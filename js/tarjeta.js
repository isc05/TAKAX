// Para generar una tarjeta de centro de reciclaje {reglas de llenado}
const MAPEO_ICONOS = {
    "cartón": "../res/icon/cardboard.png",
    "papel": "../res/icon/paper.png",
    "aluminio": "../res/icon/aluminum.png",
    "plástico": "../res/icon/plastic.png",
    "vidrio": "../res/icon/glass.png",
    "metales": "../res/icon/iron.png",
    "baterías": "../res/icon/battery.png",
    // ...añade materiales aquí
};

export function crearTarjeta(centro) {
    const template = document.getElementById("tarjeta-template");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".nombre").textContent = centro.nombre;
    clone.querySelector(".tipo").textContent = centro.tipo;
    if (centro && centro.direccion) {
        clone.querySelector(".direccion").textContent = centro.direccion.ciudad + ", " +
            centro.direccion.estado + ", " +
            centro.direccion.colonia + ", " +
            centro.direccion.calle + ", " +
            "No. " + centro.direccion.numero + ", " +
            "CP: " + centro.direccion.codigoPostal;
    } else {
        // Handle cases where centro.direccion is undefined or null
        // For example, set an empty string or a default message
        clone.querySelector(".direccion").textContent = "Dirección no disponible";
    }
    
    const iconosContainer = clone.querySelector(".materiales-iconos-container");
    // clone.querySelector(".materiales").textContent = centro.materiales.join(", ");
    centro.materiales.forEach(nombreMaterial => {
        const urlIcono = MAPEO_ICONOS[nombreMaterial.toLowerCase()]; // .toLowerCase() por si acaso
        // Si encontramos un icono para ese material
        if (urlIcono) {
            const img = document.createElement("img");
            img.src = urlIcono;
            img.alt = nombreMaterial; // Texto alternativo (importante)
            img.title = nombreMaterial; // Texto al pasar el mouse (útil)
            img.classList.add("material-icono"); // Añade una clase para estilos
            
            iconosContainer.appendChild(img);
        }else{
            const img = document.createElement("img");
            img.src = "../res/icon/bin.png";
            img.alt = nombreMaterial; // Texto alternativo (importante)
            img.title = nombreMaterial; // Texto al pasar el mouse (útil)
            img.classList.add("material-icono"); // Añade una clase para estilos
            iconosContainer.appendChild(img);
        }
    });
    clone.querySelector(".precio").textContent = `$${centro.precioMin} - $${centro.precioMax} MXN`;
    clone.querySelector(".rating").textContent = centro.rating;

    if (centro.recomendado) {
        const recomendado = clone.querySelector(".recomendado");
        recomendado.textContent = "Recomendado";
        recomendado.classList.add("recomendado");
    }
    if (!centro.recomendado) {
        const recomendado = clone.querySelector("#recomendado");
        recomendado.classList.add("invisible");
    }

    const estado = clone.querySelector(".estado");
    const txtestado = clone.querySelector(".txtestado");
    switch (centro.modo) {
        case "Disponible":
            txtestado.textContent = "Disponible";
            estado.classList.add("disponible");
            break;
        case "Ocupado":
            txtestado.textContent = "Ocupado";
            estado.classList.add("ocupado");
            break;
        case "Ausente":
            txtestado.textContent = "Ausente";
            estado.classList.add("ausente");
            break;
    }

    return clone;
}
