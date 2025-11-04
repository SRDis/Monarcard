// src/pages/Signup.jsx
import React, { useState, useRef } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

// Variables globales / Regex
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ------------------------------------------
// 📌 Componente de Campos Comunes (Fuera de Signup)
// ------------------------------------------
const CommonFields = ({
    fullName, setFullName, photoFile, avatarInputRef, setPhotoFile,
    email, validateEmailRealtime, emailValid, password, setPassword,
    confirmPassword, setConfirmPassword, passwordsMatch
}) => (
    <>
      <label style={styles.label}>Nombre completo *</label>
      <input 
        value={fullName} 
        onChange={(e) => setFullName(e.target.value)} 
        style={styles.input} 
      />

      {/* ... (Resto de los inputs de CommonFields sin cambios) ... */}
      <label style={styles.label}>Fotografía de perfil *</label>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => setPhotoFile(e.target.files[0])}
        style={styles.fileInput}
      />

      <label style={styles.label}>Email *</label>
      <input
        value={email}
        onChange={(e) => validateEmailRealtime(e.target.value)}
        style={styles.input}
        type="email"
        placeholder="correo@ejemplo.com"
      />
      {emailValid === false && <p style={styles.errorText}>{error}</p>}

      <label style={styles.label}>Contraseña *</label>
      <input 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        type="password" 
        style={styles.input} 
      />

      <label style={styles.label}>Confirmar contraseña *</label>
      <input
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        type="password"
        style={styles.input}
      />
      {!passwordsMatch() && confirmPassword.length > 0 && (
        <p style={styles.errorText}>Las contraseñas no coinciden</p>
      )}
    </>
);


