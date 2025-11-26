import { Auth } from './auth.js';

//Proteger esta página
Auth.protegerLogin();

const indexURL = 'index.html';
const loginForm = document.querySelector('#loginForm');
/**
 * Función auxiliar para buscar usuario en un archivo JSON.
 * @param {string} url - Ruta del archivo JSON.
 * @param {string} email - Email a buscar.
 * @param {string} password - Contraseña a verificar.
 * @param {string} tipoForzado - El 'tipo' de usuario que contiene este JSON ('empresa' o 'centro').
 * @returns {object|null} - Retorna el usuario normalizado o null si no se encuentra.
 */
async function buscarEnJson(url, email, password, tipoForzado) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null; // Si falla la carga, asumimos no encontrado

        const lista = await res.json();

        // Buscamos coincidencia (manejando 'password' o 'contrasena' del JSON)
        const encontrado = lista.find(item =>
            item.email.toLowerCase() === email &&
            (item.password == password || item.contrasena == password)
        );
        if (encontrado) {
            // Normalizamos el objeto para la sesión (Estandarizamos 'name' y agregamos 'tipo')
            return {
                ...encontrado,
                name: encontrado.nombre || encontrado.name, // Asegura que siempre haya un 'name'
                tipo: tipoForzado // Forzamos el tipo según el archivo de origen
            };
        }
        return null;
    } catch (error) {
        console.error(`Error leyendo ${url}:`, error);
        return null;
    }
}
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    // Normalizamos inputs (Buena práctica)
    const emailInput = document.querySelector('#email').value.trim().toLowerCase();
    const passwordInput = document.querySelector('#password').value.trim();
    // 1. Buscar en localStorage (Prioridad a usuarios registrados manualmente)
    const localUsers = JSON.parse(localStorage.getItem('users')) || [];
    let validUser = localUsers.find(user =>
        user.email.toLowerCase() === emailInput && user.password === passwordInput
    );
    // 2. Si no está en local, buscar en empresa.json 
    if (!validUser) {
        validUser = await buscarEnJson('json/empresa.json', emailInput, passwordInput, 'empresa');
    }
    // 3. Si no está en empresa, buscar en centros.json
    if (!validUser) {
        validUser = await buscarEnJson('json/centros.json', emailInput, passwordInput, 'centro');
    }
    // 4. Se encontró en algun lado y se inicia sesión
    if (validUser) {
        // NUEVA VALIDACIÓN: ¿Alguien más está usando esta cuenta?
        if (Auth.estaUsuarioOcupado(validUser.email)) {
            return alert(`La cuenta ${validUser.email} ya tiene una sesión abierta en otra ventana.`);
        }
        alert(`Bienvenido de nuevo (${validUser.tipo}), ${validUser.name}`);
        Auth.iniciarSesion(validUser);
        window.location.href = indexURL;
        return;
    }
    // 4. Si no se encuentra en ningún lado
    alert('Usuario y/o contraseña incorrectos.');
})

//Ahora estos usuarios de prueba no se utilizarán, ya que los usuarios predefinidos estarán en el archivo empresa.json
//y el registro de nuevos usuarios añadirá nuevos usuarios a localStorage.
// IMPORTANTE: Los archivos JSON no deben contener comentarios, ya que esto puede causar errores al parsearlos.

// =================================================================================
// Lógica de Inicialización de Usuarios de Prueba
// Comprueba si ya existen usuarios en localStorage. Si no hay ninguno, añade unos por defecto.
// =================================================================================
// const existingUsers = JSON.parse(localStorage.getItem('users'));

// if (!existingUsers || existingUsers.length === 0) {
//     const sampleUsers = [
//         { name: "Alice Smith", email: "alice@example.com", password: "password123" },
//         { name: "Bob Johnson", email: "bob@test.com", password: "securepass" },
//         { name: "Daniel Ortega", email: "da@da.com", password: "123" }
//     ];
//     localStorage.setItem('users', JSON.stringify(sampleUsers));
//     console.log('¡Usuarios de prueba inicializados! Usa alice@example.com o bob@test.com para iniciar sesión.');
// }