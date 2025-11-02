import { Auth } from './auth.js';

// ¡LÍNEA MÁGICA DE SEGURIDAD!
Auth.protegerPagina();
 //sección de prueba - login correcto
const usuario = Auth.obtenerUsuarioActual();
const userNameText = document.getElementById("user-name-text");
    if (usuario) {
      
      userNameText.innerText = `Bienvenido: ${usuario.name}`;
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
  if (lista.length > 0)
    lista.forEach(c => contenedor.appendChild(crearTarjeta(c)));
  else {
    document.getElementById("results-container").innerHTML = "<p>No se encontraron centros de reciclaje.</p>";
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
});
