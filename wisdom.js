/* ═══════════════════════════════════════════════
   Wisdom Tab Module
   - Groq API logic and Speech Recognition
   ═══════════════════════════════════════════════ */
import { callGroqAPI } from './api-service.js';

import { speakText } from './tts.js';
import { toast } from './ui.js';

const situationEl = document.getElementById('situation');
const loadingEl = document.getElementById('loading');
const errorMsgEl = document.getElementById('errorMsg');
const responseArea = document.getElementById('responseArea');
const counselTextEl = document.getElementById('counselText');
const verseTextEl = document.getElementById('verseText');
const verseRefEl = document.getElementById('verseRef');
const speakBtn = document.getElementById('speakBtn');
const sendBtn = document.getElementById('sendBtn');

let fullResponseText = '';

const loadingMsgs = [
  'Meditando nos ensinamentos de Cristo…',
  'Buscando sabedoria nas Escrituras…',
  'Refletindo com o coração de Jesus…',
  'Preparando uma palavra de luz…'
];
let loadingTimer;

function showLoading(show) {
  loadingEl.hidden = !show;
  if (show) {
    const textEl = loadingEl.querySelector('.loading-text');
    let i = 0;
    textEl.textContent = loadingMsgs[i];
    loadingTimer = setInterval(() => {
      i = (i + 1) % loadingMsgs.length;
      textEl.textContent = loadingMsgs[i];
    }, 2200);
  } else {
    clearInterval(loadingTimer);
  }
}

async function askJesus() {
  const situation = situationEl.value.trim();
  if (!situation) {
    situationEl.focus();
    return;
  }

  responseArea.hidden = true;
  errorMsgEl.hidden = true;
  showLoading(true);
  sendBtn.disabled = true;

  try {
    const generatedText = await callGroqAPI(situation);
    if (!generatedText) throw new Error('Resposta vazia da API');

    const clean = String(generatedText).replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Formato de resposta inválido');

    const jsonStr = clean.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);

    if (!parsed.conselho || !parsed.versiculo) throw new Error('Resposta incompleta');

    counselTextEl.textContent = parsed.conselho;
    verseTextEl.textContent = `"${parsed.versiculo}"`;

    let readableRef = '';
    if (parsed.referencia) {
      verseRefEl.textContent = `— ${parsed.referencia}`;
      const refMatch = parsed.referencia.match(/(.+?)\s+(\d+):(\d+)/);
      readableRef = refMatch ? `${refMatch[1]}, capítulo ${refMatch[2]}, versículo ${refMatch[3]}` : parsed.referencia;
      verseRefEl.setAttribute('aria-label', readableRef);
    } else {
      verseRefEl.textContent = '';
    }

    responseArea.hidden = false;
    fullResponseText = `${parsed.conselho}. Palavra de Deus: ${parsed.versiculo}. ${readableRef}`;

  } catch (err) {
    errorMsgEl.textContent = '✦ Erro: ' + (err.message || 'Não foi possível conectar. Verifique sua conexão.');
    errorMsgEl.hidden = false;
  } finally {
    showLoading(false);
    sendBtn.disabled = false;
  }
}

function setupSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    sendBtn.querySelector('.mic-icon').style.display = 'none';
    return;
  }

  const recognition = new SR();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;

  let isRecording = false;
  const micIcon = sendBtn.querySelector('.mic-icon');
  const sendIcon = sendBtn.querySelector('.send-icon');
  const recordingIndicator = document.getElementById('recordingIndicator');

  const updateIcons = () => {
    const hasText = situationEl.value.trim().length > 0;
    micIcon.hidden = hasText;
    sendIcon.hidden = !hasText;
  };

  situationEl.addEventListener('input', updateIcons);

  recognition.onstart = () => {
    isRecording = true;
    recordingIndicator.hidden = false;
    toast('🎙️ Ouvindo…');
  };

  recognition.onresult = (event) => {
    situationEl.value = event.results[0][0].transcript;
    updateIcons();
  };

  recognition.onend = () => {
    isRecording = false;
    recordingIndicator.hidden = true;
  };

  recognition.onerror = (event) => {
    toast(`❌ Erro no microfone: ${event.error}`);
    isRecording = false;
    recordingIndicator.hidden = true;
  };

  sendBtn.addEventListener('click', () => {
    if (situationEl.value.trim().length > 0) {
      askJesus();
    } else {
      if (!isRecording) {
        recognition.start();
      } else {
        recognition.stop();
      }
    }
  });

  updateIcons();
}

export function initWisdom() {
  situationEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      askJesus();
    }
  });

  speakBtn.addEventListener('click', () => speakText(fullResponseText, speakBtn));

  setupSpeechRecognition();
  console.log("Wisdom Module Initialized");
}