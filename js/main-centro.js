import { Auth } from './auth.js';

// ¡LÍNEA MÁGICA DE SEGURIDAD!
Auth.protegerPagina();

//CANDADO RE-ASEGURADO
// Si llegué aquí es que tengo sesión iniciada, así que marco el territorio de nuevo
const usuario = Auth.obtenerUsuarioActual();
if(usuario){
  Auth.bloquearUsuario(usuario.email);
}

function mostrarUI(){
  const UI = document.querySelector(".ui-profile");
  UI.classList.toggle("hidden");
}
async function cargarSocios() {
  console.log(localStorage);
    const container = document.getElementById("socios-container");
    container.innerHTML = "";
    const usuarioActual = Auth.obtenerUsuarioActual();
    console.log("Centro logueado:", usuarioActual);
    if (!usuarioActual || !usuarioActual.rfc) {
        container.innerHTML = "<li>Error: No se identificó el RFC del centro.</li>";
        return;
    }
    // Normalizamos el RFC del centro a Mayúsculas para evitar errores
    const miRFC = usuarioActual.rfc.toUpperCase();
    try {
        const res = await fetch("../json/empresa.json");
        const todasLasEmpresas = await res.json();
        
        // Debug: Ver qué hay en localStorage
        console.log("Buscando chats para RFC:", miRFC);
        console.group("Analizando LocalStorage...");
        const chatKeys = Object.keys(localStorage).filter(key => {
          if(!key.startsWith("chat_history_")) return false;
          // Limpiamos la key del storage para comparar limpiamente
            const keyMayuscula = key.toUpperCase();
            
            // Verificamos si contiene mi RFC
            const coincide = keyMayuscula.includes(miRFC);
            
            // LOG DE AUDITORÍA: Muestra qué revisó y si pasó
            console.log(`Revisando key: "${key}" | ¿Contiene ${miRFC}? : ${coincide ? "✅ SÍ" : "❌ NO"}`);
            
            return coincide;
        });
        console.groupEnd();
        console.log("Chats encontrados:", chatKeys.length);
        if (chatKeys.length === 0) {
            container.innerHTML = "<li style='text-align:center; padding: 20px;'>Aún no tienes socios comerciales activos.</li>";
            return;
        }
        chatKeys.forEach((key, index) => {
            // La key es algo como: "chat_history_RFCEMPRESA_RFCCENTRO"
            // Quitamos el prefijo y separamos los RFCs
            const rawID = key.replace("chat_history_", "");
            const partesID = rawID.split("_");
            // Encontramos el RFC que NO es el mío (ese es el socio)
            const rfcSocio = partesID.find(rfc => rfc.toUpperCase() !== miRFC);

            if (rfcSocio) {
                // 4. Busamos los detalles de ese RFC en el JSON de empresas
                const datosEmpresa = todasLasEmpresas.find(e => e.rfc.trim().toUpperCase() === rfcSocio.trim().toUpperCase());
                // Si encontramos datos (o usamos valores por defecto si no está en el JSON)
                const nombreMostrar = datosEmpresa ? (datosEmpresa.name) : `Empresa (${rfcSocio})`;
                const tipoMostrar = datosEmpresa ? (datosEmpresa.tipo || "Empresa") : "Desconocido";
                // --- GENERACIÓN DEL HTML (Igual que antes) ---
                const li = document.createElement("li");
                
                const strong = document.createElement("strong");
                strong.textContent = `${index + 1}. ${nombreMostrar} (${tipoMostrar})`;
                
                const btn = document.createElement("button");
                btn.textContent = "Chat";
                btn.className = "btn font-size-small padding-small radius-standard-small";
                
                btn.addEventListener("click", () => {
                     const url = `chat.html?rfc=${encodeURIComponent(rfcSocio)}&name=${encodeURIComponent(nombreMostrar)}`;
                     window.location.href = url;
                });
                li.appendChild(strong);
                li.appendChild(btn);
                container.appendChild(li);
            }
        });
    } catch (error) {
        console.error("Error cargando socios:", error);
    }
}
document.addEventListener("DOMContentLoaded", () => {
  
  const userNameText = document.getElementById("user-name-text");
  const userRoleText = document.getElementById("user-role-text");
  const userName = document.querySelectorAll(".account-name");
  const userEmail = document.querySelectorAll(".account-email");
  // Datos en la sección de "Tu Centro"
  const userPlan = document.querySelectorAll(".account-plan");
  const userRate = document.querySelectorAll(".account-rate");
  const userRfc = document.querySelectorAll(".account-rfc");
  const userLocation = document.querySelectorAll(".account-location");
  // Datos en la seccion de "Tu Tarjeta en TAKAX"
  const userPhone = document.querySelectorAll(".account-phone");

  if (usuario) {
    if (userRoleText) userRoleText.innerText = `${usuario.clase}`;
    if (userNameText) userNameText.innerText = `Bienvenido: ${usuario.name}`;
    if (userName) userName.forEach(n => {
      n.innerText = `${usuario.name}`;
    });
    if (userEmail) userEmail.forEach(e => {
      e.innerText = `${usuario.email}`;
    });
    if (userPlan) userPlan.forEach(p => {
      p.innerText = usuario.premium ? "Premium" : "Gratuito";
    });
    if (userRate) userRate.forEach(r => {
      r.innerText = (typeof usuario.rating === "number") ? usuario.rating.toFixed(1) : "-";
    });
    if (userRfc) userRfc.forEach(ur => {
      ur.innerText = usuario.rfc || "-";
    });
    if (userLocation) userLocation.forEach(l => {
      l.innerText = `📍${usuario.direccion.calle}, No. ${usuario.direccion.numero}, ${usuario.direccion.colonia}, CP. ${usuario.direccion.codigoPostal}, ${usuario.direccion.ciudad}, ${usuario.direccion.estado}, ${usuario.direccion.pais}.` || "- Sin dirección";
    });
    if (userPhone) userPhone.forEach(up => {
      up.innerText = usuario.telefono || usuario.phone || "-";
    });
  }
cargarSocios();
  const userImg = document.getElementById("profile-img");
  const userType = document.getElementById("enterprise-profile");
  if (userImg) userImg.addEventListener("click", mostrarUI);
  if (userType) userType.addEventListener("click", mostrarUI);
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) logoutBtn.addEventListener("click", () => Auth.cerrarSesion());

  console.log(usuario);
});