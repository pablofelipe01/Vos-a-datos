"use client";
import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import ConnectionStatus from '../components/ConnectionStatus';
import AirtableDebug from '../components/AirtableDebug';
import { airtableService } from '../services/airtableService';

interface TurnoActualData {
  turno: any;
  personal: any[];
  procesos: any[];
  metricas: {
    rendimiento: number;
    temperaturaPromedio: number;
    tiempoTranscurrido: string;
    eficiencia: number;
    estado: string;
    alertas: string[];
    totalBalancesMasa: number;
    totalViajesBiomasa: number;
    bitacoraEntradas: number;
  };
  balancesMasa: any[];
  viajesBiomasa: any[];
  bitacoraHistorial: any[];
}

export default function MiTurno() {
  const [datosActuales, setDatosActuales] = useState<TurnoActualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');

  useEffect(() => {
    loadDatosTurnoActual();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadDatosTurnoActual, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDatosTurnoActual = async () => {
    try {
      setError(null);
      console.log('🚀 Cargando último turno desde Airtable...');
      // No pasamos ID específico, obtendrá el último registro automáticamente
      const datos = await airtableService.getDatosTurnoActual();
      console.log('✅ Datos obtenidos:', datos);
      setDatosActuales(datos);
      setUltimaActualizacion(new Date().toLocaleTimeString('es-ES'));
    } catch (err) {
      console.error('💥 Error loading turno actual:', err);
      setError('Error al cargar datos del turno actual desde Airtable: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
           style={{ backgroundImage: "url('/h6.png')" }}>
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white bg-opacity-90 p-8 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Cargando datos del turno actual...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !datosActuales) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
           style={{ backgroundImage: "url('/h6.png')" }}>
        <NavBar />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="space-y-4 max-w-4xl w-full">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
              <h3 className="font-bold">Error de Conexión</h3>
              <p>{error}</p>
              <button 
                onClick={loadDatosTurnoActual}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
            
            {/* Debug component para diagnosticar el problema */}
            <AirtableDebug />
          </div>
        </div>
      </div>
    );
  }

  const { turno, metricas } = datosActuales;

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
         style={{ backgroundImage: "url('/h6.png')" }}>
      <NavBar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header con Estado de Conexión */}
          <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Turno Actual</h1>
                <p className="text-gray-600">Monitor en tiempo real - Operador: {turno.operador}</p>
              </div>
              <div className="flex flex-col gap-2 mt-4 sm:mt-0">
                <ConnectionStatus isConfigured={true} />
                <p className="text-sm text-gray-500">Última actualización: {ultimaActualizacion}</p>
                <button
                  onClick={loadDatosTurnoActual}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  🔄 Actualizar
                </button>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {metricas.alertas.length > 0 && (
            <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-8">
              <h3 className="text-red-800 font-bold mb-2">⚠️ Alertas Activas</h3>
              <ul className="list-disc list-inside text-red-700">
                {metricas.alertas.map((alerta, index) => (
                  <li key={index}>{alerta}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Estado del Turno */}
          <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="text-lg font-semibold text-gray-900">Estado</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  turno.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                  turno.estado === 'Completado' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {turno.estado}
                </span>
                <p className="text-gray-500 text-sm mt-1">Tiempo: {metricas.tiempoTranscurrido}</p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">🌡️</div>
                <h3 className="text-lg font-semibold text-gray-900">Temperatura</h3>
                <p className="text-2xl font-bold text-orange-600">{metricas.temperaturaPromedio}°C</p>
                <p className="text-gray-500 text-sm">Actual: {turno.temperatura_inicio}°C</p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">⚗️</div>
                <h3 className="text-lg font-semibold text-gray-900">Rendimiento</h3>
                <p className="text-2xl font-bold text-green-600">{metricas.rendimiento.toFixed(1)}%</p>
                <p className="text-gray-500 text-sm">{turno.biochar_kg}kg / {turno.biomasa_kg}kg</p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">�</div>
                <h3 className="text-lg font-semibold text-gray-900">Eficiencia</h3>
                <p className="text-2xl font-bold text-blue-600">{metricas.eficiencia.toFixed(1)}%</p>
                <p className="text-gray-500 text-sm">General del turno</p>
              </div>
            </div>
          </div>

          {/* Métricas del Operador */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">⚖️</div>
              <h3 className="text-xl font-bold text-gray-900">{metricas.totalBalancesMasa || 0}</h3>
              <p className="text-gray-600">Balances de Masa</p>
              <p className="text-sm text-gray-500 mt-2">Registros completados</p>
            </div>

            <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">🚛</div>
              <h3 className="text-xl font-bold text-gray-900">{metricas.totalViajesBiomasa || 0}</h3>
              <p className="text-gray-600">Viajes de Biomasa</p>
              <p className="text-sm text-gray-500 mt-2">Transportes realizados</p>
            </div>

            <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="text-xl font-bold text-gray-900">{metricas.bitacoraEntradas || 0}</h3>
              <p className="text-gray-600">Entradas Bitácora</p>
              <p className="text-sm text-gray-500 mt-2">Registros recientes</p>
            </div>
          </div>

          {/* Detalles del Turno */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Información del Turno */}
            <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Detalles del Turno</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Fecha:</span>
                  <span className="text-gray-900">{new Date(turno.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Horario:</span>
                  <span className="text-gray-900">{turno.turno}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Operador:</span>
                  <span className="text-gray-900 font-semibold text-blue-600">{turno.operador}</span>
                </div>
              </div>
            </div>

            {/* Métricas de Producción */}
            <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏭 Métricas de Producción</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Biomasa Procesada</span>
                    <span className="text-sm text-gray-900">{turno.biomasa_kg} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-yellow-600 h-3 rounded-full transition-all duration-500" style={{width: '75%', maxWidth: '100%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Biochar Producido</span>
                    <span className="text-sm text-gray-900">{turno.biochar_kg} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-green-600 h-3 rounded-full transition-all duration-500" style={{width: `${Math.min(metricas.rendimiento, 100)}%`, maxWidth: '100%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Eficiencia del Proceso</span>
                    <span className="text-sm text-gray-900">{metricas.eficiencia.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{width: `${Math.min(metricas.eficiencia, 100)}%`, maxWidth: '100%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Bitácora */}
          {datosActuales.bitacoraHistorial && datosActuales.bitacoraHistorial.length > 0 && (
            <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">� Historial de Bitácora</h2>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {datosActuales.bitacoraHistorial.slice(0, 5).map((entrada, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm">{entrada.fields?.descripcion || entrada.fields?.Descripcion || 'Sin descripción'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {entrada.fields?.fecha ? new Date(entrada.fields.fecha).toLocaleDateString('es-ES') : 'Sin fecha'} - 
                          {entrada.fields?.hora || entrada.fields?.Hora || 'Sin hora'}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {entrada.fields?.tipo || entrada.fields?.Tipo || 'General'}
                      </span>
                    </div>
                  </div>
                ))}
                {datosActuales.bitacoraHistorial.length === 0 && (
                  <p className="text-gray-400 italic text-center py-4">No hay registros de bitácora</p>
                )}
              </div>
            </div>
          )}

          {/* Panel de Control Visual - Sin botones innecesarios */}
          <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎛️ Estado Actual del Proceso</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Observaciones del Turno:</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[60px]">
                {turno.observaciones ? (
                  <p className="text-gray-700">{turno.observaciones}</p>
                ) : (
                  <p className="text-gray-400 italic">No hay observaciones registradas</p>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = '/piroliapp'}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🔥 Ir a Control de Proceso
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
