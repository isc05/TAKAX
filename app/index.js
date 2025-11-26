import { Auth } from '../js/auth.js';

// 1. Obtener el usuario desde nuestra fuente de verdad (Auth)
// Auth ya sabe si buscar en sessionStorage (lo correcto) o localStorage
const user = Auth.obtenerUsuarioActual();

if (!user) {
    // Si no hay nadie logueado, patéalo al login.
    // La ruta es '../' porque estamos DENTRO de la carpeta 'app'
    window.location.href = '../login.html';

} else if (user.tipo === 'empresa') {
    // Si es empresa, llévalo a la vista de empresa
    window.location.href = 'app/empresas.html';

} else if (user.tipo === 'centro') {
    // Si es centro, llévalo a la vista de centro
    window.location.href = 'app/centros.html';

} else {
    // Fallback por si un usuario viejo no tiene 'tipo'
    alert('Error en tu cuenta. Por favor, inicia sesión de nuevo.');
    Auth.cerrarSesion();
    window.location.href = '../login.html';
}
// Listener para detectar cuando se cierra la pestaña
window.addEventListener('beforeunload', () => {
    // Si el usuario está logueado, liberamos su candado
    const user = Auth.obtenerUsuarioActual();
    if (user) {
        Auth.desbloquearUsuario(user.email);
    }
    // Nota: No borramos sessionStorage, solo el candado de localStorage
});