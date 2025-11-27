// 1. INICIALIZACIÓN DEL MAPA
var mapa = L.map("contenedor-del-mapa").setView([18.9944608, -98.3533394], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?", {}).addTo(mapa);

// 2. DEFINICIÓN DE ICONOS
    var greenIcon = L.icon({
        iconUrl: 'img/recycling-point.png',
        iconSize: [35, 45],     // Tamaño del icono
        iconAnchor: [17, 42],   // Punto del icono que corresponde a la ubicación (centrado horizontalmente, abajo)
        popupAnchor: [0, -40]   // Punto desde donde se abre el popup
    });
// Código nuevo (funciones matemáticas) =====> INICIO
// Variables para guardar los datos
let centrosData = [];
// 1. ESCUCHAR EL MENSAJE DEL PADRE (main_empresa.js)
window.addEventListener("message", (event) => {
    if (event.data.tipo === "DATOS_MATEMATICOS") {
        centrosData = event.data.datos;
        console.log("Datos recibidos para cálculo:", centrosData);
        // Limpiamos capas anteriores si hubiera (opcional, por si se recarga)
        mapa.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
                mapa.removeLayer(layer);
            }
        });
        // Re-añadimos el tileLayer base que se borró arriba
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(mapa);

        // 1. VERIFICAR SI HAY DATOS
        if (centrosData.length > 0) {
            // 2. ENCONTRAR EL CENTRO CON MAYOR MONTO (Tu Socio de Oro)
            // Usamos .reduce para comparar uno contra otro y quedarnos con el mayor
            const centroTop = centrosData.reduce((max, centro) => {
                return (centro.monto > max.monto) ? centro : max;
            }, centrosData[0]); // Iniciamos asumiendo que el primero es el mayor

            console.log("Socio principal identificado:", centroTop.nombre);

            // 3. MOVER LA CÁMARA (Centrar el mapa)
            // Hacemos un 'flyTo' que es una animación suave en lugar de un salto brusco
            if (centroTop.lat && centroTop.lng) {
                mapa.flyTo([centroTop.lat, centroTop.lng], 15, {
                    duration: 1.5 // Duración de la animación en segundos
                });
                
                // Opcional: Mostrar un mensaje flotante temporal
                L.popup()
                    .setLatLng([centroTop.lat, centroTop.lng])
                    .setContent(`<b>📍 ${centroTop.nombre}</b><br>¡Es tu socio principal!<br>Total: $${centroTop.monto}`)
                    .openOn(mapa);
            }
            const sociosActivos = centrosData.filter(c => c.monto > 0);
            if (sociosActivos.length > 0) {
                const centroTop = sociosActivos.reduce((max, centro) => 
                    (centro.monto > max.monto) ? centro : max
                , sociosActivos[0]);

                mapa.flyTo([centroTop.lat, centroTop.lng], 15, { duration: 1.5 });
            }
            
        }
        // ¡Que comience el sufrimiento matemático! ☠️
        // Ejecutar dibujo visual
        dibujarMapaHibrido();
    }
});
// ==========================================
// FUNCIONES DE DIBUJO Y MATEMÁTICAS
// ==========================================

function dibujarMapaHibrido() {
    
    // 1. DIBUJAR MARCADORES E ICONOS (Para TODOS)
    centrosData.forEach(c => {
        // Texto del Popup condicional
        let mensaje = "";
        if (c.monto > 0) {
            mensaje = `<b>${c.nombre}</b><br>💰 Ventas totales: $${c.monto}`;
        } else {
            mensaje = `<b>${c.nombre}</b><br><i>Sin interacción comercial</i>`;
        }

        // Marcador bonito (el icono verde)
        L.marker([c.lat, c.lng], {icon: greenIcon})
         .addTo(mapa)
         .bindPopup(mensaje);

        // 2. DIBUJAR CÍRCULOS ROJOS (Solo para Socios Activos)
        // Representan la "masa" o densidad económica
        if (c.monto > 0) {
            L.circleMarker([c.lat, c.lng], {
                radius: Math.sqrt(c.monto) / 2, // Tamaño según dinero
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.3, // Un poco más transparente para que se vea el icono
                weight: 1 // Borde fino
            }).addTo(mapa);
        }
    });

    // 3. DIBUJAR EL CAMPO VECTORIAL (Flechas)
    dibujarGradiente();
}
// ==========================================
// 2. EL NÚCLEO MATEMÁTICO (Math Kernel)
// ==========================================

