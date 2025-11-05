import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const QrScannerComponent = ({ onScan }) => {
  const [data, setData] = useState("Escanea un código QR...");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "5px solid #FF6B35",
        borderRadius: "8px",
        padding: "10px",
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <BarcodeScannerComponent
        width={300}
        height={300}
        onUpdate={(err, result) => {
          if (result) {
            setData(result.text);
            if (onScan) onScan(result.text);
          }
        }}
      />
      <p
        style={{
          marginTop: "10px",
          fontWeight: "bold",
          color: "#333",
          textAlign: "center",
        }}
      >
        {data}
      </p>
    </div>
  );
};

export default QrScannerComponent;