/* ═══════════════════════════════════════════════
   Psalms Tab Module
   - Fetches Psalms from the backend (Neon DB)
   ═══════════════════════════════════════════════ */

import { getPsalmsList, getPsalmText } from './api-service.js';
import { speakText } from './tts.js';
import { toast } from './ui.js';

const psalmSelect = document.getElementById('psalmSelect');
const psalmContent = document.getElementById('psalmContent');
const psalmIntro = document.getElementById('psalmIntro');
const psalmText = document.getElementById('psalmText');
const psalmSpeakBtn = document.getElementById('psalmSpeakBtn');
const reflectionEl = document.getElementById('reflection');
const saveReflectionBtn = document.getElementById('saveReflectionBtn');
const saveConfirm = document.getElementById('saveConfirm');

let currentPsalm = null;

async function loadPsalmsMetadata() {
  try {
    const psalms = await getPsalmsList();
    psalmSelect.innerHTML = '<option value="">— Escolha um Salmo para Meditar —</option>';
    psalms.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.number;
      opt.textContent = `Salmo ${s.number} — ${s.title}`;
      psalmSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load psalms list:", err);
    psalmSelect.innerHTML = '<option value="">Falha ao carregar Salmos</option>';
  }
}

async function displayPsalm(psalmNumber) {
  if (!psalmNumber) {
    psalmContent.hidden = true;
    return;
  }

  psalmContent.hidden = false;
  psalmText.textContent = '⏳ Carregando Salmo...';
  reflectionEl.value = '';
  saveConfirm.hidden = true;

  try {
    const psalm = await getPsalmText(psalmNumber);
    currentPsalm = psalm;

    psalmIntro.textContent = `${psalm.title}\n\nAutor: ${psalm.author}\nTipo: ${psalm.type}\n\nEste Salmo oferece consolo, força e esperança através da Palavra de Deus.`;
    psalmText.textContent = psalm.text || `[Texto do Salmo ${psalmNumber} não disponível.]`;

    // Load saved reflection from localStorage
    const savedReflection = localStorage.getItem(`psalm_${psalmNumber}_reflection`) || '';
    reflectionEl.value = savedReflection;

  } catch (error) {
    console.error(`Error loading psalm ${psalmNumber}:`, error);
    psalmText.textContent = `[Salmo ${psalmNumber} - Erro ao carregar.]`;
    toast('Erro ao carregar o Salmo. Tente novamente.');
  }
}

export function initPsalms() {
  loadPsalmsMetadata();

  psalmSelect.addEventListener('change', () => displayPsalm(psalmSelect.value));

  psalmSpeakBtn.addEventListener('click', () => {
    if (currentPsalm?.text) speakText(currentPsalm.text, psalmSpeakBtn);
  });

  saveReflectionBtn.addEventListener('click', () => {
    const text = reflectionEl.value.trim();
    if (!currentPsalm || !text) return;
    localStorage.setItem(`psalm_${currentPsalm.number}_reflection`, text);
    saveConfirm.hidden = false;
    toast('✦ Reflexão guardada');
  });

  console.log("Psalms Module Initialized");
}