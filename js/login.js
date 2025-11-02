// =================================================================================
// Lógica de Inicialización de Usuarios de Prueba
// Comprueba si ya existen usuarios en localStorage. Si no hay ninguno, añade unos por defecto.
// =================================================================================

import { Auth } from './auth.js';

// (Opcional) Proteger esta página
Auth.protegerLogin();

const loginForm = document.querySelector('#loginForm')
loginForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const Users = JSON.parse(localStorage.getItem('users')) || []
    const validUser = Users.find(user => user.email === email && user.password === password)
    if(!validUser){
        return alert('Usuario y/o contraseña incorrectos!')
    }
    alert(`Bienvenido ${validUser.name}`)
    Auth.iniciarSesion(validUser);
    window.location.href = 'app/index.html'   
})

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