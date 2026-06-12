// --- MISSION CONTROL INTERACTION SCRIPT ---

// 1. DATA MODEL FOR LAUNCH NODES
const SITES_DATA = [
    {
        name: "MÉXICO",
        desc: "Cozumel Spaceport",
        coords: "20.4230° N, 86.9223° W",
        altitude: "14m ASL",
        weather: "NOMINAL // CLEAR",
        signal: "98.4%",
        baro: "29.1°C / 1013 hPa",
        fuel: 92,
        radarPos: { x: 250, y: 250 }, // Center
        azimuth: "142.82°",
        elevation: "48.19°",
        sector: "MX-CZ-09"
    },
    {
        name: "BRASIL",
        desc: "Alcântara Launch Center",
        coords: "2.3837° S, 44.3969° W",
        altitude: "45m ASL",
        weather: "NOMINAL // STABLE",
        signal: "95.1%",
        baro: "31.4°C / 1009 hPa",
        fuel: 85,
        radarPos: { x: 330, y: 290 },
        azimuth: "118.44°",
        elevation: "59.21°",
        sector: "BR-AL-12"
    },
    {
        name: "ARGENTINA",
        desc: "Puerto Belgrano Base",
        coords: "38.8872° S, 62.1012° W",
        altitude: "3m ASL",
        weather: "STANDBY // GUSTS",
        signal: "91.8%",
        baro: "12.8°C / 1022 hPa",
        fuel: 64,
        radarPos: { x: 190, y: 390 },
        azimuth: "204.15°",
        elevation: "22.50°",
        sector: "AR-PB-03"
    },
    {
        name: "CHILE",
        desc: "Atacama Range",
        coords: "24.2690° S, 69.8500° W",
        altitude: "2,630m ASL",
        weather: "NOMINAL // OPTICAL GOOD",
        signal: "99.1%",
        baro: "18.5°C / 740 hPa",
        fuel: 78,
        radarPos: { x: 130, y: 310 },
        azimuth: "191.07°",
        elevation: "37.40°",
        sector: "CL-AT-07"
    },
    {
        name: "COLOMBIA",
        desc: "Guajira Launch Complex",
        coords: "12.2153° N, 71.7925° W",
        altitude: "5m ASL",
        weather: "WARNING // WIND VELOCITY EXCEEDED",
        signal: "74.2%",
        baro: "33.1°C / 1008 hPa",
        fuel: 40,
        radarPos: { x: 280, y: 140 },
        azimuth: "135.60°",
        elevation: "55.80°",
        sector: "CO-GJ-05"
    },
    {
        name: "PERÚ",
        desc: "Pampa Chachani Base",
        coords: "16.1950° S, 71.5900° W",
        altitude: "3,850m ASL",
        weather: "STANDBY // TEMPERATURE LOW",
        signal: "88.6%",
        baro: "4.2°C / 635 hPa",
        fuel: 55,
        radarPos: { x: 160, y: 220 },
        azimuth: "172.93°",
        elevation: "42.11°",
        sector: "PE-PC-06"
    }
];

let activeSiteIndex = 0;
let isCountdownRunning = false;

// 2. DOM ELEMENTS
const clockElement = document.getElementById("utc-clock");
const siteButtons = document.querySelectorAll(".site-btn");
const chatbotLogs = document.getElementById("chatbot-logs");
const chatInputForm = document.getElementById("chat-input-form");
const chatInput = document.getElementById("chat-input");

// Telemetry DOM nodes
const nodeCoords = document.getElementById("node-coords");
const nodeAltitude = document.getElementById("node-altitude");
const nodeWeather = document.getElementById("node-weather");
const nodeSignal = document.getElementById("node-signal");
const nodeBaro = document.getElementById("node-baro");
const nodeFuelBar = document.getElementById("node-fuel-bar");
const nodeFuelText = document.getElementById("node-fuel-text");

// Radar HUD DOM nodes
const visorSubtitle = document.getElementById("visor-subtitle");
const radarLat = document.getElementById("radar-lat");
const radarLng = document.getElementById("radar-lng");
const radarAzimuth = document.getElementById("radar-azimuth");
const radarElev = document.getElementById("radar-elev");
const radarTargetReticle = document.getElementById("radar-active-target");
const statVector = document.getElementById("stat-vector");
const statDrift = document.getElementById("stat-drift");
const tickerFeed = document.getElementById("ticker-feed");

// Footer HUD nodes
const footerLatency = document.getElementById("footer-latency");
const footerMem = document.getElementById("footer-mem");

// 3. UTC CLOCK CYCLE
function updateClock() {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
    clockElement.innerText = `UTC ${hours}:${minutes}:${seconds}:${ms}`;
}
setInterval(updateClock, 33); // Smooth sub-frame updates

