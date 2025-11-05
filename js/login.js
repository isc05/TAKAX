import { Auth } from './auth.js';

//Proteger esta página
Auth.protegerLogin();

const loginForm = document.querySelector('#loginForm')
loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const localUsers = JSON.parse(localStorage.getItem('users')) || [];
    let validUser = localUsers.find(user => user.email === email && user.password === password);
    if(validUser){
        alert(`Bienvenido ${validUser.name}`)
        Auth.iniciarSesion(validUser);
        window.location.href = 'app/index.html'
        return ; 
    }
    // Si no se encontró localmente, buscamos en el JSON.
    try {
        const res = await fetch('json/empresa.json');
        if (!res.ok) throw new Error('No se pudo cargar el archivo de empresas.');
        
        const jsonEmpresas = await res.json();

        // Buscamos en el JSON.
        // También convertimos a string la contraseña del JSON por si es un número
        validUser = jsonEmpresas.find(empresa => 
            empresa.email === email && 
            empresa.password.toString() === password
        );

        if (validUser) {
            const userSessionData = { ...validUser};

            alert(`Bienvenido (${validUser.tipo}) ${validUser.name}`);
            Auth.iniciarSesion(userSessionData);
            window.location.href = 'app/index.html';
            return;
        }

    } catch (error) {
        console.error("Error al leer empresa.json:", error);
        alert("Ocurrió un error al intentar iniciar sesión. Revisa la consola.");
        return;
    }
    // --- Si no se encontró en ninguna fuente ---
    return alert('Usuario y/o contraseña incorrectos!'); 
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