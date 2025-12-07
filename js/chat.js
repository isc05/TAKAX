import { Auth } from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
    Auth.protegerPagina();
    const currentUser = Auth.obtenerUsuarioActual();

    // Obtener parámetros URL
    const urlParams = new URLSearchParams(window.location.search);
    const partnerRFC = urlParams.get('rfc');
    const partnerName = urlParams.get('name');

    if (!partnerRFC || !currentUser.rfc) {
        alert("Error de conexión.");
        window.history.back();
        return;
    }

    document.querySelector("#header-chat h1").textContent = `Chat con ${partnerName}`;

    // ID único del chat y Key de LocalStorage
    const chatID = [currentUser.rfc, partnerRFC].sort().join('_');
    const CHAT_STORAGE_KEY = `chat_history_${chatID}`;

    // Referencias al DOM
    const chatContainer = document.getElementById("chat");
    const messageInput = document.getElementById("mensaje");
    const sendButton = document.querySelector("#actions input[type='submit']");
    const clearButton = document.getElementById("clear-chat-btn");
    
    // Referencias Deal Mode
    const dealCheckbox = document.getElementById("deal-mode");
    const priceZone = document.getElementById("price-zone");
    const priceInput = document.getElementById("price");

    // Inicializar chat vacío si no existe
    if (!localStorage.getItem(CHAT_STORAGE_KEY)) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([]));
    }

    // --- 1. INTERFAZ DEAL MODE (Mostrar/Ocultar Input) ---
    dealCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            priceZone.classList.remove("invisible");
            priceInput.focus();
        } else {
            priceZone.classList.add("invisible");
            priceInput.value = ""; // Limpiar si se desmarca
        }
    });

    // --- 2. RENDERIZADO DE MENSAJES ---
    function renderMessage(msg) {
        const template = document.getElementById("mensaje-template");
        const clone = template.content.cloneNode(true);
        
        const msgArea = clone.querySelector(".mensaje-area");
        const msgChat = clone.querySelector(".mensaje-chat");
        const userNameSpan = clone.querySelector(".nombre-usuario");
        const contentSpan = clone.querySelector(".contenido-mensaje");
        
        // Elementos del Deal Mode
        const dealContainer = clone.querySelector(".deal-mode-details-msg");
        const priceLabel = clone.querySelector(".price-of-deal");
        const statusLabel = clone.querySelector(".deal-status-label");
        const actionsReceiver = clone.querySelector(".deal-actions-receiver");
        const actionsSender = clone.querySelector(".deal-actions-sender");
        
        // Botones específicos
        const btnAceptar = clone.querySelector(".aceptar-deal");
        const btnRechazar = clone.querySelector(".rechazar-deal");
        const btnCancelar = clone.querySelector(".cancelar-deal");

        userNameSpan.textContent = msg.senderName;
        contentSpan.textContent = msg.text;

        // Estilos básicos (Enviado / Recibido)
        const soyElRemitente = msg.senderRFC === currentUser.rfc;

        if (soyElRemitente) {
            msgChat.classList.add("enviado");
            userNameSpan.classList.add("right");
            msgChat.classList.add("left");
        } else {
            msgChat.classList.add("recibido");
            userNameSpan.classList.add("left");
            msgChat.classList.add("left");
        }

        // --- LÓGICA DEAL MODE ---
        if (msg.isDeal) {
            // 1. Mostrar contenedor y estilos base
            dealContainer.classList.remove("hidden");
            msgChat.classList.add("deal-mode"); // Clase CSS para borde/color especial
            
            // Formato de moneda
            const precioFormato = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(msg.price);
            priceLabel.textContent = precioFormato;

            // 2. Manejar Estados (Pendiente, Aceptado, Rechazado, Cancelado)
            
            if (msg.dealStatus === 'canceled') {
                // Estado: CANCELADO
                priceLabel.textContent = "TRATO CANCELADO";
                msgChat.classList.add("canceled");
                // No mostramos botones
            
            } else if (msg.dealStatus === 'accepted') {
                // Estado: ACEPTADO
                statusLabel.textContent = "✅ ¡TRATO CERRADO!";
                msgChat.classList.add("accepted");
                // No mostramos botones
            
            } else if (msg.dealStatus === 'rejected') {
                // Estado: RECHAZADO
                statusLabel.textContent = "❌ Trato Rechazado";
                msgChat.classList.add("rejected");
                // No mostramos botones

            } else {
                // Estado: PENDIENTE (pending)
                
                if (soyElRemitente) {
                    // Si yo lo envié, puedo CANCELAR
                    actionsSender.classList.remove("hidden");
                    
                    btnCancelar.addEventListener("click", () => {
                        actualizarEstadoTrato(msg.id, 'canceled');
                    });

                } else {
                    // Si yo lo recibí, puedo ACEPTAR o RECHAZAR
                    actionsReceiver.classList.remove("hidden");

                    btnAceptar.addEventListener("click", () => {
                        alert(`¡Has aceptado el trato por ${precioFormato}!`);
                        actualizarEstadoTrato(msg.id, 'accepted');
                        // Aquí podrías disparar lógica extra (ej. descontar inventario)
                    });

                    btnRechazar.addEventListener("click", () => {
                        actualizarEstadoTrato(msg.id, 'rejected');
                    });
                }
            }
        }

        chatContainer.appendChild(clone);
    }

    // --- 3. FUNCIÓN PARA ACTUALIZAR ESTADO ---
    function actualizarEstadoTrato(msgId, nuevoEstado) {
        const history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
        
        // Buscamos el mensaje por su ID único
        const mensajeIndex = history.findIndex(m => m.id === msgId);
        
        if (mensajeIndex !== -1) {
            history[mensajeIndex].dealStatus = nuevoEstado;
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));
            
            // Recargamos el chat para ver cambios
            loadChat(); 
        }
    }

    function loadChat() {
        chatContainer.innerHTML = '';
        const history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
        history.forEach(renderMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // --- 4. ENVÍO DE MENSAJES ---
    function sendMessage() {
        const text = messageInput.value.trim();
        const isDeal = dealCheckbox.checked;
        const price = parseFloat(priceInput.value);

        // Validaciones
        if (text === "" && !isDeal) return;
        if (isDeal && (isNaN(price) || price <= 0)) {
            return alert("Por favor, ingresa un precio válido para el trato.");
        }

        const newMessage = {
            id: Date.now(), // ID único basado en timestamp
            senderRFC: currentUser.rfc,
            senderName: currentUser.name,
            text: text,
            timestamp: new Date().toISOString(),
            // Propiedades Deal Mode
            isDeal: isDeal,
            price: isDeal ? price : null,
            dealStatus: isDeal ? 'pending' : null // pending, accepted, rejected, canceled
        };

        const history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
        history.push(newMessage);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));

        // Limpieza post-envío
        messageInput.value = '';
        if (isDeal) {
            dealCheckbox.checked = false; // Desmarcar
            priceInput.value = '';
            priceZone.classList.add("invisible"); // Ocultar input
        }

        renderMessage(newMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    sendButton.addEventListener("click", (e) => {
        e.preventDefault();
        sendMessage();
    });

    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    priceZone.addEventListener("keydown", (e)=>{
        if(e.key === "Enter"){
            //e.preventDefault();
            sendMessage();
        }
    });
    clearButton.addEventListener("click", () => {
        if(confirm("¿Borrar historial?")) {
            localStorage.removeItem(CHAT_STORAGE_KEY);
            loadChat();
        }
    });

    window.addEventListener('storage', (event) => {
        if (event.key === CHAT_STORAGE_KEY) {
            loadChat();
        }
    });

    loadChat();
});