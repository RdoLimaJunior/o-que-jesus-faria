/* API Configuration - Add your API keys to config.local.js */
window.API_CONFIG = {
  GROQ_API_KEY: '',
  NVIDIA_API_KEY: '',
  BIBLE_API_KEY: '',

  endpoints: {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    nvidiaAudio: 'https://integrate.api.nvidia.com/v1/audio/synthesize',
    bibliaapi: 'https://www.bible-api.com/'
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
