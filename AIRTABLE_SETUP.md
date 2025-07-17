# 🔥 PiroliApp - Configuración de Airtable

## 📋 Configuración Inicial

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y configura las siguientes variables:

```bash
# Configuración de Airtable
NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN=tu_token_de_airtable
NEXT_PUBLIC_AIRTABLE_BASE_ID=tu_base_id_de_airtable
NEXT_PUBLIC_AIRTABLE_TURNOS_TABLE=Turnos
NEXT_PUBLIC_AIRTABLE_PERSONAL_TABLE=Personal
NEXT_PUBLIC_AIRTABLE_PROCESOS_TABLE=Procesos
```

### 2. Obtener Token de Airtable

1. Ve a [Airtable Developer Hub](https://airtable.com/developers/web/api/introduction)
2. Crea un Personal Access Token
3. Asigna los siguientes permisos:
   - `data.records:read` - Para leer registros
   - `data.records:write` - Para crear/actualizar registros
   - `schema.bases:read` - Para leer estructura de bases

### 3. Obtener Base ID

1. Ve a tu base de Airtable
2. Haz clic en "Help" > "API documentation"
3. Copia el Base ID que aparece en la URL (comienza con `app`)

## 🗄️ Estructura de Tablas en Airtable

### Tabla "Turnos"

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID | Primary Key | Identificador único |
| Fecha | Date | Fecha del turno |
| Turno | Single Select | Mañana, Tarde, Noche |
| Operador | Single Line Text | Nombre del operador |
| Supervisor | Single Line Text | Nombre del supervisor |
| Proceso_ID | Single Line Text | ID del proceso relacionado |
| Temperatura_Inicio | Number | Temperatura inicial (°C) |
| Temperatura_Fin | Number | Temperatura final (°C) |
| Biomasa_Kg | Number | Cantidad de biomasa (kg) |
| Biochar_Kg | Number | Cantidad de biochar producido (kg) |
| Observaciones | Long Text | Notas del turno |
| Estado | Single Select | Activo, Completado, Suspendido |

### Tabla "Personal"

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID | Primary Key | Identificador único |
| Nombre | Single Line Text | Nombre completo |
| Cargo | Single Select | Operador, Supervisor, Técnico |
| Turno_Preferido | Single Select | Mañana, Tarde, Noche |
| Email | Email | Correo electrónico |
| Teléfono | Phone Number | Número de teléfono |
| Activo | Checkbox | Si está activo o no |

### Tabla "Procesos"

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID | Primary Key | Identificador único |
| Lote_ID | Single Line Text | Identificador del lote |
| Fecha_Inicio | Date | Fecha de inicio del proceso |
| Fecha_Fin | Date | Fecha de finalización |
| Tipo_Biomasa | Single Select | Tipo de biomasa utilizada |
| Cantidad_Inicial | Number | Cantidad inicial de biomasa (kg) |
| Temperatura_Proceso | Number | Temperatura del proceso (°C) |
| Rendimiento | Number | Porcentaje de rendimiento |
| Calidad_Biochar | Single Select | A, B, C |
| Estado | Single Select | En_Proceso, Completado, Suspendido |

## 🔧 Configuración de Campos en Airtable

### Configurar Single Select "Turno"
- Mañana (color verde)
- Tarde (color amarillo) 
- Noche (color azul)

### Configurar Single Select "Cargo"
- Operador (color azul)
- Supervisor (color verde)
- Técnico (color gris)

### Configurar Single Select "Estado"
- Activo (color verde)
- Completado (color azul)
- Suspendido (color rojo)

### Configurar Single Select "Calidad_Biochar"
- A (color verde) - Excelente
- B (color amarillo) - Buena
- C (color rojo) - Regular

## 📊 Vistas Recomendadas en Airtable

### Vista "Turnos Activos"
- Filtro: Estado = "Activo"
- Ordenar por: Fecha (más reciente primero)

### Vista "Turnos del Día"
- Filtro: Fecha = Hoy
- Ordenar por: Turno

### Vista "Personal Activo"
- Filtro: Activo = ✓
- Ordenar por: Cargo, Nombre

### Vista "Procesos en Curso"
- Filtro: Estado = "En_Proceso"
- Ordenar por: Fecha_Inicio

## 🚀 Funcionalidades Implementadas

### ✅ Dashboard de Turnos
- Visualización de turnos del día seleccionado
- Estadísticas en tiempo real
- Filtrado por fecha
- Estados de turnos con colores

### ✅ Gestión Mi Turno
- Crear nuevos turnos
- Actualizar estado de turnos
- Agregar observaciones
- Asignar personal

### ✅ Seguimiento de Personal
- Lista de personal activo
- Filtrado por cargo
- Asignación a turnos

### ✅ Control de Procesos
- Visualización de procesos en curso
- Seguimiento de lotes
- Métricas de producción

## 🔄 API Endpoints Utilizados

### Turnos
- `GET` - Obtener turnos del día
- `GET` - Obtener turnos activos
- `POST` - Crear nuevo turno
- `PATCH` - Actualizar turno

### Personal
- `GET` - Obtener personal activo
- `GET` - Filtrar por cargo

### Procesos
- `GET` - Obtener procesos en curso
- `GET` - Filtrar por estado

## 📈 Métricas y Estadísticas

La aplicación calcula automáticamente:
- Total de turnos del día
- Temperatura promedio
- Total de biomasa procesada
- Total de biochar producido
- Rendimiento promedio
- Estados de turnos

## 🛠️ Solución de Problemas

### Error de Conexión
1. Verifica que el token de Airtable sea válido
2. Confirma que el Base ID sea correcto
3. Asegúrate de que los nombres de tablas coincidan

### Error de Permisos
1. Verifica que el token tenga permisos de lectura y escritura
2. Confirma que las tablas existan en la base

### Datos No Aparecen
1. Verifica que haya datos en las tablas de Airtable
2. Confirma que los campos tengan los nombres correctos
3. Revisa la consola del navegador para errores

## 📞 Soporte

Para problemas con la configuración:
1. Revisa los logs en la consola del desarrollador
2. Verifica la configuración de variables de entorno
3. Confirma la estructura de tablas en Airtable

## 🔐 Seguridad

- Nunca compartir tokens de API
- Usar variables de entorno para configuración
- Implementar validaciones de entrada
- Monitorear accesos a la API
