// Script de prueba para verificar la API de usuarios
// Ejecutar con: node test-api.js

const axios = require('axios');

const API_URL = 'http://20.72.176.102:7181';

async function testEndpoints() {
    console.log('🧪 Probando endpoints de la API de Usuarios...\n');

    // Test 1: GET /api/users/getUsers
    console.log('1️⃣ Probando GET /api/users/getUsers');
    try {
        const response = await axios.get(`${API_URL}/api/users/getUsers`);
        console.log('✅ GET /api/users/getUsers - OK');
        console.log(`   Respuesta: ${JSON.stringify(response.data).substring(0, 100)}...\n`);
    } catch (error) {
        console.log('❌ GET /api/users/getUsers - ERROR');
        console.log(`   Status: ${error.response?.status || 'N/A'}`);
        console.log(`   Mensaje: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 2: POST /api/users/registerUser
    console.log('2️⃣ Probando POST /api/users/registerUser');
    try {
        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: `test${Date.now()}@example.com`,
            phoneNumber: '04121234567',
            address: 'Test Address',
            birthdate: '1990-01-01T00:00:00',
            roleUser: 'Usuario',
            password: 'test123'
        };
        const response = await axios.post(`${API_URL}/api/users/registerUser`, testUser);
        console.log('✅ POST /api/users/registerUser - OK');
        console.log(`   Respuesta: ${JSON.stringify(response.data).substring(0, 100)}...\n`);
    } catch (error) {
        console.log('❌ POST /api/users/registerUser - ERROR');
        console.log(`   Status: ${error.response?.status || 'N/A'}`);
        console.log(`   Mensaje: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.message?.includes('relation') && error.response?.data?.message?.includes('does not exist')) {
            console.log('   ⚠️  PROBLEMA: La tabla "Users" no existe en la base de datos PostgreSQL');
            console.log('   💡 SOLUCIÓN: El backend necesita crear/migrar las tablas de la base de datos\n');
        } else {
            console.log('');
        }
    }

    // Test 3: Verificar conectividad
    console.log('3️⃣ Verificando conectividad con el servidor');
    try {
        await axios.get(`${API_URL}/api/users/getUsers`, { timeout: 5000 });
        console.log('✅ El servidor está accesible\n');
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ No se puede conectar al servidor');
            console.log('   Verifica que el servidor esté corriendo en:', API_URL);
        } else {
            console.log('⚠️  El servidor responde pero hay un error:', error.message);
        }
    }
}

testEndpoints();


