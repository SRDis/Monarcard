import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../services/supabaseClient";
import BenefitCard from "../components/BenefitCard";
import RedemptionCard from "../components/RedemptionCard";
import { useNavigate } from "react-router-dom";

const DashboardCliente = () => {
  const [user, setUser] = useState(null);
  const [qrData, setQrData] = useState("");
  const [benefits, setBenefits] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [estadoMembresia, setEstadoMembresia] = useState({
    activa: true,
    texto: "✓ Membresía activa",
    color: "#CEED9F",
  });

  const navigate = useNavigate();

  // ----------------- FUNCIONES -----------------
  const generateQR = (userId) => {
    const timestamp = Date.now();
    const token = Math.random().toString(36).substring(2, 8);
    setQrData(btoa(`${userId}-${timestamp}-${token}`));
  };

  const fetchUserProfile = async (authUser) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      console.error("Error obteniendo perfil:", error);
      setMensaje("Error al cargar el perfil.");
    } else {
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: data.nombre || "Cliente",
        tipo: data.tipo_cuenta || "cliente_turista",
        foto: data.profile_pic || data.fotografia_url || null, // 👈 AQUÍ EL CAMBIO
        fecha_creacion: data.created_at,
        fecha_expiracion: data.fecha_expiracion || null,
      });
      verificarMembresia(data);
    }
  };

  const verificarMembresia = async (data) => {
    if (!data) return;

    try {
      const fechaInicio = new Date(data.created_at);
      const hoy = new Date();

      // Duración por tipo
      const limiteDias = data.tipo_cuenta === "cliente_turista" ? 7 : 90;

      const fechaExpiracion = new Date(fechaInicio);
      fechaExpiracion.setDate(fechaInicio.getDate() + limiteDias);

      const expirada = hoy > fechaExpiracion;

      // Si no hay fecha de expiración registrada, se guarda
      if (!data.fecha_expiracion) {
        await supabase
          .from("users")
          .update({ fecha_expiracion: fechaExpiracion.toISOString() })
          .eq("id", data.id);
      }

      if (expirada) {
        setEstadoMembresia({
          activa: false,
          texto: "Membresía expirada 😞",
          color: "#FF6B6B",
        });
      } else {
        setEstadoMembresia({
          activa: true,
          texto: "✓ Membresía activa",
          color: "#CEED9F",
        });
      }
    } catch (error) {
      console.error("Error verificando membresía:", error);
    }
  };

  const fetchBenefits = async () => {
    const hoy = new Date().toISOString();
    const { data, error } = await supabase
      .from("benefits")
      .select("*")
      .gte("fecha_vigencia_fin", hoy)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error cargando beneficios:", error);
      setMensaje("Error cargando beneficios.");
    } else {
      setBenefits(data || []);
    }
  };

  const fetchRedemptions = async (userId) => {
    const { data, error } = await supabase
      .from("redemptions")
      .select(
        `
        *,
        beneficio:beneficio_id(*),
        negocio:negocio_id(*)
      `
      )
      .eq("usuario_id", userId)
      .order("fecha_uso", { ascending: false });

    if (error) {
      console.error("Error cargando redenciones:", error);
      setMensaje("Error cargando historial de redenciones.");
    } else {
      setRedemptions(data || []);
    }
  };

  const handleViewAllBenefits = () => {
    navigate("/beneficios-completos");
  };

  // ----------------- EFECTO INICIAL -----------------
  useEffect(() => {
    const getUserSession = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        navigate("/login");
        return;
      }

      const authUser = session.user;
      await fetchUserProfile(authUser);
      generateQR(authUser.id);
      await fetchBenefits();
      await fetchRedemptions(authUser.id);

      setLoading(false);
    };

    getUserSession();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando...</p>;
  if (!user) return <p style={{ textAlign: "center" }}>No se encontró el usuario.</p>;

  // ----------------- RENDER -----------------
  const LIMITE_MOSTRAR = 3;
  const beneficiosAmostrar = benefits.slice(0, LIMITE_MOSTRAR);
  const totalBeneficios = benefits.length;
  const hayMasBeneficios = totalBeneficios > beneficiosAmostrar.length;

  const tipoLegible =
    user.tipo === "cliente_residente" ? "Residente" : "Turista";

  return (
    <div style={{ textAlign: "center", margin: "20px", fontFamily: "Arial, sans-serif" }}>
  {user.foto && (
        <img
          src={user.foto}
          alt="Foto de perfil"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
            border: "3px solid #1B5E20",
          }}
        />
      )}

      <h1 style={{ color: "#1B5E20" }}>Bienvenido, {user.name}</h1>

    

      <p
        style={{
          color: "#395213",
          fontWeight: "bold",
          backgroundColor: estadoMembresia.color,
          borderRadius: "20px",
          width: "300px",
          margin: "10px auto",
          padding: "10px",
        }}
      >
        {estadoMembresia.texto} ({tipoLegible})
      </p>

      {/* QR */}
      <div style={{ margin: "20px" }}>
        {estadoMembresia.activa ? (
          qrData ? (
            <QRCodeCanvas value={qrData} size={250} />
          ) : (
            <p>Generando QR...</p>
          )
        ) : (
          <span style={{ fontSize: "100px" }}>😞</span>
        )}
      </div>

      {estadoMembresia.activa && (
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#FF6B35",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => generateQR(user.id)}
        >
          Regenerar Código QR
        </button>
      )}

      {/* Beneficios */}
      <h2 style={{ marginTop: "40px", color: "#1B5E20" }}>Beneficios Disponibles</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        {totalBeneficios === 0 ? (
          <p>No hay beneficios disponibles actualmente</p>
        ) : (
          beneficiosAmostrar.map((b) => <BenefitCard key={b.id} beneficio={b} />)
        )}
      </div>

      {/* Botón "Ver todos" */}
      {hayMasBeneficios && (
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#1B5E20",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px",
            fontSize: "1em",
            fontWeight: "bold",
          }}
          onClick={handleViewAllBenefits}
        >
          Ver los {totalBeneficios} beneficios completos 🚀
        </button>
      )}

      {/* Historial */}
      <h2 style={{ marginTop: "40px", color: "#1B5E20" }}>Historial de Redenciones</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        {redemptions.length === 0 ? (
          <p>No has usado ningún beneficio todavía</p>
        ) : (
          redemptions.map((r) => <RedemptionCard key={r.id} redemption={r} />)
        )}
      </div>

      {mensaje && (
        <p
          style={{
            marginTop: "20px",
            color: "#1B5E20",
            fontWeight: "bold",
            minHeight: "20px",
          }}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default DashboardCliente;
