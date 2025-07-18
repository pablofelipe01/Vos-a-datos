'use client';

import { useState } from 'react';
import { airtableService } from '../services/airtableService';

interface TestResults {
  configuracion?: {
    hasToken: boolean;
    baseId: string;
    turnosTable: string;
    tokenLength: number;
  };
  turnosRaw?: Record<string, unknown>;
  analisis?: {
    totalRegistros: number;
    camposDisponibles: string[];
    primerRegistro: Record<string, unknown> | null;
  };
  serviceResults?: {
    totalTurnos: number;
    totalPersonal: number;
    totalProcesos: number;
  } | null;
}

export default function AirtableDebug() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setError(null);
    setTestResults(null);

    try {
      console.log('🧪 Iniciando prueba de conexión Airtable...');
      
      // Test 0: Verificar configuración
      const token = process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN;
      const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
      const turnosTable = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE;
      
      console.log('� Configuración:', {
        hasToken: !!token,
        baseId,
        turnosTable,
        tokenLength: token?.length
      });

      // Test 1: Probar URL base directamente
      const baseUrl = `https://api.airtable.com/v0/${baseId}`;
      console.log('🌐 URL base:', baseUrl);

      // Test 2: Listar todas las tablas disponibles (esto puede fallar, pero es informativo)
      console.log('📋 Intentando obtener metadata de la base...');
      try {
        const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (metaResponse.ok) {
          const metaData = await metaResponse.json();
          console.log('✅ Tablas disponibles:', metaData.tables?.map((t: Record<string, unknown>) => t.name));
        }
      } catch (metaError) {
        console.log('⚠️ No se pudo obtener metadata (normal en algunos casos)');
      }

      // Test 3: Probar acceso directo a la tabla de turnos
      const turnosTableName = turnosTable || 'Turnos';
      const turnosUrl = `${baseUrl}/${encodeURIComponent(turnosTableName)}`;
      console.log('� Probando acceso a tabla de turnos:', turnosUrl);
      
      const turnosResponse = await fetch(turnosUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Respuesta de turnos:', {
        status: turnosResponse.status,
        statusText: turnosResponse.statusText,
        ok: turnosResponse.ok
      });

      if (!turnosResponse.ok) {
        const errorText = await turnosResponse.text();
        console.error('❌ Error en respuesta de turnos:', errorText);
        throw new Error(`Error ${turnosResponse.status}: ${errorText}`);
      }

      const turnosData = await turnosResponse.json();
      console.log('✅ Datos de turnos recibidos:', turnosData);
      
      // Analizar estructura de los datos
      if (turnosData.records && turnosData.records.length > 0) {
        const primerRegistro = turnosData.records[0];
        console.log('🔍 Estructura del primer registro:', {
          id: primerRegistro.id,
          fields: Object.keys(primerRegistro.fields),
          fieldsData: primerRegistro.fields
        });
      }

      // Test 4: Usar el servicio airtable (solo si hay datos)
      let serviceResults = null;
      if (turnosData.records && turnosData.records.length > 0) {
        console.log('⚙️ Probando servicios de airtable...');
        try {
          const turnos = await airtableService.getTurnos();
          const personal = await airtableService.getPersonal();
          const procesos = await airtableService.getProcesos();
          
          serviceResults = {
            turnos,
            personal,
            procesos,
            totalTurnos: turnos.length,
            totalPersonal: personal.length,
            totalProcesos: procesos.length
          };
          
          console.log('✅ Servicios funcionando:', serviceResults);
        } catch (serviceError) {
          console.error('❌ Error en servicios:', serviceError);
        }
      }

      setTestResults({
        configuracion: {
          hasToken: !!token,
          baseId,
          turnosTable,
          tokenLength: token?.length
        },
        turnosRaw: turnosData,
        serviceResults,
        analisis: {
          totalRegistros: turnosData.records?.length || 0,
          camposDisponibles: turnosData.records?.[0]?.fields ? Object.keys(turnosData.records[0].fields) : [],
          primerRegistro: turnosData.records?.[0]?.fields || null
        }
      });

    } catch (err: unknown) {
      console.error('❌ Error en prueba de conexión:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testEnvironmentVariables = () => {
    const envVars = {
      NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN,
      NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
      NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE: process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE,
      NEXT_PUBLIC_AIRTABLE_PERSONAL_TABLE: process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_TABLE,
      NEXT_PUBLIC_AIRTABLE_PROCESOS_TABLE: process.env.NEXT_PUBLIC_AIRTABLE_PROCESOS_TABLE
    };

    console.log('🔧 Variables de entorno:', envVars);
    return envVars;
  };

  const envVars = testEnvironmentVariables();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">🔧 Airtable Debug Console</h2>
      
      {/* Variables de Entorno */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Variables de Entorno</h3>
        <div className="bg-gray-100 p-3 rounded text-sm">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="font-mono text-blue-600">{key}:</span>{' '}
              <span className={value ? 'text-green-600' : 'text-red-600'}>
                {value ? (key.includes('TOKEN') ? `${value.substring(0, 15)}...` : value) : '❌ NO DEFINIDA'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de Prueba */}
      <button
        onClick={testConnection}
        disabled={isTestingConnection}
        className={`px-4 py-2 rounded font-semibold ${
          isTestingConnection
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isTestingConnection ? '🔄 Probando conexión...' : '🧪 Probar Conexión Airtable'}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h4 className="font-bold">❌ Error de Conexión:</h4>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Resultados */}
      {testResults && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">✅ Resultados de la Prueba</h3>
          
          {/* Análisis de la Conexión */}
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded">
            <h4 className="font-bold text-blue-800">📊 Análisis de Conexión:</h4>
            <div className="mt-2 text-sm">
              <p><strong>Total de registros encontrados:</strong> {testResults.analisis?.totalRegistros}</p>
              <p><strong>Campos disponibles:</strong> {testResults.analisis?.camposDisponibles?.join(', ') || 'Ninguno'}</p>
            </div>
          </div>

          {/* Primer Registro */}
          {testResults.analisis?.primerRegistro && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded">
              <h4 className="font-bold text-green-800">🔍 Primer Registro Encontrado:</h4>
              <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-32">
                {JSON.stringify(testResults.analisis.primerRegistro, null, 2)}
              </pre>
            </div>
          )}

          {/* Resumen de Servicios */}
          {testResults.serviceResults && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded">
                <div className="text-sm text-blue-600">Turnos Procesados</div>
                <div className="text-2xl font-bold text-blue-800">{testResults.serviceResults?.totalTurnos || 0}</div>
              </div>
              <div className="bg-green-100 p-3 rounded">
                <div className="text-sm text-green-600">Personal Procesado</div>
                <div className="text-2xl font-bold text-green-800">{testResults.serviceResults?.totalPersonal || 0}</div>
              </div>
              <div className="bg-purple-100 p-3 rounded">
                <div className="text-sm text-purple-600">Procesos Procesados</div>
                <div className="text-2xl font-bold text-purple-800">{testResults.serviceResults?.totalProcesos || 0}</div>
              </div>
            </div>
          )}

          {/* Datos Completos Raw */}
          <div className="bg-gray-100 p-3 rounded">
            <h4 className="font-bold mb-2">📊 Datos Raw de Airtable:</h4>
            <pre className="text-xs overflow-auto max-h-64 bg-white p-2 rounded border">
              {JSON.stringify(testResults.turnosRaw, null, 2)}
            </pre>
          </div>

          {/* Datos Procesados por Servicio */}
          {testResults.serviceResults && (
            <div className="mt-4 bg-gray-100 p-3 rounded">
              <h4 className="font-bold mb-2">⚙️ Datos Procesados por Servicios:</h4>
              <pre className="text-xs overflow-auto max-h-64 bg-white p-2 rounded border">
                {JSON.stringify(testResults.serviceResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
