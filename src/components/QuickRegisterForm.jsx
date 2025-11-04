import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

// 🌐 Importaciones para React Leaflet (OpenStreetMap)
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'; // 👈 useMap agregado
import 'leaflet/dist/leaflet.css'; // Asegúrate de que este CSS se cargue en tu proyecto

// Fix para los íconos de Leaflet en React (necesario para webpack/vite)
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

// Regex para email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ----------------------
// Estilos
// ----------------------
const styles = {
  tabContainer: { display: 'flex', marginBottom: 20, borderBottom: '2px solid #ddd' },
  tabButton: { padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: '#555', borderBottom: '2px solid transparent', transition: 'all 0.3s' },
  activeTab: { color: '#1B5E20', borderBottom: '2px solid #1B5E20', background: '#f8f8f8' },
  label: { display: "block", marginTop: 10, marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd", boxSizing: 'border-box' },
  fileInput: { display: "block", marginTop: 6 },
  select: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd", boxSizing: 'border-box' },
  primaryBtn: { background: "#1B5E20", color: "#fff", padding: "10px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 'bold', transition: 'background 0.3s' },
  secondaryBtn: { background: "#fff", color: "#FF6B35", padding: "10px 18px", borderRadius: 8, border: "1px solid #FF6B35", cursor: "pointer", transition: 'background 0.3s' },
  errorText: { color: "#D32F2F", marginTop: 8 },
  successText: { color: "#1B5E20", marginTop: 8, fontWeight: 'bold' },
  mapContainer: { border: "1px dashed #ccc", padding: 12, borderRadius: 6, margin: "10px 0" },
};

// ----------------------
// Subcomponente de campos comunes
// ----------------------
const CommonFields = ({
  fullName, setFullName, photoFile, setPhotoFile,
  email, validateEmailRealtime, emailValid, password, setPassword,
  confirmPassword, setConfirmPassword, passwordsMatch
}) => (
  <>
    <label style={styles.label}>Nombre completo (Contacto) *</label>
    <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={styles.input} />

    <label style={styles.label}>Fotografía de perfil *</label>
    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} style={styles.fileInput} />

    <label style={styles.label}>Email *</label>
    <input value={email} onChange={(e) => validateEmailRealtime(e.target.value)} style={styles.input} type="email" placeholder="correo@ejemplo.com" />
    {emailValid === false && email.length > 0 && <p style={styles.errorText}>Email inválido.</p>}

    <label style={styles.label}>Contraseña *</label>
    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={styles.input} />

    <label style={styles.label}>Confirmar contraseña *</label>
    <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" style={styles.input} />
    {!passwordsMatch() && confirmPassword.length > 0 && (<p style={styles.errorText}>Las contraseñas no coinciden</p>)}
  </>
);

// ----------------------
// 🌍 Componente para manejar la selección de ubicación (Leaflet Hook)
// ----------------------
function LocationMarker({ setPosition, onLocationSelected }) {
  // Hook para manejar eventos del mapa
  useMapEvents({
    click(e) {
      const newCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newCoords);
      onLocationSelected(newCoords); // Envía las coordenadas al estado del formulario
    },
  });
  return null;
}

// ----------------------
// 🔍 Nuevo Componente para la búsqueda de dirección
// ----------------------
function SearchLocation({ address, setMarkerPosition, onLocationSelected }) {
  const map = useMap(); // Obtenemos la instancia del mapa

  // Efecto que se dispara cada vez que la dirección (address) cambia y está definido
  useEffect(() => {
    if (address.trim() === "") return;

    const searchAddress = async () => {
      // ⚠️ Usamos la API de Nominatim de OpenStreetMap para geocodificación
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const newCoords = { lat, lng };

          // 1. Mover el mapa al nuevo punto
          map.flyTo([lat, lng], 15); 
          
          // 2. Actualizar la posición del marcador
          setMarkerPosition(newCoords);

          // 3. Actualizar el estado del formulario principal
          onLocationSelected(newCoords); 
        } else {
          console.warn("Ubicación no encontrada para la dirección:", address);
        }
      } catch (error) {
        console.error("Error buscando la dirección:", error);
      }
    };

    // Buscamos la ubicación solo después de un pequeño retraso para no saturar la API
    const handler = setTimeout(() => {
      searchAddress();
    }, 800);

    return () => clearTimeout(handler); // Limpieza del timer
  }, [address]); // Depende solo de la dirección

  return null; // Este componente solo maneja la lógica, no renderiza nada
}

