import React from 'react';

const BeneficioNegocioCard = ({ beneficio, businesses }) => {
  // 1. Buscar el negocio cuyo ID coincida con el id_negocio del beneficio
  const negocioVinculado = businesses.find(
    (negocio) => negocio.id === beneficio.id_negocio
  );

  // 2. Obtener el nombre del negocio (usar un valor por defecto si no se encuentra)
  const nombreNegocio = negocioVinculado ? negocioVinculado.nombre : 'Negocio Desconocido';

  return (
    <div style={{
      border: '1px solid #1B5E20',
      borderRadius: '8px',
      padding: '12px',
      margin: '10px',
      backgroundColor: '#F0FFF0',
      maxWidth: '250px'
    }}>
      {/* 3. Agregar el nombre del negocio */}
      <h3 style={{ color: '#1B5E20' }}>{nombreNegocio}</h3>
      
      <h4>{beneficio.descripcion}</h4>
      <p>Descuento: {beneficio.descuento_porcentaje}%</p>
      <p>Vigencia: {new Date(beneficio.fecha_vigencia_inicio).toLocaleDateString()} - {new Date(beneficio.fecha_vigencia_fin).toLocaleDateString()}</p>
      <p>Límite de uso: {beneficio.límite_uso === 0 ? 'Ilimitado' : beneficio.límite_uso}</p>
    </div>
  );
};

export default BeneficioNegocioCard;
