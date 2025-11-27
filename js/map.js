let map = null;      // Variable global para guardar la instancia del mapa
let marker = null;   // Variable para el marcador actual

/**
 * Inicializa o actualiza el mapa con nuevas coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {string} textoPopup - Texto a mostrar al hacer clic
 */
export function cargarMapa(lat, lng, textoPopup) {
    // 1. Si el mapa NO existe, lo creamos
    if (map === null) {
        // 'map' es el ID de tu div en el HTML
        map = L.map('map').setView([lat, lng], 15); 

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        // 2. Si YA existe, solo movemos la cámara (ahorra recursos)
        map.setView([lat, lng], 15);
        
        // Invalidamos tamaño para corregir errores visuales si el div estaba oculto
        setTimeout(() => { map.invalidateSize(); }, 100); 
    }

    // 3. Manejo del Marcador (Pin)
    // Si ya había un marcador antes, lo quitamos para no llenar el mapa de pines
    if (marker) {
        map.removeLayer(marker);
    }

    // Ponemos el nuevo marcador
    marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(textoPopup)
        //.openPopup();
}
export function redimensionarMapa() {
    if (map) {
        // invalidateSize() comprueba el tamaño real del div contenedor
        // y ajusta el mapa a esas dimensiones.
        map.invalidateSize();
    }
}