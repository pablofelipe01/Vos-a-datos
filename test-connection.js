// Test rápido de conexión a Airtable
const fetch = require('node-fetch');

const BASE_ID = 'apprXBBomgiKhVc50';
const TABLE_NAME = 'Turno Pirolisis';
const ACCESS_TOKEN = 'patzfAySCZmA9Xnbo.9c4f6f268bea4f6909b6bf2e16fa8faaad25319dce1ef950cca9e453ba814e28';

async function testAirtable() {
  try {
    console.log('🧪 Probando conexión a Airtable...');
    console.log(`Base ID: ${BASE_ID}`);
    console.log(`Tabla: ${TABLE_NAME}`);
    
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ Conexión exitosa!');
    console.log(`Total de registros: ${data.records.length}`);
    
    if (data.records.length > 0) {
      console.log('🔍 Primer registro:');
      console.log(JSON.stringify(data.records[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAirtable();
