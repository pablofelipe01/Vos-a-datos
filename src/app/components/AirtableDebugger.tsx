"use client";
import React, { useState, useEffect } from 'react';
import { airtableService } from '../services/airtableService';

interface DebugInfo {
  hasToken: boolean;
  hasBaseId: boolean;
  turnosCount: number;
  personalCount: number;
  turnoActual?: {
    id: string;
    operador: string;
    estado: string;
    temperatura_inicio: number;
  } | null;
}

export default function AirtableDebugger() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rawData, setRawData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setErrorMessage('');
      
      console.log('Testing Airtable connection...');
      
      // Test básico de configuración
      const hasToken = !!process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN;
      const hasBaseId = !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
      
      console.log('Environment variables:', {
        hasToken,
        hasBaseId,
        token: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN?.substring(0, 10) + '...',
        baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
      });

      // Test de obtener turnos
      const turnos = await airtableService.getTurnos();
      console.log('Turnos obtenidos:', turnos);

      // Test de obtener turno actual
      const turnoActual = await airtableService.getTurnoActual();
      console.log('Turno actual:', turnoActual);

      // Test de obtener personal
      const personal = await airtableService.getPersonal();
      console.log('Personal obtenido:', personal);

      setDebugInfo({
        hasToken,
        hasBaseId,
        turnosCount: turnos.length,
        personalCount: personal.length,
        turnoActual: turnoActual ? {
          id: turnoActual.id || '',
          operador: turnoActual.operador || '',
          estado: turnoActual.estado || '',
          temperatura_inicio: turnoActual.temperatura_inicio || 0
        } : null
      });

      setRawData({
        turnos,
        personal,
        turnoActual
      });

      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error en test de conexión:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const testSpecificTable = async (tableName: string) => {
    try {
      console.log(`Testing table: ${tableName}`);
      
      const baseUrl = `https://api.airtable.com/v0/${process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID}`;
      const headers = {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${baseUrl}/${encodeURIComponent(tableName)}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Error en tabla ${tableName}:`, data);
        return { error: data.error || 'Error desconocido', status: response.status };
      }

      console.log(`Datos de ${tableName}:`, data);
      return { success: true, records: data.records };
    } catch (error) {
      console.error(`Error al probar tabla ${tableName}:`, error);
      return { error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🔧 Airtable Debug Console</h2>
      
      {/* Status de conexión */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'testing' ? 'bg-yellow-500 animate-pulse' :
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-semibold">
            Estado: {connectionStatus === 'testing' ? 'Probando...' : 
                    connectionStatus === 'connected' ? 'Conectado' : 'Error'}
          </span>
        </div>
        
        {errorMessage && (
          <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
      </div>

      {/* Información de debug */}
      {debugInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">🔑 Configuración</h3>
            <ul className="text-sm space-y-1">
              <li>Token: {debugInfo.hasToken ? '✅ Configurado' : '❌ Faltante'}</li>
              <li>Base ID: {debugInfo.hasBaseId ? '✅ Configurado' : '❌ Faltante'}</li>
              <li>Turnos encontrados: {debugInfo.turnosCount}</li>
              <li>Personal encontrado: {debugInfo.personalCount}</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">📊 Turno Actual</h3>
            {debugInfo.turnoActual ? (
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {debugInfo.turnoActual.id}</p>
                <p><strong>Operador:</strong> {debugInfo.turnoActual.operador}</p>
                <p><strong>Estado:</strong> {debugInfo.turnoActual.estado}</p>
                <p><strong>Temperatura:</strong> {debugInfo.turnoActual.temperatura_inicio}°C</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay turno activo</p>
            )}
          </div>
        </div>
      )}

      {/* Botones de test */}
      <div className="space-x-2 mb-6">
        <button
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔄 Reconectar
        </button>
        
        <button
          onClick={() => testSpecificTable('Turno Pirolisis')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          🧪 Test Tabla Turnos
        </button>
        
        <button
          onClick={() => testSpecificTable('Personal')}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          👥 Test Tabla Personal
        </button>
      </div>

      {/* Datos raw */}
      {rawData && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold text-gray-700 mb-2">📋 Datos Raw (JSON)</h3>
          <pre className="text-xs overflow-auto max-h-96 bg-white p-3 rounded border">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