function getFormattedTime() {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// 4. TELEMETRY & RADAR SELECTOR UPDATE
function selectLaunchSite(index) {
    activeSiteIndex = index;
    const site = SITES_DATA[index];
    
    // Toggle active buttons style
    siteButtons.forEach((btn, idx) => {
        if (idx === index) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Update Telemetry log labels
    nodeCoords.innerText = site.coords;
    nodeAltitude.innerText = site.altitude;
    nodeWeather.innerText = site.weather;
    nodeSignal.innerText = site.signal;
    nodeBaro.innerText = site.baro;
    nodeFuelBar.style.width = `${site.fuel}%`;
    nodeFuelText.innerText = `${site.fuel}%`;

    // Apply color class to weather node based on telemetry status
    nodeWeather.className = "dl-value";
    if (site.weather.includes("NOMINAL")) {
        nodeWeather.classList.add("text-green");
    } else if (site.weather.includes("STANDBY")) {
        nodeWeather.classList.add("text-cyan");
    } else {
        nodeWeather.classList.add("text-orange");
    }

    // Update Visor Radar Texts
    visorSubtitle.innerText = `SYS LOCK: ${site.name} SPACEPORT ${site.desc.split(" ")[0].toUpperCase()}`;
    const [latStr, lngStr] = site.coords.split(", ");
    radarLat.innerText = latStr;
    radarLng.innerText = lngStr;
    radarAzimuth.innerText = site.azimuth;
    radarElev.innerText = site.elevation;

    // Update center HUD stat panels
    if (site.weather.includes("WARNING")) {
        statVector.innerText = "DRIFT STB";
        statVector.className = "s-val text-orange";
        statDrift.innerText = "0.087° [HI]";
        statDrift.className = "s-val text-orange";
    } else {
        statVector.innerText = "LOCK OK";
        statVector.className = "s-val text-cyan";
        statDrift.innerText = "0.002° [NOM]";
        statDrift.className = "s-val text-green";
    }

    // Update SVG Target Location (Translate group coordinate)
    radarTargetReticle.setAttribute("transform", `translate(${site.radarPos.x}, ${site.radarPos.y})`);

    // Update Ticker
    tickerFeed.innerText = `LINKING REGIONAL NODE-${String(index+1).padStart(2, '0')} (${site.name})... DATASTREAM SYNCHRONIZED... COORDINATES LOCKED AT ${site.coords}... MONITORING ATMOSPHERIC DRIFT...`;

    // Notify Chatbot of site lock
    appendSystemMessage(`TARGET NODE ALIGNED: ${site.name} SPACEPORT.`);
}

// Bind clicks to buttons
siteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-site-index"));
        selectLaunchSite(index);
    });
});

// 5. CHATBOT TERMINAL UTILITIES
function appendSystemMessage(text) {
    const timeStr = getFormattedTime();
    const msg = document.createElement("div");
    msg.className = "chat-message system-msg";
    msg.innerHTML = `
        <span class="msg-timestamp">[${timeStr}]</span>
        <span class="msg-sender">SYSTEM:</span>
        <span class="msg-text">${text}</span>
    `;
    chatbotLogs.appendChild(msg);
    chatbotLogs.scrollTop = chatbotLogs.scrollHeight;
}

function appendUserMessage(text) {
    const timeStr = getFormattedTime();
    const msg = document.createElement("div");
    msg.className = "chat-message user-msg";
    msg.innerHTML = `
        <span class="msg-timestamp">[${timeStr}]</span>
        <span class="msg-sender">OPERATOR:</span>
        <span class="msg-text">${text}</span>
    `;
    chatbotLogs.appendChild(msg);
    chatbotLogs.scrollTop = chatbotLogs.scrollHeight;
}

function typeAIMessage(text) {
    const timeStr = getFormattedTime();
    const msg = document.createElement("div");
    msg.className = "chat-message ai-msg";
    msg.innerHTML = `
        <span class="msg-timestamp">[${timeStr}]</span>
        <span class="msg-sender">KRONOS AI:</span>
        <span class="msg-text"></span>
    `;
    chatbotLogs.appendChild(msg);
    chatbotLogs.scrollTop = chatbotLogs.scrollHeight;

    const textSpan = msg.querySelector(".msg-text");
    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < text.length) {
            textSpan.innerHTML += text.charAt(i);
            i++;
            chatbotLogs.scrollTop = chatbotLogs.scrollHeight;
        } else {
            clearInterval(typingInterval);
        }
    }, 12);
}

// Countdown sequence simulation
function triggerLaunchSequence() {
    if (isCountdownRunning) {
        typeAIMessage("ADVERTENCIA: La simulación de secuencia de lanzamiento ya está en curso.");
        return;
    }
    
    const site = SITES_DATA[activeSiteIndex];
    if (site.weather.includes("WARNING")) {
        typeAIMessage(`ABORTADO: Clima crítico en el nodo ${site.name}. Velocidad de viento excede los parámetros seguros de vuelo.`);
        return;
    }

    isCountdownRunning = true;
    typeAIMessage(`INICIANDO SECUENCIA TÁCTICA PARA CONTINENTE-1 DESDE EL NODO ${site.name}...`);
    
    setTimeout(() => {
        appendSystemMessage("WARNING: RANGE SAFETY IS CLEAR. MISSILE GANTRY RETRACTED.");
    }, 1200);

    setTimeout(() => {
        typeAIMessage("Iniciando presurización de tanques... Cuenta regresiva T-10 segundos.");
    }, 2500);

    let count = 5;
    const countdownTimer = setInterval(() => {
        if (count > 0) {
            appendSystemMessage(`T-MINUS ${count} SECONDS...`);
            count--;
        } else {
            clearInterval(countdownTimer);
            executeIgnition();
        }
    }, 4000);
}