const Signup = () => {
  const navigate = useNavigate();

  // Estados Comunes y de Negocio (sin cambios)
  const [activeTab, setActiveTab] = useState("cliente");
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("cliente_turista"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCoords, setBusinessCoords] = useState(null); 
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [promoText, setPromoText] = useState("");
  const [promoExpiry, setPromoExpiry] = useState("");
  const [businessPlan, setBusinessPlan] = useState("negocio"); 

  // 💡 NUEVO ESTADO PARA EL COMPROBANTE DE RESIDENCIA
  const [residenciaFile, setResidenciaFile] = useState(null);

  const avatarInputRef = useRef();
  const logoInputRef = useRef();
  const residenciaInputRef = useRef(); // Ref para el input de residencia

  // ------------------------------------------
  // Lógica de Validación (sin cambios)
  // ------------------------------------------
  const validateEmailRealtime = (value) => {
    setEmail(value);
    setEmailValid(EMAIL_REGEX.test(value));
  };
  const passwordsMatch = () => password !== "" && password === confirmPassword;
  const checkStep1Valid = () => {
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
  // 💡 NUEVA VALIDACIÓN PARA EL ARCHIVO DE RESIDENCIA
  const checkResidenciaValid = () => {
    if (!residenciaFile) return { ok: false, msg: "Debe adjuntar un comprobante de residencia." };
    return { ok: true };
  };

  // ------------------------------------------
  // Funciones de Backend (Subida de archivos)
  // ------------------------------------------
  async function uploadFileToSupabase(bucket, pathPrefix, file) {
    const filename = `${pathPrefix}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    const { publicURL, error: urlErr } = supabase.storage.from(bucket).getPublicUrl(data.path);
    if (urlErr) throw urlErr;
    return { path: data.path, publicURL };
  }

  // ------------------------------------------
  // HANDLERS PARA FLUJOS DE PAGO (Stripe)
  // ------------------------------------------
  async function handleStripeCheckout(amountMXN, priceKey = null) {
      setLoading(true);
      setError("");

      try {
        const formData = {
            fullName, photoFile: photoFile ? photoFile.name : null, email, password,
            // 💡 Incluimos la info de residencia si existe (para el backend)
            residenciaFile: residenciaFile ? residenciaFile.name : null, 
            businessName, businessAddress, businessCoords, businessCategory, businessPhone, 
            logoFile: logoFile ? logoFile.name : null, promoText, promoExpiry,
            accountType: activeTab === 'cliente' ? accountType : businessPlan,
        };

        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData, 
            amountMXN,
            priceKey,
            success_url: `${window.location.origin}/signup-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/signup?canceled=true`,
          }),
        });

        const { url, error: backendError } = await res.json();
        if (backendError) throw new Error(backendError);

        if (url) {
          window.location.href = url;
        } else {
          throw new Error("No se recibió URL de Checkout.");
        }
      } catch (err) {
        console.error("Error creando sesión Stripe:", err);
        setError(err.message || "Error iniciando pago.");
        setLoading(false);
      }
  }

  // ------------------------------------------
  // 💡 NUEVO HANDLER: Submit Paso 1 Cliente (Cliente/Turista va directo, Residente va a Paso 2)
  // ------------------------------------------
  const handleClienteStep1Next = () => {
    setError("");
    const v = checkStep1Valid();
    if (!v.ok) {
      setError(v.msg);
      return;
    }

    if (accountType === "cliente_turista") {
      // Cliente/Turista: va directo a pago
      handleStripeCheckout(350, "cliente_turista_price_key");
      return;
    }

    if (accountType === "cliente_residente") {
      // Cliente/Residente: va al paso 2 de residencia
      setStep(2);
      return;
    }
  };

  // ------------------------------------------
  // 💡 NUEVO HANDLER: Submit Paso 2 Cliente Residente (Subida y Pago)
  // ------------------------------------------
  const handleClienteResidenteSubmit = async () => {
    setError("");
    const valid = checkResidenciaValid();
    if (!valid.ok) {
      setError(valid.msg);
      return;
    }

    setLoading(true);
    
    try {
        // 1. Subir el archivo de residencia
        // Se subirá a un bucket especial 'residencia'
        await uploadFileToSupabase("residencia", "comprobantes", residenciaFile);
        
        // 2. Redirigir a Stripe para pagar el plan Residente
        handleStripeCheckout(600, "cliente_residente_price_key");

    } catch (err) {
        setLoading(false);
        setError(err.message || "Error al subir comprobante e iniciar pago.");
    }
  };

  // ------------------------------------------
  // Handlers de Negocio (sin cambios en su lógica)
  // ------------------------------------------
  const handleNegocioStep1Next = () => {
    setError("");
    const v = checkStep1Valid();
    if (!v.ok) {
      setError(v.msg);
      return;
    }
    setStep(2); 
  };
  const handleBusinessSubmit = async () => {
    setError("");
    const valid = checkBusinessFormValid();
    if (!valid.ok) {
      setError(valid.msg);
      return;
    }
    setLoading(true);
    
    try {
        await uploadFileToSupabase("logos", "logos", logoFile);
        
        let amountMXN;
        let priceKey;

        if (businessPlan === "negocio") {
            amountMXN = 150;
            priceKey = "negocio_estandar_anual_price";
        } else if (businessPlan === "negocio_premium") {
            amountMXN = 350;
            priceKey = "negocio_premium_mensual_price";
        } else {
            throw new Error("Plan de negocio no válido.");
        }
        
        handleStripeCheckout(amountMXN, priceKey);

    } catch (err) {
        setLoading(false);
        setError(err.message || "Error al iniciar el pago del negocio.");
    }
  };


  // ------------------------------------------
  // Render
  // ------------------------------------------
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Registro Monarcard</h2>
        
        {/* CONTROLES DE PESTAÑA */}
        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tabButton, ...(activeTab === 'cliente' && styles.activeTab) }}
            onClick={() => { setActiveTab('cliente'); setError(""); setStep(1); setAccountType("cliente_turista"); }}
            disabled={loading}
          >
            Cliente
          </button>
          <button
            style={{ ...styles.tabButton, ...(activeTab === 'negocio' && styles.activeTab) }}
            onClick={() => { setActiveTab('negocio'); setError(""); setStep(1); setBusinessPlan("negocio"); }}
            disabled={loading}
          >
            Negocio Aliado
          </button>
        </div>

        {/* ----------------------------------
            PESTAÑA CLIENTE
        ---------------------------------- */}
        {activeTab === 'cliente' && (
          <div style={styles.tabContent}>
            
            {/* ------------------ CLIENTE - PASO 1 (Datos Básicos) ------------------ */}
            {step === 1 && (
                <>
                    <p style={{ color: "#555" }}>Paso 1/1 o 1/2 — Información básica</p>
                    
                    <CommonFields 
                        fullName={fullName} setFullName={setFullName}
                        photoFile={photoFile} avatarInputRef={avatarInputRef} setPhotoFile={setPhotoFile}
                        email={email} validateEmailRealtime={validateEmailRealtime} emailValid={emailValid}
                        password={password} setPassword={setPassword}
                        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                        passwordsMatch={passwordsMatch}
                    />

                    <label style={styles.label}>Tipo de membresía *</label>
                    <select value={accountType} onChange={(e) => { setAccountType(e.target.value); setResidenciaFile(null); }} style={styles.select}>
                        <option value="cliente_turista">Turista — $350 MXN (Pago único)</option>
                        <option value="cliente_residente">Residente — $600 MXN (Pago único) - Requiere comprobante de residencia</option>
                    </select>

                    {error && <p style={styles.errorText}>{error}</p>}

                    <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "center" }}>
                        <button style={styles.primaryBtn} onClick={handleClienteStep1Next} disabled={loading}>
                            {loading 
                                ? "Procesando..." 
                                : accountType === 'cliente_turista' ? "Continuar a pago" : "Continuar a comprobante de residencia"}
                        </button>
                        <button style={styles.secondaryBtn} onClick={() => navigate('/')}>Cancelar</button>
                    </div>
                </>
            )}
            
            {/* ------------------ CLIENTE - PASO 2 (Residencia) ------------------ */}
            {step === 2 && accountType === 'cliente_residente' && (
                <>
                    <p style={{ color: "#1B5E20", fontWeight: 'bold' }}>Paso 2/2 — Verificación de Residencia (Cliente Residente)</p>
                    
                    <div style={styles.alertBox}>
                        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Requisito de Verificación</p>
                        <p style={{ margin: '5px 0' }}>Para obtener la tarifa de Residente ($600 MXN), necesitamos validar tu domicilio:</p>
                        <ul>
                            <li>Adjunta **INE/Credencial** o **Comprobante Domiciliario** (Luz, Agua, Teléfono).</li>
                            <li>El documento debe mostrar tu nombre ({fullName}) y una dirección en **Valle de Bravo, Estado de México**.</li>
                        </ul>
                    </div>

                    <label style={styles.label}>Adjuntar Documento de Residencia *</label>
                    <input
                        ref={residenciaInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setResidenciaFile(e.target.files[0])}
                        style={styles.fileInput}
                    />
                    {residenciaFile && <p style={{ fontSize: 12, color: "#666" }}>Archivo seleccionado: {residenciaFile.name}</p>}

                    {error && <p style={styles.errorText}>{error}</p>}

                    <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "center" }}>
                        <button style={styles.primaryBtn} onClick={handleClienteResidenteSubmit} disabled={loading}>
                            {loading ? "Preparando pago..." : "Subir documento y Continuar a Pago ($600 MXN)"}
                        </button>
                        <button style={styles.secondaryBtn} onClick={() => setStep(1)}>Volver</button>
                    </div>
                </>
            )}
          </div>
        )}
        
        {/* ----------------------------------
            PESTAÑA NEGOCIO (Lógica sin cambios de pasos)
        ---------------------------------- */}
        {activeTab === 'negocio' && (
          <div style={styles.tabContent}>
            
            {/* ------------------ NEGOCIO - PASO 1 ------------------ */}
            {step === 1 && (
              <>
                <p style={{ color: "#555" }}>Paso 1/2 — Información básica del contacto</p>

                <CommonFields 
                    fullName={fullName} setFullName={setFullName}
                    photoFile={photoFile} avatarInputRef={avatarInputRef} setPhotoFile={setPhotoFile}
                    email={email} validateEmailRealtime={validateEmailRealtime} emailValid={emailValid}
                    password={password} setPassword={setPassword}
                    confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                    passwordsMatch={passwordsMatch}
                />
                
                <label style={styles.label}>Plan de Negocio *</label>
                <select value={businessPlan} onChange={(e) => setBusinessPlan(e.target.value)} style={styles.select}>
                  <option value="negocio">Plan Estándar — $150 MXN (Anual)</option>
                  <option value="negocio_premium">Plan Premium — $350 MXN (Mensual)</option>
                </select>

                {error && <p style={styles.errorText}>{error}</p>}

                <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "center" }}>
                  <button style={styles.primaryBtn} onClick={handleNegocioStep1Next} disabled={loading}>
                    {loading ? "Procesando..." : "Continuar a datos del negocio"}
                  </button>
                  <button style={styles.secondaryBtn} onClick={() => navigate('/')}>Cancelar</button>
                </div>
              </>
            )}

            {/* ------------------ NEGOCIO - PASO 2 ------------------ */}
            {step === 2 && (
              <>
                <p style={{ color: "#555" }}>Paso 2/2 — Datos del Negocio (Se le redirigirá a pago)</p>

                <label style={styles.label}>Nombre del negocio *</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={styles.input} />

                <label style={styles.label}>Dirección (elige en el mapa) *</label>
                <input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} style={styles.input} />

                <small style={{ color: "#666" }}>
                  Usa el selector de mapa para fijar coordenadas.
                </small>

                <div style={{ margin: "10px 0" }}>
                  <MapSelector onLocationSelected={(loc) => { setBusinessCoords(loc); setBusinessAddress("Ubicación fijada"); }} /> 
                  {businessCoords && (
                    <p style={{ fontSize: 12, color: "#333" }}>
                      Coordenadas: {businessCoords.lat.toFixed(5)}, {businessCoords.lng.toFixed(5)}
                    </p>
                  )}
                </div>

                <label style={styles.label}>Giro del negocio *</label>
                <input value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} style={styles.input} />

                <label style={styles.label}>Teléfono</label>
                <input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} style={styles.input} />

                <label style={styles.label}>Logotipo *</label>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} style={styles.fileInput} />

                <label style={styles.label}>Descuento / Promoción (Opcional)</label>
                <input value={promoText} onChange={(e) => setPromoText(e.target.value)} style={styles.input} />

                <label style={styles.label}>Vigencia de la promoción</label>
                <input type="date" value={promoExpiry} onChange={(e) => setPromoExpiry(e.target.value)} style={styles.input} />

                {error && <p style={styles.errorText}>{error}</p>}

                <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "center" }}>
                  <button style={styles.primaryBtn} onClick={handleBusinessSubmit} disabled={loading}>
                    {loading ? "Preparando pago..." : "Continuar a Pago"}
                  </button>
                  <button style={styles.secondaryBtn} onClick={() => setStep(1)}>Volver</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;


// ---------------------- Componente auxiliar y estilos (sin cambios, excepto alertBox) ----------------------
function MapSelector({ onLocationSelected }) {
    return (
      <div style={{ border: "1px dashed #ccc", padding: 12, borderRadius: 6 }}>
        <p style={{ margin: 0, color: "#666" }}>Componente MapSelector (placeholder)</p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={() => onLocationSelected({ lat: 19.1999, lng: -100.0678 })}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd", cursor: "pointer" }}
          >
            Usar ubicación de ejemplo (Valle)
          </button>
        </div>
      </div>
    );
  }

const styles = {
    // ... (Otros estilos sin cambios) ...
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0f2f5", 
      padding: 20,
    },
    card: {
      width: "100%",
      maxWidth: 720,
      background: "#fff",
      padding: 24,
      borderRadius: 10,
      boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    },
    title: { color: "#1B5E20", marginBottom: 15, textAlign: 'center' },
    tabContainer: {
        display: 'flex',
        marginBottom: 20,
        borderBottom: '2px solid #ddd',
    },
    tabButton: {
        padding: '10px 20px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontWeight: 600,
        color: '#555',
        borderBottom: '2px solid transparent',
        transition: 'all 0.3s',
    },
    activeTab: {
        color: '#1B5E20',
        borderBottom: '2px solid #1B5E20',
        background: '#f8f8f8',
    },
    tabContent: {
        paddingTop: 10,
    },
    label: { display: "block", marginTop: 10, marginBottom: 6, fontWeight: 600 },
    input: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd" },
    fileInput: { display: "block", marginTop: 6 },
    select: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd" },
    primaryBtn: {
      background: "#FF6B35", 
      color: "#fff",
      padding: "10px 18px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: 'bold',
      transition: 'background 0.3s',
    },
    secondaryBtn: {
      background: "#fff",
      color: "#1B5E20",
      padding: "10px 18px",
      borderRadius: 8,
      border: "1px solid #1B5E20",
      cursor: "pointer",
      transition: 'background 0.3s',
    },
    errorText: { color: "#D32F2F", marginTop: 8 },
    // 💡 NUEVO ESTILO: Caja de alerta para requisitos
    alertBox: {
        padding: 15,
        border: '1px solid #4CAF50',
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        color: '#1B5E20',
        marginBottom: 15,
    }
  };