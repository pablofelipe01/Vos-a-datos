"use client";
import { useState, useEffect, useCallback } from 'react';
import { airtableService, TurnoData, PersonalData, ProcesoData } from '../services/airtableService';

export interface UseAirtableState {
  loading: boolean;
  error: string | null;
  turnos: TurnoData[];
  personal: PersonalData[];
  procesos: ProcesoData[];
  estadisticas: Record<string, unknown>;
}

export interface UseAirtableActions {
  refreshData: () => Promise<void>;
  createTurno: (turno: Omit<TurnoData, 'id'>) => Promise<void>;
  updateTurno: (id: string, updates: Partial<TurnoData>) => Promise<void>;
  getTurnosByDate: (date: string) => Promise<void>;
  clearError: () => void;
}

export const useAirtable = (initialDate?: string): [UseAirtableState, UseAirtableActions] => {
  const [state, setState] = useState<UseAirtableState>({
    loading: true,
    error: null,
    turnos: [],
    personal: [],
    procesos: [],
    estadisticas: {},
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const date = initialDate || new Date().toISOString().split('T')[0];
      
      // Cargar datos en paralelo
      const [turnosData, personalData, procesosData] = await Promise.all([
        airtableService.getTurnosDelDia(date),
        airtableService.getPersonal(),
        airtableService.getProcesosEnCurso()
      ]);

      // Cargar estadísticas del último mes
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30);
      const stats = await airtableService.getEstadisticasTurnos(
        fechaInicio.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      setState(prev => ({
        ...prev,
        loading: false,
        turnos: turnosData,
        personal: personalData,
        procesos: procesosData,
        estadisticas: stats,
      }));

    } catch (error) {
      console.error('Error loading data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, [initialDate]);

  const getTurnosByDate = useCallback(async (date: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const turnosData = await airtableService.getTurnosDelDia(date);
      
      setState(prev => ({
        ...prev,
        loading: false,
        turnos: turnosData,
      }));

    } catch (error) {
      console.error('Error loading turnos by date:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar turnos',
      }));
    }
  }, []);

  const createTurno = useCallback(async (turno: Omit<TurnoData, 'id'>) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const newTurno = await airtableService.createTurno(turno);
      
      setState(prev => ({
        ...prev,
        turnos: [...prev.turnos, newTurno],
      }));

      // Refrescar datos para obtener estadísticas actualizadas
      await refreshData();

    } catch (error) {
      console.error('Error creating turno:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al crear turno',
      }));
      throw error;
    }
  }, [refreshData]);

  const updateTurno = useCallback(async (id: string, updates: Partial<TurnoData>) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const updatedTurno = await airtableService.updateTurno(id, updates);
      
      setState(prev => ({
        ...prev,
        turnos: prev.turnos.map(turno => 
          turno.id === id ? updatedTurno : turno
        ),
      }));

    } catch (error) {
      console.error('Error updating turno:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al actualizar turno',
      }));
      throw error;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return [
    state,
    {
      refreshData,
      createTurno,
      updateTurno,
      getTurnosByDate,
      clearError,
    }
  ];
};

// Hook específico para obtener personal por cargo
export const usePersonalByCargo = (cargo?: 'Operador' | 'Supervisor' | 'Técnico') => {
  const [personal, setPersonal] = useState<PersonalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPersonal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const personalData = cargo 
          ? await airtableService.getPersonalPorCargo(cargo)
          : await airtableService.getPersonal();
          
        setPersonal(personalData);
      } catch (err) {
        console.error('Error loading personal:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar personal');
      } finally {
        setLoading(false);
      }
    };

    loadPersonal();
  }, [cargo]);

  return { personal, loading, error };
};

// Hook para estadísticas en tiempo real
export const useEstadisticasTiempoReal = (refreshInterval = 30000) => {
  const [estadisticas, setEstadisticas] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEstadisticas = useCallback(async () => {
    try {
      setError(null);
      
      const fechaHoy = new Date().toISOString().split('T')[0];
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 7); // Última semana
      
      const [statsHoy, statsTotal] = await Promise.all([
        airtableService.getEstadisticasTurnos(fechaHoy, fechaHoy),
        airtableService.getEstadisticasTurnos(
          fechaInicio.toISOString().split('T')[0],
          fechaHoy
        )
      ]);

      setEstadisticas({
        hoy: statsHoy,
        semana: statsTotal,
        ultimaActualizacion: new Date().toLocaleTimeString(),
      });
      
    } catch (err) {
      console.error('Error loading estadísticas:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEstadisticas();

    // Actualizar cada `refreshInterval` milisegundos
    const interval = setInterval(loadEstadisticas, refreshInterval);

    return () => clearInterval(interval);
  }, [loadEstadisticas, refreshInterval]);

  return { estadisticas, loading, error, refresh: loadEstadisticas };
};

export default useAirtable;
