import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const QrScannerComponent = ({ onScan }) => {
    return (
        <div style={{ 
            height: '250px', 
            width: '100%', 
            borderRadius: '4px', 
            border: '5px solid #FF6B35' 
        }}>
            <Scanner
                onScan={(result) => {
                    // result es un array, tomamos el valor del primer código detectado
                    if (result && result.length > 0) {
                        onScan(result[0].rawValue);
                    }
                }}
                onError={(error) => {
                    console.error('Error del escáner:', error);
                }}
                constraints={{ facingMode: 'environment' }} // Prioriza la cámara trasera
            />
        </div>
    );
};

export default QrScannerComponent;