import { Auth } from './auth.js';

Auth.protegerLogin();

const selectType = document.querySelector('#tipo');
selectType.addEventListener('change', (e) => {
    const empresaDetalles = document.querySelector('#empresa-detalles');
    if (e.target.value === 'empresa') {
        empresaDetalles.classList.remove('hidden');
    }else{
        empresaDetalles.classList.add('hidden');
    }
});
const signupForm = document.querySelector('#signupForm')
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = document.querySelector('#name').value
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const tipo = document.querySelector('#tipo').value;
    const rfc = document.querySelector('#rfc').value;
    const phone = document.querySelector('#phone').value;
    if(tipo === 'empresa'){
        const clase = document.querySelector('#clase').value;
    }

    // --- Check 1: Verificar en localStorage ---

    const localUsers = JSON.parse(localStorage.getItem('users')) || [];
    let isUserRegistered = localUsers.find(user => user.email === email);
    if (isUserRegistered) {
        return alert('¡El email ya esta registado (local)!')
    }
    // --- Check 2: Verificar en json/empresa.json ---
    try {
        const res = await fetch('json/empresa.json');
        if (!res.ok) throw new Error('No se pudo cargar el archivo de empresas.');

        const jsonEmpresas = await res.json();
        isUserRegistered = jsonEmpresas.find(empresa => empresa.email === email);

        if (isUserRegistered) {
            return alert('Ese email pertenece a una empresa. Por favor, inicia sesión.');
        }

    } catch (error) {
        console.error("Error al leer empresa.json:", error);
        alert("Ocurrió un error al registrar. Revisa la consola.");
        return;
    }

    // --- Si pasó ambas validaciones, lo registramos (en localStorage) ---
    const newUser = { name, email, password, tipo, rfc, phone, clase: tipo === 'empresa' ? document.querySelector('#clase').value : undefined };
    localUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(localUsers));

    alert('¡Registro Exitoso!');
    Auth.iniciarSesion(newUser);
    window.location.href = 'app/index.html';

})