// Servicio para interactuar con Airtable API
// Gestión mi turno de pirólisis

export interface TurnoData {
  id?: string;
  "Fecha Inicio Turno"?: string;
  "Fecha Fin Turno"?: string;
  "Operador"?: string;
  "🎙️ Alimentación Biomasa Húmeda Por Minuto (Kg)"?: number;
  "🎙️ Herzt Tolva 2"?: number;
  "Consumo Energia Inicio"?: number;
  "Consumo Energia Fin"?: number;
  "Consumo Gas Inicial"?: number;
  "Consumo Gas Final"?: number;
  "Estado Inicial Planta"?: 'Encendida' | 'Apagada';
  "Estado Final Planta"?: 'Encendida' | 'Apagada';
  "Porcentaje Humedad Biomasa"?: number[];
  "Balances Masa"?: string[];
  "Viajes Biomasa"?: string[];
  "Bitácora Pirolisis"?: string[];
  "Monitoreo Turnos"?: string[];
  "Manejo Residuos"?: string[];
  
  // Campos legacy para compatibilidad
  fecha?: string;
  turno?: 'Mañana' | 'Tarde' | 'Noche';
  operador?: string;
  supervisor?: string;
  proceso_id?: string;
  temperatura_inicio?: number;
  temperatura_fin?: number;
  biomasa_kg?: number;
  biochar_kg?: number;
  observaciones?: string;
  estado?: 'Activo' | 'Completado' | 'Suspendido';
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

export interface EquipoPiroData {
  id?: string;
  ID?: string;
  Nombre?: string;
  Cedula?: string;
  Cargo?: string;
  ID_Chat?: string;
  Estado_Operador?: 'Esperando_Audio' | 'Normal' | 'Manipular_Bache';
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

export interface BachePiroData {
  id?: string;
  "ID"?: string;
  "Auto Number"?: number;
  "Fecha Creacion"?: string;
  "Recuento Lonas"?: number;
  "Total Biochar Bache (KG)"?: number;
  "Cantidad Biochar Vendido"?: number[];
  "Cantidad Biochar Blend"?: number;
  "Total Biochar Humedo Bache (KG)"?: number;
  "Vendido"?: boolean;
  "Biochar Humedo (KG)"?: number;
  "Codigo Bache"?: string;
  "QR_Bache"?: Record<string, unknown>[];
  "Estado Bache"?: string;
  "Turnos Pirolisis"?: string[];
  "Balances Masa"?: string[];
  "Venta Biochar"?: string[];
  "Biochar Blend"?: string[];
  "Monitoreo Baches"?: string[];
}

export interface BalanceMasaData {
  id?: string;
  "ID"?: string;
  "Fecha"?: string;
  "Peso Biochar (KG)"?: number;
  "Temperatura Reactor (R1)"?: number;
  "Temperatura Reactor (R2)"?: number;
  "Temperatura Reactor (R3)"?: number;
  "Temperatura Horno (H1)"?: number;
  "Temperatura Horno (H2)"?: number;
  "Temperatura Horno (H3)"?: number;
  "Temperatura Horno (H4)"?: number;
  "Temperatura Ducto (G9)"?: number;
  "QR_lona"?: Record<string, unknown>[];
}

class AirtableService {
  private baseUrl: string;
  private headers: HeadersInit;
  private isConfigured: boolean = false;

