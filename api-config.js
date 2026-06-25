/* API Configuration - Read from window vars or environment */
// In Vercel: loaded from Environment Variables
// Local: add keys to config.local.js before app.js loads

window.API_CONFIG = {
  GROQ_API_KEY: window.GROQ_API_KEY || '',
  NVIDIA_API_KEY: window.NVIDIA_API_KEY || '',
  BIBLIAAPI_KEY: window.BIBLIAAPI_KEY || '',

  endpoints: {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    nvidiaAudio: 'https://integrate.api.nvidia.com/v1/audio/synthesize',
    bibliaapi: 'https://bible-api.com/'
  },

  models: {
    groq: 'llama-3.3-70b-versatile'
  },

  audio: {
    voice: 'Padre',
    language: 'pt-BR',
    encoding: 'MP3',
    sampleRate: 24000,
    rate: 1.0,
    emotion: 'calm'
  }
};
