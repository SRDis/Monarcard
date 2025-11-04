import React from 'react';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  textAlign: 'center',
  width: '300px',
};

const buttonStyle = {
  padding: '10px 20px',
  margin: '10px 5px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>
          {message}
        </p>
        <div>
          <button 
            onClick={onCancel} 
            style={{ ...buttonStyle, backgroundColor: '#ccc', color: '#333' }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            style={{ ...buttonStyle, backgroundColor: '#FF6B35', color: '#fff' }}
          >
            Sí, Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;