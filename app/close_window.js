import { Auth } from '../js/auth.js';
// Listener para detectar cuando se cierra la pestaña
window.addEventListener('beforeunload', () => {
    // Si el usuario está logueado, liberamos su candado
    const user = Auth.obtenerUsuarioActual();
    if (user) {
        Auth.desbloquearUsuario(user.email);
    }
    // Nota: No borramos sessionStorage, solo el candado de localStorage
});