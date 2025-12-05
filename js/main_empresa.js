import { Auth } from './auth.js';
import { cargarMapa, redimensionarMapa, inicializarMapaAnalitico, enfocarCoordenadas, calcularMetricasRegion } from './map.js';
import { crearTarjeta } from "./tarjeta.js";

Auth.protegerPagina();
const usuario = Auth.obtenerUsuarioActual();
if (usuario) {
  Auth.bloquearUsuario(usuario.email);
}
//sección - login correcto
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
// Lógica de la página de empresas - búsqueda y filtros de centros de reciclaje
let centros = [];

async function cargarDatos() {
  const res = await fetch("../json/centros.json");
  centros = await res.json();
  // Calculamos la distancia de cada centro al usuario
  centros = centros.map(c => {
    let distancia = Infinity; // Por defecto muy lejos
    // Si ambos tienen coordenadas, calculamos
    if (usuario.coordenadas && c.coordenadas) {
      distancia = calcularDistanciaKm(usuario.coordenadas, c.coordenadas);
    }
    // Retornamos el centro + su distancia calculada
    return { ...c, distanciaCalculada: distancia };
  });
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
    // Si la distancia es válida en ambos, ordenamos por km
    if (a.distanciaCalculada !== Infinity && b.distanciaCalculada !== Infinity) {
      return a.distanciaCalculada - b.distanciaCalculada;
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
// ==========================================
// 1. FUNCIÓN MATEMÁTICA DE DISTANCIA (Euclidiana Local)
// ==========================================
function calcularDistanciaKm(coord1, coord2) {
  if (!coord1 || !coord2) return Infinity; // Si faltan datos, está infinitamente lejos

  // Factores de conversión (Los mismos que usamos en el mapa para consistencia)
  // 1 grado Lat ~= 111.19 km
  // 1 grado Lng ~= 111.19 * cos(lat) km
  const factorLatKm = 111.19;
  const factorLngKm = 111.19 * Math.cos(coord1.lat * (Math.PI / 180));

  const dx = (coord2.lng - coord1.lng) * factorLngKm;
  const dy = (coord2.lat - coord1.lat) * factorLatKm;

  // Teorema de Pitágoras: c = raíz(a² + b²)
  return Math.sqrt(dx * dx + dy * dy);
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
    const maxDist = f.distanciaMax > 0 ? f.distanciaMax : Infinity;
    const coincideDistancia = c.distanciaCalculada <= maxDist;
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

let datosCacheados = null;
let socioTopCacheado = null;
async function calcularDatosMapa() {
  const usuarioActual = Auth.obtenerUsuarioActual();
  if (!usuarioActual) return;

  try {
    const res = await fetch("../json/centros.json");
    const todosLosCentros = await res.json();
    const datosAnaliticos = [];

    todosLosCentros.forEach(centro => {
      let totalGastado = 0;
      let totalTransacciones = 0;

      if (centro.historialCompras) {
        const misCompras = centro.historialCompras.filter(compra =>
          compra.rfcEmpresa === usuarioActual.rfc
        );
        totalGastado = misCompras.reduce((sum, c) => sum + c.monto, 0);
        totalTransacciones = misCompras.length;
      }

      if (centro.coordenadas) {
        datosAnaliticos.push({
          nombre: centro.nombre,
          lat: centro.coordenadas.lat,
          lng: centro.coordenadas.lng,
          monto: totalGastado,
          transacciones: totalTransacciones
        });
      }
    });

    console.log("Datos analiticos:", datosAnaliticos);
    inicializarMapaAnalitico(datosAnaliticos, usuarioActual);

    renderizarTablaTopSocios(datosAnaliticos);

    // --- CÓDIGO NUEVO PARA EL BOTÓN ---
    const btnCalculos = document.getElementById("btn-ver-calculos");

    // Encontrar al socio top (el de mayor monto)
    const sociosConVentas = datosAnaliticos.filter(d => d.monto > 0);

    if (sociosConVentas.length > 0) {
      const socioTop = sociosConVentas.reduce((max, c) => (c.monto > max.monto) ? c : max, sociosConVentas[0]);

      // Guardamos en memoria para usar al dar clic
      datosCacheados = datosAnaliticos;
      socioTopCacheado = socioTop;

      // Mostrar botón
      btnCalculos.classList.remove("hidden");
    } else {
      btnCalculos.classList.add("hidden");
    }
  } catch (e) {
    console.error("Error cargando dashboard:", e);
  }
}
// --- NUEVA FUNCIÓN PARA LA TABLA ---
function renderizarTablaTopSocios(datos) {
  const tbody = document.querySelector("#tabla-socios tbody");
  tbody.innerHTML = ""; // Limpiar tabla

  // 1. Filtramos solo los que tienen ventas (> 0)
  const sociosActivos = datos.filter(d => d.monto > 0);

  if (sociosActivos.length === 0) {
    tbody.innerHTML = "<tr><td colspan='3' style='text-align:center'>No hay actividad reciente.</td></tr>";
    return;
  }
  // 2. Ordenamos de mayor a menor monto (Top)
  sociosActivos.sort((a, b) => b.monto - a.monto);

  // 3. Generamos las filas
  sociosActivos.forEach(socio => {
    const fila = document.createElement("tr");
    fila.style.cursor = "pointer";
    fila.title = "Ver en el mapa";
    // Formatear dinero (ej: $1,200.00)
    const montoFormato = new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN'
    }).format(socio.monto);

    fila.innerHTML = `
            <td><strong>${socio.nombre}</strong></td>
            <td style="text-align: center;">${socio.transacciones}</td>
            <td style="color: var(--secondary-color); font-weight: bold;">${montoFormato}</td>
        `;
    // Al hacer clic en la fila, llamamos al mapa
    fila.addEventListener("click", () => {
      console.log(`Viajando a: ${socio.nombre}`);
      enfocarCoordenadas(socio.lat, socio.lng);

      // (Opcional) Resaltar visualmente la fila seleccionada
      // Quitamos la clase 'selected' de todas y se la ponemos a esta
      document.querySelectorAll("#tabla-socios tr").forEach(tr => tr.style.backgroundColor = "");
      fila.style.backgroundColor = "var(--primary-color)";
    });

    tbody.appendChild(fila);
  });
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
  const tablaSocios = document.getElementById("tabla-socios");
  viewMapBtn.addEventListener("click", () => {
    const estaOculto1 = mapaAnalitico.classList.toggle("hidden");
    const estaOculto2 = tablaSocios.classList.toggle("hidden");

    if (estaOculto1 && estaOculto2) {
      // A) SI SE OCULTÓ:
      viewIcon.style.opacity = "0.5";
      span.innerText = "Mostrar mapa&tabla";
    } else {
      // B) SI SE MOSTRÓ:
      viewIcon.style.opacity = "1";
      span.innerText = "Ocultar mapa&tabla";
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

  // LÓGICA DEL MODAL MATEMÁTICO
  const btnVerCalculos = document.getElementById("btn-ver-calculos");
  const modal = document.getElementById("modal-calculos");
  const btnCerrarModal = document.getElementById("btn-cerrar-modal");

  btnVerCalculos.addEventListener("click", () => {
    if (datosCacheados && socioTopCacheado) {
      // 1. Ejecutar las Matemáticas Pesadas
      const resultados = calcularMetricasRegion(datosCacheados, socioTopCacheado);

      // 2. Llenar el HTML del Modal
      document.getElementById("math-nombre-socio").textContent = socioTopCacheado.nombre;

      // Formateo de números para que se vean científicos pero legibles
      document.getElementById("res-densidad").textContent = resultados.densidad.toFixed(2);
      document.getElementById("res-gradiente").textContent = resultados.gradiente.magnitud.toFixed(2);
      document.getElementById("res-promedio").textContent = `$ ${resultados.promedio.toFixed(2)}`;

      // 3. Mostrar Modal
      modal.classList.remove("hidden");
    }
  });

  // Cerrar Modal
  btnCerrarModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Cerrar si clic afuera
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
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