import { Auth } from './auth.js';
import { cargarMapa, redimensionarMapa, inicializarMapaAnalitico } from './map.js';

// ¡LÍNEA MÁGICA DE SEGURIDAD!
Auth.protegerPagina();
// RE-ASEGURAR EL CANDADO
// Si llegué aquí es que tengo sesión iniciada, así que marco el territorio de nuevo
const usuario = Auth.obtenerUsuarioActual();
if (usuario) {
  Auth.bloquearUsuario(usuario.email);
}
//sección de prueba - login correcto
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
//console.log("Usuario actual:", usuario);
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
  console.log("Aplicando filtros...");
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

/**
 * Rellena los detalles del centro en el área de detalles
 * @param {object} centro - El objeto del centro de reciclaje clickeado.
 */
function poblarDetalles(centro) {
  const detallesArea = document.querySelector("#detalles");
  const recomendado = detallesArea.querySelector("#recomendado-det");

  if (!centro || !detallesArea) return;
  recomendado.classList.remove("invisible");
  if (!centro.recomendado) {
    recomendado.classList.add("invisible");
  }
  // Rellena los campos (Usa los IDs/clases de tu HTML en empresas.html)
  // (Estos son ejemplos, ajusta los selectores a tu HTML real)
  detallesArea.querySelector("#nombre-centro-det").innerText = centro.nombre;
  detallesArea.querySelector("#telefono-centro-det").innerText = `Teléfono: ${centro.telefono}`;
  detallesArea.querySelector("#direccion-det").innerText = `📍${centro.direccion.calle}, No. ${centro.direccion.numero}, ${centro.direccion.colonia}, CP. ${centro.direccion.codigoPostal}, ${centro.direccion.ciudad}, ${centro.direccion.estado}, ${centro.direccion.pais}.` || "- Sin dirección";
  detallesArea.querySelector("#rating-det").innerText = centro.rating;

  // LÓGICA DEL MAPA
  // Verificamos si el centro tiene coordenadas configuradas
  if (centro.coordenadas) {
    cargarMapa(
      centro.coordenadas.lat,
      centro.coordenadas.lng,
      `<b>${centro.nombre}</b><br>${centro.direccion.calle}, ${centro.direccion.numero}`
    );
  } else {
    console.warn("Este centro no tiene coordenadas GPS.");
    // Opcional: Cargar un mapa por defecto en el centro de la ciudad
    cargarMapa(18.9065, -98.4289, "Ubicación no disponible");
  }
  // LÓGICA DEL CHAT
  const btnChat = document.querySelector("#btn-chat-centro");
  // Eliminamos listeners anteriores clonando el botón (Truco para evitar múltiples clicks)
  const newBtnChat = btnChat.cloneNode(true);
  btnChat.parentNode.replaceChild(newBtnChat, btnChat);
  newBtnChat.addEventListener("click", () => {
    // Obtenemos el usuario actual para validar
    const currentUser = Auth.obtenerUsuarioActual();
    if (!currentUser.rfc) {
      alert("Error: Tu usuario no tiene un RFC válido para chatear.");
      return;
    }
    // VALIDACIÓN DE RFC DEL CENTRO
    // Asegúrate de que en centros.json todos tengan "rfc"
    if (!centro.rfc) {
      alert("Este centro no tiene un RFC configurado para el chat.");
      return;
    }
    // REDIRECCIÓN AL CHAT
    // Pasamos el RFC y el Nombre del centro por URL
    const url = `chat.html?rfc=${encodeURIComponent(centro.rfc)}&name=${encodeURIComponent(centro.nombre)}`;
    window.location.href = url;
  });
}

function mostrarUI() {
  const UI = document.querySelector(".ui-profile");
  UI.classList.toggle("hidden");
}

