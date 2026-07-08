/* ═══════════════════════════════════════════════
   O QUE JESUS FARIA — Main App Orchestrator
   ═══════════════════════════════════════════════ */

import { initUI } from './modules/ui.js';
import { initTTS } from './modules/tts.js';
import { initWisdom } from './modules/wisdom.js';
import { initPsalms } from './modules/psalms.js';
import { initDevotion } from './modules/devotion.js';
import { I18N } from './modules/i18n.js';
import { loadEnvVars } from './modules/api-service.js';

'use strict';

function initApp() {
  I18N.init();
  initUI();
  initTTS();
  initWisdom();
  initPsalms();
  initDevotion();
  // initPWA(); // Future module for PWA logic
  console.log("O Que Jesus Faria? App Initialized.");
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadEnvVars();
  initApp();
});
