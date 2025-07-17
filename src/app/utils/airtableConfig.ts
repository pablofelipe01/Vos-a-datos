// Utilidades para configuración de Airtable
export const validateAirtableConfig = () => {
  const config = {
    accessToken: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN,
    baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
    turnosTable: process.env.NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE,
    personalTable: process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_TABLE,
    procesosTable: process.env.NEXT_PUBLIC_AIRTABLE_PROCESOS_TABLE
  };

  const errors = [];
  
  if (!config.accessToken || config.accessToken.includes('your_')) {
    errors.push('NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN no está configurado correctamente');
  }
  
  if (!config.baseId || config.baseId.includes('appXXXXXX') || config.baseId === config.accessToken) {
    errors.push('NEXT_PUBLIC_AIRTABLE_BASE_ID no está configurado correctamente (debe ser diferente al token)');
  }
  
  if (!config.turnosTable) {
    errors.push('NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE no está configurado');
  }

  return {
    isValid: errors.length === 0,
    errors,
    config
  };
};

export const getAirtableConnectionStatus = () => {
  const validation = validateAirtableConfig();
  
  if (!validation.isValid) {
    return {
      status: 'error',
      message: 'Configuración de Airtable incompleta',
      details: validation.errors,
      usingMockData: true
    };
  }

  return {
    status: 'configured',
    message: 'Airtable configurado correctamente',
    details: [],
    usingMockData: false
  };
};

// Configuración de ejemplo para el usuario
export const getExampleConfig = () => {
  return `
# Ejemplo de configuración correcta para Airtable:

# 1. Token de acceso (Personal Access Token)
NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN=pat14.exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 2. Base ID (ID de tu base de datos, empieza con 'app')
NEXT_PUBLIC_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# 3. Nombres de las tablas (deben coincidir exactamente con Airtable)
NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE=Turno Pirolisis
NEXT_PUBLIC_AIRTABLE_PERSONAL_TABLE=Personal
NEXT_PUBLIC_AIRTABLE_PROCESOS_TABLE=Procesos

# Cómo obtener estos valores:
# 1. Token: https://airtable.com/developers/web/api/introduction
# 2. Base ID: https://airtable.com/api (selecciona tu base)
# 3. Nombres de tablas: Exactamente como aparecen en tu base de Airtable
  `.trim();
};
