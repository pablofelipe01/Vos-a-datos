// Servicio para interactuar con Airtable API
// Gestión mi turno de pirólisis

export interface TurnoData {
  id?: string;
  fecha: string;
  turno: 'Mañana' | 'Tarde' | 'Noche';
  operador: string;
  supervisor: string;
  proceso_id?: string;
  temperatura_inicio?: number;
  temperatura_fin?: number;
  biomasa_kg?: number;
  biochar_kg?: number;
  observaciones?: string;
  estado: 'Activo' | 'Completado' | 'Suspendido';
}

export interface PersonalData {
  id?: string;
  nombre: string;
  cargo: 'Operador' | 'Supervisor' | 'Técnico';
  turno_preferido: 'Mañana' | 'Tarde' | 'Noche';
  email?: string;
  telefono?: string;
  activo: boolean;
}

export interface ProcesoData {
  id?: string;
  lote_id: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo_biomasa: string;
  cantidad_inicial: number;
  temperatura_proceso: number;
  rendimiento?: number;
  calidad_biochar?: 'A' | 'B' | 'C';
  estado: 'En_Proceso' | 'Completado' | 'Suspendido';
}

class AirtableService {
  private baseUrl: string;
  private headers: HeadersInit;
  private isConfigured: boolean = false;

  constructor() {
    const accessToken = process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN;
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

    console.log('🔧 Verificando configuración de Airtable...');
    console.log('Token presente:', !!accessToken);
    console.log('BaseId presente:', !!baseId);
    console.log('Token (primeros 15 chars):', accessToken?.substring(0, 15) + '...');
    console.log('BaseId completo:', baseId);
    
    // Verificaciones específicas
    if (!accessToken) {
      console.error('❌ NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN no está definido');
    }
    if (!baseId) {
      console.error('❌ NEXT_PUBLIC_AIRTABLE_BASE_ID no está definido');
    }
    if (baseId === accessToken) {
      console.error('❌ BaseId no puede ser igual al token');
    }

    // Ahora que tienes la configuración real, forzamos el uso de Airtable
    if (!accessToken || !baseId || 
        accessToken === 'your_airtable_access_token_here' || 
        baseId === 'appXXXXXXXXXXXXXX' ||
        baseId === accessToken) {  // Evitar que baseId sea igual al token
      console.warn('Airtable not configured properly. Using mock data for development.');
      this.isConfigured = false;
      this.baseUrl = '';
      this.headers = {};
      return;
    }

    // Si llegamos aquí, tenemos configuración válida
    console.log('✅ Airtable configurado correctamente - usando datos reales');
    this.isConfigured = true;
    this.baseUrl = `https://api.airtable.com/v0/${baseId}`;
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private getMockTurnos(): TurnoData[] {
    return [
      {
        id: 'recdIDVEAfuHhyDqy',
        fecha: '2025-07-17',
        turno: 'Mañana',
        operador: 'Kevin Avila',
        supervisor: 'Kevin Avila',
        proceso_id: 'proc1',
        temperatura_inicio: 167.014,
        temperatura_fin: 167.292,
        biomasa_kg: 2.30,
        biochar_kg: 31,
        observaciones: 'Proceso en curso - Reactor encendido. Temperatura estable.',
        estado: 'Activo'
      },
      {
        id: 'mock2',
        fecha: '2025-07-17',
        turno: 'Tarde',
        operador: 'Carlos López',
        supervisor: 'Ana Martín',
        proceso_id: 'proc2',
        temperatura_inicio: 340,
        temperatura_fin: 420,
        biomasa_kg: 150,
        biochar_kg: 37.5,
        observaciones: 'Turno completado exitosamente',
        estado: 'Completado'
      }
    ];
  }

  private getMockPersonal(): PersonalData[] {
    return [
      {
        id: 'pers1',
        nombre: 'Kevin Avila',
        cargo: 'Operador',
        turno_preferido: 'Mañana',
        email: 'kevin.avila@piroliapp.com',
        telefono: '+57 123 456 7890',
        activo: true
      },
      {
        id: 'pers2',
        nombre: 'Kevin Avila',
        cargo: 'Supervisor',
        turno_preferido: 'Mañana',
        email: 'kevin.supervisor@piroliapp.com',
        telefono: '+57 123 456 7891',
        activo: true
      },
      {
        id: 'pers3',
        nombre: 'Carlos López',
        cargo: 'Operador',
        turno_preferido: 'Tarde',
        email: 'carlos@piroliapp.com',
        telefono: '+57 123 456 7892',
        activo: true
      },
      {
        id: 'pers4',
        nombre: 'Ana Martín',
        cargo: 'Supervisor',
        turno_preferido: 'Tarde',
        email: 'ana@piroliapp.com',
        telefono: '+57 123 456 7893',
        activo: true
      }
    ];
  }

  private getMockProcesos(): ProcesoData[] {
    return [
      {
        id: 'proc1',
        lote_id: 'LOTE-PYR-001',
        fecha_inicio: '2025-07-17',
        tipo_biomasa: 'Biomasa pirolítica',
        cantidad_inicial: 2.30,
        temperatura_proceso: 167,
        rendimiento: 1347.8, // 31/2.30 * 100
        calidad_biochar: 'A',
        estado: 'En_Proceso'
      },
      {
        id: 'proc2',
        lote_id: 'LOTE-PYR-002',
        fecha_inicio: '2025-07-17',
        tipo_biomasa: 'Cáscara de arroz',
        cantidad_inicial: 150,
        temperatura_proceso: 380,
        rendimiento: 25,
        calidad_biochar: 'B',
        estado: 'En_Proceso'
      }
    ];
  }

  // ==========================================
  // MÉTODO DE VERIFICACIÓN DE CONEXIÓN
  // ==========================================

  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    if (!this.isConfigured) {
      return {
        success: false,
        message: 'Airtable no está configurado - usando datos mock'
      };
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}?maxRecords=1`;
      
      console.log('🧪 Probando conexión a:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: `Error de conexión: ${response.status} ${response.statusText}`,
          data: { errorText, headers: this.headers }
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: '✅ Conexión exitosa con Airtable',
        data: data
      };

    } catch (error) {
      return {
        success: false,
        message: `Error de red: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  // ==========================================
  // MÉTODOS PARA TURNOS
  // ==========================================

  async getTurnos(filterFormula?: string): Promise<TurnoData[]> {
    if (!this.isConfigured) {
      console.log('Using mock turnos data - Airtable not configured');
      return this.getMockTurnos();
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
      let url = `${this.baseUrl}/${encodeURIComponent(tableName)}`;
      
      if (filterFormula) {
        url += `?filterByFormula=${encodeURIComponent(filterFormula)}`;
      }

      console.log('Fetching turnos from:', url);
      console.log('Headers:', this.headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`Error fetching turnos: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Turnos data received:', data);
      
      return data.records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error('Error al obtener turnos:', error);
      console.log('Falling back to mock data');
      return this.getMockTurnos();
    }
  }

  async getTurnoById(id: string): Promise<TurnoData | null> {
    if (!this.isConfigured) {
      const mockTurnos = this.getMockTurnos();
      return mockTurnos.find(t => t.id === id) || null;
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}/${id}`;
      
      console.log('Fetching turno by ID:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Turno con ID ${id} no encontrado`);
          return null;
        }
        throw new Error(`Error fetching turno: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Turno encontrado por ID:', data);
      
      return {
        id: data.id,
        ...data.fields,
      };
    } catch (error) {
      console.error('Error al obtener turno por ID:', error);
      return null;
    }
  }

  async createTurno(turnoData: Omit<TurnoData, 'id'>): Promise<TurnoData> {
    if (!this.isConfigured) {
      console.log('Mock: Creating turno', turnoData);
      const newTurno = {
        id: `mock-${Date.now()}`,
        ...turnoData
      };
      return newTurno;
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turnos';
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(tableName)}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          fields: turnoData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating turno: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        ...data.fields,
      };
    } catch (error) {
      console.error('Error al crear turno:', error);
      throw error;
    }
  }

  async updateTurno(id: string, turnoData: Partial<TurnoData>): Promise<TurnoData> {
    if (!this.isConfigured) {
      console.log('Mock: Updating turno', id, turnoData);
      const mockTurnos = this.getMockTurnos();
      const turno = mockTurnos.find(t => t.id === id);
      if (turno) {
        return { ...turno, ...turnoData };
      }
      throw new Error('Turno not found');
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turnos';
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(tableName)}/${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          fields: turnoData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating turno: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        ...data.fields,
      };
    } catch (error) {
      console.error('Error al actualizar turno:', error);
      throw error;
    }
  }

  // ==========================================
  // MÉTODOS PARA PERSONAL
  // ==========================================

  async getPersonal(): Promise<PersonalData[]> {
    if (!this.isConfigured) {
      console.log('Using mock personal data');
      return this.getMockPersonal();
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_TABLE || 'Personal';
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(tableName)}?filterByFormula={Activo}=1`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Error fetching personal: ${response.statusText}`);
      }

      const data = await response.json();
      return data.records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error('Error al obtener personal:', error);
      return this.getMockPersonal();
    }
  }

  // ==========================================
  // MÉTODOS PARA PROCESOS
  // ==========================================

  async getProcesos(estado?: string): Promise<ProcesoData[]> {
    if (!this.isConfigured) {
      console.log('Using mock procesos data');
      const mockProcesos = this.getMockProcesos();
      return estado ? mockProcesos.filter(p => p.estado === estado) : mockProcesos;
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_PROCESOS_TABLE || 'Procesos';
      let url = `${this.baseUrl}/${encodeURIComponent(tableName)}`;
      
      if (estado) {
        url += `?filterByFormula={Estado}='${estado}'`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Error fetching procesos: ${response.statusText}`);
      }

      const data = await response.json();
      return data.records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error('Error al obtener procesos:', error);
      return this.getMockProcesos();
    }
  }

  // ==========================================
  // MÉTODOS DE CONSULTA ESPECÍFICOS
  // ==========================================

  async getTurnoActual(turnoId?: string): Promise<TurnoData | null> {
    // FORZAR USO DE DATOS REALES - NO MÁS MOCK DATA
    try {
      // Si se proporciona un ID específico, intentamos obtenerlo primero
      if (turnoId) {
        console.log('Intentando obtener turno específico:', turnoId);
        const turno = await this.getTurnoById(turnoId);
        if (turno) {
          console.log('Turno específico encontrado:', turno);
          return turno;
        }
      }

      // Obtener el último registro (más reciente) de la tabla de turnos
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
      
      // Ordenar por fecha descendente y tomar el primer registro (más reciente)
      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}?maxRecords=1&sort[0][field]=Fecha&sort[0][direction]=desc&sort[1][field]=ID&sort[1][direction]=desc`;

      console.log('🚀 FORZANDO conexión a Airtable:', url);
      console.log('🔑 Headers:', this.headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error fetching último turno: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta de último turno:', data);
      
      if (data.records && data.records.length > 0) {
        const record = data.records[0];
        console.log('🎯 Último turno encontrado:', record);
        
        return {
          id: record.id,
          ...record.fields,
        };
      }

      console.log('⚠️ No se encontraron turnos en la tabla');
      throw new Error('No hay turnos disponibles en la base de datos');

    } catch (error) {
      console.error('💥 Error crítico al obtener turno actual:', error);
      throw error; // Propagar el error en lugar de usar datos mock
    }
  }

  // Método auxiliar para obtener turno activo actual
  private async getTurnoActivoActual(): Promise<TurnoData | null> {
    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
      const filterFormula = `{Estado} = 'Activo'`;
      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1&sort[0][field]=Fecha&sort[0][direction]=desc`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Error fetching turno activo: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const record = data.records[0];
        return {
          id: record.id,
          ...record.fields,
        };
      }

      return null;
    } catch (error) {
      console.error('Error al obtener turno activo:', error);
      return null;
    }
  }

  async getTurnosDelDia(fecha: string): Promise<TurnoData[]> {
    const filterFormula = `{Fecha} = '${fecha}'`;
    return this.getTurnos(filterFormula);
  }

  async getTurnosActivos(): Promise<TurnoData[]> {
    const filterFormula = `{Estado} = 'Activo'`;
    return this.getTurnos(filterFormula);
  }

  async getProcesosEnCurso(): Promise<ProcesoData[]> {
    return this.getProcesos('En_Proceso');
  }

  async getPersonalPorCargo(cargo: 'Operador' | 'Supervisor' | 'Técnico'): Promise<PersonalData[]> {
    const personal = await this.getPersonal();
    return personal.filter(p => p.cargo === cargo);
  }

  // ==========================================
  // MÉTODOS PARA TURNO ACTUAL EN TIEMPO REAL
  // ==========================================

  async getDatosTurnoActual(turnoId?: string) {
    try {
      console.log('🚀 Obteniendo datos del turno actual (último registro desde Airtable)...');
      
      // Obtener el último turno (más reciente) - FORZAR CONEXIÓN REAL
      const turno = await this.getTurnoActual(turnoId);
      if (!turno) {
        throw new Error('❌ No se encontraron turnos en la base de datos de Airtable');
      }

      console.log('✅ Turno obtenido:', turno);

      // Obtener datos adicionales para el dashboard visual
      const operador = turno.operador || '';
      console.log('👤 Obteniendo datos para operador:', operador);

      const [balancesMasa, viajesBiomasa, bitacoraHistorial] = await Promise.all([
        this.getBalancesMasaByOperador(operador),
        this.getViajesBiomasaByOperador(operador),
        this.getBitacoraByOperador(operador)
      ]);

      console.log('📊 Balances de masa encontrados:', balancesMasa.length);
      console.log('🚚 Viajes de biomasa encontrados:', viajesBiomasa.length);
      console.log('📝 Entradas de bitácora encontradas:', bitacoraHistorial.length);

      // Calcular métricas del turno actual
      const rendimiento = turno.biomasa_kg && turno.biochar_kg 
        ? ((turno.biochar_kg / turno.biomasa_kg) * 100)
        : 0;

      const tiempoTranscurrido = this.calcularTiempoTranscurrido(turno.fecha);
      
      const temperaturaPromedio = turno.temperatura_inicio && turno.temperatura_fin
        ? ((turno.temperatura_inicio + turno.temperatura_fin) / 2)
        : turno.temperatura_inicio || 0;

      const metricas = {
        rendimiento: parseFloat(rendimiento.toFixed(2)),
        temperaturaPromedio: parseFloat(temperaturaPromedio.toFixed(2)),
        tiempoTranscurrido,
        eficiencia: this.calcularEficiencia(turno),
        estado: turno.estado || 'Activo',
        alertas: this.generarAlertas(turno),
        // Nuevas métricas para el dashboard visual
        totalBalancesMasa: balancesMasa.length,
        totalViajesBiomasa: viajesBiomasa.length,
        bitacoraEntradas: bitacoraHistorial.length
      };

      console.log('📈 Métricas calculadas:', metricas);

      return {
        turno,
        personal: [], // Simplificado para interfaz visual
        procesos: [], // Simplificado para interfaz visual
        metricas,
        balancesMasa,
        viajesBiomasa,
        bitacoraHistorial
      };
    } catch (error) {
      console.error('💥 Error crítico en getDatosTurnoActual:', error);
      throw error; // Propagar error sin fallback a datos mock
    }
  }

  // Nuevos métodos para obtener datos específicos del operador
  async getBalancesMasaByOperador(operador: string): Promise<any[]> {
    if (!this.isConfigured || !operador) return [];
    
    try {
      const tableName = 'Balance de Masa'; // Ajustar nombre según tu tabla
      const filterFormula = `OR({Operador} = "${operador}", {operador} = "${operador}")`;
      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=Fecha&sort[0][direction]=desc`;

      console.log('📊 Obteniendo balances de masa para:', operador);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (response.ok) {
        const data = await response.json();
        return data.records || [];
      }
    } catch (error) {
      console.log('⚠️ Error obteniendo balances de masa:', error);
    }
    
    return [];
  }

  async getViajesBiomasaByOperador(operador: string): Promise<any[]> {
    if (!this.isConfigured || !operador) return [];
    
    try {
      const tableName = 'Viaje Biomasa'; // Ajustar nombre según tu tabla
      const filterFormula = `OR({Operador} = "${operador}", {operador} = "${operador}")`;
      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=Fecha&sort[0][direction]=desc`;

      console.log('🚚 Obteniendo viajes de biomasa para:', operador);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (response.ok) {
        const data = await response.json();
        return data.records || [];
      }
    } catch (error) {
      console.log('⚠️ Error obteniendo viajes de biomasa:', error);
    }
    
    return [];
  }

  async getBitacoraByOperador(operador: string): Promise<any[]> {
    if (!this.isConfigured || !operador) return [];
    
    try {
      const tableName = 'Bitacora'; // Ajustar nombre según tu tabla
      const filterFormula = `OR({Operador} = "${operador}", {operador} = "${operador}")`;
      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=Fecha&sort[0][direction]=desc&maxRecords=10`;

      console.log('📝 Obteniendo bitácora para:', operador);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (response.ok) {
        const data = await response.json();
        return data.records || [];
      }
    } catch (error) {
      console.log('⚠️ Error obteniendo bitácora:', error);
    }
    
    return [];
  }

  private calcularTiempoTranscurrido(fechaTurno: string): string {
    const inicio = new Date(fechaTurno);
    const ahora = new Date();
    const diferencia = ahora.getTime() - inicio.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
  }

  private calcularEficiencia(turno: TurnoData): number {
    // Cálculo básico de eficiencia basado en temperatura y rendimiento
    const tempOptima = 400; // Temperatura óptima de referencia
    const tempActual = turno.temperatura_inicio || 0;
    const eficienciaTemp = Math.max(0, 100 - Math.abs(tempOptima - tempActual) / tempOptima * 100);
    
    const rendimiento = turno.biomasa_kg && turno.biochar_kg 
      ? (turno.biochar_kg / turno.biomasa_kg) * 100 
      : 0;
    
    return ((eficienciaTemp + rendimiento) / 2);
  }

  private generarAlertas(turno: TurnoData): string[] {
    const alertas: string[] = [];
    
    const maxTemp = parseFloat(process.env.NEXT_PUBLIC_MAX_TEMP_REACTOR || '800');
    const minTemp = parseFloat(process.env.NEXT_PUBLIC_MIN_TEMP_REACTOR || '300');
    
    if (turno.temperatura_inicio && turno.temperatura_inicio > maxTemp) {
      alertas.push(`Temperatura alta: ${turno.temperatura_inicio}°C`);
    }
    
    if (turno.temperatura_inicio && turno.temperatura_inicio < minTemp) {
      alertas.push(`Temperatura baja: ${turno.temperatura_inicio}°C`);
    }
    
    if (turno.estado === 'Suspendido') {
      alertas.push('Turno suspendido - Revisar');
    }
    
    return alertas;
  }

  // ==========================================
  // MÉTODOS DE ESTADÍSTICAS
  // ==========================================

  async getEstadisticasTurnos(fechaInicio: string, fechaFin: string) {
    try {
      if (!this.isConfigured) {
        const mockTurnos = this.getMockTurnos();
        return {
          totalTurnos: mockTurnos.length,
          turnosCompletados: mockTurnos.filter(t => t.estado === 'Completado').length,
          turnosActivos: mockTurnos.filter(t => t.estado === 'Activo').length,
          turnosSuspendidos: mockTurnos.filter(t => t.estado === 'Suspendido').length,
          promedioTemperatura: mockTurnos.reduce((acc, t) => acc + (t.temperatura_inicio || 0), 0) / mockTurnos.length,
          totalBiomasa: mockTurnos.reduce((acc, t) => acc + (t.biomasa_kg || 0), 0),
          totalBiochar: mockTurnos.reduce((acc, t) => acc + (t.biochar_kg || 0), 0),
        };
      }

      const filterFormula = `AND({Fecha} >= '${fechaInicio}', {Fecha} <= '${fechaFin}')`;
      const turnos = await this.getTurnos(filterFormula);

      return {
        totalTurnos: turnos.length,
        turnosCompletados: turnos.filter(t => t.estado === 'Completado').length,
        turnosActivos: turnos.filter(t => t.estado === 'Activo').length,
        turnosSuspendidos: turnos.filter(t => t.estado === 'Suspendido').length,
        promedioTemperatura: turnos.reduce((acc, t) => acc + (t.temperatura_inicio || 0), 0) / turnos.length,
        totalBiomasa: turnos.reduce((acc, t) => acc + (t.biomasa_kg || 0), 0),
        totalBiochar: turnos.reduce((acc, t) => acc + (t.biochar_kg || 0), 0),
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      // Retornar estadísticas mock en caso de error
      return {
        totalTurnos: 2,
        turnosCompletados: 1,
        turnosActivos: 1,
        turnosSuspendidos: 0,
        promedioTemperatura: 345,
        totalBiomasa: 220,
        totalBiochar: 30,
      };
    }
  }
}

// Exportar instancia singleton
export const airtableService = new AirtableService();

// Funciones de utilidad para formateo de datos
export const formatTurnoForDisplay = (turno: TurnoData) => ({
  ...turno,
  fechaFormateada: new Date(turno.fecha).toLocaleDateString('es-ES'),
  temperaturaPromedio: turno.temperatura_inicio && turno.temperatura_fin 
    ? ((turno.temperatura_inicio + turno.temperatura_fin) / 2).toFixed(1)
    : 'N/A',
  rendimiento: turno.biomasa_kg && turno.biochar_kg
    ? ((turno.biochar_kg / turno.biomasa_kg) * 100).toFixed(1)
    : 'N/A'
});

export default AirtableService;
