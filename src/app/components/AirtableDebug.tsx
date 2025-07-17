"use client";
import React, { useState, useEffect } from 'react';
import { airtableService } from '../services/airtableService';

export default function AirtableDebug() {
  const [debug, setDebug] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log('🔍 Iniciando diagnóstico completo...');
      
      // Test basic configuration
      const config = {
        token: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN?.substring(0, 15) + '...',
        baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
        table: process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE
      };
      
      console.log('Config obtenida:', config);

      // Probar conexión directa
      const connectionTest = await airtableService.testConnection();
      console.log('Resultado test conexión:', connectionTest);

      // Test getting último turno (sin ID específico)
      let turnoActual = null;
      if (connectionTest.success) {
        console.log('Obteniendo último turno...');
        turnoActual = await airtableService.getDatosTurnoActual();
        console.log('Último turno obtenido:', turnoActual);
      }
      
      setDebug({
        config,
        connectionTest,
        turnoActual,
        timestamp: new Date().toLocaleTimeString()
      });
      
    } catch (error) {
      console.error('Debug error:', error);
      setDebug({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h3 className="text-lg font-bold mb-4">🔍 Debug Airtable Connection</h3>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {debug && (
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
          <pre className="text-xs">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
