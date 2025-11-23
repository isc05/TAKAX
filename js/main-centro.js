import { Auth } from './auth.js';

// ¡LÍNEA MÁGICA DE SEGURIDAD!
Auth.protegerPagina();

const usuario = Auth.obtenerUsuarioActual();
const userNameText = document.getElementById("user-name-text");
const userRoleText = document.getElementById("user-role-text");
const userName = document.querySelector(".user-name");
const userEmail = document.querySelector(".user-email");
    if (usuario) {
      userRoleText.innerText = `${usuario.clase}`;
      userNameText.innerText = `Bienvenido: ${usuario.name}`;
      userName.innerText = `Nombre: ${usuario.name}`;
      userEmail.innerText = `Correo: ${usuario.email}`;
    }

function mostrarUI(){
  const UI = document.querySelector(".ui-profile");
  UI.classList.toggle("hidden");
}
document.addEventListener("DOMContentLoaded", () => {
  const userImg = document.getElementById("profile-img");
  const userType = document.getElementById("enterprise-profile");
  userImg.addEventListener("click", mostrarUI);
  userType.addEventListener("click", mostrarUI);
  document.getElementById("logout").addEventListener("click", () => {
    Auth.cerrarSesion();
  });
});