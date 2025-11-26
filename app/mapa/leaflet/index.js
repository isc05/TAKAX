// var mapa = L.map("contenedor-del-mapa").setView([19.0247141,-98.2380999], 10.5)
// L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?, {}").addTo(mapa)


// var greenIcon = L.icon({
//     iconUrl: '../img/recycling-point.png',
//     iconSize:     [50, 60], // size of the icon
//     iconAnchor:   [18, 37], // point of the icon which will correspond to marker's location
//     popupAnchor:  [-3, -76], // point from which the popup should open relative to the iconAnchor
// });
// var ratIcon = L.icon({
//     iconUrl: '../img/robber.png',
//     iconSize:     [30, 30], // size of the icon
//     iconAnchor:   [18, 37], // point of the icon which will correspond to marker's location
//     popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
// });

// // var polygon = L.polygon([
// //     [18.9247678,-98.4521227],
// //     [18.919582,-98.4413716],
// //     [18.9144473,-98.4524976],
// // ]).addTo(mapa);
// // polygon.bindPopup("triangulo");

// var leafletIcon = L.icon ({
//     iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
//     shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
//     iconSize: [20,20],
//     iconAnchor: [22,30],
//     popupAnchor: [12,-90]
// })


// // var marker = L.marker([18.9132048,-98.4390207],{icon:leafletIcon}).addTo(mapa)

// var marcador = L.marker([18.9215118, -98.4226005],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora01");

// var marcadordos = L.marker([19.0435240,-98.0893745], {icon:greenIcon}).addTo(mapa)
// marcadordos.bindPopup("recicladora02"); 

// var demsa = L.marker([19.05775009,-98.10592792], {icon:greenIcon}).addTo(mapa)
// demsa.bindPopup("recicladora03"); 

// var marcador = L.marker([18.95445136,-98.17272058],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora05");

// var marcador = L.marker([19.06616998,-98.10111115],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora06");

// var marcador = L.marker([18.90821399,-98.43324111],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora07");

// var marcador = L.marker([19.1094228,-98.26489888],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora08");

// var marcador = L.marker([19.0624149,-98.29406411],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora09");

// var marcador = L.marker([19.0863969,-98.1596107],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora10");

// var marcador = L.marker([19.0829467,-98.1601668],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora11");

// var marcador = L.marker([19.0934018,-98.2124851],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora12");

// var marcador = L.marker([19.0959855,-98.34271],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora13");

// var marcador = L.marker([19.0502279,-98.1902301],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora14");

// var marcador = L.marker([19.0573995,-98.209455],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora15");

// var marcador = L.marker([18.47377784, -97.38908135],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora16");

// var marcador = L.marker([18.620759296418356, -98.47077340365726],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora17");

// var marcador = L.marker([18.444326728053703, -97.40312033914253],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora18");

// var marcador = L.marker([18.459593554632445, -97.41912409866917],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora19");

// var marcador = L.marker([19.056607876858497, -98.21479728963052],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora20");

// var marcador = L.marker([19.08435991280201, -98.19323350847397],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora21");

// var marcador = L.marker([19.257819282203418, -98.40749821112152],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora22");

// var marcador = L.marker([18.982346698700162, -98.36786200097295],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora23");

// var marcador = L.marker([19.094571396776313, -98.15701069126621],{icon:greenIcon}).addTo(mapa)
// marcador.bindPopup("recicladora24");


// // var circulo = L.circle([18.9096612,-98.4343474],{
// //     radius:50,
// //     color:"red",
// //     fillColor: '#f03',
// //     fillOpacity: .7
// // }).addTo(mapa)
// // circulo.bindPopup("zocalo de atlixco");


// // function clicSobreMapa(evneto){
// //     console.log("Este es un mensaje para la consola")
// //     alert("Acabas de dar click")
// // }

// /* === AGREGAR LEYENDA === */
// var legend = L.control({position: 'bottomright'}); // Ubicación: abajo a la derecha

// legend.onAdd = function (map) {
//     // Crea un div con la clase 'legend' que definimos en CSS
//     var div = L.DomUtil.create('div', 'legend');
    
//     // Define el contenido HTML de la leyenda
//     // Aquí ponemos la imagen pequeña y el texto descriptivo
//     div.innerHTML += '<img src="../img/recycling-point.png" alt="Icono"> Centros de Reciclaje';
    
