// Test específico para verificar el último turno
const { airtableService } = require('./src/app/services/airtableService.ts');

async function testUltimoTurno() {
  try {
    console.log('🧪 Probando obtención del último turno...');
    
    const turnos = await airtableService.getTurnos();
    console.log(`📊 Total turnos: ${turnos.length}`);
    
    if (turnos.length > 0) {
      // Ordenar por fecha para obtener el más reciente
      const turnosOrdenados = turnos.sort((a, b) => {
        const fechaA = new Date(a["Fecha Inicio Turno"] || a.fecha || a.createdTime || '');
        const fechaB = new Date(b["Fecha Inicio Turno"] || b.fecha || b.createdTime || '');
        return fechaB.getTime() - fechaA.getTime();
      });
      
      const ultimoTurno = turnosOrdenados[0];
      
      console.log('🎯 ÚLTIMO TURNO ENCONTRADO:');
      console.log('============================');
      console.log('ID:', ultimoTurno.id);
      console.log('Operador:', ultimoTurno.Operador || ultimoTurno.operador || 'N/A');
      console.log('Fecha Inicio:', ultimoTurno["Fecha Inicio Turno"] || ultimoTurno.fecha || 'N/A');
      console.log('Fecha Fin:', ultimoTurno["Fecha Fin Turno"] || 'En proceso');
      console.log('Estado Planta:', ultimoTurno["Estado Final Planta"] || 'N/A');
      console.log('Biochar Total:', ultimoTurno["Total Biochar Produccido Turno"] || 0);
      console.log('Energia Inicio:', ultimoTurno["Consumo Energia Inicio"] || 0);
      console.log('Energia Fin:', ultimoTurno["Consumo Energia Fin"] || 0);
      console.log('============================');
      
      // Mostrar también los primeros 3 turnos para comparar
      console.log('\n📋 PRIMEROS 3 TURNOS (ordenados por fecha):');
      turnosOrdenados.slice(0, 3).forEach((turno, index) => {
        console.log(`${index + 1}. ${turno.Operador || turno.operador} - ${turno["Fecha Inicio Turno"] || turno.fecha} - ${turno["Total Biochar Produccido Turno"] || 0}kg`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUltimoTurno();
