import { Auth } from './auth.js';

// ¡LÍNEA MÁGICA DE SEGURIDAD!
Auth.protegerPagina();
 //sección de prueba - login correcto
const usuario = Auth.obtenerUsuarioActual();
const userNameText = document.getElementById("user-name-text");
const userRoleText = document.getElementById("user-role-text");
const userName = document.querySelector(".user-name");
const userEmail = document.querySelector(".user-email");
    if (usuario) {
      userRoleText.innerText = `Perfil de ${usuario.tipo}`;
      userNameText.innerText = `Bienvenido: ${usuario.name}`;
      userName.innerText = `Nombre: ${usuario.name}`;
      userEmail.innerText = `Correo: ${usuario.email}`;
    }
    console.log("Usuario actual:", usuario);
// Lógica de la página de empresas - búsqueda y filtros de centros de reciclaje
import { crearTarjeta } from "./tarjeta.js";

let centros = [];

async function cargarDatos() {
  const res = await fetch("../json/centros.json");
  centros = await res.json();
  mostrarResultados(centros);
}

function mostrarResultados(lista) {
  const contenedor = document.getElementById("results-container");
  contenedor.innerHTML = "";
  const listaOrdenada = lista.sort((a, b) => {
    
    // Criterio 1: "recomendado" (true=1, false=0)
    // Ordena recomendados (1) antes que no recomendados (0)
    const critRecomendado = b.recomendado - a.recomendado;

    // Si son diferentes en "recomendado" (uno es 1 y el otro 0),
    // usamos ese resultado y terminamos.
    if (critRecomendado !== 0) {
      return critRecomendado;
    }

    // Criterio 2: Si son iguales en "recomendado" (critRecomendado es 0),
    // entonces ordenamos por 'rating' de mayor a menor.
    return b.rating - a.rating;
    //esta función está bien diabólica, apenas y la entiendo yo mismo :D
  });

  if (listaOrdenada.length > 0) {
    // Ahora usamos la 'listaOrdenada' para crear las tarjetas
    listaOrdenada.forEach(c => contenedor.appendChild(crearTarjeta(c)));
  } else {
    contenedor.innerHTML = "<p>No se encontraron centros de reciclaje.</p>";
  }
}

function obtenerFiltros() {
  console.log("Obteniendo filtros...");
  const nombre = document.getElementById("busqueda-nombre").value.toLowerCase();
  const ratingMin = parseFloat(document.getElementById("filtro-rating").value) || 0;
  const distanciaMax = parseFloat(document.getElementById("filtro-distancia").value) || Infinity;
  const precioMin = parseFloat(document.getElementById("precio-min").value) || 0;
  const precioMax = parseFloat(document.getElementById("precio-max").value) || Infinity;
  const materiales = Array.from(document.querySelectorAll(".material-checkbox:checked")).map(cb => cb.value);

  return { nombre, ratingMin, distanciaMax, precioMin, precioMax, materiales };
}

function aplicarFiltros() {
  const f = obtenerFiltros();

  const filtrados = centros.filter(c => {
    const coincideNombre = f.nombre === "" || c.nombre.toLowerCase().includes(f.nombre);
    const coincideRating = c.rating >= f.ratingMin;
    const coincidePrecio = c.precioMin >= f.precioMin && c.precioMax <= f.precioMax;
    const coincideMateriales = f.materiales.length === 0 || f.materiales.some(m => c.materiales.includes(m));
    const coincideDistancia = !c.distancia || c.distancia <= f.distanciaMax; // si tienes distancia en tu JSON
    return coincideNombre && coincideRating && coincidePrecio && coincideMateriales && coincideDistancia;
  });

  mostrarResultados(filtrados);
}

function mostrarUI(){
  const UI = document.querySelector(".ui-profile");
  UI.classList.toggle("hidden");
}
document.addEventListener("DOMContentLoaded", () => {
  //mostrarResultados(centros);
  cargarDatos();

  document.getElementById("btn-buscar").addEventListener("click", aplicarFiltros);
  document.getElementById("aplicar-filtros").addEventListener("click", aplicarFiltros);

  document.getElementById("toggle-filtros").addEventListener("click", () => {
    document.getElementById("panel-filtros").classList.toggle("hidden");

  });
  document.getElementById("logout").addEventListener("click", () => {
    Auth.cerrarSesion();
  });
  const userImg = document.getElementById("profile-img");
  const userType = document.getElementById("user-role-text");
  userImg.addEventListener("click", mostrarUI);
  userType.addEventListener("click", mostrarUI);
});
