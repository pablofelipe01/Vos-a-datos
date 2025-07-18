'use client';

import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import AirtableDebug from '../components/AirtableDebug';
import { airtableService, TurnoData, PersonalData, ProcesoData } from '../services/airtableService';

interface TurnoMetricas {
  rendimiento: number;
  temperaturaPromedio: number;
  tiempoTranscurrido: string;
  eficiencia: number;
  estado: string;
  alertas: string[];
}

interface DashboardData {
  turno: TurnoData;
  personal: PersonalData[];
  procesos: ProcesoData[];
  metricas: TurnoMetricas;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showDebug, setShowDebug] = useState(false);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('🔄 Cargando datos del dashboard...');
      console.log('📊 AirtableService disponible:', !!airtableService);
      
      // Intentar obtener datos del turno actual SIN un ID específico
      // Esto permitirá que el servicio busque automáticamente un turno
      console.log('🎯 Llamando getDatosTurnoActual...');
      const data = await airtableService.getDatosTurnoActual();
      console.log('✅ Datos cargados:', data);
      
      setDashboardData(data);
      setLastUpdate(new Date());
    } catch (err: unknown) {
      console.error('❌ Error loading dashboard data:', err);
      if (err instanceof Error) {
        console.error('❌ Error stack:', err.stack);
        setError(`Error al cargar los datos: ${err.message}`);
      } else {
        setError('Error desconocido al cargar los datos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Dashboard useEffect iniciado');
    console.log('🚀 Window object available:', typeof window !== 'undefined');
    console.log('🚀 AirtableService instance:', airtableService);
    
    // Mostrar un indicador inmediato de que el useEffect se ejecutó
    setError('🚀 UseEffect iniciado - cargando datos...');
    
    // Agregar un try-catch para capturar cualquier error del useEffect
    const initializeDashboard = async () => {
      try {
        console.log('🔄 Iniciando carga de datos...');
        await loadDashboardData();
      } catch (err) {
        console.error('💥 Error en useEffect:', err);
        setError(`Error en useEffect: ${err}`);
      }
    };
    
    // Ejecutar inmediatamente
    initializeDashboard();
    
    // Actualizar datos cada 30 segundos  
    const interval = setInterval(() => {
      console.log('🔄 Actualizando datos automáticamente...');
      initializeDashboard();
    }, 30000);
    
    return () => {
      console.log('🧹 Limpiando interval del dashboard');
      clearInterval(interval);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'text-green-600 bg-green-100';
      case 'Completado': return 'text-blue-600 bg-blue-100';
      case 'Suspendido': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTemperaturaColor = (temp: number) => {
    if (temp < 300) return 'text-blue-600';
    if (temp > 600) return 'text-red-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/h6.png')" }}>
        <NavBar />
        <div className="pt-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/h6.png')" }}>
        <NavBar />
        <div className="pt-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error || 'No se pudieron cargar los datos'}</span>
              <div className="mt-3 flex space-x-2">
                <button 
                  onClick={loadDashboardData}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  🔄 Reintentar
                </button>
                <button 
                  onClick={() => setShowDebug(!showDebug)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  🔧 {showDebug ? 'Ocultar' : 'Mostrar'} Debug
                </button>
              </div>
              
              {/* Debug Panel */}
              {showDebug && (
                <div className="mt-4">
                  <AirtableDebug />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/h6.png')" }}>
      <NavBar />
      
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="relative z-10 pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header del Dashboard */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard - Turno Actual</h1>
                <p className="text-gray-600 mt-1">
                  {dashboardData.turno.turno} - {dashboardData.turno.fecha} | Operador: {dashboardData.turno.operador}
                </p>
              </div>
              <div className="text-right">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getEstadoColor(dashboardData.turno.estado || 'Desconocido')}`}>
                  {dashboardData.turno.estado}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Última actualización: {formatTime(lastUpdate)}
                </p>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {dashboardData.metricas.alertas.length > 0 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Alertas del Sistema</h3>
                  <ul className="mt-2 text-sm">
                    {dashboardData.metricas.alertas.map((alerta, index) => (
                      <li key={index}>• {alerta}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Temperatura */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm">🌡️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Temperatura Promedio</p>
                  <p className={`text-2xl font-bold ${getTemperaturaColor(dashboardData.metricas.temperaturaPromedio)}`}>
                    {dashboardData.metricas.temperaturaPromedio}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Rendimiento */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rendimiento</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.metricas.rendimiento.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Eficiencia */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">⚡</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Eficiencia</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardData.metricas.eficiencia.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Tiempo Transcurrido */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm">⏱️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tiempo Transcurrido</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardData.metricas.tiempoTranscurrido}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Detallada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Detalles del Turno */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Turno</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Temperatura Inicial</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dashboardData.turno.temperatura_inicio?.toFixed(3)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Temperatura Final</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dashboardData.turno.temperatura_fin?.toFixed(3)}°C
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Biomasa (kg)</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dashboardData.turno.biomasa_kg}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Biochar (kg)</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dashboardData.turno.biochar_kg}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dashboardData.turno.observaciones || 'Sin observaciones'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal y Supervisión */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal del Turno</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Operador</p>
                  <p className="text-lg font-semibold text-gray-900">{dashboardData.turno.operador}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Supervisor</p>
                  <p className="text-lg font-semibold text-gray-900">{dashboardData.turno.supervisor}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Personal Disponible</p>
                  <div className="space-y-2">
                    {dashboardData.personal.slice(0, 3).map((persona) => (
                      <div key={persona.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{persona.nombre}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {persona.cargo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Procesos en Curso */}
          <div className="mt-8 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Procesos en Curso</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lote
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Biomasa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temperatura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.procesos.map((proceso) => (
                    <tr key={proceso.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {proceso.lote_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proceso.tipo_biomasa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proceso.cantidad_inicial}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proceso.temperatura_proceso}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(proceso.estado)}`}>
                          {proceso.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botón de Actualización Manual */}
          <div className="mt-8 text-center">
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200"
            >
              🔄 Actualizar Datos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
