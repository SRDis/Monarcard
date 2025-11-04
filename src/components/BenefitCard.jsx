import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const BenefitCard = ({ beneficio }) => {
  const [negocio, setNegocio] = useState(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!beneficio?.usuario_id) return;

      // 🔍 Obtener negocio con su logo, ubicación y categoría
      const { data: business, error } = await supabase
        .from("businesses")
        .select("nombre, latitud, longitud, logo_url, categoria")
        .eq("usuario_id", beneficio.usuario_id)
        .single();

      if (error) {
        console.error("Error al obtener negocio:", error);
        return;
      }

      setNegocio(business);

      // 🗺️ Crear link a Google Maps si hay coordenadas
      if (business?.latitud && business?.longitud) {
        setGoogleMapsUrl(
          `https://www.google.com/maps/search/?api=1&query=${business.latitud},${business.longitud}`
        );
      }
    };

    fetchBusiness();
  }, [beneficio]);

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "350px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #1B5E20",
        borderRadius: "8px",
        padding: "15px",
        margin: "10px",
        backgroundColor: "#F5FFF5",
      }}
    >
      {/* Logo + Nombre del negocio */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        {negocio?.logo_url ? (
          <img
            src={negocio.logo_url}
            alt="Logo del negocio"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: "8px",
              marginRight: 10,
            }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              background: "#EEE",
              borderRadius: "8px",
              marginRight: 10,
            }}
          ></div>
        )}
        <div>
          <h3 style={{ margin: 0, color: "#1B5E20" }}>
            {negocio ? negocio.nombre : "Cargando..."}
          </h3>
          {negocio?.categoria && (
            <span
              style={{
                fontSize: "0.85rem",
                color: "#555",
                background: "#E8F5E9",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              {negocio.categoria}
            </span>
          )}
        </div>
      </div>

      {/* Información del beneficio */}
      <p>{beneficio.descripcion}</p>
      <p>Descuento: {beneficio.descuento_porcentaje}%</p>

      {/* Botón de ubicación */}
      {googleMapsUrl && (
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
          <button
            style={{
              backgroundColor: "#348A15",
              color: "white",
              padding: "8px 25px",
              border: "none",
              borderRadius: "20px",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            Ubicación
          </button>
        </a>
      )}
    </div>
  );
};

export default BenefitCard;
