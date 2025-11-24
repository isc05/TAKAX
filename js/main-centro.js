import { Auth } from './auth.js';

// ¡LÍNEA MÁGICA DE SEGURIDAD!
Auth.protegerPagina();

function mostrarUI(){
  const UI = document.querySelector(".ui-profile");
  UI.classList.toggle("hidden");
}
document.addEventListener("DOMContentLoaded", () => {
  const usuario = Auth.obtenerUsuarioActual();
  const userNameText = document.getElementById("user-name-text");
  const userRoleText = document.getElementById("user-role-text");
  const userName = document.querySelectorAll(".account-name");
  const userEmail = document.querySelectorAll(".account-email");
  // Datos en la sección de "Tu Centro"
  const userPlan = document.querySelectorAll(".account-plan");
  const userRate = document.querySelectorAll(".account-rate");
  const userRfc = document.querySelectorAll(".account-rfc");
  const userLocation = document.querySelectorAll(".account-location");
  // Datos en la seccion de "Tu Tarjeta en TAKAX"
  const userPhone = document.querySelectorAll(".account-phone");

  if (usuario) {
    if (userRoleText) userRoleText.innerText = `${usuario.clase}`;
    if (userNameText) userNameText.innerText = `Bienvenido: ${usuario.name}`;
    if (userName) userName.forEach(n => {
      n.innerText = `${usuario.name}`;
    });
    if (userEmail) userEmail.forEach(e => {
      e.innerText = `${usuario.email}`;
    });
    if (userPlan) userPlan.forEach(p => {
      p.innerText = usuario.premium ? "Premium" : "Gratuito";
    });
    if (userRate) userRate.forEach(r => {
      r.innerText = (typeof usuario.rating === "number") ? usuario.rating.toFixed(1) : "";
    });
    if (userRfc) userRfc.forEach(ur => {
      ur.innerText = usuario.rfc || "-";
    });
    if (userLocation) userLocation.forEach(l => {
      l.innerText = `📍${usuario.direccion.calle}, No. ${usuario.direccion.numero}, ${usuario.direccion.colonia}, CP. ${usuario.direccion.codigoPostal}, ${usuario.direccion.ciudad}, ${usuario.direccion.estado}, ${usuario.direccion.pais}.` || "-";
    });
    if (userPhone) userPhone.forEach(up => {
      up.innerText = usuario.telefono || "-";
    });
  }

  const userImg = document.getElementById("profile-img");
  const userType = document.getElementById("enterprise-profile");
  if (userImg) userImg.addEventListener("click", mostrarUI);
  if (userType) userType.addEventListener("click", mostrarUI);
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) logoutBtn.addEventListener("click", () => Auth.cerrarSesion());
});