import React, { useState } from 'react';

const NewBenefitForm = ({ onClose, onSave }) => {
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('Descuento');
  const [vigencia, setVigencia] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (descripcion && vigencia) {
      const nuevoBeneficio = { descripcion, tipo, vigencia };
      
      console.log('Simulando guardado:', nuevoBeneficio);
      alert(`¡Beneficio "${descripcion}" creado simuladamente!`);

      if (onSave) onSave(nuevoBeneficio); // ✅ ahora sí está activa
      onClose();
    } else {
      alert('Por favor, completa la descripción y la vigencia.');
    }
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <span onClick={onClose} style={closeButtonStyle}>
          &times;
        </span>
        <h3 style={{ color: '#1B5E20' }}>🎁 Crear Nuevo Beneficio/Promoción</h3>
        <p>Define una nueva oferta para tus miembros.</p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={labelStyle}>
            Descripción del Beneficio:
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              style={inputStyle}
              placeholder="Ej: 2x1 en café, 15% de descuento en todo el menú"
            />
          </label>

          <label style={labelStyle}>
            Tipo de Oferta:
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={inputStyle}
            >
              <option value="Descuento">Descuento</option>
              <option value="Producto Gratis">Producto Gratis</option>
              <option value="Servicio Extra">Servicio Extra</option>
            </select>
          </label>

          <label style={labelStyle}>
            Fecha de Vigencia (Fin):
            <input
              type="date"
              value={vigencia}
              onChange={(e) => setVigencia(e.target.value)}
              required
              style={inputStyle}
            />
          </label>

          <button type="submit" style={submitButtonStyle}>
            Guardar Beneficio
          </button>
        </form>
      </div>
    </div>
  );
};

// ✅ ESTILOS CORRECTOS (sin reasignaciones)
const modalStyle = {
  position: 'fixed',
  zIndex: 1000,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  overflow: 'auto',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '25px',
  borderRadius: '10px',
  width: '90%',
  maxWidth: '500px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  position: 'relative',
};

const closeButtonStyle = {
  color: '#aaa',
  position: 'absolute',
  right: '15px',
  top: '10px',
  fontSize: '28px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  marginTop: '20px',
};

const labelStyle = {
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '16px',
};

const submitButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#FF6B35',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '10px',
};

export default NewBenefitForm;