async function calcularDatosMapa() {
    const usuarioActual = Auth.obtenerUsuarioActual();
    if (!usuarioActual) return;

    try {
        const res = await fetch("../json/centros.json");
        const todosLosCentros = await res.json();
        const datosParaMapa = [];

        todosLosCentros.forEach(centro => {
            let totalGastado = 0;
            if (centro.historialCompras) {
                const misCompras = centro.historialCompras.filter(compra => 
                    compra.rfcEmpresa === usuarioActual.rfc
                );
                totalGastado = misCompras.reduce((sum, c) => sum + c.monto, 0);
            }

            if (centro.coordenadas) {
                datosParaMapa.push({
                    nombre: centro.nombre,
                    lat: centro.coordenadas.lat,
                    lng: centro.coordenadas.lng,
                    monto: totalGastado
                });
            }
        });

        // 2. ¡ADIÓS IFRAME! LLAMADA DIRECTA
        console.log("Inicializando mapa analítico con datos:", datosParaMapa);
        inicializarMapaAnalitico(datosParaMapa);

    } catch (e) {
        console.error("Error cargando mapa analítico:", e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
  //mostrarResultados(centros);
  cargarDatos();

  calcularDatosMapa();
  const mapaAnalitico = document.getElementById("map-analitico");

  // Eventos de búsqueda y filtros
  const search = document.querySelectorAll(".search-centers");
  search.forEach(btn => { btn.addEventListener("click", aplicarFiltros); });

  const search_section = document.getElementById("search-section");
  search_section.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      aplicarFiltros();
    }
  });

  document.getElementById("toggle-filtros").addEventListener("click", () => {
    document.getElementById("panel-filtros").classList.toggle("hidden");
  });

  // Ocultar/mostrar mapa
  const viewMapBtn = document.getElementById("view-map");
  const span = viewMapBtn.querySelector("span");
  const viewIcon = viewMapBtn.querySelector(".fi-sr-eye");
  viewMapBtn.addEventListener("click", () => {
    const estaOculto = mapaAnalitico.classList.toggle("hidden");

    if (estaOculto) {
        // A) SI SE OCULTÓ:
        viewIcon.style.opacity = "0.5";
        span.innerText = "Mostrar mapa";
    } else {
        // B) SI SE MOSTRÓ:
        viewIcon.style.opacity = "1";
        span.innerText = "Ocultar mapa";
        // --- ¡LA CLAVE DEL ÉXITO! ---
        // Esperamos un instante a que el navegador quite el display:none
        // y le decimos a Leaflet: "¡Despierta, tienes espacio nuevo!"
        setTimeout(() => {
            redimensionarMapa(); 
        }, 100); 
    }
   });
  // Logout
  document.getElementById("logout").addEventListener("click", () => {
    Auth.cerrarSesion();
  });
  const userImg = document.getElementById("profile-img");
  const userType = document.getElementById("enterprise-profile");
  userImg.addEventListener("click", mostrarUI);
  userType.addEventListener("click", mostrarUI);

  const backBtn = document.getElementById("back");
  const detallesArea = document.querySelector("#detalles");
  const mainSection = document.querySelector("#main-content");
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.addEventListener("click", (event) => {
    // 1. Comprueba si el elemento clickeado (o su padre) tiene la clase .contactar
    const contactarBtn = event.target.closest(".contactar");
    if (contactarBtn) {
      // 2. ¡Sí! Obtén el ID (nombre) que guardamos en el data-*
      const nombreCentro = contactarBtn.dataset.centroNombre;
      // 3. Busca el objeto 'centro' completo en tu array 'centros'
      const centroClickeado = centros.find(c => c.nombre === nombreCentro);
      if (centroClickeado) {
        // 4. (Solución Problema 2) Llama a la función para llenar los detalles
        poblarDetalles(centroClickeado);
        // 5. Muestra la sección de detalles
        detallesArea.classList.remove("hidden");
        mainSection.classList.add("hidden");
        // Esperamos 200ms a que la animación/transición de CSS termine
        // y le decimos al mapa que se arregle.
        setTimeout(() => {
          redimensionarMapa();
        }, 500);
      }
    }
  });

  backBtn.addEventListener("click", () => {
    detallesArea.classList.add("hidden");
    mainSection.classList.remove("hidden");
    if (mapaAnalitico) {
      setTimeout(() => {
      redimensionarMapa();
    }, 100);
    }
  });
});