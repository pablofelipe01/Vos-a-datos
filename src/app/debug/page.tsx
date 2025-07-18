'use client';

import { useState } from 'react';
import { airtableService } from '../services/airtableService';

export default function DebugPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Iniciando test de conexión...');
      
      // Test directo de getTurnos
      const turnos = await airtableService.getTurnos();
      console.log('✅ Turnos obtenidos:', turnos);
      
      // Test directo de getTurnoActual
      const turnoActual = await airtableService.getTurnoActual();
      console.log('✅ Turno actual:', turnoActual);
      
      setResult({
        totalTurnos: turnos.length,
        turnos: turnos.slice(0, 3), // Solo los primeros 3
        turnoActual,
        success: true
      });
      
    } catch (err: unknown) {
      console.error('❌ Error en test:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔧 Debug de Airtable</h1>
      
      <button 
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {loading ? '🔄 Probando...' : '🧪 Probar Conexión'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>{error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold text-lg">✅ Conexión Exitosa</h2>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
