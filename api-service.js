/* ═══════════════════════════════════════════════
   API Service Module
   - Centralizes all fetch calls for the application.
   ═══════════════════════════════════════════════ */

export async function loadEnvVars() {
  try {
    const response = await fetch('/api/env');
    if (!response.ok) throw new Error('Failed to load env vars');
    const env = await response.json();
    window.API_CONFIG.GROQ_API_KEY = env.GROQ_API_KEY || window.API_CONFIG.GROQ_API_KEY;
    window.API_CONFIG.NVIDIA_API_KEY = env.NVIDIA_API_KEY || window.API_CONFIG.NVIDIA_API_KEY;
    window.API_CONFIG.BIBLIAAPI_KEY = env.BIBLIAAPI_KEY || window.API_CONFIG.BIBLIAAPI_KEY;
    console.log("Environment variables loaded via API service.");
  } catch (e) {
    console.log('Using local config for environment variables.');
  }
}

export async function callGroqAPI(situation) {
  const { endpoints, models, GROQ_API_KEY } = window.API_CONFIG;
  if (!GROQ_API_KEY) throw new Error('Chave de API do Groq não configurada');

  const systemPrompt = `Você é uma voz amorosa e sábia que reflete os ensinamentos de Jesus Cristo no Evangelho. REGRAS: Tom caloroso, simples, como um amigo sábio. Frases curtas, palavras simples, sem jargões teológicos. Em PORTUGUÊS DO BRASIL. Para qualquer situação: 1. Conselho de como Cristo aconselharia (3 a 4 frases simples). 2. UM versículo bíblico apropriado. Responda APENAS em JSON válido: {"conselho": "...", "versiculo": "...", "referencia": "Livro Cap:Ver"}`;

  const res = await fetch(endpoints.groq, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: models.groq,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: situation }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Status ${res.status}: ${errorData || 'Erro ao chamar Groq API'}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function synthesizeSpeech(text) {
  const res = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, ...window.API_CONFIG.audio })
  });

  if (!res.ok) throw new Error('Nvidia API failed');

  return res.blob();
}

export async function getDailyDevotion() {
  const res = await fetch('/api/devotion');
  if (!res.ok) throw new Error('Falha ao carregar devocional');
  return res.json();
}

export async function getPsalmText(psalmNumber) {
  const res = await fetch(`/api/psalms?number=${psalmNumber}`);
  if (!res.ok) {
    throw new Error(`Falha ao carregar Salmo ${psalmNumber}`);
  }
  return res.json();
}

export async function getPsalmsList() {
  const res = await fetch('/api/psalms');
  if (!res.ok) {
    throw new Error('Falha ao carregar a lista de Salmos');
  }
  return res.json();
}