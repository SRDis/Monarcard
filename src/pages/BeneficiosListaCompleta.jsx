// src/pages/BeneficiosListaCompleta.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import BenefitCard from "../components/BenefitCard";

const BeneficiosListaCompleta = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trae TODOS los beneficios activos desde Supabase
  const fetchAllBenefits = async () => {
    setLoading(true);
    setError(null);
    const hoy = new Date().toISOString();
    
    // NOTA: Se usa la misma lógica de filtro por vigencia que en el Dashboard
    const { data, error } = await supabase
      .from("benefits")
      .select("*")
      .gte("fecha_vigencia_fin", hoy) 
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching all benefits:", error);
      setError("Error cargando la lista completa de beneficios.");
      setLoading(false);
    } else {
      setBenefits(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBenefits();
  }, []);

  // --- RENDERIZADO ---

  if (loading) {
    return <p style={{ textAlign: "center", margin: "50px" }}>Cargando beneficios...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", margin: "50px", color: "red" }}>{error}</p>;
  }
  
  const totalBeneficios = benefits.length;

  return (
    <div style={{ textAlign: "center", margin: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#1B5E20", marginBottom: "10px" }}>
        Lista Completa de Descuentos y Beneficios 🎁
      </h1>
      <p style={{ color: "#333", fontSize: "1.1em", marginBottom: "30px" }}>
        ¡Descubre las {totalBeneficios} oportunidades que tenemos para ti!
      </p>

      <div 
        style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "center", 
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
        {totalBeneficios === 0 ? (
          <p>Actualmente no hay beneficios disponibles.</p>
        ) : (
          benefits.map((b) => <BenefitCard key={b.id} beneficio={b} />)
        )}
      </div>
      
    </div>
  );
};

export default BeneficiosListaCompleta;