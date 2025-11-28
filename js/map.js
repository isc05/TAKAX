// ==========================================
// VARIABLES GLOBALES DEL MÓDULO
// ==========================================
let mapaDetalle = null;    // El mapa pequeño del modal "Contactar"
let mapaAnalitico = null;  // El mapa grande del dashboard principal
let markerDetalle = null;  // Pin del mapa pequeño

// Icono verde reutilizable
const greenIcon = L.icon({
    iconUrl: '../res/icon/recycling-point.png', // Ajusta ruta si es necesario
    iconSize: [35, 45],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40]
});

// ==========================================
// 1. LÓGICA DEL MAPA DE DETALLE (El pequeño)
// ==========================================

export function cargarMapa(lat, lng, textoPopup) {
    // Si no existe, lo creamos
    if (mapaDetalle === null) {
        mapaDetalle = L.map('map').setView([lat, lng], 15); 
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapaDetalle);
    } else {
        // Si existe, lo movemos
        mapaDetalle.setView([lat, lng], 15);
    }

    // Manejo del marcador
    if (markerDetalle) mapaDetalle.removeLayer(markerDetalle);
    
    markerDetalle = L.marker([lat, lng], {icon: greenIcon})
        .addTo(mapaDetalle)
        .bindPopup(textoPopup)

    // Fix visual para cuando el div estaba oculto
    setTimeout(() => { mapaDetalle.invalidateSize(); }, 200);
}

export function redimensionarMapa() {
    if (mapaDetalle) mapaDetalle.invalidateSize();
    if (mapaAnalitico) mapaAnalitico.invalidateSize();
}

// ==========================================
// 2. LÓGICA DEL MAPA ANALÍTICO (El grande)
// ==========================================

export function inicializarMapaAnalitico(centrosData) {
    const containerId = 'map-analitico';
    
    // Verificamos que el div exista en el HTML antes de intentar dibujar
    if (!document.getElementById(containerId)) return;

    // A. Inicialización (Singleton)
    if (mapaAnalitico === null) {
        mapaAnalitico = L.map(containerId).setView([18.9065, -98.4289], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapaAnalitico);
    } else {
        // Limpiamos capas viejas para redibujar
        mapaAnalitico.eachLayer((layer) => {
            // Borramos todo MENOS el mapa base (tileLayer)
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
                mapaAnalitico.removeLayer(layer);
            }
        });
    }

    // B. Enfoque de Cámara (FlyTo)
    if (centrosData.length > 0) {
        const sociosActivos = centrosData.filter(c => c.monto > 0);
        let socioPrincipal = null;

        if (sociosActivos.length > 0) {
            socioPrincipal = sociosActivos.reduce((max, c) => (c.monto > max.monto) ? c : max, sociosActivos[0]);
            
            // Animación suave hacia el ganador
            mapaAnalitico.flyTo([socioPrincipal.lat, socioPrincipal.lng], 14, { duration: 1.5 });
            L.popup()
                    .setLatLng([socioPrincipal.lat, socioPrincipal.lng])
                    .setContent(`<b>📍 ${socioPrincipal.nombre}</b><br>¡Es tu socio principal!<br>Total: $${socioPrincipal.monto}`)
                    .openOn(mapaAnalitico);
        }

        // C. Ejecutar Dibujo Híbrido
        dibujarCapasAnaliticas(centrosData, socioPrincipal);
    }
}

// ==========================================
// 3. MOTOR MATEMÁTICO Y DE DIBUJO
// ==========================================

