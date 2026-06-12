// --- M.I.A.A. TACTICAL CORE INTERACTION SCRIPT ---

// 1. DATA MODEL FOR LAUNCH NODES
const SITES_DATA = [
    {
        name: "ALTAR",
        desc: "México Spaceport",
        coords: "31.6961° N, 111.7314° W",
        orbit: "POLAR / SSO",
        altitude: "780m ASL",
        weather: "NOMINAL // CLEAR",
        signal: "98.4%",
        baro: "29.1°C / 1013 hPa",
        fuel: 98,
        vector: "COHETE CÓNDOR-1: listo en plataforma",
        radarPos: { x: 120, y: 105 }, 
        azimuth: "324.51°",
        elevation: "18.30°",
        sector: "MX-AL-01"
    },
    {
        name: "ALCÂNTARA",
        desc: "Brasil Launch Center",
        coords: "2.3837° S, 44.3969° W",
        orbit: "EQUATORIAL / LEO",
        altitude: "45m ASL",
        weather: "NOMINAL // STABLE",
        signal: "95.1%",
        baro: "31.4°C / 1009 hPa",
        fuel: 92,
        vector: "VEHÍCULO SABIÁ-2: en preparación",
        radarPos: { x: 350, y: 215 },
        azimuth: "102.14°",
        elevation: "44.92°",
        sector: "BR-AL-12"
    },
    {
        name: "PUNTA INDIO",
        desc: "Argentina Tactical Base",
        coords: "35.3448° S, 57.2681° W",
        orbit: "HELIOSYNCHRONOUS / SSO",
        altitude: "3m ASL",
        weather: "STANDBY // GUSTS",
        signal: "91.8%",
        baro: "12.8°C / 1022 hPa",
        fuel: 89,
        vector: "VECTOR TRONADOR-3: presurización activa",
        radarPos: { x: 285, y: 395 },
        azimuth: "164.88°",
        elevation: "28.12°",
        sector: "AR-PI-03"
    },
    {
        name: "ATACAMA",
        desc: "Chile Telemetry Range",
        coords: "24.2690° S, 69.8500° W",
        orbit: "POLAR / MEO",
        altitude: "2,630m ASL",
        weather: "NOMINAL // OPTICAL EXCELLENT",
        signal: "99.1%",
        baro: "18.5°C / 740 hPa",
        fuel: 78,
        vector: "COHETE LAUTARO-5: chequeo estático",
        radarPos: { x: 232, y: 340 },
        azimuth: "188.45°",
        elevation: "38.70°",
        sector: "CL-AT-07"
    },
    {
        name: "GUAJIRA",
        desc: "Colombia Launch Complex",
        coords: "12.2153° N, 71.7925° W",
        orbit: "LOW-INCLINATION / LEO",
        altitude: "5m ASL",
        weather: "WARNING // WIND VELOCITY EXCEEDED",
        signal: "74.2%",
        baro: "33.1°C / 1008 hPa",
        fuel: 40,
        vector: "SISTEMA CHIBCHA-1: en espera (clima)",
        radarPos: { x: 245, y: 180 },
        azimuth: "12.50°",
        elevation: "68.42°",
        sector: "CO-GJ-05"
    },
    {
        name: "LA JOYA",
        desc: "Perú Aerospace Base",
        coords: "16.5910° S, 71.8510° W",
        orbit: "POLAR / LEO",
        altitude: "3,850m ASL",
        weather: "STANDBY // TEMPERATURE LOW",
        signal: "88.6%",
        baro: "4.2°C / 635 hPa",
        fuel: 55,
        vector: "VECTOR CHASQUI-3: carga de combustible",
        radarPos: { x: 228, y: 290 },
        azimuth: "208.11°",
        elevation: "52.36°",
        sector: "PE-LJ-06"
    }
];

let activeSiteIndex = 0;
let isCountdownRunning = false;

// 2. DOM ELEMENTS
const clockElement = document.getElementById("utc-clock");
const siteButtons = document.querySelectorAll(".site-btn");
const mapMarkers = document.querySelectorAll(".spaceport-marker");
const chatbotLogs = document.getElementById("chatbot-logs");
const chatInputForm = document.getElementById("chat-input-form");
const chatInput = document.getElementById("chat-input");
const miaaLoader = document.getElementById("miaa-loader");