// Esta es la función f(x,y). 
// Devuelve la "Densidad de Dinero" en cualquier punto geográfico (lat, lng)
function funcionDensidad(lat, lng) {
    let densidad = 0;
    const sigma = 0.02; // "Ancho" de la campana (qué tan lejos influye un centro) aprox 2km de influencia

    // Sumatoria (Integral discreta) de influencias
    centrosData.forEach(centro => {
        // Distancia euclidiana simple (aprox. válida para distancias cortas)
        const dx = lat - centro.lat;
        const dy = lng - centro.lng;
        const distanciaCuadrada = dx * dx + dy * dy;

        // Fórmula Gaussiana: Masa * e^(-distancia / ancho)
        // Mientras más cerca, más alto el valor. Mientras más dinero (monto), más alto.
        densidad += centro.monto * Math.exp(-distanciaCuadrada / (2 * sigma * sigma));
    });
    return densidad;
}

// Calcula el Gradiente (Vector) en un punto
// El gradiente es la derivada parcial respecto a Lat y respecto a Lng
function calcularGradiente(lat, lng) {
    const h = 0.0001; // Un paso infinitesimal (muy pequeño)

    // Derivada parcial respecto a x (latitud)
    // f'(x) ≈ (f(x+h) - f(x)) / h
    const valActual = funcionDensidad(lat, lng);
    const dLat = (funcionDensidad(lat + h, lng) - valActual) / h;
    const dLng = (funcionDensidad(lat, lng + h) - valActual) / h;

    return { x: dLat, y: dLng }; // Este es tu vector gradiente <P, Q>
}
function dibujarGradiente() {
    const bounds = mapa.getBounds();
    
    // AJUSTE 1: Hacemos la rejilla un poquito más fina para que se vea más "lleno"
    // Antes era 0.002, ahora 0.0015
    const paso = 0.008; // Aprox 80m entre flechas

    for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += paso) {
        for (let lng = bounds.getWest(); lng < bounds.getEast(); lng += paso) {
            
            const densidad = funcionDensidad(lat, lng);
            
            // AJUSTE 2: Bajamos el umbral drásticamente
            // Ahora permitimos dibujar aunque la influencia sea mínima (0.1)
            if (densidad > 0.1) { 
                const gradiente = calcularGradiente(lat, lng);
                const magnitud = Math.sqrt(gradiente.x**2 + gradiente.y**2);
                
                // Si el vector tiene un tamaño decente
                if (magnitud > 0.0001) {
                    // Factor de escala visual para la longitud de la flecha
                    const factorEscala = 0.001;
                    // Calculamos dónde termina la flecha
                    // Normalizamos (dividimos por magnitud) para que todas las flechas
                    // tengan un tamaño similar y se vea ordenado
                    const endLat = lat + (gradiente.x / magnitud) * factorEscala;
                    const endLng = lng + (gradiente.y / magnitud) * factorEscala;
                    // 1. DIBUJAR LA LÍNEA (El cuerpo de la flecha)
                    L.polyline([[lat, lng], [endLat, endLng]], {
                        color: '#007bff', // Un azul más brillante
                        weight: 1.5,
                        opacity: 0.6
                    }).addTo(mapa);

                    // 2. DIBUJAR LA BOLITA (La punta de la flecha)
                    L.circleMarker([endLat, endLng], {
                        radius: 2, // Pequeñito
                        color: '#007bff',
                        fillColor: '#007bff',
                        fillOpacity: 1,
                        stroke: false // Sin borde para que se vea sólido
                    }).addTo(mapa);
                }
            }
        }
    }
}
// ==========================================
// 3. LA VISUALIZACIÓN (Mapa de Leaflet)
// ==========================================



