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
/**
 * Realiza los cálculos de cálculo vectorial.
 * 1. Densidad en el punto (Socio Top).
 * 2. Gradiente en el punto.
 * 3. Valor promedio en la región (Integral Doble).
 */
// ==========================================
// MOTOR DE ÁLGEBRA LINEAL (Regresión Múltiple)
// ==========================================
// Resuelve Ax = b usando Eliminación Gaussiana
function resolverSistemaLineal(A, b) {
    const n = A.length;
    // Combinar A y b en una matriz aumentada
    const M = A.map((row, i) => [...row, b[i]]);

    for (let i = 0; i < n; i++) {
        // Pivotaje
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
        }
        [M[i], M[maxRow]] = [M[maxRow], M[i]];

        // Hacer ceros abajo
        for (let k = i + 1; k < n; k++) {
            const factor = M[k][i] / M[i][i];
            for (let j = i; j <= n; j++) {
                M[k][j] -= factor * M[i][j];
            }
        }
    }

    // Sustitución hacia atrás
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += M[i][j] * x[j];
        }
        x[i] = (M[i][n] - sum) / M[i][i];
    }
    return x;
}
export function calcularMetricasRegion(datos, centroFoco) {
    if (!centroFoco || !datos.length) return null;

    const RADIO_REGION_KM = 2.7;
    
    // Factores de conversión (Aprox para Puebla/Atlixco)
    const factorLatKm = 110.57; 
    const factorLngKm = 111.32 * Math.cos(centroFoco.lat * (Math.PI / 180));

    // --- PASO 0: FILTRADO DE DATOS (CRÍTICO) ---
    // Solo aceptamos centros que:
    // 1. Tengan ventas reales (monto > 0)
    // 2. Estén dentro del radio de análisis (Cercanía)
    
    const datosFiltrados = datos.filter(c => {
        // Filtro Económico
        if (c.monto <= 0) return false;

        // Filtro Espacial (Distancia)
        const dx = (c.lng - centroFoco.lng) * factorLngKm;
        const dy = (c.lat - centroFoco.lat) * factorLatKm;
        const distanciaKm = Math.sqrt(dx*dx + dy*dy);

        return distanciaKm <= RADIO_REGION_KM;
    });

    console.log(`Puntos válidos para regresión: ${datosFiltrados.length}`);

    if (datosFiltrados.length < 3) {
        console.warn("⚠️ Muy pocos puntos para una regresión polinómica fiable.");
        // Retornamos valores seguros para no romper la UI
        return { densidad: centroFoco.monto, gradiente: {x:0, y:0, magnitud:0}, promedio: centroFoco.monto, radio: RADIO_REGION_KM };
    }

    // --- 1. TRANSFORMACIÓN (Usando SOLO datosFiltrados) ---
    const puntos = datosFiltrados.map(c => {
        return {
            nombre: c.nombre, 
            x: (c.lng - centroFoco.lng) * factorLngKm, 
            y: (c.lat - centroFoco.lat) * factorLatKm, 
            z: c.monto 
        };
    });

    // --- DEBUGGING ---
    console.group("🧪 Datos Filtrados para Regresión");
    console.table(puntos);
    console.groupEnd();

    // 2. CONSTRUIR MATRICES (Mínimos Cuadrados)
    const N_COEFFS = 6;
    const XtX = Array(N_COEFFS).fill(0).map(() => Array(N_COEFFS).fill(0));
    const XtY = Array(N_COEFFS).fill(0);

    puntos.forEach(p => {
        const row = [1, p.x, p.y, p.x*p.x, p.y*p.y, p.x*p.y];
        for (let i = 0; i < N_COEFFS; i++) {
            XtY[i] += row[i] * p.z;
            for (let j = 0; j < N_COEFFS; j++) {
                XtX[i][j] += row[i] * row[j];
            }
        }
    });

    // 3. RESOLVER SISTEMA
    const coeffs = resolverSistemaLineal(XtX, XtY); 
    const [A, B, C, D, E, F] = coeffs;

    console.log("📊 Coeficientes Finales:", { A, B, C, D, E, F });

    // 4. CÁLCULOS FINALES

    // A. Densidad y Gradiente
    const densidadCentro = A;
    const gradX = B;
    const gradY = C;
    const magnitudGradiente = Math.sqrt(gradX*gradX + gradY*gradY);

    // B. Promedio en región (CÁLCULO EXACTO: Volumen / Área Geométrica)
    // Definimos la región
    const R = RADIO_REGION_KM; // 2.7 km
    
    const PASO = 0.01; // Paso de integración (km)
    
    // Área de cada diferencial (dA = dx * dy)
    // Esto es cuánto mide la base de cada "columna" de la integral en km2
    const AREA_DIFERENCIAL = PASO * PASO; 

    let volumenTotal = 0; // Suma de (Altura * dA)

    for (let x = -R; x <= R; x += PASO) {
        for (let y = -R; y <= R; y += PASO) {
            
            // Si está dentro del círculo
            if ((x*x + y*y) <= (R*R)) {
                
                // Evaluamos el polinomio (Altura Z)
                let val = A + (B*x) + (C*y) + (D*x*x) + (E*y*y) + (F*x*y);

                // Restricción de Suelo (Economía no negativa)
                if (val < 0) val = 0; 

                // 2. SUMA DE RIEMANN (VOLUMEN)
                // En lugar de sumar solo 'val', sumamos el volumen de la columna
                // Volumen += Altura ($) * Base (km2)
                volumenTotal += val * AREA_DIFERENCIAL;
            }
        }
    }

    // 3. DIVISIÓN EXACTA
    const areaGeometrica = Math.PI * R * R; // ~22.9022 km2
    
    // Promedio = Volumen ($ * km2) / Area (km2) = $
    const promedioRegion = volumenTotal / areaGeometrica;

    console.log(`📊 Reporte Integral:
    - Radio: ${R} km
    - Área Base (Exacta): ${areaGeometrica.toFixed(4)} km²
    - Volumen Total (Integral): ${volumenTotal.toFixed(2)}
    - Promedio Final: ${promedioRegion.toFixed(2)}`);

    return {
        densidad: densidadCentro,
        gradiente: { x: gradX, y: gradY, magnitud: magnitudGradiente },
        promedio: promedioRegion,
        radio: R
    };
}