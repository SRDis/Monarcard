import React from 'react';

const RedemptionCard = ({ redemption }) => {
  const fecha = new Date(redemption.fecha_uso).toLocaleString();

  return (
    <div style={{
      border: '1px solid #D4AF37',
      borderRadius: '8px',
      padding: '12px',
      margin: '10px',
      backgroundColor: '#FFF8E1',
      maxWidth: '300px'
    }}>
      <h4>{redemption.beneficio?.descripcion || 'Beneficio desconocido'}</h4>
      <p>Negocio: {redemption.negocio?.nombre || 'Desconocido'}</p>
      <p>Fecha: {fecha}</p>
      <p>Estado: {redemption.estado}</p>
    </div>
  );
};

export default RedemptionCard;
