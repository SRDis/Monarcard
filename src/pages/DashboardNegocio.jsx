import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import BenefitCard from "../components/BenefitCard";
import { validateQRCode } from "../utils/qrUtils";
import NewBenefitForm from "../components/NewBenefitForm";
import { useNavigate } from "react-router-dom";
// --- ¡NUEVA IMPORTACIÓN! ---
import QrScannerComponent from "../components/QrScannerComponent"; // Asegúrate de que la ruta sea correcta
// --------------------------

// --- Modal de confirmación (CORREGIDO: Ahora usa usuario.profile_pic) ---
const UserValidationModal = ({ usuario, onFinalize, onCancel }) => (
  <div style={modalOverlay}>
    <div style={modalCard}>
      <h3 style={{ color: "#1B5E20" }}>✅ Usuario Verificado</h3>
      <img
        src={usuario.profile_pic || "/default-user.png"}
        alt="Usuario"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          objectFit: "cover",
          marginTop: "10px",
        }}
      />
      <h4 style={{ marginTop: "15px" }}>{usuario.nombre}</h4>
      <p style={{ color: "#555" }}>{usuario.email}</p>
      <p
        style={{
          color: "#FF6B35",
          fontWeight: "bold",
          marginTop: "10px",
        }}
      >
        ¿Desea registrar la redención?
      </p>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-around",
          gap: "10px",
        }}
      >
        <button onClick={onFinalize} style={botonVerde}>
          Canjear y Finalizar
        </button>
        <button onClick={onCancel} style={botonRojo}>
          Cancelar Redención
        </button>
      </div>
    </div>
  </div>
);