// ----------------------
// 🗺️ Componente de Mapa Interactivo con Leaflet
// ----------------------
function InteractiveMapSelector({ onLocationSelected, initialCoords, currentAddress }) { // 👈 currentAddress agregado
    // Coordenadas por defecto (ej: Ciudad de México)
    const defaultPosition = initialCoords || { lat: 19.4326, lng: -99.1332 };
    const [markerPosition, setMarkerPosition] = useState(defaultPosition);

    useEffect(() => {
         // Sincroniza el marcador si initialCoords cambia externamente
        if (initialCoords) {
            setMarkerPosition(initialCoords);
        } else {
            onLocationSelected(defaultPosition);
        }
    }, [initialCoords]); 

    return (
        <div style={{ ...styles.mapContainer, height: '300px', width: '100%', padding: 0, border: '1px solid #ddd' }}>
            <MapContainer
                key={markerPosition.lat} // Key para forzar un re-render si la posición cambia mucho
                center={[markerPosition.lat, markerPosition.lng]} // Leaflet usa [lat, lng]
                zoom={13}
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
            >
                {/* Capa de OpenStreetMap (Gratuita) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Componente que detecta el clic */}
                <LocationMarker 
                    setPosition={setMarkerPosition} 
                    onLocationSelected={onLocationSelected}
                />
                
                {/* Componente que busca y mueve el mapa */}
                <SearchLocation 
                    address={currentAddress} 
                    setMarkerPosition={setMarkerPosition}
                    onLocationSelected={onLocationSelected}
                />

                {/* Marcador fijo en la ubicación seleccionada */}
                <Marker position={[markerPosition.lat, markerPosition.lng]} />
            </MapContainer>
            <p style={{ margin: '8px 12px 0 12px', color: "#666", fontSize: '12px' }}>
                Escribe la dirección y espera unos segundos para que se centre el mapa, o haz clic en el mapa para ajustar la ubicación exacta.
            </p>
        </div>
    );
}

