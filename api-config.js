/* API Configuration - Add your API keys to config.local.js */
window.API_CONFIG = {
  GROQ_API_KEY: '',
  NVIDIA_API_KEY: '',
  BIBLE_API_KEY: '',

  endpoints: {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    nvidiaAudio: 'https://integrate.api.nvidia.com/v1/audio/synthesize',
    bible: 'https://api.api-bible.com/v1/bibles/de4e12af7f28f599-02'
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
