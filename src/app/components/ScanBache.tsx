'use client';
import React, { useState, useEffect, useRef } from "react";
import { Camera, Paperclip, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

const MultiModalInput = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false); // Mantener solo el estado de escaneo
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      stopQRScanner(); // Limpiar el escáner al desmontar el componente
    };
  }, []);

  const startQRScanner = () => {
    if (isScanning) return;
    setIsScanning(true);

    const scanner = new Html5QrcodeScanner("qr-scanner", {
      fps: 10, // Frames per second
      qrbox: { width: 250, height: 250 }, // Tamaño de la caja de escaneo
    });

    scanner.render(
      (decodedText) => {
        setScannedData(decodedText); // Guardar el texto escaneado en la variable
        alert(`Código QR detectado: ${decodedText}`); // Mostrar el contenido en un mensaje
        stopQRScanner();
      },
      (error) => {
        console.warn("Error al escanear el código QR:", error);
      }
    );

    qrScannerRef.current = scanner;
  };

  const stopQRScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const captureBacheID = () => {
    if (scannedData) {
      alert(`ID del Bache Capturado: ${scannedData}`);
      // Aquí podrías agregar lógica adicional para procesar el ID del bache
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        {/* Botón para escanear QR */}
        <button
          onClick={startQRScanner}
          disabled={isScanning}
          className={`p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-all ${
            isScanning ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Camera className="w-5 h-5 text-white" />
        </button>

        {/* Botón para adjuntar archivos */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-full bg-green-500 hover:bg-green-600 transition-all"
        >
          <Paperclip className="w-5 h-5 text-white" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
        />

        {/* Botón para capturar ID del Bache */}
        <button
          onClick={captureBacheID}
          disabled={!scannedData}
          className={`p-3 rounded-full bg-purple-500 hover:bg-purple-600 transition-all ${
            !scannedData ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Capturar ID del Bache
        </button>
      </div>

      {/* Contenedor del escáner QR */}
      {isScanning && (
        <div className="w-full h-64 mt-4 bg-gray-800 rounded-lg flex items-center justify-center">
          <div id="qr-scanner" className="w-full h-full" />
        </div>
      )}

      {/* Archivos seleccionados */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-800 p-2 rounded-lg"
            >
              <span className="text-sm text-gray-200 truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mostrar el dato escaneado del QR */}
      {scannedData && (
        <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg">
          <strong>QR Data:</strong> {scannedData}
        </div>
      )}
    </div>
  );
};

export default MultiModalInput;