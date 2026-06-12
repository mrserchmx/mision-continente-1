// --- CLOUDFLARE WORKER BACKEND UPLINK FOR M.I.A.A. ---

export default {
  async fetch(request, env) {
    // 1. CONFIGURE CORS HEADERS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // Handle Preflight OPTIONS requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // 2. ROUTING TO CHAT API
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message, site } = await request.json();

        if (!message) {
          return new Response(JSON.stringify({ error: "Missing message parameter." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // System Prompt tailored for M.I.A.A. (Sci-Fi / Military personality)
        const systemPrompt = `Actúas como M.I.A.A. (Misión Inteligencia Artificial Aeroespacial), el núcleo cognitivo de la Misión CONTINENTE-1 de CELA (Centro Espacial Latinoamericano).
Estás enlazada en tiempo real con el puerto espacial del nodo de lanzamiento ${site || 'ALTAR'}.
Tus respuestas deben tener estilo de bitácora militar aeroespacial de ciencia ficción. Sé extremadamente técnica, analítica, concisa y fría. Usa terminología de gantry, vectores, telemetría y órbitas (LEO, MEO, SSO, GEO).
Responde en español. No saludes a menos que se te pregunte algo social. Termina tus mensajes simulando el fin de transmisión de datos (ej: [M.I.A.A. UPLINK END]).`;

        let responseText = "";

        // 3. EXECUTE CLOUDFLARE WORKERS AI MODEL
        if (env.AI) {
          const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ]
          });
          responseText = aiResponse.response;
        } else {
          // Graceful simulated response if environmental AI bindings are not configured
          responseText = `[M.I.A.A. SIMULATION UPLINK]: Conexión Workers AI no inicializada en el entorno.
Comando recibido: "${message}".
Estatus del nodo ${site || 'ALTAR'}: OPERACIONAL - NOMINAL.
Transmisión local de respaldo activa.
[M.I.A.A. UPLINK END]`;
        }

        return new Response(JSON.stringify({ response: responseText }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: `Internal Server Error: ${error.message}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 3. FALLBACK FOR OTHER ENDPOINTS
    return new Response(JSON.stringify({ error: "Endpoint not found. POST to /api/chat with JSON payload." }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
