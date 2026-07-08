/* ═══════════════════════════════════════════════
   Devotion Tab Module
   - Daily Devotion and Prayer Journal
   ═══════════════════════════════════════════════ */

import { speakText } from './tts.js';
import { toast } from './ui.js';

let currentDevotion = null;

function formatDate() {
  const d = new Date();
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

async function loadDailyDevotion() {
  document.getElementById('devotionDate').textContent = formatDate();
  const devotionVerseEl = document.getElementById('devotionVerse');
  const devotionRefEl = document.getElementById('devotionRef');
  const devotionReflectionEl = document.getElementById('devotionReflection');

  try {
    const res = await fetch('/api/devotion');
    if (!res.ok) throw new Error('Falha ao carregar devocional');

    const devotion = await res.json();
    currentDevotion = devotion;

    devotionVerseEl.textContent = devotion.text;
    devotionRefEl.textContent = `— ${devotion.reference}`;

    const refMatch = devotion.reference.match(/(.+?)\s+(\d+):(\d+)/);
    let readableDevotionRef = devotion.reference;
    if (refMatch) {
      const [, livro, cap, ver] = refMatch;
      readableDevotionRef = `${livro}, capítulo ${cap}, versículo ${ver}`;
      devotionRefEl.setAttribute('aria-label', readableDevotionRef);
    }

    const meditationText = Object.values(devotion.meditation).join('\n\n');
    devotionReflectionEl.textContent = meditationText;

    const devotionSpeakBtn = document.getElementById('devotionSpeakBtn');
    devotionSpeakBtn.onclick = () => {
      const txt = `Versículo do dia. ${devotion.text}. ${readableDevotionRef}. Reflexão. ${meditationText}`;
      speakText(txt, devotionSpeakBtn);
    };

  } catch (error) {
    console.error('Erro no devocional:', error);
    devotionVerseEl.textContent = 'Não foi possível carregar o versículo do dia.';
    devotionRefEl.textContent = '';
    devotionReflectionEl.textContent = 'Por favor, verifique sua conexão e tente novamente.';
  }
}

function setupPrayerJournal() {
  const prayerListEl = document.getElementById('prayerList');
  const prayerEmpty = document.getElementById('prayerEmpty');
  const prayerForm = document.getElementById('prayerForm');
  const prayerInput = document.getElementById('prayerInput');
  const newPrayerBtn = document.getElementById('newPrayerBtn');
  const cancelPrayer = document.getElementById('cancelPrayer');

  function loadPrayers() {
    try { return JSON.parse(localStorage.getItem('prayers') || '[]'); } catch (e) { return []; }
  }
  function savePrayers(arr) {
    localStorage.setItem('prayers', JSON.stringify(arr));
  }
  let prayers = loadPrayers();

  function fmtPrayerDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  function renderPrayers() {
    prayerListEl.innerHTML = '';
    prayerEmpty.hidden = prayers.length > 0;

    prayers.forEach(p => {
      const li = document.createElement('li');
      li.className = 'prayer-item' + (p.answered ? ' answered' : '');
      li.innerHTML = `
        <div>
          <div class="prayer-text"></div>
          <div class="prayer-meta">${fmtPrayerDate(p.ts)}${p.answered ? ' · Respondida' : ''}</div>
        </div>
        <div class="prayer-actions">
          <button class="prayer-icon-btn answered-btn" title="${p.answered ? 'Marcar como não respondida' : 'Marcar como respondida'}" aria-label="Respondida">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button class="prayer-icon-btn delete-btn" title="Remover" aria-label="Remover">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>
      `;
      li.querySelector('.prayer-text').textContent = p.text;
      li.querySelector('.answered-btn').addEventListener('click', () => {
        p.answered = !p.answered;
        savePrayers(prayers);
        renderPrayers();
        if (p.answered) toast('✦ Glória a Deus pela resposta!');
      });
      li.querySelector('.delete-btn').addEventListener('click', () => {
        if (!confirm('Tem certeza que quer remover esta oração?')) return;
        prayers = prayers.filter(x => x !== p);
        savePrayers(prayers);
        renderPrayers();
        toast('✦ Oração removida');
      });
      prayerListEl.appendChild(li);
    });
  }

  newPrayerBtn.addEventListener('click', () => {
    prayerForm.hidden = !prayerForm.hidden;
    if (!prayerForm.hidden) prayerInput.focus();
  });
  cancelPrayer.addEventListener('click', () => {
    prayerForm.hidden = true;
    prayerInput.value = '';
  });
  prayerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = prayerInput.value.trim();
    if (!t) return;
    prayers.unshift({ text: t, ts: Date.now(), answered: false });
    savePrayers(prayers);
    prayerInput.value = '';
    prayerForm.hidden = true;
    renderPrayers();
    toast('Oração registrada');
  });

  renderPrayers();
}

export function initDevotion() {
  loadDailyDevotion();
  setupPrayerJournal();
  console.log("Devotion Module Initialized");
}
