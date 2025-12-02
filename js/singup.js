import { Auth } from './auth.js';

Auth.protegerLogin();

const indexURL = 'index.html';
/**
 * Verifica si un email existe en un archivo JSON.
 */
async function existeEnJson(url, email) {
    try {
        const res = await fetch(url);
        if (!res.ok) return false;
        const lista = await res.json();
        return lista.some(item => item.email.toLowerCase() === email);
    } catch (error) {
        console.warn(`No se pudo verificar en ${url}`);
        return false;
    }
}
const signupForm = document.querySelector('#signupForm');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    // Recolección y limpieza de datos
    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim().toLowerCase();
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    const tipo = document.querySelector('#tipo').value;
    const rfc = document.querySelector('#rfc').value.trim().toUpperCase(); // RFC siempre mayúsculas
    const phone = document.querySelector('#phone').value.trim();
    const clase = document.querySelector('#clase').value.trim();
    // Validación básica de contraseñas
    if (password !== passwordConfirm) {
        return alert('Las contraseñas no coinciden.');
    }
    // --- Check 1: Verificar en localStorage ---
    const localUsers = JSON.parse(localStorage.getItem('users')) || [];
    const existeLocal = localUsers.find(user => user.email === email || user.rfc === rfc);

    if (existeLocal) {
        return alert('¡El usuario (Email o RFC) ya está registrado localmente!');
    }
    // --- Check 2: Verificar en JSONs (Empresas Y Centros) ---
    // Usamos Promise.all para verificar ambos archivos simultáneamente (Más rápido)
    const [existeEnEmpresas, existeEnCentros] = await Promise.all([
        existeEnJson('json/empresa.json', email),
        existeEnJson('json/centros.json', email)
    ]);

    if (existeEnEmpresas || existeEnCentros) {
        return alert('Este correo ya pertenece a una cuenta verificada del sistema. Por favor inicia sesión.');
    }
    // --- CREACIÓN DE USUARIO ---
    const newUser = { 
        name, 
        email, 
        password, 
        phone, 
        rfc, 
        tipo, 
        clase
    };
    localUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(localUsers));
    alert('¡Registro Exitoso!');
    // Auto-login
    Auth.iniciarSesion(newUser);
    window.location.href = indexURL;
});