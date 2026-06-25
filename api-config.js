/* API Configuration - Add your API keys to config.local.js */
window.API_CONFIG = {
  GEMINI_API_KEY: '',
  GROQ_API_KEY: '',
  ELEVEN_LABS_API_KEY: '',
  BIBLE_API_KEY: '',

  endpoints: {
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    elevenLabs: 'https://api.elevenlabs.io/v1/text-to-speech',
    bible: 'https://api.api-bible.com/v1/bibles/de4e12af7f28f599-02'
  },

  models: {
    groq: 'llama-3.3-70b-versatile'
  }
};