  constructor() {
    const accessToken = process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN;
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

    console.log('🔧 Inicializando AirtableService...');
    console.log('Airtable Config:', {
      hasToken: !!accessToken,
      hasBaseId: !!baseId,
      token: accessToken ? `${accessToken.substring(0, 15)}...` : 'missing',
      baseId: baseId || 'missing',
      tokenLength: accessToken?.length || 0
    });

    if (!accessToken || !baseId || accessToken === 'your_airtable_access_token_here') {
      console.warn('⚠️ Airtable no configurado correctamente. Usando datos mock para desarrollo.');
      console.warn('Variables faltantes:', {
        token: !accessToken ? 'FALTA' : 'OK',
        baseId: !baseId ? 'FALTA' : 'OK',
        isDefault: accessToken === 'your_airtable_access_token_here' ? 'ES VALOR POR DEFECTO' : 'OK'
      });
      this.isConfigured = false;
      this.baseUrl = '';
      this.headers = {};
      return;
    }

    console.log('✅ Airtable configurado correctamente');
    this.isConfigured = true;
    this.baseUrl = `https://api.airtable.com/v0/${baseId}`;
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  // ==========================================
  // MÉTODOS PARA TURNOS
  // ==========================================

  async getTurnos(filterFormula?: string): Promise<TurnoData[]> {
    if (!this.isConfigured) {
      throw new Error('Airtable no está configurado. Verifique las variables de entorno.');
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
      let url = `${this.baseUrl}/${encodeURIComponent(tableName)}`;
      
      // NO aplicar filtros por ahora para debug - obtener todos los registros
      if (filterFormula && filterFormula.trim() !== '') {
        console.log('🔍 Aplicando filtro:', filterFormula);
        url += `?filterByFormula=${encodeURIComponent(filterFormula)}`;
      }

      console.log('🔄 Fetching turnos from:', url);
      console.log('📋 Tabla name:', tableName);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        console.error('❌ Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error details:', errorText);
        throw new Error(`Error fetching turnos: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Turnos data received:', data.records?.length || 0, 'records');
      console.log('🔍 Raw records sample:', JSON.stringify(data.records?.slice(0, 1), null, 2));
      
      if (!data.records || data.records.length === 0) {
        console.warn('⚠️ No se encontraron registros en la tabla');
        return [];
      }

      const mappedRecords = data.records.map((record: { id: string; fields: Record<string, unknown> }) => {
        const mapped = {
          id: record.id,
          ...(record.fields as Record<string, unknown>),
          // Mapear campos de Airtable a campos legacy para compatibilidad
          fecha: (record.fields as Record<string, unknown>)["Fecha Inicio Turno"] as string,
          operador: (record.fields as Record<string, unknown>)["Operador"] as string,
          temperatura_inicio: (record.fields as Record<string, unknown>)["Consumo Energia Inicio"] as number,
          biomasa_kg: (record.fields as Record<string, unknown>)["🎙️ Alimentación Biomasa Húmeda Por Minuto (Kg)"] as number,
          estado: (record.fields as Record<string, unknown>)["Estado Inicial Planta"] === 'Encendida' ? 'Activo' : 'Suspendido',
        };
        console.log('🔄 Mapped record:', mapped);
        return mapped;
      });
      
      return mappedRecords;
    } catch (error) {
      console.error('💥 Error al obtener turnos:', error);
      throw error;
    }
  }

  async getTurnoById(id: string): Promise<TurnoData | null> {
    if (!this.isConfigured) {
      throw new Error('Airtable no está configurado. Verifique las variables de entorno.');
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}/${id}`;
      
      console.log('🔄 Fetching turno by ID:', id);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('⚠️ Turno not found:', id);
          return null;
        }
        throw new Error(`Error fetching turno: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Turno data received:', data.id);
      
      return {
        id: data.id,
        ...(data.fields as Record<string, unknown>),
        // Mapear campos de Airtable a campos legacy para compatibilidad
        fecha: (data.fields as Record<string, unknown>)["Fecha Inicio Turno"] as string,
        operador: (data.fields as Record<string, unknown>)["Operador"] as string,
        temperatura_inicio: (data.fields as Record<string, unknown>)["Consumo Energia Inicio"] as number,
        biomasa_kg: (data.fields as Record<string, unknown>)["🎙️ Alimentación Biomasa Húmeda Por Minuto (Kg)"] as number,
        estado: (data.fields as Record<string, unknown>)["Estado Inicial Planta"] === 'Encendida' ? 'Activo' : 'Suspendido',
      };
    } catch (error) {
      console.error('💥 Error al obtener turno por ID:', error);
      throw error;
    }
  }

  async createTurno(turnoData: Omit<TurnoData, 'id'>): Promise<TurnoData> {
    if (!this.isConfigured) {
      throw new Error('Airtable no está configurado. Verifique las variables de entorno.');
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
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
      throw new Error('Airtable no está configurado. Verifique las variables de entorno.');
    }

    try {
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE || 'Turno Pirolisis';
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
      throw new Error('Airtable no está configurado. Verifique las variables de entorno.');
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
      return data.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error('Error al obtener personal:', error);
      throw error;
    }
  }

  // ==========================================
  // MÉTODOS PARA PROCESOS
  // ==========================================

  async getProcesos(estado?: string): Promise<ProcesoData[]> {
    if (!this.isConfigured) {
      throw new Error('Airtable no está configurado. Verifique las variables de entorno.');
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
      return data.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error('Error al obtener procesos:', error);
      throw error;
    }
  }

  // ==========================================
  // MÉTODOS DE CONSULTA ESPECÍFICOS
  // ==========================================

  async getTurnoActual(turnoId?: string): Promise<TurnoData | null> {
    if (!this.isConfigured) {
      throw new Error('Airtable no está configurado. Verifique las variables de entorno.');
    }

    try {
      console.log('🎯 Obteniendo turno actual...');
      
      // Si se proporciona un ID específico, intentar obtenerlo
      if (turnoId) {
        console.log('🔍 Buscando turno por ID:', turnoId);
        const turno = await this.getTurnoById(turnoId);
        if (turno) {
          console.log('✅ Turno encontrado por ID');
          return turno;
        }
      }

      // Obtener TODOS los turnos sin filtros complejos
      console.log('📋 Obteniendo todos los turnos disponibles...');
      const todosTurnos = await this.getTurnos();
      console.log(`📊 Total de turnos encontrados: ${todosTurnos.length}`);
      
      if (todosTurnos.length === 0) {
        console.warn('⚠️ No se encontraron turnos en la tabla');
        return null;
      }

      // Retornar el primer turno disponible (para testing)
      const primerTurno = todosTurnos[0];
      console.log('✅ Retornando primer turno disponible:', primerTurno.id);
      return primerTurno;
      
    } catch (error) {
      console.error('💥 Error al obtener turno actual:', error);
      return null;
    }
  }

  async getTurnosDelDia(fecha: string): Promise<TurnoData[]> {
    const filterFormula = `{Fecha Inicio Turno} = '${fecha}'`;
    return this.getTurnos(filterFormula);
  }

  async getTurnosActivos(): Promise<TurnoData[]> {
    const filterFormula = `{Estado Inicial Planta} = 'Encendida'`;
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
      console.log('🔄 Obteniendo datos del turno actual...');
      
      const turno = await this.getTurnoActual(turnoId);
      if (!turno) {
        throw new Error('No se encontró ningún turno. Verifique que existan turnos en la base de datos de Airtable.');
      }

      console.log('✅ Turno encontrado:', turno);

      // Obtener datos relacionados
      const [personal, procesos] = await Promise.all([
        this.getPersonal(),
        this.getProcesosEnCurso()
      ]);

      console.log('✅ Datos relacionados obtenidos - Personal:', personal.length, 'Procesos:', procesos.length);

      // Calcular métricas del turno actual
      const rendimiento = turno.biomasa_kg && turno.biochar_kg 
        ? ((turno.biochar_kg / turno.biomasa_kg) * 100).toFixed(2)
        : '0';

      const tiempoTranscurrido = this.calcularTiempoTranscurrido(turno.fecha || turno["Fecha Inicio Turno"] || new Date().toISOString());
      
      const temperaturaPromedio = turno.temperatura_inicio && turno.temperatura_fin
        ? ((turno.temperatura_inicio + turno.temperatura_fin) / 2).toFixed(2)
        : turno.temperatura_inicio?.toFixed(2) || '0';

      const dashboardData = {
        turno,
        personal,
        procesos,
        metricas: {
          rendimiento: parseFloat(rendimiento),
          temperaturaPromedio: parseFloat(temperaturaPromedio),
          tiempoTranscurrido,
          eficiencia: this.calcularEficiencia(turno),
          estado: turno.estado || 'Desconocido',
          alertas: this.generarAlertas(turno)
        }
      };

      console.log('✅ Dashboard data completo preparado');
      return dashboardData;
    } catch (error) {
      console.error('💥 Error al obtener datos del turno actual:', error);
      throw error;
    }
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
        throw new Error('Airtable no está configurado. Verifique las variables de entorno.');
      }

      const filterFormula = `AND({Fecha} >= '${fechaInicio}', {Fecha} <= '${fechaFin}')`;
      const turnos = await this.getTurnos(filterFormula);

      if (turnos.length === 0) {
        return {
          totalTurnos: 0,
          turnosCompletados: 0,
          turnosActivos: 0,
          turnosSuspendidos: 0,
          promedioTemperatura: 0,
          totalBiomasa: 0,
          totalBiochar: 0,
        };
      }

      return {
        totalTurnos: turnos.length,
        turnosCompletados: turnos.filter((t: TurnoData) => t.estado === 'Completado').length,
        turnosActivos: turnos.filter((t: TurnoData) => t.estado === 'Activo').length,
        turnosSuspendidos: turnos.filter((t: TurnoData) => t.estado === 'Suspendido').length,
        promedioTemperatura: turnos.reduce((acc: number, t: TurnoData) => acc + (t.temperatura_inicio || 0), 0) / turnos.length,
        totalBiomasa: turnos.reduce((acc: number, t: TurnoData) => acc + (t.biomasa_kg || 0), 0),
        totalBiochar: turnos.reduce((acc: number, t: TurnoData) => acc + (t.biochar_kg || 0), 0),
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // ==========================================
  // MÉTODOS DE BACHES PIROLISIS
  // ==========================================

  async getBachesPirolisis(limit: number = 10): Promise<BachePiroData[]> {
    try {
      if (!this.isConfigured) {
        console.warn('⚠️ Airtable no configurado. Retornando datos mock de baches pirólisis...');
        return this.getMockBachesPirolisis();
      }

      console.log('🔄 Obteniendo baches de pirólisis desde Airtable...');
      
      const url = `${this.baseUrl}/Baches%20Pirolisis?maxRecords=${limit}&sort[0][field]=Fecha%20Creacion&sort[0][direction]=desc`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from Airtable Baches:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.records?.length || 0} baches de pirólisis obtenidos de Airtable`);
      
      if (!data.records || data.records.length === 0) {
        console.warn('⚠️ No se encontraron baches de pirólisis');
        return [];
      }

      return data.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        ...record.fields
      }));

    } catch (error) {
      console.error('❌ Error al obtener baches de pirólisis:', error);
      // En caso de error, retornar datos mock para continuar funcionando
      return this.getMockBachesPirolisis();
    }
  }