const DashboardNegocio = () => {
  const navigate = useNavigate();
  const [negocio, setNegocio] = useState(null);
  const [beneficios, setBeneficios] = useState([]);
  const [redenciones, setRedenciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [qrInput, setQrInput] = useState(""); // Se usa para el input manual de fallback
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [scannedUserId, setScannedUserId] = useState(null);
  const [showNewBenefitModal, setShowNewBenefitModal] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState(null);

  // --- Obtenemos sesión actual (useEffect) ---
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const userId = session.user.id;
      await fetchNegocio(userId);
      await fetchPerfilUsuario(userId);
    };
    fetchData();
  }, [navigate]);

  // --- Funciones de carga de datos (Se mantienen igual) ---
  const fetchPerfilUsuario = async (userId) => {
    // ... (código se mantiene)
    const { data, error } = await supabase
      .from("users")
      .select("nombre, profile_pic")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setPerfilUsuario(data);
    } else {
      console.error("Error cargando perfil de usuario:", error);
    }
  };

  const fetchNegocio = async (userId) => {
    // ... (código se mantiene)
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("usuario_id", userId)
      .single();

    if (error || !data) {
      console.error("Error cargando negocio:", error);
      setMensaje("Error cargando negocio o no encontrado.");
      return;
    }

    setNegocio(data);
    fetchBeneficios(data.id);
    fetchRedenciones(data.id);
  };

  const fetchBeneficios = async (negocioId) => {
    // ... (código se mantiene)
    const { data, error } = await supabase
      .from("benefits")
      .select("*")
      .eq("negocio_id", negocioId)
      .order("id", { ascending: true });

    if (!error) setBeneficios(data);
    else console.error("Error fetching benefits:", error);
  };

  const fetchRedenciones = async (negocioId) => {
    // ... (código se mantiene)
    const { data, error } = await supabase
      .from("redemptions")
      .select("*, usuario:usuario_id(email, nombre)")
      .eq("negocio_id", negocioId)
      .order("fecha_uso", { ascending: false });

    if (!error) setRedenciones(data);
    else console.error("Error fetching redemptions:", error);
  };

  // --- Lógica de Manejo de Redención y Cancelación (Se mantienen igual) ---
  const handleRedeemFinalize = async () => {
    // ... (código se mantiene)
    if (!scannedUserId || !usuarioActual || !negocio) return;

    const beneficioACanjear = beneficios[0];
    if (!beneficioACanjear) {
      setMensaje("Error: No hay beneficios activos para este negocio.");
      setShowUserModal(false);
      setQrInput("");
      setIsProcessing(false);
      return;
    }

    setMensaje("Registrando redención...");
    setIsProcessing(true);
    setShowUserModal(false);

    const { error } = await supabase.from("redemptions").insert([
      {
        usuario_id: scannedUserId,
        beneficio_id: beneficioACanjear.id,
        negocio_id: negocio.id,
        estado: "válida",
        fecha_uso: new Date(),
      },
    ]);

    if (error) {
      setMensaje("❌ Error registrando redención: " + error.message);
    } else {
      setMensaje(
        `✅ Redención registrada para ${usuarioActual.email} (${beneficioACanjear.descripcion}).`
      );
      fetchRedenciones(negocio.id);
    }

    setQrInput("");
    setScannedUserId(null);
    setUsuarioActual(null);
    setIsProcessing(false);
  };

  const handleCancelRedemption = () => {
    // ... (código se mantiene)
    setMensaje("🚫 Redención cancelada por el operador.");
    setShowUserModal(false);
    setQrInput("");
    setScannedUserId(null);
    setUsuarioActual(null);
    setIsProcessing(false);
  };

  // --- VALIDAR QR (FUNCIÓN UNIFICADA PARA ESCÁNER Y MANUAL) ---
  const handleScan = async (scannedValue) => {
    const qrToValidate = scannedValue || qrInput;
    
    if (!qrToValidate || !negocio) {
        setMensaje("Ingresa un código QR o espera el escaneo.");
        return;
    }
    
    // Evita que se procese dos veces o mientras el modal está abierto
    if (isProcessing || showUserModal) return; 

    setIsProcessing(true);
    setMensaje("Validando QR...");
    
    // Si la validación viene del escáner, actualiza el input para visibilidad
    if (scannedValue) setQrInput(scannedValue); 

    let userId = null;
    try {
      userId = atob(qrToValidate).split("-")[0];
    } catch (e) {
      setIsProcessing(false);
      setQrInput("");
      return setMensaje("Error: Formato de QR no válido (no es Base64).");
    }

    const result = await validateQRCode(userId, negocio.id);

    if (!result.valid) {
      setMensaje(`🛑 ${result.message}`);
      setIsProcessing(false);
      setQrInput("");
      return;
    }

    setScannedUserId(userId);
    setUsuarioActual(result.user);
    setMensaje(`Usuario ${result.user.nombre} verificado. Confirmar canje...`);
    setShowUserModal(true);
    setIsProcessing(false);
  };

  // --- Guardar nuevo beneficio (Se mantiene igual) ---
  const handleSaveBenefit = async (beneficio) => {
    // ... (código se mantiene)
    const { error } = await supabase.from("benefits").insert([
      {
        descripcion: beneficio.descripcion,
        negocio_id: negocio.id,
        descuento_porcentaje: beneficio.descuento_porcentaje || 0,
        limite_uso: beneficio.limite_uso || 1,
        fecha_vigencia_inicio: new Date(),
        fecha_vigencia_fin: beneficio.vigencia_fin,
        estado: "activo",
      },
    ]);

    if (error) alert("Error guardando beneficio: " + error.message);
    else {
      alert("✅ Beneficio guardado correctamente.");
      fetchBeneficios(negocio.id);
      setShowNewBenefitModal(false);
    }
  };

  if (!negocio)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando...</p>;

  const totalRedenciones = redenciones.length;
  const ultimoUsuario = redenciones[0]?.usuario?.email || "Ninguno";

  return (
    <div style={container}>
      {/* --- Encabezado Principal (Logo y Título) --- */}
      <div style={headerInfo}>
        <img
          src={negocio.logo_url || "/default-logo.png"}
          alt="Logo del negocio"
          style={logoNegocio}
        />
        <div style={headerText}>
          <h1 style={titulo}>
            Panel de <span style={{ color: "#FF6B35" }}>{negocio.nombre}</span>
          </h1>
          <p style={{ color: "#555" }}>
            Administra tus beneficios y valida los QR de tus clientes.
          </p>
        </div>
      </div>

      {/* --- Información del Responsable (IZQUIERDA) --- */}
      {perfilUsuario && (
        <div style={profileSection}>
          <img
            src={perfilUsuario.profile_pic || "/default-user.png"}
            alt="Perfil del usuario"
            style={fotoPerfil}
          />
          <div style={profileText}>
            <p style={{ margin: 0, fontWeight: "bold", color: "#1B5E20" }}>
              RESPONSABLE:
            </p>
            <p style={{ margin: 0, color: "#333", fontSize: "1.1em" }}>
              {perfilUsuario.nombre}
            </p>
          </div>
        </div>
      )}

      {/* Sección escáner */}
      <section style={seccion}>
        <h2 style={{ color: "#1B5E20" }}>Escáner QR</h2>

        {/* --- REEMPLAZO DEL DIV POR EL COMPONENTE DE CÁMARA REAL --- */}
        <QrScannerComponent onScan={handleScan} />
        {/* ------------------------------------------------------------ */}


        <p style={textoPrueba}>*Prueba Manual (Temporal)</p>
        <input
          type="text"
          placeholder="Pega aquí QR generado (Base64)"
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
          style={inputQR}
        />
        <br />
        <button
          onClick={() => handleScan(null)} // Llamada manual, pasa null para usar qrInput
          disabled={isProcessing || showUserModal || !qrInput}
          style={{
            ...botonNaranja,
            backgroundColor:
              isProcessing || showUserModal || !qrInput ? "#ccc" : "#FF6B35",
            cursor:
              isProcessing || showUserModal || !qrInput ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? "Validando..." : "Validar QR Manualmente"}
        </button>

        <p style={mensajeEstilo}>{mensaje}</p>
      </section>

      <hr style={linea} />

      {/* Beneficios */}
      <section>
        <h2 style={{ color: "#1B5E20" }}>Beneficios Activos</h2>
        <div style={beneficiosGrid}>
          {beneficios.length === 0 ? (
            <p>No hay beneficios disponibles.</p>
          ) : (
            beneficios.map((b) => <BenefitCard key={b.id} beneficio={b} />)
          )}

          <button onClick={() => setShowNewBenefitModal(true)} style={botonVerde}>
            ➕ Agregar Beneficio
          </button>
        </div>
      </section>

      <hr style={linea} />

      {/* Redenciones */}
      <section>
        <h2 style={{ color: "#1B5E20" }}>Historial de Redenciones</h2>
        <p>
          Total: <strong>{totalRedenciones}</strong>
        </p>
        <p>
          Último usuario: <strong>{ultimoUsuario}</strong>
        </p>

        {redenciones.length > 0 && (
          <table style={tabla}>
            <thead>
              <tr style={encabezadoTabla}>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {redenciones.slice(0, 5).map((r) => (
                <tr
                  key={r.id}
                  style={{
                    backgroundColor:
                      r.estado === "válida" ? "#e8ffe8" : "#ffe8e8",
                  }}
                >
                  <td>{new Date(r.fecha_uso).toLocaleDateString()}</td>
                  <td>{r.usuario?.email || "N/A"}</td>
                  <td>{r.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showUserModal && usuarioActual && (
        <UserValidationModal
          usuario={usuarioActual}
          onFinalize={handleRedeemFinalize}
          onCancel={handleCancelRedemption}
        />
      )}

      {showNewBenefitModal && (
        <NewBenefitForm
          onClose={() => setShowNewBenefitModal(false)}
          onSave={handleSaveBenefit}
        />
      )}
    </div>
  );
};

// --- Estilos --- (Se mantienen igual, solo se elimina areaCamara)
const container = {
  textAlign: "center",
  margin: "30px auto",
  fontFamily: "Arial, sans-serif",
  maxWidth: "900px",
  padding: "0 15px",
};

// Estilos para el encabezado principal (Logo y Título)
const headerInfo = {
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  marginBottom: "10px", 
  gap: "15px",
  textAlign: "left",
};

const headerText = {
  flexGrow: 1, 
  minWidth: 0,
};

const logoNegocio = {
  width: "90px", 
  height: "90px",
  borderRadius: "10px",
  objectFit: "cover",
  border: "2px solid #FF6B35",
  flexShrink: 0,
};

// --- Estilos para la sección de Responsable ---
const profileSection = {
  display: "flex",
  justifyContent: "flex-start", 
  alignItems: "center",
  gap: "15px",
  marginBottom: "30px", 
  marginTop: "10px",
};

const profileText = {
  textAlign: "left", 
  lineHeight: 1.2,
};

const fotoPerfil = { 
  width: "50px", 
  height: "50px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid #1B5E20",
  flexShrink: 0,
};
// --- FIN Estilos de Responsable ---


const titulo = { color: "#1B5E20", marginBottom: "5px", fontSize: "1.8em" }; 
const seccion = {
  backgroundColor: "#f9f9f9",
  padding: "20px",
  borderRadius: "8px",
  marginTop: "30px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};
// const areaCamara (ELIMINADO, ahora se gestiona en QrScannerComponent)
const textoPrueba = {
  marginTop: "20px",
  color: "#555",
  borderTop: "1px solid #eee",
  paddingTop: "10px",
};
const inputQR = {
  padding: "10px",
  width: "calc(100% - 150px)",
  margin: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};
const mensajeEstilo = {
  marginTop: "10px",
  color: "#1B5E20",
  fontWeight: "bold",
  minHeight: "20px",
};
const linea = { margin: "40px 0", borderTop: "1px solid #ddd" };
const beneficiosGrid = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "15px",
  marginTop: "10px",
};
const tabla = {
  width: "100%",
  marginTop: "20px",
  borderCollapse: "collapse",
};
const encabezadoTabla = {
  backgroundColor: "#1B5E20",
  color: "white",
};
const botonVerde = {
  padding: "10px 15px",
  backgroundColor: "#1B5E20",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};
const botonRojo = {
  padding: "10px 15px",
  backgroundColor: "#8D0000",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};
const botonNaranja = {
  padding: "10px 20px",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold",
};
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};
const modalCard = {
  backgroundColor: "#fff",
  borderRadius: "10px",
  padding: "25px",
  width: "90%",
  maxWidth: "450px",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
};

export default DashboardNegocio;