function executeIgnition() {
    appendSystemMessage("IGNITION BOOSTERS ENGAGED. FUEL INJECTION ACTIVE.");
    setTimeout(() => {
        typeAIMessage("LIFT OFF! Misión CONTINENTE-1 ha despegado con éxito. Telemetría de ascenso nominal.");
        isCountdownRunning = false;
        
        // Add random deviation simulation
        setTimeout(() => {
            appendSystemMessage("ORBITAL INJECTION ACHIEVED. SEPARATION STAGE 1 NOMINAL.");
        }, 3000);
    }, 1500);
}

// Chatbot commands router
function handleChatbotCommand(command) {
    const cleanCmd = command.trim().toLowerCase();
    const site = SITES_DATA[activeSiteIndex];

    if (cleanCmd === "") return;

    appendUserMessage(command);

    setTimeout(() => {
        switch(cleanCmd) {
            case "help":
            case "ayuda":
                typeAIMessage("Comandos disponibles en el Núcleo CELA KRONOS:\n" +
                              "• [status] : Diagnóstico general de la red táctica.\n" +
                              "• [launch sequence] : Inicia cuenta regresiva de simulación de lanzamiento.\n" +
                              "• [telemetry] : Lectura profunda del nodo activo actual.\n" +
                              "• [weather] : Reporte climático detallado de la estación.\n" +
                              "• [clear] : Limpia la bitácora de mensajes.");
                break;
            case "status":
            case "estado":
                typeAIMessage(`DIAGNÓSTICO RED CELA:\n` +
                              `- CORE INTEGRITY: 99.8%\n` +
                              `- NODO ACTIVO: ${site.name} (${site.desc})\n` +
                              `- RED ENLACES: 6/6 NODOS SINCRONIZADOS\n` +
                              `- COMMS ENCRYPTION: MIL-2048-AES (OPTIMAL)`);
                break;
            case "launch sequence":
            case "launch":
            case "lanzamiento":
                triggerLaunchSequence();
                break;
            case "telemetry":
            case "telemetria":
                typeAIMessage(`TELEMETRÍA ACTUAL [NODO ${site.name}]:\n` +
                              `• Coordenadas: ${site.coords}\n` +
                              `• Altura: ${site.altitude}\n` +
                              `• Presión Atmosférica: ${site.baro}\n` +
                              `• Fuerza de Señal: ${site.signal}\n` +
                              `• Nivel Combustible: ${site.fuel}%`);
                break;
            case "weather":
            case "clima":
                typeAIMessage(`REPORTE METEOROLÓGICO [NODO ${site.name}]:\n` +
                              `• Estado: ${site.weather}\n` +
                              `• Condición: Temperatura actual de ${site.baro.split(" / ")[0]} con presión de ${site.baro.split(" / ")[1]}.`);
                break;
            case "clear":
            case "limpiar":
                chatbotLogs.innerHTML = "";
                appendSystemMessage("CONSOLE CLEARED BY OPERATOR UPLINK.");
                break;
            default:
                typeAIMessage(`Comando '${command}' no reconocido. Escriba 'help' para ver los protocolos disponibles de KRONOS.`);
                break;
        }
    }, 400);
}

// Bind chat submission
chatInputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cmd = chatInput.value;
    handleChatbotCommand(cmd);
    chatInput.value = "";
});

// Bind quick suggestions buttons
document.getElementById("sug-status").addEventListener("click", () => handleChatbotCommand("status"));
document.getElementById("sug-launch").addEventListener("click", () => handleChatbotCommand("launch sequence"));
document.getElementById("sug-telemetry").addEventListener("click", () => handleChatbotCommand("telemetry"));
document.getElementById("sug-weather").addEventListener("click", () => handleChatbotCommand("weather report"));


// 6. DYNAMIC HUD TELEMETRY FLUCTUATIONS
setInterval(() => {
    // Fluctuating Latency slightly
    const currentLatency = Math.floor(Math.random() * 6) + 10; // 10ms - 15ms
    footerLatency.innerText = `${currentLatency} ms`;

    // Fluctuating Memory slightly
    const baseMem = 42.8;
    const driftMem = (Math.random() * 0.4 - 0.2).toFixed(2);
    footerMem.innerText = `${(parseFloat(baseMem) + parseFloat(driftMem)).toFixed(1)}%`;
}, 3000);

// Initialize Mexico as active
window.addEventListener("DOMContentLoaded", () => {
    selectLaunchSite(0);
});
