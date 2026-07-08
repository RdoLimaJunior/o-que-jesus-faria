/* ═══════════════════════════════════════════════
   Text-to-Speech (TTS) Module
   - Nvidia API with browser fallback
   ═══════════════════════════════════════════════ */

import { toast } from './ui.js';

const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
let currentSource = null;
let currentBtn = null;

function setBtnPlaying(btn, playing, label) {
  if (!btn) return;
  btn.classList.toggle('playing', !!playing);
  const labelEl = btn.querySelector('.speak-label');
  if (labelEl) labelEl.textContent = playing ? 'Parar' : (label || 'Ouvir');
}

export function stopAll() {
  if (synth && synth.speaking) { try { synth.cancel(); } catch (e) {} }
  if (currentSource) {
    try { currentSource.stop ? currentSource.stop() : currentSource.pause(); } catch (e) {}
    currentSource = null;
  }
  if (currentBtn) {
    const orig = currentBtn.dataset.label || 'Ouvir';
    setBtnPlaying(currentBtn, false, orig);
    currentBtn = null;
  }
}

function getBestBrowserVoice() {
  if (!synth) return null;
  const voices = synth.getVoices();
  const finders = [
    v => /pt[-_]BR/i.test(v.lang) && /Google|Daniel|Ricardo|Felipe/i.test(v.name),
    v => /pt[-_]BR/i.test(v.lang),
    v => /pt/i.test(v.lang),
  ];
  for (const fn of finders) {
    const found = voices.find(fn);
    if (found) return found;
  }
  return voices.find(v => /en/i.test(v.lang)) || null;
}

function browserSpeak(text, btn, origLabel) {
  if (!synth) { toast('Áudio não suportado neste dispositivo'); return; }
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'pt-BR';
  utt.rate = 0.9;
  utt.pitch = 0.8;
  const v = getBestBrowserVoice();
  if (v) utt.voice = v;

  if (btn) {
    currentBtn = btn;
    setBtnPlaying(btn, true, 'Parar');
  }
  utt.onend = () => {
    if (currentBtn === btn) {
      setBtnPlaying(btn, false, origLabel);
      currentBtn = null;
    }
  };
  utt.onerror = () => {
    if (currentBtn === btn) {
      setBtnPlaying(btn, false, origLabel);
      currentBtn = null;
    }
  };
  synth.speak(utt);
}

export async function speakText(text, btn) {
  if (!text) return;
  if (btn && currentBtn === btn) {
    stopAll();
    return;
  }
  stopAll();

  const origLabel = btn ? (btn.querySelector('.speak-label')?.textContent || 'Ouvir') : '';
  if (btn) btn.dataset.label = origLabel;

  try {
    if (btn) {
      btn.classList.add('playing');
      currentBtn = btn;
    }

    const res = await fetch('/api/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ...window.API_CONFIG.audio })
    });

    if (!res.ok) throw new Error('Nvidia API failed');

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentSource = audio;

    if (btn) setBtnPlaying(btn, true, 'Parar');

    audio.onended = () => {
      if (currentSource === audio) currentSource = null;
      if (currentBtn === btn) {
        setBtnPlaying(btn, false, origLabel);
        currentBtn = null;
      }
    };
    audio.play();

  } catch (err) {
    console.warn('Nvidia Synthesis unavailable, using Web Speech API fallback', err);
    toast('⚠️ Áudio via Nvidia falhou. Usando navegador...');
    if (btn) setBtnPlaying(btn, false, origLabel);
    currentBtn = null;
    browserSpeak(text, btn, origLabel);
  }
}

export function testVoice(text) {
    speakText(text);
}

export function initTTS() {
    if (synth) {
        // Pre-load voices
        try { synth.getVoices(); synth.onvoiceschanged = () => synth.getVoices(); } catch (e) {}
    }
    console.log("TTS Module Initialized");
}