// Telemetry DOM nodes
const nodeCoords = document.getElementById("node-coords");
const nodeOrbit = document.getElementById("node-orbit");
const nodeAltitude = document.getElementById("node-altitude");
const nodeWeather = document.getElementById("node-weather");
const nodeSignal = document.getElementById("node-signal");
const nodeBaro = document.getElementById("node-baro");
const nodeVectorName = document.getElementById("node-vector-name");
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
    
    // Toggle active list buttons styling
    siteButtons.forEach((btn, idx) => {
        if (idx === index) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Toggle active SVG map markers styling
    mapMarkers.forEach((marker, idx) => {
        if (idx === index) {
            marker.classList.add("active-marker");
        } else {
            marker.classList.remove("active-marker");
        }
    });

    // Trigger visual scan overlay on the telemetry log block
    const telemetrySub = document.getElementById("site-telemetry-details");
    telemetrySub.classList.remove("scanning");
    void telemetrySub.offsetWidth; // Force reflow to restart CSS animation
    telemetrySub.classList.add("scanning");

    // Update Telemetry Log Panels
    nodeCoords.innerText = site.coords;
    nodeOrbit.innerText = site.orbit;
    nodeAltitude.innerText = site.altitude;
    nodeWeather.innerText = site.weather;
    nodeSignal.innerText = site.signal;
    nodeBaro.innerText = site.baro;
    nodeVectorName.innerText = site.vector.toUpperCase();

    // Reset and animate progress bar
    nodeFuelBar.style.width = '0%';
    nodeFuelText.innerText = '0%';
    setTimeout(() => {
        nodeFuelBar.style.width = `${site.fuel}%`;
        nodeFuelText.innerText = `${site.fuel}%`;
    }, 60);

    // Apply color class to weather node based on telemetry status
    nodeWeather.className = "dl-value";
    if (site.weather.includes("NOMINAL")) {
        nodeWeather.classList.add("text-green");
    } else if (site.weather.includes("STANDBY")) {
        nodeWeather.classList.add("text-cyan");
    } else {
        nodeWeather.classList.add("text-orange");
    }

    // Update Visor Radar HUD
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

    // Translate active HUD target reticle on the map
    radarTargetReticle.setAttribute("transform", `translate(${site.radarPos.x}, ${site.radarPos.y})`);

    // Update bottom Ticker message
    tickerFeed.innerText = `LINKING REGIONAL NODE-${String(index+1).padStart(2, '0')} (${site.name})... DATASTREAM SYNCHRONIZED... COORDINATES LOCKED AT ${site.coords}... MONITORING ATMOSPHERIC DRIFT... OPTIMAL ORBIT: ${site.orbit}...`;

    // Notify Chatbot of site lock
    appendSystemMessage(`TARGET NODE ALIGNED: ${site.name} SPACEPORT.`);
}

// Bind click event listeners to sidebar selector list
siteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-site-index"));
        selectLaunchSite(index);
    });
});

// Bind click event listeners to SVG map markers
mapMarkers.forEach((marker) => {
    marker.addEventListener("click", () => {
        const index = parseInt(marker.getAttribute("data-site-index"));
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
        <span class="msg-sender">M.I.A.A. AI:</span>
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
    }, 10);
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

// Local Fallback router in case Cloudflare Worker is offline/not deployed
function executeLocalFallbackCommand(cleanCmd, site) {
    switch(cleanCmd) {
        case "help":
        case "ayuda":
            typeAIMessage("Comandos locales M.I.A.A. (FALLBACK MODE):\n" +
                          "• [status] : Diagnóstico general de la red aeroespacial.\n" +
                          "• [launch sequence] : Inicia simulación de lanzamiento.\n" +
                          "• [telemetry] : Lectura profunda del nodo activo actual.\n" +
                          "• [weather] : Reporte climático detallado de la estación.\n" +
                          "• [clear] : Limpia la bitácora de mensajes.");
            break;
        case "status":
        case "estado":
            typeAIMessage(`DIAGNÓSTICO NÚCLEO COGNITIVO M.I.A.A.:\n` +
                          `- WORKER BACKEND: OFFLINE (FALLBACK ACTIVE)\n` +
                          `- CORE INTEGRITY: 99.8% [NOMINAL]\n` +
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
                          `• Órbita Óptima: ${site.orbit}\n` +
                          `• Altura: ${site.altitude}\n` +
                          `• Estatus Gantry: ${site.vector}\n` +
                          `• Fuerza de Señal: ${site.signal}\n` +
                          `• Combustible: ${site.fuel}%`);
            break;
        case "weather":
        case "clima":
            typeAIMessage(`REPORTE METEOROLÓGICO [NODO ${site.name}]:\n` +
                          `• Estado: ${site.weather}\n` +
                          `• Condición: Temperatura de ${site.baro.split(" / ")[0]} con presión de ${site.baro.split(" / ")[1]}.`);
            break;
        case "clear":
        case "limpiar":
            chatbotLogs.innerHTML = "";
            appendSystemMessage("CONSOLE CLEARED BY OPERATOR UPLINK.");
            break;
        default:
            typeAIMessage(`[M.I.A.A. CORE]: Conexión con Workers AI fuera de línea. Procesando consulta de respaldo local. Consulta: "${cleanCmd}". Estado general del nodo ${site.name}: NOMINAL.`);
            break;
    }
}

// Chatbot commands router with fetch uplink to Cloudflare Worker
async function handleChatbotCommand(command) {
    const cleanCmd = command.trim();
    const site = SITES_DATA[activeSiteIndex];

    if (cleanCmd === "") return;

    appendUserMessage(command);

    // Show dynamic soundwave equalizer thinking indicator
    miaaLoader.style.display = "flex";
    chatbotLogs.scrollTop = chatbotLogs.scrollHeight;

    // Disable inputs during network request
    chatInput.disabled = true;
    const sendBtn = document.getElementById("chat-send-trigger");
    if (sendBtn) sendBtn.disabled = true;

    try {
        // Asynchronous fetch call to Cloudflare Worker
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: cleanCmd,
                site: site.name
            })
        });

        // Hide thinking loader
        miaaLoader.style.display = "none";
        chatInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        chatInput.focus();

        if (!response.ok) {
            throw new Error(`Uplink Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.response) {
            typeAIMessage(data.response);
        } else {
            typeAIMessage("Error: M.I.A.A. recibió un paquete de datos vacío.");
        }
    } catch (error) {
        console.warn("M.I.A.A. Worker offline or unreachable. Engaging local fallback routine.", error);
        
        // Simulating artificial thinking time for fallback (1.2 seconds)
        setTimeout(() => {
            miaaLoader.style.display = "none";
            chatInput.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            chatInput.focus();

            executeLocalFallbackCommand(cleanCmd.toLowerCase(), site);
        }, 1200);
    }
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

// Initialize Altar as active
window.addEventListener("DOMContentLoaded", () => {
    selectLaunchSite(0);
});
