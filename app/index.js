// Este script se ejecuta en app/index.html
const user = JSON.parse(localStorage.getItem('login_success'));

if (!user) {
    // Si no hay nadie logueado, patéalo al login.
    // La ruta es '../' porque estamos DENTRO de la carpeta 'app'
    window.location.href = '../login.html';

} else if (user.tipo === 'empresa') {
    // Si es empresa, llévalo a la vista de empresa
    window.location.href = 'empresas.html';

} else if (user.tipo === 'centro') {
    // Si es centro, llévalo a la vista de centro
    window.location.href = 'centros.html';

} else {
    // Fallback por si un usuario viejo no tiene 'tipo'
    alert('Error en tu cuenta. Por favor, inicia sesión de nuevo.');
    localStorage.removeItem('login_success');
    window.location.href = '../login.html';
}