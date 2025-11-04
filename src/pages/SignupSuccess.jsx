// src/pages/SignupSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const SignupSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verificando pago...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setMessage("No se encontró sesión de pago.");
      setLoading(false);
      return;
    }

    // Llama a tu endpoint backend para verificar la sesión de Stripe y crear el usuario
    fetch("/api/complete-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          setMessage("Pago verificado. Cuenta creada correctamente.");
          setTimeout(() => {
            // Redirige al dashboard según tipo retornado por backend
            const redirect = data.redirectTo || "/dashboard-cliente";
            navigate(redirect);
          }, 1200);
        } else {
          setMessage("Error al completar registro: " + (data?.error || "Desconocido"));
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("Error verificando pago.");
      })
      .finally(() => setLoading(false));
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 20, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h2>{message}</h2>
      {loading ? <p>Procesando...</p> : <p>Serás redirigido en breve.</p>}
    </div>
  );
};

export default SignupSuccess;