// 3. DATOS DE LOS CENTROS DE RECICLAJE (Array de objetos)
// Así es más fácil agregar o quitar recicladoras sin repetir código
// var centrosReciclaje = [
//     { loc: [18.9215118, -98.4226005], title: "recicladora01" },
//     { loc: [19.0435240, -98.0893745], title: "recicladora02" },
//     { loc: [19.05775009, -98.10592792], title: "recicladora03" },
//     { loc: [18.95445136, -98.17272058], title: "recicladora05" },
//     { loc: [19.06616998, -98.10111115], title: "recicladora06" },
//     { loc: [18.90821399, -98.43324111], title: "recicladora07" },
//     { loc: [19.1094228, -98.26489888], title: "recicladora08" },
//     { loc: [19.0624149, -98.29406411], title: "recicladora09" },
//     { loc: [19.0863969, -98.1596107], title: "recicladora10" },
//     { loc: [19.0829467, -98.1601668], title: "recicladora11" },
//     { loc: [19.0934018, -98.2124851], title: "recicladora12" },
//     { loc: [19.0959855, -98.34271], title: "recicladora13" },
//     { loc: [19.0502279, -98.1902301], title: "recicladora14" },
//     { loc: [19.0573995, -98.209455], title: "recicladora15" },
//     { loc: [18.47377784, -97.38908135], title: "recicladora16" },
//     { loc: [18.62075929, -98.47077340], title: "recicladora17" },
//     { loc: [18.44432672, -97.40312033], title: "recicladora18" },
//     { loc: [18.45959355, -97.41912409], title: "recicladora19" },
//     { loc: [19.05660787, -98.21479728], title: "recicladora20" },
//     { loc: [19.08435991, -98.19323350], title: "recicladora21" },
//     { loc: [19.25781928, -98.40749821], title: "recicladora22" },
//     { loc: [18.98234669, -98.36786200], title: "recicladora23" },
//     { loc: [19.09457139, -98.15701069], title: "recicladora24" }
// ];

// // 4. CREACIÓN DE GRUPO Y GENERACIÓN AUTOMÁTICA DE MARCADORES
// var markersLayer = new L.LayerGroup(); // Grupo para el buscador

// centrosReciclaje.forEach(function (punto) {
//     var marker = L.marker(punto.loc, {
//         icon: greenIcon,   // Usamos tu icono verde
//         title: punto.title // Título para que el buscador lo encuentre
//     });

//     marker.bindPopup("<b>" + punto.title + "</b>"); // Popup con negrita
//     markersLayer.addLayer(marker); // Añadimos al grupo
// });

// mapa.addLayer(markersLayer); // Añadimos el grupo al mapa

// // 6. CONTROL DE LEYENDA (Legend)
// var legend = L.control({ position: 'bottomright' }); // Posición: Abajo a la derecha

// legend.onAdd = function (map) {
//     var div = L.DomUtil.create('div', 'legend');

//     // CORREGIDO: src="recycling-point.png" (sin carpetas)
//     div.innerHTML += '<img src="img/recycling-point.png" alt="Icono"> Centros de Reciclaje';

//     return div;
// };

// legend.addTo(mapa);

// // 5. CONTROL DE BÚSQUEDA (Search Bar)
// var controlSearch = new L.Control.Search({
//     position: 'topright',
//     layer: markersLayer,
//     initial: false,
//     zoom: 16,
//     marker: false
// });

// mapa.addControl(controlSearch);

// // 7. EVENTOS DEL MAPA
// function clicSobreMapa(evento) {
//     console.log("Coordenadas click: " + evento.latlng);
//     // alert("Acabas de dar click en: " + evento.latlng); 
// }

// mapa.on("click", clicSobreMapa);