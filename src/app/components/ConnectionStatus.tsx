"use client";
import React, { useState } from 'react';
import { getAirtableConnectionStatus } from '../utils/airtableConfig';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const connectionStatus = getAirtableConnectionStatus();

  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-2 rounded"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className={`w-2 h-2 rounded-full ${
          connectionStatus.status === 'configured' ? 'bg-green-500' : 
          connectionStatus.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        }`}></div>
        <span className={
          connectionStatus.status === 'configured' ? 'text-green-700' : 
          connectionStatus.status === 'error' ? 'text-red-700' : 'text-yellow-700'
        }>
          {connectionStatus.message}
        </span>
        <span className="text-gray-400">ⓘ</span>
      </div>

      {showDetails && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-96">
          <h4 className="font-semibold text-gray-900 mb-2">Estado de Conexión</h4>
          
          {connectionStatus.usingMockData && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm font-medium">⚠️ Usando datos simulados</p>
              <p className="text-yellow-700 text-xs mt-1">
                La aplicación funciona con datos de ejemplo porque Airtable no está configurado correctamente.
              </p>
            </div>
          )}

          {connectionStatus.details.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Problemas detectados:</p>
              <ul className="text-xs text-red-600 space-y-1">
                {connectionStatus.details.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Configuración actual:</p>
            <div className="text-xs text-gray-600 space-y-1 font-mono bg-gray-50 p-2 rounded">
              <div>Token: {process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN ? 
                `${process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN.substring(0, 10)}...` : 
                'No configurado'}</div>
              <div>Base ID: {process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'No configurado'}</div>
              <div>Tabla Turnos: {process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'No configurado'}</div>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(false)}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