// ----------------------
// Componente principal
// ----------------------
const QuickRegisterForm = ({ onClose, onEntityRegistered }) => {
  // Estados generales
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

  // Estados cliente
  const [accountType, setAccountType] = useState("cliente_turista");

  // Estados negocio
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCoords, setBusinessCoords] = useState(null); // Estado para guardar {lat, lng}
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [promoText, setPromoText] = useState("");
  const [promoExpiry, setPromoExpiry] = useState("");
  const [businessPlan, setBusinessPlan] = useState("negocio");

  // Validaciones
  const validateEmailRealtime = (value) => {
    setEmail(value);
    setEmailValid(EMAIL_REGEX.test(value));
  };
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
    // Validación de coordenadas actualizada
    if (!businessAddress.trim() || !businessCoords || !businessCoords.lat || !businessCoords.lng) return { ok: false, msg: "Dirección y ubicación (coordenadas) son obligatorias. Fije un punto en el mapa." };
    if (!businessCategory.trim()) return { ok: false, msg: "El giro del negocio es obligatorio." };
    if (!logoFile) return { ok: false, msg: "El logotipo es obligatorio." };
    return { ok: true };
  };

  // Sesión vendedor
  useEffect(() => {
    const getVendedor = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setVendedorNombre(session?.user?.email || "Administrador Desconocido");
    };
    getVendedor();
  }, []);

  // Subida de archivos
  async function uploadFileToSupabase(bucket, pathPrefix, file) {
    const filename = `${pathPrefix}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
      cacheControl: "3600", upsert: false, contentType: file.type,
    });
    if (error) throw error;
    const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }

  // Registro de cliente (sin cambios en la lógica del cliente, solo se mantuvo la URL de perfil)
  const handleCashRegister = async () => {
    setError(""); setSuccess("");
    const v = checkCommonFieldsValid();
    if (!v.ok) { setError(v.msg); return; }
    setLoading(true);

    try {
      // 1️⃣ Subir archivo y obtener URL
      const profilePicUrl = await uploadFileToSupabase("foto_perfil", "avatars", photoFile);
      
      // 2️⃣ Crear usuario de Auth
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { nombre: fullName, profile_pic: profilePicUrl } } // Usamos profile_pic
      });
      if (signUpError) throw signUpError;
      if (!user) throw new Error("Registro de usuario fallido o sin respuesta.");

      // 3️⃣ Insertar usuario en tabla 'users'
      await supabase.from('users').insert({
        id: user.id, 
        email, 
        nombre: fullName, 
        tipo_membresia: accountType,
        profile_pic: profilePicUrl, // link de la foto
      });

      await supabase.from('sales').insert({
        cliente_id: user.id,
        vendedor_nombre: vendedorNombre,
        monto: accountType === 'cliente_turista' ? 350 : 600,
        tipo_membresia: accountType,
      });

      setSuccess(`¡Cliente ${fullName} registrado y venta en efectivo registrada!`);
      onEntityRegistered();
    } catch (err) {
      console.error("Error en registro/venta:", err);
      setError(err.message || "Error desconocido al procesar la venta.");
    } finally {
      setLoading(false);
    }
  };

  // Registro de negocio
  const handleBusinessRegister = async () => {
    setError(""); setSuccess("");
    const vCommon = checkCommonFieldsValid();
    if (!vCommon.ok) { setError(vCommon.msg); return; }
    const vBusiness = checkBusinessFormValid();
    if (!vBusiness.ok) { setError(vBusiness.msg); return; }
    setLoading(true);

    try {
      // 1️⃣ Subir archivos y obtener URLs
      const profilePicUrl = await uploadFileToSupabase("foto_perfil", "avatars", photoFile); 
      const logoUrl = await uploadFileToSupabase("logo_bussines", "logos", logoFile);

      // 2️⃣ Crear usuario de Auth
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { nombre: fullName, profile_pic: profilePicUrl } } 
      });
      if (signUpError) throw signUpError;
      if (!user) throw new Error("Registro de usuario fallido o sin respuesta.");

      // 3️⃣ Insertar usuario en tabla 'users'
      const { error: userInsertError } = await supabase.from("users").insert({
        id: user.id, 
        email, 
        nombre: fullName, 
        tipo_membresia: businessPlan,
        profile_pic: profilePicUrl, // link de la foto de perfil
      });
      if (userInsertError) throw userInsertError;

      // 4️⃣ Insertar negocio en tabla 'businesses'
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .insert({
          nombre: businessName,
          categoria: businessCategory,
          email,
          telefono: businessPhone,
          responsable: fullName,
          direccion: businessAddress,
          latitud: businessCoords.lat,
          longitud: businessCoords.lng,
          logo_url: logoUrl, // link del logo
          estado_activo: true, 
          usuario_id: user.id, 
        })
        .select()
        .single();
      if (businessError) throw businessError;

      // 5️⃣ Insertar beneficio
      if (promoText) {
        const { error: benefitError } = await supabase.from("benefits").insert({
          negocio_id: businessData.id,
          usuario_id: user.id,
          descripcion: promoText,
          descuento_porcentaje: 0,
          limite_uso: 9999,
          fecha_vigencia_fin: promoExpiry || null,
          tipo: businessPlan,
        });
        if (benefitError) throw benefitError;
      }

      setSuccess(`✅ Negocio "${businessName}" y contacto "${fullName}" registrados con éxito.`);
      onEntityRegistered();

    } catch (err) {
      console.error("❌ Error en registro de negocio:", err);
      setError(err.message || "Error desconocido al registrar el negocio.");

      // 🔙 Rollback: eliminar usuario si ya se creó
      try {
        if (email) await supabase.from("users").delete().eq("email", email);
      } catch (rollbackErr) {
        console.warn("Error durante rollback:", rollbackErr);
      }
    } finally {
      setLoading(false);
    }
  };


  // ----------------------
  // Render
  // ----------------------
  return (
    <div style={{ padding: '0', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h3 style={{ color: "#1B5E20", borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        Registro Administrativo Rápido
      </h3>
      <p style={{ color: "#555", fontSize: '14px' }}>Vendedor/Admin: <strong>{vendedorNombre}</strong></p>

      <div style={styles.tabContainer}>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'cliente' && styles.activeTab) }}
          onClick={() => { setActiveTab('cliente'); setError(""); setSuccess(""); }}
          disabled={loading}
        >
          Cliente (Venta Efectivo)
        </button>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'negocio' && styles.activeTab) }}
          onClick={() => { setActiveTab('negocio'); setError(""); setSuccess(""); }}
          disabled={loading}
        >
          Negocio Aliado (Registro Admin)
        </button>
      </div>

      {/* Cliente */}
      {activeTab === 'cliente' && (
        <div style={{ paddingTop: '10px' }}>
          <CommonFields
            fullName={fullName} setFullName={setFullName}
            photoFile={photoFile} setPhotoFile={setPhotoFile}
            email={email} validateEmailRealtime={validateEmailRealtime} emailValid={emailValid}
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            passwordsMatch={passwordsMatch}
          />
          <label style={styles.label}>Tipo de membresía *</label>
          <select value={accountType} onChange={(e) => setAccountType(e.target.value)} style={styles.select}>
            <option value="cliente_turista">Turista — $350 MXN (Efectivo)</option>
            <option value="cliente_residente">Residente — $600 MXN (Efectivo)</option>
          </select>

          {error && <p style={styles.errorText}>{error}</p>}
          {success && <p style={styles.successText}>{success}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
            <button style={styles.primaryBtn} onClick={handleCashRegister} disabled={loading}>
              {loading ? "Registrando y Vendiendo..." : `Registrar Cliente y Venta ($${accountType === 'cliente_turista' ? '350' : '600'})`}
            </button>
            <button style={styles.secondaryBtn} onClick={onClose} disabled={loading}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Negocio */}
      {activeTab === 'negocio' && (
        <div style={{ paddingTop: '10px' }}>
          <CommonFields
            fullName={fullName} setFullName={setFullName}
            photoFile={photoFile} setPhotoFile={setPhotoFile}
            email={email} validateEmailRealtime={validateEmailRealtime} emailValid={emailValid}
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            passwordsMatch={passwordsMatch}
          />

          <label style={styles.label}>Plan de Negocio *</label>
          <select value={businessPlan} onChange={(e) => setBusinessPlan(e.target.value)} style={styles.select}>
            <option value="negocio">Plan Estándar</option>
            <option value="negocio_premium">Plan Premium</option>
          </select>

          <label style={styles.label}>Nombre del negocio *</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={styles.input} />

          <label style={styles.label}>Dirección *</label>
          {/* 🔑 AGREGADO: onBlur para intentar buscar la ubicación al salir del campo */}
          <input 
            value={businessAddress} 
            onChange={(e) => setBusinessAddress(e.target.value)} 
            onBlur={() => { /* Esto disparará la búsqueda en el componente del mapa */ }}
            style={styles.input} 
          />

          <label style={styles.label}>Ubicación (Coordenadas) *</label>
          <InteractiveMapSelector 
            onLocationSelected={setBusinessCoords} 
            initialCoords={businessCoords}
            currentAddress={businessAddress} // 🔑 AGREGADO: Pasamos la dirección al mapa
          />
          {businessCoords && (
            <p style={{ fontSize: 12, color: "#333" }}>
              Coordenadas fijadas: {businessCoords.lat.toFixed(5)}, {businessCoords.lng.toFixed(5)}
            </p>
          )}

          <label style={styles.label}>Giro del negocio *</label>
          <input value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} style={styles.input} />

          <label style={styles.label}>Teléfono</label>
          <input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} style={styles.input} />

          <label style={styles.label}>Logotipo *</label>
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} style={styles.fileInput} />

          <label style={styles.label}>Descuento / Promoción</label>
          <textarea value={promoText} onChange={(e) => setPromoText(e.target.value)} rows="3" style={styles.input} />

          <label style={styles.label}>Fecha de vigencia de promoción</label>
          <input type="date" value={promoExpiry} onChange={(e) => setPromoExpiry(e.target.value)} style={styles.input} />

          {error && <p style={styles.errorText}>{error}</p>}
          {success && <p style={styles.successText}>{success}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
            <button style={styles.primaryBtn} onClick={handleBusinessRegister} disabled={loading}>
              {loading ? "Registrando Negocio..." : "Registrar Negocio"}
            </button>
            <button style={styles.secondaryBtn} onClick={onClose} disabled={loading}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickRegisterForm;