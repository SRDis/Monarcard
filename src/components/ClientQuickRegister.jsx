import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

// Variables globales / Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

// --- ESTILOS (Optimizados para Modal, mismos que ya ajustamos) ---
const styles = {
    formWrapper: { padding: '0', backgroundColor: '#fff', borderRadius: '8px' }, 
    header: { color: "#1B5E20", borderBottom: '1px solid #e0e0e0', paddingBottom: '12px', marginBottom: '15px', fontWeight: 700 },
    tabContainer: { display: 'flex', marginBottom: 20, borderBottom: '2px solid #e0e0e0', width: '100%' },
    tabButton: { padding: '10px 15px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: '#757575', borderBottom: '2px solid transparent', transition: 'all 0.3s', flexGrow: 1, textAlign: 'center' },
    activeTab: { color: '#1B5E20', borderBottom: '3px solid #1B5E20', background: '#f5f5f5' },
    label: { display: "block", marginTop: 15, marginBottom: 5, fontWeight: 600, color: '#424242' },
    inputBase: { width: '100%', padding: 10, borderRadius: 6, border: "1px solid #bdbdbd", boxSizing: 'border-box', transition: 'border-color 0.3s' },
    fileInput: { display: "block", marginTop: 6, padding: 8, border: "1px solid #ddd", borderRadius: 6, width: '100%', boxSizing: 'border-box' },
    select: { width: '100%', padding: 10, borderRadius: 6, border: "1px solid #bdbdbd", boxSizing: 'border-box' },
    buttonGroup: { display: "flex", gap: 10, marginTop: 25, paddingTop: 15, borderTop: '1px solid #e0e0e0', justifyContent: "flex-end" },
    primaryBtn: { background: "#1B5E20", color: "#fff", padding: "10px 18px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 'bold' },
    secondaryBtn: { background: "#fff", color: "#FF6B35", padding: "10px 18px", borderRadius: 6, border: "2px solid #FF6B35", cursor: "pointer" },
    errorText: { color: "#D32F2F", marginTop: 8, padding: '6px', backgroundColor: '#FFEBEE', borderRadius: '4px' },
    successText: { color: "#1B5E20", marginTop: 8, fontWeight: 'bold', padding: '6px', backgroundColor: '#E8F5E9', borderRadius: '4px' },
    mapContainer: { border: "1px dashed #BDBDBD", padding: 10, borderRadius: 8, margin: "10px 0", backgroundColor: '#fafafa' },
};

// --- Componente auxiliar para campos comunes ---
const CommonFields = ({
    fullName, setFullName, photoFile, setPhotoFile,
    email, validateEmailRealtime, emailValid, password, setPassword,
    confirmPassword, setConfirmPassword, passwordsMatch
}) => (
    <>
      <label style={styles.label}>👤 Nombre completo (Contacto) *</label>
      <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={styles.inputBase} placeholder="Ej: Juan Pérez"/>

      <label style={styles.label}>🖼️ Fotografía de perfil *</label>
      <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} style={styles.fileInput} />

      <label style={styles.label}>📧 Email *</label>
      <input value={email} onChange={(e) => validateEmailRealtime(e.target.value)} style={styles.inputBase} type="email" placeholder="correo@ejemplo.com" />
      {emailValid === false && email.length > 0 && <p style={styles.errorText}>Email inválido.</p>}

      <label style={styles.label}>🔒 Contraseña *</label>
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={styles.inputBase} placeholder="Mínimo 6 caracteres"/>

      <label style={styles.label}>🔑 Confirmar contraseña *</label>
      <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" style={styles.inputBase} placeholder="Repita la contraseña"/>
      {!passwordsMatch() && confirmPassword.length > 0 && (<p style={styles.errorText}>Las contraseñas no coinciden</p>)}
    </>
);


// ------------------------------------------
// Componente Principal QuickRegisterForm
// ------------------------------------------
const QuickRegisterForm = ({ onClose, onEntityRegistered }) => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState("cliente");
  const [fullName, setFullName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vendedorNombre, setVendedorNombre] = useState("Cargando..."); 
  const [accountType, setAccountType] = useState("cliente_turista"); 
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCoords, setBusinessCoords] = useState(null); 
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [promoText, setPromoText] = useState("");
  const [promoExpiry, setPromoExpiry] = useState("");
  const [businessPlan, setBusinessPlan] = useState("negocio"); 

  // --- Lógica de Validación ---
  const validateEmailRealtime = (value) => { setEmail(value); setEmailValid(EMAIL_REGEX.test(value)); };
  const passwordsMatch = () => password !== "" && password === confirmPassword;
  const checkCommonFieldsValid = () => {
    if (!fullName.trim()) return { ok: false, msg: "El nombre es obligatorio." };
    if (!photoFile) return { ok: false, msg: "La fotografía de perfil es obligatoria." };
    if (!email || !EMAIL_REGEX.test(email)) return { ok: false, msg: "Email inválido." };
    if (!password || password.length < 6) return { ok: false, msg: "Password debe tener mínimo 6 caracteres." };
    if (!passwordsMatch()) return { ok: false, msg: "Las contraseñas no coinciden." };
    return { ok: true };
  };
  const checkBusinessFormValid = () => {
    if (!businessName.trim()) return { ok: false, msg: "Nombre del negocio es obligatorio." };
    if (!businessAddress.trim() || !businessCoords) return { ok: false, msg: "Dirección y ubicación son obligatorias." }; 
    if (!businessCategory.trim()) return { ok: false, msg: "El giro del negocio es obligatorio." };
    if (!logoFile) return { ok: false, msg: "El logotipo es obligatorio." };
    return { ok: true };
  };


  // --- OBTENER DATOS DEL VENDEDOR (Sesión de Admin) ---
  useEffect(() => {
    const getVendedor = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setVendedorNombre(session.user.email); 
      } else {
        setVendedorNombre("Administrador Desconocido");
      }
    };
    getVendedor();
  }, []);

  // --- Funciones de Backend (Subida de archivos) ---
  async function uploadFileToSupabase(bucket, pathPrefix, file) {
    const filename = `${pathPrefix}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
      cacheControl: "3600", upsert: false, contentType: file.type,
    });
    if (error) throw error;
    const { publicUrl, error: urlErr } = supabase.storage.from(bucket).getPublicUrl(data.path);
    if (urlErr) throw urlErr;
    return publicUrl;
  }
  
  // 🔑 HANDLER CLIENTE: REGISTRO Y VENTA (CORREGIDO)
  const handleCashRegister = async () => {
    setError(""); setSuccess("");
    const v = checkCommonFieldsValid();
    if (!v.ok) { setError(v.msg); return; }
    setLoading(true);
    
    try {
        // 1. Subir la fotografía de perfil
        const avatarUrl = await uploadFileToSupabase("foto_perfil", "avatars", photoFile);
        
        // 2. Registrar el usuario en la autenticación de Supabase
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email, password, options: { data: { nombre: fullName, avatar_url: avatarUrl } }
        });
        if (signUpError) throw signUpError;
        if (!user) throw new Error("Registro de usuario fallido o sin respuesta.");
        
        // 3. Insertar el perfil del usuario en la tabla 'users'
        await supabase.from('users').insert({
            id: user.id, email: email, nombre: fullName, tipo_membresia: accountType,
        });

        // 4. Registrar VENTA EN EFECTIVO (CLAVE para el contador del dashboard)
        await supabase.from('sales').insert({
            cliente_id: user.id,
            vendedor_nombre: vendedorNombre,
            monto: accountType === 'cliente_turista' ? 350 : 600, 
            tipo_membresia: accountType,
        });
        // --------------------------------------------------------------------------

        setSuccess(`¡Cliente ${fullName} registrado y venta en efectivo registrada!`);
        onEntityRegistered(); // Llama a fetchStats en el dashboard

    } catch (err) {
        console.error("Error en registro/venta:", err);
        setError(err.message || "Error desconocido al procesar la venta.");
    } finally {
        setLoading(false);
    }
  };

  // 🔑 HANDLER NEGOCIO: REGISTRO ADMINISTRATIVO (CORREGIDO)
  const handleBusinessRegister = async () => {
    setError(""); setSuccess("");
    const vCommon = checkCommonFieldsValid();
    if (!vCommon.ok) { setError(vCommon.msg); return; }
    const vBusiness = checkBusinessFormValid();
    if (!vBusiness.ok) { setError(vBusiness.msg); return; }
    setLoading(true);
    
    try {
        // 1. Subir archivos
        const avatarUrl = await uploadFileToSupabase("foto_perfil", "avatars", photoFile);
        const logoUrl = await uploadFileToSupabase("logo_bussines", "logos", logoFile); 
        
        // 2. Registrar el usuario (contacto) en Auth
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email, password, options: { data: { nombre: fullName, avatar_url: avatarUrl } }
        });
        if (signUpError) throw signUpError;
        if (!user) throw new Error("Registro de usuario fallido o sin respuesta.");
        
        // 3. Insertar el perfil del contacto en 'users'
        await supabase.from('users').insert({
            id: user.id, email: email, nombre: fullName, tipo_membresia: businessPlan,
        });

        // 4. Insertar el negocio en 'businesses'
        const { data: businessData, error: businessError } = await supabase.from('businesses').insert({
            nombre: businessName,
            categoria: businessCategory,
            email: email,
            telefono: businessPhone,
            responsable: fullName,
            direccion: businessAddress, 
            // Guardar coordenadas (Asegúrate de que tu tabla tenga este campo)
            coords_lat_lng: businessCoords ? `${businessCoords.lat},${businessCoords.lng}` : null, 
            estado_activo: 'activo', // Activo por ser registro admin
        }).select().single();
        if (businessError) throw businessError;

        // 5. Insertar el beneficio si hay promoción (Tabla 'benefits')
        if (promoText) {
            await supabase.from('benefits').insert({
                negocio_id: businessData.id, 
                descripcion: promoText,
                descuento_porcentaje: 0, 
                limite_uso: 9999, 
                fecha_vigencia_fin: promoExpiry || null,
                tipo: businessPlan,
            });
        }
        // --------------------------------------------------------------------------

        setSuccess(`¡Negocio ${businessName} y contacto ${fullName} registrados con éxito!`);
        onEntityRegistered(); // Llama a fetchStats en el dashboard

    } catch (err) {
        console.error("Error en registro de negocio:", err);
        setError(err.message || "Error desconocido al registrar el negocio.");
    } finally {
        setLoading(false);
    }
  };

  // --- Renderizado del componente MapSelector (Placeholder) ---
  function MapSelector({ onLocationSelected }) {
    return (
      <div style={styles.mapContainer}>
        <p style={{ margin: 0, color: "#616161", fontSize: '13px', fontWeight: 500 }}>📍 Coordenadas de Ubicación (Placeholder)</p>
        <button
          onClick={() => onLocationSelected({ lat: 19.1999, lng: -100.0678 })}
          style={{ padding: '8px 12px', borderRadius: 6, border: "1px solid #1B5E20", backgroundColor: '#E8F5E9', color: '#1B5E20', cursor: "pointer", marginTop: '8px', fontWeight: 'bold' }}
        >Usar Coordenadas de Ejemplo</button>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div style={styles.formWrapper}>
      <h3 style={styles.header}>🚀 Registro Administrativo Rápido</h3>
      <p style={{ color: "#555", fontSize: '14px', marginBottom: '20px' }}>Registro realizado por: **{vendedorNombre}**</p>

      {/* CONTROLES DE PESTAÑA */}
      <div style={styles.tabContainer}>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'cliente' && styles.activeTab) }}
          onClick={() => { setActiveTab('cliente'); setError(""); setSuccess(""); }}
          disabled={loading}>👤 Cliente</button>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'negocio' && styles.activeTab) }}
          onClick={() => { setActiveTab('negocio'); setError(""); setSuccess(""); }}
          disabled={loading}>🏢 Negocio Aliado</button>
      </div>
      
      {/* Contenedor de Formulario */}
      <div style={{ paddingTop: '10px' }}>
        {error && <p style={styles.errorText}>❌ {error}</p>}
        {success && <p style={styles.successText}>✅ {success}</p>}
        
        {/* PESTAÑA CLIENTE */}
        {activeTab === 'cliente' && (
          <>
              <CommonFields 
                  fullName={fullName} setFullName={setFullName} photoFile={photoFile} setPhotoFile={setPhotoFile}
                  email={email} validateEmailRealtime={validateEmailRealtime} emailValid={emailValid}
                  password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                  passwordsMatch={passwordsMatch}
              />
              <label style={styles.label}>🏷️ Tipo de membresía *</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value)} style={styles.select}>
                  <option value="cliente_turista">Turista — $350 MXN (Efectivo)</option>
                  <option value="cliente_residente">Residente — $600 MXN (Efectivo)</option>
              </select>
              
              <div style={styles.buttonGroup}>
                <button style={styles.secondaryBtn} onClick={onClose} disabled={loading}>Cerrar</button>
                <button style={styles.primaryBtn} onClick={handleCashRegister} disabled={loading}>
                  {loading ? "Registrando..." : `Registrar y Vender ($${accountType === 'cliente_turista' ? '350' : '600'})`}
                </button>
              </div>
          </>
        )}

        {/* PESTAÑA NEGOCIO */}
        {activeTab === 'negocio' && (
          <>
              <CommonFields 
                  fullName={fullName} setFullName={setFullName} photoFile={photoFile} setPhotoFile={setPhotoFile}
                  email={email} validateEmailRealtime={validateEmailRealtime} emailValid={emailValid}
                  password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                  passwordsMatch={passwordsMatch}
              />

              <label style={styles.label}>📝 Plan de Negocio *</label>
              <select value={businessPlan} onChange={(e) => setBusinessPlan(e.target.value)} style={styles.select}>
                <option value="negocio">Plan Estándar</option>
                <option value="negocio_premium">Plan Premium</option>
              </select>
              
              <label style={styles.label}>🏢 Nombre del negocio *</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={styles.inputBase} placeholder="Ej: Restaurant El Buen Sazón" />

              <label style={styles.label}>🗺️ Dirección *</label>
              <input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} style={styles.inputBase} placeholder="Calle, Número, Colonia" />

              <label style={styles.label}>📍 Ubicación (Coordenadas) *</label>
              <MapSelector onLocationSelected={(loc) => { setBusinessCoords(loc); }} /> 
              {businessCoords && (<p style={{ fontSize: 13, color: "#333", marginTop: '-5px', marginBottom: '15px' }}>Coordenadas: **{businessCoords.lat.toFixed(5)}, {businessCoords.lng.toFixed(5)}**</p>)}

              <label style={styles.label}>💼 Giro del negocio *</label>
              <input value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} style={styles.inputBase} placeholder="Ej: Restaurante, Hotel, Agencia de Viajes" />

              <label style={styles.label}>📞 Teléfono</label>
              <input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} style={styles.inputBase} placeholder="Opcional" />

              <label style={styles.label}>🖼️ Logotipo *</label>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} style={styles.fileInput} />

              <label style={styles.label}>🎁 Descuento / Promoción (Tabla Benefits)</label>
              <input value={promoText} onChange={(e) => setPromoText(e.target.value)} style={styles.inputBase} placeholder="Ej: 15% de Descuento en alimentos (Opcional)" />

              <label style={styles.label}>🗓️ Vigencia de la promoción (Opcional)</label>
              <input type="date" value={promoExpiry} onChange={(e) => setPromoExpiry(e.target.value)} style={styles.inputBase} />

              <div style={styles.buttonGroup}>
                <button style={styles.secondaryBtn} onClick={onClose} disabled={loading}>Cerrar</button>
                <button style={styles.primaryBtn} onClick={handleBusinessRegister} disabled={loading}>
                  {loading ? "Registrando..." : "Registrar Negocio"}
                </button>
              </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickRegisterForm;