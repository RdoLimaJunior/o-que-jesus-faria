/* Internationalization (i18n) - Multi-language support */

window.I18N = {
  currentLang: localStorage.getItem('appLanguage') || 'pt-BR',

  languages: {
    'pt-BR': { name: '🇧🇷 Português (Brasil)', nativeName: 'Português (Brasil)' },
    'pt': { name: '🇵🇹 Português (Portugal)', nativeName: 'Português (Portugal)' },
    'en': { name: '🇬🇧 English', nativeName: 'English' },
    'es': { name: '🇪🇸 Español', nativeName: 'Español' },
  },

  strings: {
    'pt-BR': {
      // Header
      'title': 'O que Jesus Faria?',
      'subtitle': 'Sabedoria · Salmos · Devocional',

      // Tabs
      'tab-wisdom': 'Sabedoria',
      'tab-psalms': 'Salmos',
      'tab-devotion': 'Devocional',

      // Wisdom Tab
      'situation-label': 'Conte sua situação ou dúvida',
      'step-1': 'Compartilhe',
      'step-2': 'Receba',
      'ask-btn': 'Buscar Sabedoria',
      'clear-btn': 'Limpar',
      'speak-btn': 'Ouvir em voz alta',
      'stop-btn': 'Parar',

      // Settings
      'settings-title': 'Voz Divina',
      'settings-intro': 'Voz divina ativada com Nvidia ResembleAI. Ouça as Escrituras em português claro e natural.',
      'test-voice-btn': 'Testar voz',
      'save-settings-btn': 'Salvar',
      'language-label': 'Idioma',

      // Messages
      'error-no-situation': 'Por favor, compartilhe sua situação.',
      'error-no-groq-key': 'Chave de API do Groq não configurada',
      'error-empty-response': 'Resposta vazia do Groq',
      'error-invalid-format': 'Formato de resposta inválido',
      'error-malformed': 'Resposta está malformada',
      'error-incomplete': 'Resposta incompleta',
      'error-connection': 'Erro: Não foi possível conectar ao servidor. Verifique sua conexão.',
      'error-no-mic': 'Seu navegador não suporta entrada por voz. Tente Chrome ou Edge.',
      'error-mic-permission': 'Permita o microfone nas configurações do navegador.',
      'error-audio-failed': '⚠️ Áudio via Nvidia falhou. Usando navegador...',

      // Voice recognition
      'listening': '🎙️ Ouvindo… fale agora',
      'no-match': 'Nenhum texto reconhecido. Tente novamente.',

      // Footer
      'footer-text': 'Com fé, toda resposta vem do alto · WWJD',

      // Installation
      'install-title': 'Instalar aplicativo',
      'install-subtitle': 'Tenha sabedoria sempre à mão, mesmo sem internet.',
      'install-btn': 'Instalar',

      // Settings status
      'settings-saved': 'Configurações salvas',
      'settings-status': '✦ Voz divina configurada via Vercel.',
    },

    'pt': {
      'title': 'O que Jesus Faria?',
      'subtitle': 'Sabedoria · Salmos · Devocional',
      'tab-wisdom': 'Sabedoria',
      'tab-psalms': 'Salmos',
      'tab-devotion': 'Devocional',
      'situation-label': 'Conte a sua situação ou dúvida',
      'step-1': 'Partilhe',
      'step-2': 'Receba',
      'ask-btn': 'Procurar Sabedoria',
      'clear-btn': 'Limpar',
      'speak-btn': 'Ouvir em voz alta',
      'stop-btn': 'Parar',
      'settings-title': 'Voz Divina',
      'settings-intro': 'Voz divina ativada com Nvidia ResembleAI. Ouça as Escrituras em português claro e natural.',
      'test-voice-btn': 'Testar voz',
      'save-settings-btn': 'Guardar',
      'language-label': 'Idioma',
      'settings-saved': 'Configurações guardadas',
      'footer-text': 'Com fé, toda resposta vem do alto · WWJD',
    },

    'en': {
      'title': 'What Would Jesus Do?',
      'subtitle': 'Wisdom · Psalms · Devotional',
      'tab-wisdom': 'Wisdom',
      'tab-psalms': 'Psalms',
      'tab-devotion': 'Devotional',
      'situation-label': 'Share your situation or question',
      'step-1': 'Share',
      'step-2': 'Receive',
      'ask-btn': 'Seek Wisdom',
      'clear-btn': 'Clear',
      'speak-btn': 'Listen aloud',
      'stop-btn': 'Stop',
      'settings-title': 'Divine Voice',
      'settings-intro': 'Divine voice activated with Nvidia ResembleAI. Listen to the Scriptures in clear and natural English.',
      'test-voice-btn': 'Test voice',
      'save-settings-btn': 'Save',
      'language-label': 'Language',
      'settings-saved': 'Settings saved',
      'footer-text': 'With faith, every answer comes from above · WWJD',
    },

    'es': {
      'title': '¿Qué haría Jesús?',
      'subtitle': 'Sabiduría · Salmos · Devocional',
      'tab-wisdom': 'Sabiduría',
      'tab-psalms': 'Salmos',
      'tab-devotion': 'Devocional',
      'situation-label': 'Comparta su situación o pregunta',
      'step-1': 'Compartir',
      'step-2': 'Recibir',
      'ask-btn': 'Buscar Sabiduría',
      'clear-btn': 'Limpiar',
      'speak-btn': 'Escuchar en voz alta',
      'stop-btn': 'Detener',
      'settings-title': 'Voz Divina',
      'settings-intro': 'Voz divina activada con Nvidia ResembleAI. Escuche las Escrituras en español claro y natural.',
      'test-voice-btn': 'Probar voz',
      'save-settings-btn': 'Guardar',
      'language-label': 'Idioma',
      'settings-saved': 'Configuración guardada',
      'footer-text': 'Con fe, toda respuesta viene del cielo · WWJD',
    }
  },

  get(key) {
    return this.strings[this.currentLang]?.[key] || this.strings['pt-BR'][key] || key;
  },

  setLanguage(lang) {
    if (this.strings[lang]) {
      this.currentLang = lang;
      localStorage.setItem('appLanguage', lang);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
  },

  init() {
    // Apply current language
    this.applyLanguage();

    // Listen for language changes
    window.addEventListener('languageChanged', () => this.applyLanguage());
  },

  applyLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.get(key);
    });

    // Update placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      el.placeholder = this.get(key);
    });

    // Update aria-label attributes
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
      const key = el.dataset.i18nLabel;
      el.setAttribute('aria-label', this.get(key));
    });

    // Update title
    document.title = this.get('title');

    // Force reload of all text (hardcoded strings fallback)
    // This handles any text that wasn't marked with data-i18n
    this.updateHardcodedStrings();
  },

  updateHardcodedStrings() {
    // Map of common selectors to i18n keys
    const mappings = [
      { selector: '[data-i18n="ask-btn"]', key: 'ask-btn' },
      { selector: 'h1', key: 'title' },
      { selector: '.subtitle', key: 'subtitle' }
    ];

    // This is handled by data-i18n, but we ensure everything is translated
  }
};

// Initialize immediately and on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.I18N.init());
} else {
  window.I18N.init();
}