function dibujarCapasAnaliticas(data, centroFoco) {
    // 1. Dibujar Marcadores (Puntos físicos)
    data.forEach(c => {
        let msg = c.monto > 0 ? 
            `<b>${c.nombre}</b><br>💰 Ventas: $${c.monto}` : 
            `<b>${c.nombre}</b><br><i>Sin interacción</i>`;

        L.marker([c.lat, c.lng], {icon: greenIcon}).addTo(mapaAnalitico).bindPopup(msg);

        // Halo rojo de "Masa Económica"
        if (c.monto > 0) {
            L.circleMarker([c.lat, c.lng], {
                radius: Math.sqrt(c.monto) / 2,
                color: 'red', fillColor: '#f03', fillOpacity: 0.3, weight: 1
            }).addTo(mapaAnalitico);
        }
    });

    // 2. Dibujar Vectores (Solo si hay un foco de atención)
    if (centroFoco) {
        dibujarGradiente(data, centroFoco);
    }
}

// --- Funciones Matemáticas Puras ---

function funcionDensidad(lat, lng, data) {
    let densidad = 0;
    const sigma = 0.02; // Alcance de influencia (~2km)

    data.forEach(centro => {
        const dx = lat - centro.lat;
        const dy = lng - centro.lng;
        const distCuad = dx*dx + dy*dy;
        // Fórmula Gaussiana
        densidad += centro.monto * Math.exp( -distCuad / (2 * sigma * sigma) );
    });
    return densidad;
}

function calcularGradiente(lat, lng, data) {
    const h = 0.0001; // Diferencial
    const val = funcionDensidad(lat, lng, data);
    const dLat = (funcionDensidad(lat + h, lng, data) - val) / h;
    const dLng = (funcionDensidad(lat, lng + h, data) - val) / h;
    return { x: dLat, y: dLng };
}

function dibujarGradiente(data, foco) {
    const radioVisual = 0.027; // Radio del "Aura"
    const paso = 0.0015;      // Densidad de flechas

    const minLat = foco.lat - radioVisual;
    const maxLat = foco.lat + radioVisual;
    const minLng = foco.lng - radioVisual;
    const maxLng = foco.lng + radioVisual;

    for (let lat = minLat; lat < maxLat; lat += paso) {
        for (let lng = minLng; lng < maxLng; lng += paso) {
            
            // Filtro Circular (Máscara)
            const dLat = lat - foco.lat;
            const dLng = lng - foco.lng;
            if (Math.sqrt(dLat*dLat + dLng*dLng) > radioVisual) continue;

            const densidad = funcionDensidad(lat, lng, data);
            
            // Umbral de dibujo
            if (densidad > 0.1) { 
                const grad = calcularGradiente(lat, lng, data);
                const mag = Math.sqrt(grad.x**2 + grad.y**2);
                
                if (mag > 0.0001) {
                    const factor = 0.001;
                    const endLat = lat + (grad.x / mag) * factor;
                    const endLng = lng + (grad.y / mag) * factor;

                    // Cuerpo de flecha
                    L.polyline([[lat, lng], [endLat, endLng]], {
                        color: '#007bff', weight: 1.5, opacity: 0.6
                    }).addTo(mapaAnalitico);

                    // Punta de flecha
                    L.circleMarker([endLat, endLng], {
                        radius: 2, color: '#007bff', fillColor: '#007bff', 
                        fillOpacity: 1, stroke: false
                    }).addTo(mapaAnalitico);
                }
            }
        }
    }
}
/**
 * Mueve la cámara suavemente hacia una ubicación específica.
 * Útil para conectar tablas o listas externas con el mapa.
 */
export function enfocarCoordenadas(lat, lng) {
    if (mapaAnalitico) {
        // Usamos flyTo para una animación cinematográfica
        // Zoom 16 es lo suficientemente cerca para ver la calle
        mapaAnalitico.flyTo([lat, lng], 16, { 
            duration: 1.5,
            easeLinearity: 0.25
        });
        // Abrir un popup temporal
        L.popup()
            .setLatLng([lat, lng])
            .setContent(`📍 Ubicación seleccionada`)
            .openOn(mapaAnalitico);
        setTimeout(() => { mapaAnalitico.closePopup(); }, 1600);
    } else {
        console.warn("El mapa analítico aún no está inicializado.");
    }
}