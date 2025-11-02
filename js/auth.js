// Clave única de localStorage
const SESSION_KEY = 'login_success';

// Hacemos un "export" para que otras funciones puedan usarlas
export const Auth = {
    
    /**
     * Guarda el usuario en localStorage e inicia la sesión.
     * @param {object} user - El objeto del usuario (ej. {name, email, tipo})
     */
    iniciarSesion(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    },

    /**
     * Elimina al usuario de localStorage y cierra la sesión.
     */
    cerrarSesion() {
        localStorage.removeItem(SESSION_KEY);
        // Redirigimos al login
        window.location.href = '../login.html'; 
    },

    /**
     * Comprueba si hay un usuario logueado.
     * @returns {boolean} - True si hay sesión, false si no.
     */
    estaLogueado() {
        return localStorage.getItem(SESSION_KEY) !== null;
    },

    /**
     * Devuelve el objeto del usuario que está logueado.
     * @returns {object | null} - El objeto del usuario o null si no hay nadie.
     */
    obtenerUsuarioActual() {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    },

    /**
     * Función clave: Protege una página.
     * Si no hay nadie logueado, lo patea al login.
     * ¡Esta la usarás en app/empresa.html y app/centro.html!
     */
    protegerPagina() {
        if (!this.estaLogueado()) {
            alert('Debes iniciar sesión para ver esta página.');
            window.location.href = '../login.html';
        }
    },
    
    /**
     * (Opcional) Protege las páginas de login/signup.
     * Si ya estás logueado, no tiene sentido ver el login.
     */
    protegerLogin() {
        if (this.estaLogueado()) {
             // Lo mandamos al "router" (app/index.html) que ya sabe
             // a dónde enviarlo (empresa.html o centro.html)
            window.location.href = 'app/index.html';
        }
    }
};//esto y es demasiado para mi...