  // ==========================================
  // MÉTODOS DE BALANCES MASA
  // ==========================================

  async getBalancesMasa(limit: number = 10): Promise<BalanceMasaData[]> {
    try {
      if (!this.isConfigured) {
        console.warn('⚠️ Airtable no configurado. Retornando datos mock de balances masa...');
        return this.getMockBalancesMasa();
      }

      console.log('🔄 Obteniendo balances de masa desde Airtable...');
      
      const url = `${this.baseUrl}/Balances%20Masa?maxRecords=${limit}&sort[0][field]=Fecha&sort[0][direction]=desc`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from Airtable Balances Masa:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.records?.length || 0} balances de masa obtenidos de Airtable`);
      
      if (!data.records || data.records.length === 0) {
        console.warn('⚠️ No se encontraron balances de masa');
        return [];
      }

      return data.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        ...record.fields
      }));

    } catch (error) {
      console.error('❌ Error al obtener balances de masa:', error);
      // En caso de error, retornar datos mock para continuar funcionando
      return this.getMockBalancesMasa();
    }
  }

  private getMockBachesPirolisis(): BachePiroData[] {
    return [
      {
        id: "recK6JEgdsYSAeqB0",
        "Auto Number": 1,
        "Fecha Creacion": "2025-04-26T00:36:27.000Z",
        "Codigo Bache": "S-00083",
        "Recuento Lonas": 20,
        "Total Biochar Bache (KG)": 500,
        "Estado Bache": "Esperando Pesaje",
        "Biochar Humedo (KG)": 500
      },
      {
        id: "recrQR3t1FUjr8Ju0",
        "Auto Number": 2,
        "Fecha Creacion": "2025-04-30T02:01:15.000Z",
        "Codigo Bache": "S-00084",
        "Recuento Lonas": 20,
        "Total Biochar Bache (KG)": 0,
        "Estado Bache": "Bache Agotado",
        "Total Biochar Humedo Bache (KG)": 82,
        "Biochar Humedo (KG)": 82,
        "Cantidad Biochar Vendido": [500]
      },
      {
        id: "recNkbSNPnpdGyjXJ",
        "Auto Number": 3,
        "Fecha Creacion": "2025-05-05T19:56:22.000Z",
        "Codigo Bache": "S-00085",
        "Recuento Lonas": 20,
        "Total Biochar Bache (KG)": 0,
        "Estado Bache": "Bache Agotado",
        "Total Biochar Humedo Bache (KG)": 76,
        "Biochar Humedo (KG)": 76,
        "Cantidad Biochar Vendido": [500]
      }
    ];
  }

  private getMockBalancesMasa(): BalanceMasaData[] {
    return [
      {
        id: "recKj68fv5lPLmGL7",
        "Fecha": "2025-04-26T00:36:28.000Z",
        "Peso Biochar (KG)": 25.00,
        "Temperatura Reactor (R1)": 399.00,
        "Temperatura Reactor (R2)": 412.00,
        "Temperatura Reactor (R3)": 413.00,
        "Temperatura Horno (H1)": 321.00,
        "Temperatura Horno (H2)": 820.00,
        "Temperatura Horno (H3)": 414.00,
        "Temperatura Horno (H4)": 234.00,
        "Temperatura Ducto (G9)": 0.00
      },
      {
        id: "recekJHRvu5toLSRn",
        "Fecha": "2025-04-26T01:34:20.000Z",
        "Peso Biochar (KG)": 25.00,
        "Temperatura Reactor (R1)": 377.00,
        "Temperatura Reactor (R2)": 370.00,
        "Temperatura Reactor (R3)": 370.00,
        "Temperatura Horno (H1)": 315.00,
        "Temperatura Horno (H2)": 795.00,
        "Temperatura Horno (H3)": 401.00,
        "Temperatura Horno (H4)": 215.00,
        "Temperatura Ducto (G9)": 0.00
      },
      {
        id: "recGyReoq3oDqLucX",
        "Fecha": "2025-04-26T01:59:55.000Z",
        "Peso Biochar (KG)": 25.00,
        "Temperatura Reactor (R1)": 374.00,
        "Temperatura Reactor (R2)": 363.00,
        "Temperatura Reactor (R3)": 363.00,
        "Temperatura Horno (H1)": 311.00,
        "Temperatura Horno (H2)": 786.00,
        "Temperatura Horno (H3)": 399.00,
        "Temperatura Horno (H4)": 191.00,
        "Temperatura Ducto (G9)": 0.00
      },
      {
        id: "recczzeanzGXRg3h4",
        "Fecha": "2025-04-26T02:36:08.000Z",
        "Peso Biochar (KG)": 25.00,
        "Temperatura Reactor (R1)": 421.00,
        "Temperatura Reactor (R2)": 476.00,
        "Temperatura Reactor (R3)": 477.00,
        "Temperatura Horno (H1)": 321.00,
        "Temperatura Horno (H2)": 771.00,
        "Temperatura Horno (H3)": 408.00,
        "Temperatura Horno (H4)": 144.00,
        "Temperatura Ducto (G9)": 0.00
      },
      {
        id: "recliY4VrrZMZQWMl",
        "Fecha": "2025-04-26T03:26:12.000Z",
        "Peso Biochar (KG)": 25.00,
        "Temperatura Reactor (R1)": 412.00,
        "Temperatura Reactor (R2)": 443.00,
        "Temperatura Reactor (R3)": 444.00,
        "Temperatura Horno (H1)": 321.00,
        "Temperatura Horno (H2)": 784.00,
        "Temperatura Horno (H3)": 411.00,
        "Temperatura Horno (H4)": 186.00,
        "Temperatura Ducto (G9)": 0.00
      }
    ];
  }

  // ==========================================
  // MÉTODOS PARA VALIDACIÓN DE CÉDULAS
  // ==========================================

  async validateCedula(cedula: string): Promise<EquipoPiroData | null> {
    if (!this.isConfigured) {
      // En modo desarrollo sin configuración, permitir cualquier cédula
      console.warn('⚠️ Airtable no configurado. Permitiendo login con cualquier cédula para desarrollo.');
      return {
        id: 'dev-user',
        Nombre: 'Usuario Desarrollo',
        Cedula: cedula,
        Cargo: 'Desarrollador',
        Estado_Operador: 'Normal'
      };
    }

    try {
      console.log('🔍 Validando cédula:', cedula);
      
      // Usar el ID de la tabla directamente desde la documentación
      const tableId = 'tbl8jLu1r5Noqd8WB'; // Equipo Pirolisis Table ID
      
      // Filtrar por el campo Cedula usando filterByFormula
      const filterFormula = `{Cedula} = '${cedula}'`;
      const url = `${this.baseUrl}/${tableId}?filterByFormula=${encodeURIComponent(filterFormula)}`;
      
      console.log('🔄 Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from Airtable Equipo Pirolisis:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Equipo Pirolisis query result:`, data);
      
