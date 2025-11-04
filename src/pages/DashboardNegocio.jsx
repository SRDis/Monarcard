import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import BenefitCard from "../components/BenefitCard";
import { validateQRCode } from "../utils/qrUtils";
import NewBenefitForm from "../components/NewBenefitForm";
import { useNavigate } from "react-router-dom";

// --- Modal de confirmación (CORREGIDO: Ahora usa usuario.profile_pic) ---
const UserValidationModal = ({ usuario, onFinalize, onCancel }) => (
  <div style={modalOverlay}>
    <div style={modalCard}>
      <h3 style={{ color: "#1B5E20" }}>✅ Usuario Verificado</h3>
      <img
        src={usuario.profile_pic || "/default-user.png"} // <--- ¡CORRECCIÓN APLICADA AQUÍ!
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
  const [qrInput, setQrInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [scannedUserId, setScannedUserId] = useState(null);
  const [showNewBenefitModal, setShowNewBenefitModal] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState(null);

  // --- Obtenemos sesión actual ---
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

  // --- Obtener perfil del usuario ---
  const fetchPerfilUsuario = async (userId) => {
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

  // --- Obtener datos del negocio ---
  const fetchNegocio = async (userId) => {
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

  // --- Obtener beneficios ---
  const fetchBeneficios = async (negocioId) => {
    const { data, error } = await supabase
      .from("benefits")
      .select("*")
      .eq("negocio_id", negocioId)
      .order("id", { ascending: true });

    if (!error) setBeneficios(data);
    else console.error("Error fetching benefits:", error);
  };

  // --- Obtener redenciones ---
  const fetchRedenciones = async (negocioId) => {
    const { data, error } = await supabase
      .from("redemptions")
      .select("*, usuario:usuario_id(email, nombre)")
      .eq("negocio_id", negocioId)
      .order("fecha_uso", { ascending: false });

    if (!error) setRedenciones(data);
    else console.error("Error fetching redemptions:", error);
  };

  // --- Confirmar redención ---
  const handleRedeemFinalize = async () => {
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
    setMensaje("🚫 Redención cancelada por el operador.");
    setShowUserModal(false);
    setQrInput("");
    setScannedUserId(null);
    setUsuarioActual(null);
    setIsProcessing(false);
  };

  // --- Validar QR ---
  const handleSimulatedScan = async () => {
    if (!qrInput) return setMensaje("Ingresa un código QR para validar.");

    setIsProcessing(true);
    setMensaje("Validando QR...");

    let userId = null;
    try {
      userId = atob(qrInput).split("-")[0];
    } catch (e) {
      setIsProcessing(false);
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

  // --- Guardar nuevo beneficio ---
  const handleSaveBenefit = async (beneficio) => {
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

        <div style={areaCamara}>
          <p>Área de la Cámara / Lector de QR</p>
          <p style={{ fontSize: "0.9em", opacity: 0.7 }}>
            Al escanear, el código se procesará automáticamente.
          </p>
        </div>

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
          onClick={handleSimulatedScan}
          disabled={isProcessing || showUserModal}
          style={{
            ...botonNaranja,
            backgroundColor:
              isProcessing || showUserModal ? "#ccc" : "#FF6B35",
            cursor:
              isProcessing || showUserModal ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? "Validando..." : "Validar QR"}
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

// --- Estilos ---
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
const areaCamara = {
  height: "250px",
  backgroundColor: "#222",
  borderRadius: "4px",
  margin: "15px 0",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  border: "5px solid #FF6B35",
};
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