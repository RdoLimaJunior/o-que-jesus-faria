/* API Configuration - Injected via environment variables */
window.API_CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY || '',
  BIBLE_API_KEY: process.env.BIBLE_API_KEY || '',

  endpoints: {
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    elevenLabs: 'https://api.elevenlabs.io/v1/text-to-speech',
    bible: 'https://api.api-bible.com/v1/bibles/de4e12af7f28f599-02'
  },

  models: {
    groq: 'mixtral-8x7b-32768'
  }
};
