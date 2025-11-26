import { Auth } from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Seguridad: Verificar Login
    Auth.protegerPagina();
    const currentUser = Auth.obtenerUsuarioActual();

    // 2. Obtener datos del destinatario desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const partnerRFC = urlParams.get('rfc');
    const partnerName = urlParams.get('name');

    // 3. Seguridad: Si no hay RFC de destino, sacar al usuario
    if (!partnerRFC || !currentUser.rfc) {
        alert("Error de conexión: Identificador no válido.");
        window.history.back(); // Regresa a la página anterior
        return;
    }

    // Actualizar título del chat
    document.querySelector("#header-chat h1").textContent = `Chat con ${partnerName}`;

    // 4. Generar ID Único del Chat (Orden alfabético para consistencia)
    // Esto asegura que EMP1 chateando con CEN1 usen la misma "sala" que CEN1 con EMP1
    const chatID = [currentUser.rfc, partnerRFC].sort().join('_');
    const CHAT_STORAGE_KEY = `chat_history_${chatID}`;
    // --- NUEVO: INICIALIZACIÓN INMEDIATA ---
    // Si este chat nunca ha existido, creamos un array vacío en localStorage.
    // Esto sirve para "registrar" la conexión inmediatamente, 
    // permitiendo que aparezca en la lista de socios del otro usuario.

    if (!localStorage.getItem(CHAT_STORAGE_KEY)) {
         localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([]));
    }

    console.log(localStorage);
    const chatContainer = document.getElementById("chat");
    const messageInput = document.getElementById("mensaje");
    const sendButton = document.querySelector("#actions input[type='submit']");
    const clearButton = document.getElementById("clear-chat-btn");
    const backButton = document.getElementById("back");

    // --- FUNCIONES ---

    function renderMessage(msg) {
        const template = document.getElementById("mensaje-template");
        const clone = template.content.cloneNode(true);
        
        const msgArea = clone.querySelector(".mensaje-area");
        const msgChat = clone.querySelector(".mensaje-chat");
        const userNameSpan = clone.querySelector(".nombre-usuario");
        const contentSpan = clone.querySelector(".contenido-mensaje");
        const timeSpan = document.createElement("span"); // Opcional: para la hora
        
        userNameSpan.textContent = msg.senderName;
        contentSpan.textContent = msg.text;

        // Estilos: ¿Fui yo o fue el otro?
        // Comparamos el RFC del remitente con el RFC del usuario actual
        if (msg.senderRFC === currentUser.rfc) {
            msgChat.classList.add("enviado");
            userNameSpan.classList.add("right");
            msgArea.style.display = "flex";
            msgArea.style.flexDirection = "column";
            msgArea.style.alignItems = "flex-end";
        } else {
            msgChat.classList.add("recibido");
            userNameSpan.classList.add("left");
        }

        chatContainer.appendChild(clone);
    }

    function loadChat() {
        chatContainer.innerHTML = '';
        const history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
        history.forEach(renderMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === "") return;

        const newMessage = {
            senderRFC: currentUser.rfc, // Usamos RFC para identificar quien envía
            senderName: currentUser.name, // Nombre para mostrar
            text: text,
            timestamp: new Date().toISOString()
        };

        const history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
        history.push(newMessage);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));

        renderMessage(newMessage);
        messageInput.value = '';
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // --- EVENTOS ---

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

    clearButton.addEventListener("click", () => {
        if(confirm("¿Borrar todo el historial de este chat?")) {
            localStorage.removeItem(CHAT_STORAGE_KEY);
            loadChat();
        }
    });

    // Botón de regresar
    backButton.addEventListener("click", () => {
        window.history.back();
    });

    // Escuchar mensajes de la otra pestaña/ventana en tiempo real
    window.addEventListener('storage', (event) => {
        if (event.key === CHAT_STORAGE_KEY) {
            loadChat();
        }
    });

    // Carga inicial
    loadChat();
});