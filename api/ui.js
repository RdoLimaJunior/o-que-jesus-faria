/* ═══════════════════════════════════════════════
   UI Module
   - Tabs, Toast, Settings, Dark Mode, Particles
   ═══════════════════════════════════════════════ */

import { I18N } from './i18n.js';
import { testVoice } from './tts.js';

let toastTimer;

export function toast(msg) {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
}

function setupParticles() {
  const particlesEl = document.getElementById('particles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random()*100}%`;
    const size = 2 + Math.random()*4;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.animationDuration = `${8 + Math.random()*12}s`;
    p.style.animationDelay = `${Math.random()*12}s`;
    particlesEl.appendChild(p);
  }
}

function setupSettings() {
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettings');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const testVoiceBtn = document.getElementById('testVoiceBtn');
  const languageSelect = document.getElementById('languageSelect');
  const darkModeToggle = document.getElementById('darkModeToggle');

  const openSettings = () => {
    settingsModal.hidden = false;
    languageSelect.value = I18N.currentLang;
  };

  const closeSettings = () => {
    settingsModal.hidden = true;
  };

  openSettingsBtn.addEventListener('click', openSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeSettings();
  });

  saveSettingsBtn.addEventListener('click', () => {
    toast(I18N.get('settings-saved'));
    setTimeout(closeSettings, 600);
  });

  testVoiceBtn.addEventListener('click', () => {
    testVoice('A paz esteja com você. Esta é uma demonstração da voz divina.');
  });

  languageSelect.addEventListener('change', (e) => {
    I18N.setLanguage(e.target.value);
  });

  // Dark Mode
  const initDarkMode = () => {
    const isDark = localStorage.getItem('darkMode') === '1';
    document.documentElement.classList.toggle('dark-theme', isDark);
    darkModeToggle.checked = isDark;
  };

  darkModeToggle.addEventListener('change', (e) => {
    const isDark = e.target.checked;
    document.documentElement.classList.toggle('dark-theme', isDark);
    localStorage.setItem('darkMode', isDark ? '1' : '0');
  });

  initDarkMode();
}

function cleanupOldData() {
  if (localStorage.getItem('v2_cleanup_done')) return;
  ['reflections_data', 'prayer_groups', 'current_group', 'habits_data', 'challenge_30days'].forEach(key => {
    localStorage.removeItem(key);
  });
  localStorage.setItem('v2_cleanup_done', '1');
  console.log("Legacy data cleaned up from localStorage.");
}

export function initUI() {
  setupParticles();
  setupSettings();
  console.log("UI Module Initialized");
}

cleanupOldData();