//     return div;
// };

// legend.addTo(mapa);

// mapa.on("click", clicSobreMapa);

// 1. INICIALIZACIÓN DEL MAPA
var mapa = L.map("contenedor-del-mapa").setView([18.9944608, -98.3533394], 10.5);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?", {}).addTo(mapa);


// 2. DEFINICIÓN DE ICONOS
var greenIcon = L.icon({
    iconUrl: 'img/recycling-point.png',
    iconSize: [50, 60],     // Tamaño del icono
    iconAnchor: [25, 60],   // Punto del icono que corresponde a la ubicación (centrado horizontalmente, abajo)
    popupAnchor: [0, -60]   // Punto desde donde se abre el popup
});



// 3. DATOS DE LOS CENTROS DE RECICLAJE (Array de objetos)
// Así es más fácil agregar o quitar recicladoras sin repetir código
var centrosReciclaje = [
    { loc: [18.9215118, -98.4226005], title: "recicladora01" },
    { loc: [19.0435240, -98.0893745], title: "recicladora02" },
    { loc: [19.05775009, -98.10592792], title: "recicladora03" },
    { loc: [18.95445136, -98.17272058], title: "recicladora05" },
    { loc: [19.06616998, -98.10111115], title: "recicladora06" },
    { loc: [18.90821399, -98.43324111], title: "recicladora07" },
    { loc: [19.1094228, -98.26489888], title: "recicladora08" },
    { loc: [19.0624149, -98.29406411], title: "recicladora09" },
    { loc: [19.0863969, -98.1596107], title: "recicladora10" },
    { loc: [19.0829467, -98.1601668], title: "recicladora11" },
    { loc: [19.0934018, -98.2124851], title: "recicladora12" },
    { loc: [19.0959855, -98.34271], title: "recicladora13" },
    { loc: [19.0502279, -98.1902301], title: "recicladora14" },
    { loc: [19.0573995, -98.209455], title: "recicladora15" },
    { loc: [18.47377784, -97.38908135], title: "recicladora16" },
    { loc: [18.62075929, -98.47077340], title: "recicladora17" },
    { loc: [18.44432672, -97.40312033], title: "recicladora18" },
    { loc: [18.45959355, -97.41912409], title: "recicladora19" },
    { loc: [19.05660787, -98.21479728], title: "recicladora20" },
    { loc: [19.08435991, -98.19323350], title: "recicladora21" },
    { loc: [19.25781928, -98.40749821], title: "recicladora22" },
    { loc: [18.98234669, -98.36786200], title: "recicladora23" },
    { loc: [19.09457139, -98.15701069], title: "recicladora24" }
];


// 4. CREACIÓN DE GRUPO Y GENERACIÓN AUTOMÁTICA DE MARCADORES
var markersLayer = new L.LayerGroup(); // Grupo para el buscador

centrosReciclaje.forEach(function(punto) {
    var marker = L.marker(punto.loc, {
        icon: greenIcon,   // Usamos tu icono verde
        title: punto.title // Título para que el buscador lo encuentre
    });
    
    marker.bindPopup("<b>" + punto.title + "</b>"); // Popup con negrita
    markersLayer.addLayer(marker); // Añadimos al grupo
});

mapa.addLayer(markersLayer); // Añadimos el grupo al mapa

// 6. CONTROL DE LEYENDA (Legend)
var legend = L.control({position: 'bottomright'}); // Posición: Abajo a la derecha

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    
    // CORREGIDO: src="recycling-point.png" (sin carpetas)
    div.innerHTML += '<img src="img/recycling-point.png" alt="Icono"> Centros de Reciclaje';
    
    return div;
};

legend.addTo(mapa);

// 5. CONTROL DE BÚSQUEDA (Search Bar)
var controlSearch = new L.Control.Search({
    position: 'topright',
    layer: markersLayer,
    initial: false,
    zoom: 16,
    marker: false
});

mapa.addControl(controlSearch);



// 7. EVENTOS DEL MAPA
function clicSobreMapa(evento){
    console.log("Coordenadas click: " + evento.latlng);
    // alert("Acabas de dar click en: " + evento.latlng); 
}



mapa.on("click", clicSobreMapa);