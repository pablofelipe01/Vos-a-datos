"use client";
import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { airtableService, TurnoData } from '../services/airtableService';

interface MetricasTurno {
  rendimiento: number;
  temperaturaPromedio: number;
  tiempoTranscurrido: string;
  eficiencia: number;
  estado: string;
  alertas: string[];
  biomasaTotal: number;
  biocharTotal: number;
  energiaConsumida: number;
  gasConsumido: number;
}

interface DashboardData {
  turnoActual: TurnoData | null;
  ultimosTurnos: TurnoData[];
  metricas: MetricasTurno;
  estadisticas: {
    totalTurnos: number;
    turnosHoy: number;
    rendimientoPromedio: number;
    temperaturaMaxima: number;
  };
}

export default function SeguimientoTurno() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const cargarDatosTurnoActual = async () => {
    try {
      setError(null);
      console.log('🔄 Cargando datos de seguimiento de turno...');
      
      // Obtener todos los turnos para análisis
      const turnos = await airtableService.getTurnos();
      console.log(`✅ ${turnos.length} turnos obtenidos de Airtable`);
      
      if (turnos.length === 0) {
        throw new Error('No se encontraron turnos en la base de datos');
      }

      // Buscar turno actual (el más reciente o el que esté activo)
      const turnoActual = encontrarTurnoActual(turnos);
      const ultimosTurnos = turnos.slice(0, 10); // Últimos 10 turnos
      
      // Calcular métricas del turno actual
      const metricas = calcularMetricas(turnoActual);
      
      // Calcular estadísticas generales
      const estadisticas = calcularEstadisticas(turnos);

      const datos: DashboardData = {
        turnoActual,
        ultimosTurnos,
        metricas,
        estadisticas
      };

      setDashboardData(datos);
      setUltimaActualizacion(new Date());
      console.log('✅ Datos de seguimiento cargados exitosamente');
      
    } catch (err: unknown) {
      console.error('❌ Error cargando datos de seguimiento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar datos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const encontrarTurnoActual = (turnos: TurnoData[]): TurnoData | null => {
    // Buscar primero un turno con estado "Activo"
    const turnoActivo = turnos.find(t => {
      const turnoRecord = t as Record<string, unknown>;
      return t.estado === 'Activo' || 
             turnoRecord["Estado Final Planta"] === 'Encendida';
    });
    
    if (turnoActivo) return turnoActivo;
    
    // Si no hay turno activo, tomar el más reciente
    const turnosOrdenados = turnos.sort((a, b) => {
      const turnoRecordA = a as Record<string, unknown>;
      const turnoRecordB = b as Record<string, unknown>;
      const fechaA = new Date(String(turnoRecordA["Fecha Inicio Turno"] || a.fecha || ''));
      const fechaB = new Date(String(turnoRecordB["Fecha Inicio Turno"] || b.fecha || ''));
      return fechaB.getTime() - fechaA.getTime();
    });
    
    return turnosOrdenados[0] || null;
  };

  const calcularMetricas = (turno: TurnoData | null): MetricasTurno => {
    if (!turno) {
      return {
        rendimiento: 0,
        temperaturaPromedio: 0,
        tiempoTranscurrido: '0 horas',
        eficiencia: 0,
        estado: 'Sin datos',
        alertas: ['No hay turno activo'],
        biomasaTotal: 0,
        biocharTotal: 0,
        energiaConsumida: 0,
        gasConsumido: 0
      };
    }

    // Calcular biochar total del turno usando Record para acceder a campos dinámicos
    const turnoRecord = turno as Record<string, unknown>;
    const biocharTotal = Number(turnoRecord["Total Biochar Produccido Turno"]) || 
                        ((turnoRecord["Peso Biochar (KG) (from Balances Masa)"] as number[]) || []).reduce((sum: number, peso: number) => sum + peso, 0) || 
                        Number(turno.biochar_kg) || 0;

    // Calcular biomasa total estimada
    const biomasaTotal = biocharTotal > 0 ? biocharTotal * 4 : 0; // Estimación: 4kg biomasa por 1kg biochar

    // Calcular consumos
    const energiaConsumida = Number(turnoRecord["Consumo Energia Fin"] || 0) - Number(turnoRecord["Consumo Energia Inicio"] || 0);
    const gasConsumido = Number(turnoRecord["Consumo Gas Final"] || 0) - Number(turnoRecord["Consumo Gas Inicial"] || 0);

    // Calcular rendimiento
    const rendimiento = biomasaTotal > 0 ? (biocharTotal / biomasaTotal) * 100 : 0;

    // Calcular temperatura promedio
    const temperaturas = (turnoRecord["Temperatura Horno (H1) (from Balances Masa)"] as number[]) || [];
    const temperaturaPromedio = temperaturas.length > 0 
      ? temperaturas.reduce((sum: number, temp: number) => sum + temp, 0) / temperaturas.length 
      : Number(turno.temperatura_inicio) || 0;

    // Calcular tiempo transcurrido
    const fechaInicio = new Date(String(turnoRecord["Fecha Inicio Turno"] || turno.fecha || Date.now()));
    const fechaFin = turnoRecord["Fecha Fin Turno"] ? new Date(String(turnoRecord["Fecha Fin Turno"])) : new Date();
    const tiempoMs = fechaFin.getTime() - fechaInicio.getTime();
    const horas = Math.floor(tiempoMs / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoMs % (1000 * 60 * 60)) / (1000 * 60));
    const tiempoTranscurrido = `${horas}h ${minutos}m`;

    // Generar alertas
    const alertas: string[] = [];
    if (temperaturaPromedio > 800) alertas.push('⚠️ Temperatura alta detectada');
    if (rendimiento < 15) alertas.push('📉 Rendimiento por debajo del promedio');
    if (energiaConsumida > 50) alertas.push('⚡ Alto consumo energético');
    if (alertas.length === 0) alertas.push('✅ Operación normal');

    // Determinar estado
    const estado = turnoRecord["Estado Final Planta"] === 'Encendida' ? 'Activo' :
                  turnoRecord["Fecha Fin Turno"] ? 'Completado' : 'En proceso';    return {
      rendimiento: Math.round(rendimiento * 100) / 100,
      temperaturaPromedio: Math.round(temperaturaPromedio),
      tiempoTranscurrido,
      eficiencia: Math.min(100, Math.round((rendimiento / 25) * 100)), // 25% rendimiento = 100% eficiencia
      estado,
      alertas,
      biomasaTotal: Math.round(biomasaTotal),
      biocharTotal: Math.round(biocharTotal),
      energiaConsumida: Math.round(energiaConsumida * 100) / 100,
      gasConsumido: Math.round(gasConsumido * 100) / 100
    };
  };

  const calcularEstadisticas = (turnos: TurnoData[]) => {
    const hoy = new Date().toISOString().split('T')[0];
    const turnosHoy = turnos.filter(t => {
      const turnoRecord = t as Record<string, unknown>;
      const fechaTurno = String(turnoRecord["Fecha Inicio Turno"] || t.fecha || '').split('T')[0];
      return fechaTurno === hoy;
    });

    const rendimientos = turnos
      .map(t => {
        const turnoRecord = t as Record<string, unknown>;
        const biochar = Number(turnoRecord["Total Biochar Produccido Turno"]) || 0;
        const biomasa = biochar * 4; // Estimación
        return biomasa > 0 ? (biochar / biomasa) * 100 : 0;
      })
      .filter(r => r > 0);

    const temperaturas = turnos
      .flatMap(t => ((t as Record<string, unknown>)["Temperatura Horno (H1) (from Balances Masa)"] as number[]) || [])
      .filter((temp: number) => temp > 0);

    return {
      totalTurnos: turnos.length,
      turnosHoy: turnosHoy.length,
      rendimientoPromedio: rendimientos.length > 0 
        ? Math.round((rendimientos.reduce((sum, r) => sum + r, 0) / rendimientos.length) * 100) / 100
        : 0,
      temperaturaMaxima: temperaturas.length > 0 ? Math.max(...temperaturas) : 0
    };
  };

  useEffect(() => {
    console.log('🚀 Iniciando seguimiento de turno...');
    cargarDatosTurnoActual();
    
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        console.log('🔄 Actualización automática de seguimiento...');
        cargarDatosTurnoActual();
      }, 30000); // Cada 30 segundos
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
        console.log('🧹 Limpiando interval de seguimiento');
      }
    };
  }, [autoRefresh]);

  const formatearFecha = (fecha: string | undefined) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo': 
      case 'En proceso': 
        return 'bg-green-100 text-green-800';
      case 'Completado': 
        return 'bg-blue-100 text-blue-800';
      case 'Suspendido': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTemperaturaColor = (temp: number) => {
    if (temp < 300) return 'text-blue-600';
    if (temp > 800) return 'text-red-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
           style={{ backgroundImage: "url('/h6.png')" }}>
        <NavBar />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white bg-opacity-95 p-8 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-center mt-4 text-lg font-semibold">Cargando seguimiento de turno...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
           style={{ backgroundImage: "url('/h6.png')" }}>
        <NavBar />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error || 'No se pudieron cargar los datos'}</span>
              <button 
                className="mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={cargarDatosTurnoActual}
              >
                🔄 Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { turnoActual, metricas, estadisticas, ultimosTurnos } = dashboardData;

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
         style={{ backgroundImage: "url('/h6.png')" }}>
      <NavBar />
      
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header del Dashboard */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📊 Seguimiento de Turno Actual</h1>
                <p className="text-gray-600 mt-1">
                  Monitoreo en tiempo real - Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')}
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={cargarDatosTurnoActual}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  🔄 Actualizar
                </button>
                <button 
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`font-bold py-2 px-4 rounded-lg ${autoRefresh 
                    ? 'bg-green-500 hover:bg-green-700 text-white' 
                    : 'bg-gray-500 hover:bg-gray-700 text-white'}`}
                >
                  {autoRefresh ? '⏸️ Pausar' : '▶️ Auto'}
                </button>
              </div>
            </div>

            {/* Alertas */}
            {metricas.alertas.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {metricas.alertas.map((alerta: string, index: number) => (
                  <div key={index} className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
                    {alerta}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            
            {/* Estado del Turno */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getEstadoColor(metricas.estado)}`}>
                    {metricas.estado}
                  </div>
                </div>
                <div className="text-4xl">🔄</div>
              </div>
            </div>

            {/* Rendimiento */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rendimiento</p>
                  <p className="text-2xl font-bold text-green-600">{metricas.rendimiento}%</p>
                  <p className="text-xs text-gray-500">Eficiencia: {metricas.eficiencia}%</p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </div>

            {/* Temperatura */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Temperatura Promedio</p>
                  <p className={`text-2xl font-bold ${getTemperaturaColor(metricas.temperaturaPromedio)}`}>
                    {metricas.temperaturaPromedio}°C
                  </p>
                </div>
                <div className="text-4xl">🌡️</div>
              </div>
            </div>

            {/* Tiempo */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tiempo Transcurrido</p>
                  <p className="text-2xl font-bold text-blue-600">{metricas.tiempoTranscurrido}</p>
                </div>
                <div className="text-4xl">⏱️</div>
              </div>
            </div>
          </div>

          {/* Información del Turno Actual */}
          {turnoActual && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Datos del Turno */}
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Información del Turno</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Operador:</span>
                    <span className="text-gray-900">{String((turnoActual as Record<string, unknown>).Operador || turnoActual.operador || 'N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Inicio:</span>
                    <span className="text-gray-900">{formatearFecha(String((turnoActual as Record<string, unknown>)["Fecha Inicio Turno"] || turnoActual.fecha || ''))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Estado Planta:</span>
                    <span className={`px-2 py-1 rounded text-sm ${String((turnoActual as Record<string, unknown>)["Estado Final Planta"]) === 'Encendida' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {String((turnoActual as Record<string, unknown>)["Estado Final Planta"] || 'Desconocido')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">ID Turno:</span>
                    <span className="text-gray-600 text-sm font-mono">{turnoActual.id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Métricas de Producción */}
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⚗️ Métricas de Producción</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">Biomasa Total</p>
                    <p className="text-xl font-bold text-blue-600">{metricas.biomasaTotal} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">Biochar Producido</p>
                    <p className="text-xl font-bold text-green-600">{metricas.biocharTotal} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">Energía Consumida</p>
                    <p className="text-xl font-bold text-orange-600">{metricas.energiaConsumida} kWh</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">Gas Consumido</p>
                    <p className="text-xl font-bold text-purple-600">{metricas.gasConsumido} m³</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas Generales y Últimos Turnos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Estadísticas del Día */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Estadísticas</h3>
              <div className="space-y-4">
                <div className="text-center border-b pb-3">
                  <p className="text-sm font-medium text-gray-500">Total Turnos</p>
                  <p className="text-2xl font-bold text-blue-600">{estadisticas.totalTurnos}</p>
                </div>
                <div className="text-center border-b pb-3">
                  <p className="text-sm font-medium text-gray-500">Turnos Hoy</p>
                  <p className="text-2xl font-bold text-green-600">{estadisticas.turnosHoy}</p>
                </div>
                <div className="text-center border-b pb-3">
                  <p className="text-sm font-medium text-gray-500">Rendimiento Promedio</p>
                  <p className="text-2xl font-bold text-orange-600">{estadisticas.rendimientoPromedio}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Temp. Máxima</p>
                  <p className="text-2xl font-bold text-red-600">{estadisticas.temperaturaMaxima}°C</p>
                </div>
              </div>
            </div>

            {/* Últimos Turnos */}
            <div className="lg:col-span-2 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🕒 Últimos Turnos</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {ultimosTurnos.slice(0, 8).map((turno: TurnoData, index: number) => {
                  const turnoRecord = turno as Record<string, unknown>;
                  return (
                    <div key={turno.id || index} className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {String(turnoRecord.Operador || turno.operador || 'Operador N/A')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatearFecha(String(turnoRecord["Fecha Inicio Turno"] || turno.fecha || ''))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {Number(turnoRecord["Total Biochar Produccido Turno"]) || 0} kg biochar
                          </p>
                          <div className={`inline-block px-2 py-1 rounded text-xs ${getEstadoColor(turnoRecord["Estado Final Planta"] === 'Encendida' ? 'Activo' : 'Completado')}`}>
                            {turnoRecord["Estado Final Planta"] === 'Encendida' ? 'Activo' : 'Completado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
