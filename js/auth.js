// Clave única de localStorage
const SESSION_KEY = 'login_success';

// Hacemos un "export" para que otras funciones puedan usarlas
export const Auth = {
    
    /**
     * Guarda el usuario en sessionStorage (SOLO PARA ESTA PESTAÑA).
     * Esto evita que una pestaña sobrescriba a la otra.
     * @param {object} user - El objeto del usuario (ej. {name, email, tipo})
     */
    iniciarSesion(user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        // NUEVO: Ponemos el candado público en localStorage
        this.bloquearUsuario(user.email);
    },

    /**
     * Cierra la sesión SOLO de esta pestaña.
     */
    cerrarSesion() {
        const user = this.obtenerUsuarioActual();
        if (user) {
            // NUEVO: Quitamos el candado antes de irnos
            this.desbloquearUsuario(user.email);
        }
        sessionStorage.removeItem(SESSION_KEY);
        // Redirigimos al login
        window.location.href = '../login.html'; 
    },

    /**
     * Comprueba si hay usuario en esta pestaña.
     * @returns {boolean} - True si hay sesión, false si no.
     */
    estaLogueado() {
        return sessionStorage.getItem(SESSION_KEY) !== null;
    },

    /**
     * Devuelve el objeto del usuario que está logueado en esta pestaña.
     * @returns {object | null} - El objeto del usuario o null si no hay nadie.
     */
    obtenerUsuarioActual() {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    },

    // --- NUEVAS FUNCIONES PARA EL CANDADO ---
    /**
     * Revisa si existe un candado para este email en localStorage
     */
    estaUsuarioOcupado(email) {
        return localStorage.getItem(`lock_session_${email}`) === 'true';
    },

    /**
     * Pone el candado
     */
    bloquearUsuario(email) {
        localStorage.setItem(`lock_session_${email}`, 'true');
    },

    /**
     * Quita el candado
     */
    desbloquearUsuario(email) {
        localStorage.removeItem(`lock_session_${email}`);
    },
    
    /**
     * Función clave: Protege una página.
     * Si no hay nadie logueado, lo patea al login.
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
            window.location.href = 'index.html';
        }
    }
};//esto y es demasiado para mi...