      if (!data.records || data.records.length === 0) {
        console.warn('⚠️ Cédula no encontrada en la tabla Equipo Pirolisis');
        return null;
      }

      // Retornar el primer registro encontrado (debería ser único)
      const record = data.records[0];
      const userData: EquipoPiroData = {
        id: record.id,
        ID: record.fields.ID,
        Nombre: record.fields.Nombre,
        Cedula: record.fields.Cedula,
        Cargo: record.fields.Cargo,
        ID_Chat: record.fields.ID_Chat,
        Estado_Operador: record.fields.Estado_Operador
      };

      console.log('✅ Usuario validado exitosamente:', userData);
      return userData;

    } catch (error) {
      console.error('❌ Error al validar cédula:', error);
      throw error;
    }
  }

  async getEquipoPirolisis(): Promise<EquipoPiroData[]> {
    if (!this.isConfigured) {
      console.warn('⚠️ Airtable no configurado. Retornando datos mock de equipo pirólisis...');
      return [
        {
          id: 'dev-1',
          Nombre: 'Usuario Desarrollo 1',
          Cedula: '1234567',
          Cargo: 'Desarrollador',
          Estado_Operador: 'Normal'
        },
        {
          id: 'dev-2',
          Nombre: 'Usuario Desarrollo 2',
          Cedula: '7654321',
          Cargo: 'Operador de planta',
          Estado_Operador: 'Normal'
        }
      ];
    }

    try {
      console.log('🔄 Obteniendo equipo de pirólisis desde Airtable...');
      
      const tableId = 'tbl8jLu1r5Noqd8WB'; // Equipo Pirolisis Table ID
      const url = `${this.baseUrl}/${tableId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from Airtable Equipo Pirolisis:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.records?.length || 0} registros de equipo pirólisis obtenidos de Airtable`);
      
      if (!data.records || data.records.length === 0) {
        console.warn('⚠️ No se encontraron registros en la tabla Equipo Pirolisis');
        return [];
      }

      return data.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        ID: record.fields.ID,
        Nombre: record.fields.Nombre,
        Cedula: record.fields.Cedula,
        Cargo: record.fields.Cargo,
        ID_Chat: record.fields.ID_Chat,
        Estado_Operador: record.fields.Estado_Operador
      }));

    } catch (error) {
      console.error('❌ Error al obtener equipo de pirólisis:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const airtableService = new AirtableService();

// Funciones de utilidad para formateo de datos
export const formatTurnoForDisplay = (turno: TurnoData) => ({
  ...turno,
  fechaFormateada: new Date(turno.fecha || turno["Fecha Inicio Turno"] || new Date()).toLocaleDateString('es-ES'),
  temperaturaPromedio: turno.temperatura_inicio && turno.temperatura_fin 
    ? ((turno.temperatura_inicio + turno.temperatura_fin) / 2).toFixed(1)
    : 'N/A',
  rendimiento: turno.biomasa_kg && turno.biochar_kg
    ? ((turno.biochar_kg / turno.biomasa_kg) * 100).toFixed(1)
    : 'N/A'
});

export default AirtableService;
