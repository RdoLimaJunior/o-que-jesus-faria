/* ═══════════════════════════════════════════════
   O QUE JESUS FARIA — App Logic
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  // ════════ PARTICLES ════════
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

  // ════════ TABS ════════
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      tabContents.forEach(c => {
        const isActive = c.id === 'tab-' + target;
        c.classList.toggle('active', isActive);
        if (isActive) c.removeAttribute('hidden');
        else c.setAttribute('hidden', '');
      });
    });
  });

  // ════════ TOAST ════════
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
  }

  // ════════ ELEVENLABS / AUDIO ════════
  const VOICES = [
    { id: 'pqHfZKP75CvOlQylNhV4', name: 'Moisés',    desc: 'Grave e profundo, autoridade divina' },
    { id: 'nPczCjzI2devNBz1zQrb', name: 'João',     desc: 'Sábio e caloroso, o discípulo amado' },
    { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Madalena', desc: 'Suave e maternal, compaixão transformada' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Débora',   desc: 'Serena e contemplativa, profetisa e juíza' },
    { id: 'zikw3FmGal7NOLtzFqg1', name: 'Padre',    desc: 'Voz acolhedora e espiritual, guia de fé' },
  ];

  let elevenLabsVoiceId = localStorage.getItem('elevenLabsVoiceId') || VOICES[0].id;

  // populate voice grid
  const voiceGrid = document.getElementById('voiceGrid');
  function renderVoiceGrid() {
    voiceGrid.innerHTML = '';
    VOICES.forEach(v => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'voice-card' + (v.id === elevenLabsVoiceId ? ' selected' : '');
      card.dataset.id = v.id;
      card.innerHTML = `<div class="voice-card__name">${v.name}</div><div class="voice-card__desc">${v.desc}</div>`;
      card.addEventListener('click', () => {
        elevenLabsVoiceId = v.id;
        renderVoiceGrid();
      });
      voiceGrid.appendChild(card);
    });
  }
  renderVoiceGrid();

  function openSettings() {
    settingsModal.hidden = false;
    refreshStatus();
  }

  function closeSettings() {
    settingsModal.hidden = true;
  }
  document.getElementById('openSettings').addEventListener('click', openSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeSettings();
  });

  function refreshStatus() {
    apiStatus.hidden = false;
    apiStatus.className = 'status-pill success';
    apiStatus.textContent = '✦ Voz divina configurada via Vercel.';
  }

  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    localStorage.setItem('elevenLabsVoiceId', elevenLabsVoiceId);
    refreshStatus();
    toast('Configurações salvas');
    setTimeout(closeSettings, 600);
  });

  document.getElementById('testVoiceBtn').addEventListener('click', () => {
    speakText('A paz esteja com você. Esta é uma demonstração da voz escolhida.', null, elevenLabsApiKey, elevenLabsVoiceId);
  });

  // ════════ SPEECH (browser TTS + ElevenLabs) ════════
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if (synth) {
    try { synth.getVoices(); synth.onvoiceschanged = () => synth.getVoices(); } catch (e) {}
  }

  function getBestBrowserVoice() {
    if (!synth) return null;
    const voices = synth.getVoices();
    const finders = [
      v => /pt[-_]BR/i.test(v.lang) && /Google|Daniel|Ricardo|Felipe/i.test(v.name),
      v => /pt[-_]BR/i.test(v.lang),
      v => /pt/i.test(v.lang),
      v => /en/i.test(v.lang) && /Daniel|Alex|David/i.test(v.name),
      v => true,
    ];
    for (const fn of finders) {
      const found = voices.find(fn);
      if (found) return found;
    }
    return null;
  }

  let currentSource = null;
  let currentAudioCtx = null;
  let currentBtn = null;

  function setBtnPlaying(btn, playing, label) {
    if (!btn) return;
    btn.classList.toggle('playing', !!playing);
    const labelEl = btn.querySelector('.speak-label');
    if (labelEl) labelEl.textContent = playing ? 'Parar' : (label || 'Ouvir em voz alta');
  }

  function stopAll() {
    if (synth && synth.speaking) { try { synth.cancel(); } catch (e) {} }
    if (currentSource) {
      try { currentSource.stop(); } catch (e) {}
      currentSource = null;
    }
    if (currentBtn) {
      const orig = currentBtn.dataset.label || 'Ouvir em voz alta';
      setBtnPlaying(currentBtn, false, orig);
      currentBtn = null;
    }
  }

  async function speakText(text, btn, apiKeyOverride, voiceIdOverride) {
    if (!text) return;

    if (btn && currentBtn === btn) {
      stopAll();
      return;
    }
    stopAll();

    const voice = voiceIdOverride || elevenLabsVoiceId;
    const origLabel = btn ? (btn.querySelector('.speak-label')?.textContent || 'Ouvir em voz alta') : '';
    if (btn) btn.dataset.label = origLabel;

    try {
      const apiKey = window.API_CONFIG?.ELEVEN_LABS_API_KEY;
      if (!apiKey) {
        throw new Error('ElevenLabs API key não configurada');
      }

      if (btn) {
        const labelEl = btn.querySelector('.speak-label');
        if (labelEl) labelEl.textContent = 'Carregando…';
        btn.classList.add('playing');
        currentBtn = btn;
      }

      const res = await fetch(`${window.API_CONFIG.endpoints.elevenLabs}/${voice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      });

      if (!res.ok) {
        throw new Error(`ElevenLabs error ${res.status}`);
      }

      const buf = await res.arrayBuffer();
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuf = await ctx.decodeAudioData(buf);
      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      src.connect(ctx.destination);
      currentSource = src;
      if (btn) setBtnPlaying(btn, true, 'Parar');
      src.onended = () => {
        if (currentSource === src) currentSource = null;
        if (currentBtn === btn) {
          setBtnPlaying(btn, false, origLabel);
          currentBtn = null;
        }
      };
      src.start(0);
    } catch (err) {
      toast('⚠️ Áudio via ElevenLabs falhou. Usando navegador...');
      if (btn) setBtnPlaying(btn, false, origLabel);
      currentBtn = null;
      browserSpeak(text, btn, origLabel);
    }
  }

  function browserSpeak(text, btn, origLabel) {
    if (!synth) { toast('Áudio não suportado neste dispositivo'); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'pt-BR';
    utt.rate = 0.78;
    utt.pitch = 0.85;
    utt.volume = 1.0;
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

  // ════════ WISDOM TAB (Claude) ════════
  const situationEl = document.getElementById('situation');
  const askBtn = document.getElementById('askBtn');
  const clearBtn = document.getElementById('clearBtn');
  const loadingEl = document.getElementById('loading');
  const errorMsgEl = document.getElementById('errorMsg');
  const responseArea = document.getElementById('responseArea');
  const counselTextEl = document.getElementById('counselText');
  const verseTextEl = document.getElementById('verseText');
  const verseRefEl = document.getElementById('verseRef');
  const speakBtn = document.getElementById('speakBtn');

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
      askBtn.disabled = true;
      askBtn.style.opacity = '0.6';
      const btnLabel = askBtn.querySelector('span:last-child');
      if (btnLabel) btnLabel.textContent = 'Buscando…';
      let i = 0;
      loadingTimer = setInterval(() => {
        i = (i + 1) % loadingMsgs.length;
        textEl.textContent = loadingMsgs[i];
      }, 2200);
    } else {
      clearInterval(loadingTimer);
      askBtn.disabled = false;
      askBtn.style.opacity = '1';
      const btnLabel = askBtn.querySelector('span:last-child');
      if (btnLabel) btnLabel.textContent = 'Buscar Sabedoria';
    }
  }

  function clearWisdom() {
    situationEl.value = '';
    responseArea.hidden = true;
    errorMsgEl.hidden = true;
    fullResponseText = '';
    stopAll();
    situationEl.focus();
    // Reset step indicator
    const steps = document.querySelectorAll('#wisdomSteps .step');
    steps[0].classList.add('active');
    steps[1].classList.remove('active');
  }
  clearBtn.addEventListener('click', clearWisdom);

  async function askJesus() {
    const situation = situationEl.value.trim();

    if (!situation) {
      situationEl.focus();
      return;
    }

    responseArea.hidden = true;
    errorMsgEl.hidden = true;
    showLoading(true);
    askBtn.disabled = true;

    try {
      const apiKey = window.API_CONFIG?.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Chave de API do Gemini não configurada');
      }

      const systemPrompt = `Você é uma voz amorosa e sábia que reflete os ensinamentos de Jesus Cristo no Evangelho.

REGRAS:
- Tom caloroso, simples, como um amigo sábio.
- Frases curtas, palavras simples, sem jargões teológicos.
- Em PORTUGUÊS DO BRASIL.

Para qualquer situação:
1. Conselho de como Cristo aconselharia (3 a 4 frases simples).
2. UM versículo bíblico curto dos Evangelhos ou Epístolas.

Responda APENAS em JSON válido (sem markdown, sem comentários):
{"conselho": "...", "versiculo": "...", "referencia": "Livro Cap:Ver"}`;

      const url = new URL(window.API_CONFIG.endpoints.gemini);
      url.searchParams.append('key', apiKey);

      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: { text: systemPrompt }
          },
          contents: {
            parts: { text: situation }
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Status ${res.status}: Erro ao chamar Gemini API`);
      }

      const data = await res.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!generatedText) {
        throw new Error('Resposta vazia do Gemini');
      }

      const clean = String(generatedText).replace(/```json|```/g, '').trim();
      const start = clean.indexOf('{');
      const end = clean.lastIndexOf('}');

      if (start === -1 || end === -1) {
        throw new Error('Formato de resposta inválido');
      }

      const jsonStr = clean.slice(start, end + 1);
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (parseErr) {
        throw new Error('Resposta do Gemini está malformada');
      }

      if (!parsed.conselho || !parsed.versiculo) {
        throw new Error('Resposta do Gemini incompleta');
      }

      counselTextEl.textContent = parsed.conselho || '';
      verseTextEl.textContent = `"${parsed.versiculo || ''}"`;
      verseTextEl.setAttribute('aria-label', `Citação: ${parsed.versiculo || ''}`);

      let readableRef = '';
      if (parsed.referencia) {
        verseRefEl.textContent = `— ${parsed.referencia}`;
        const refMatch = parsed.referencia.match(/(.+?)\s+(\d+):(\d+)/);
        if (refMatch) {
          const [, livro, cap, ver] = refMatch;
          readableRef = `${livro}, capítulo ${cap}, versículo ${ver}`;
          verseRefEl.setAttribute('aria-label', readableRef);
        } else {
          readableRef = parsed.referencia;
        }
      } else {
        verseRefEl.textContent = '';
        verseRefEl.removeAttribute('aria-label');
      }

      responseArea.hidden = false;

      const steps = document.querySelectorAll('#wisdomSteps .step');
      steps[0].classList.remove('active');
      steps[1].classList.add('active');

      fullResponseText = `${parsed.conselho}. Palavra de Deus: ${parsed.versiculo}. ${readableRef}`;
    } catch (err) {
      errorMsgEl.textContent = '✦ Erro: ' + (err.message || 'Não foi possível conectar ao servidor. Verifique sua conexão.');
      errorMsgEl.hidden = false;
    } finally {
      showLoading(false);
      askBtn.disabled = false;
    }
  }
  askBtn.addEventListener('click', askJesus);
  situationEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault(); askJesus();
    }
  });

  speakBtn.addEventListener('click', () => speakText(fullResponseText, speakBtn));

  // ════════ MIC INPUT (Speech-to-Text) ════════
  const micBtn = document.getElementById('micBtn');
  const micHint = document.getElementById('micHint');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let recognizing = false;
  let baseTranscript = '';

  function setMicHint(msg, isError) {
    if (!msg) { micHint.hidden = true; micHint.textContent = ''; return; }
    micHint.hidden = false;
    micHint.textContent = msg;
    micHint.classList.toggle('error', !!isError);
  }

  if (!SR) {
    micBtn.addEventListener('click', () => {
      setMicHint('Seu navegador não suporta entrada por voz. Tente Chrome ou Edge.', true);
    });
  } else {
    recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      recognizing = true;
      micBtn.classList.add('recording');
      micBtn.setAttribute('aria-label', 'Parar gravação');
      baseTranscript = situationEl.value ? situationEl.value.trim() + ' ' : '';
      setMicHint('🎙️ Ouvindo… fale agora');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript + ' ';
        else interim += r[0].transcript;
      }
      if (finalText) {
        baseTranscript = (baseTranscript + finalText).replace(/\s+/g, ' ');
      }
      situationEl.value = (baseTranscript + interim).trim();
    };

    recognition.onerror = (e) => {
      let msg = 'Erro no reconhecimento. Tente novamente.';
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        msg = 'Permita o microfone nas configurações do navegador.';
      } else if (e.error === 'no-speech') {
        msg = 'Não ouvi nada. Toque novamente para falar.';
      } else if (e.error === 'audio-capture') {
        msg = 'Microfone não encontrado.';
      }
      setMicHint(msg, true);
    };

    recognition.onend = () => {
      recognizing = false;
      micBtn.classList.remove('recording');
      micBtn.setAttribute('aria-label', 'Falar em vez de digitar');
      setTimeout(() => {
        if (!recognizing) setMicHint('');
      }, 2500);
    };

    micBtn.addEventListener('click', () => {
      if (recognizing) {
        try { recognition.stop(); } catch (e) {}
        return;
      }
      // stop any TTS playback so it doesn't get captured
      stopAll();
      try {
        recognition.start();
      } catch (e) {
        try { recognition.stop(); } catch (e2) {}
        setTimeout(() => { try { recognition.start(); } catch (e3) {} }, 200);
      }
    });
  }

  // ════════ PSALMS ════════
  let psalmsDb = {};

  // IndexedDB para guardar todos os 150 salmos
  const DB_NAME = 'OQueJesusFaria';
  const STORE_NAME = 'psalms';

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'numero' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function savePsalmToDB(psalm) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(psalm);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      return;
    }
  }

  async function getPsalmFromDB(numero) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(Number(numero));
      return new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result);
      });
    } catch (err) {
      return null;
    }
  }


  // Load psalm text from Bible API
  async function getPsalmText(psalmNumber) {
    const cached = await getPsalmFromDB(psalmNumber);
    if (cached && cached.texto) {
      return cached.texto;
    }

    const psalm = psalmsDb[psalmNumber];
    if (psalm && psalm.text) {
      return psalm.text;
    }

    try {
      const apiKey = window.API_CONFIG?.BIBLE_API_KEY;
      if (!apiKey) {
        return `[Salmo ${psalmNumber} - Chave de API não configurada.]`;
      }

      const searchUrl = `${window.API_CONFIG.endpoints.bible}/search?query=psalm%20${psalmNumber}&limit=1`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'api-key': apiKey }
      });

      if (!searchRes.ok) {
        return `[Salmo ${psalmNumber} - Texto não disponível.]`;
      }

      const searchData = await searchRes.json();
      if (!searchData.results || searchData.results.length === 0) {
        return `[Salmo ${psalmNumber} - Não encontrado.]`;
      }

      const verseId = searchData.results[0].verseId;
      const textUrl = `${window.API_CONFIG.endpoints.bible}/verses/${verseId}?content-type=text`;
      const textRes = await fetch(textUrl, {
        headers: { 'api-key': apiKey }
      });

      if (!textRes.ok) {
        return `[Salmo ${psalmNumber} - Erro ao buscar texto.]`;
      }

      const textData = await textRes.json();
      const texto = textData.data?.content || '';

      if (!texto) {
        return `[Salmo ${psalmNumber} - Texto vazio.]`;
      }

      await savePsalmToDB({
        numero: psalmNumber,
        titulo: psalm?.titulo || `Salmo ${psalmNumber}`,
        texto: texto,
        tipo: psalm?.tipo || 'Desconhecido',
        autor: psalm?.autor || 'Desconhecido'
      });

      return texto;
    } catch (err) {
      return `[Salmo ${psalmNumber} - Erro ao carregar.]`;
    }
  }

  // Load psalms metadata (titles, authors, types only)
  async function loadPsalmsMetadata() {
    try {
      const res = await fetch('/salmos.json');
      if (!res.ok) throw new Error('Failed to load salmos.json');
      const { salmos } = await res.json();

      salmos.forEach(s => {
        psalmsDb[s.numero] = {
          titulo: s.titulo,
          tipo: s.tipo,
          autor: s.autor,
          intro: `${s.titulo}\n\nAutor: ${s.autor}\nTipo: ${s.tipo}\n\nEste Salmo oferece consolo, força e esperança através da Palavra de Deus.`,
          text: s.texto || null,
          numero: s.numero
        };
      });

      const select = document.getElementById('psalmSelect');
      select.innerHTML = '<option value="">— Escolha um Salmo para Meditar —</option>';
      salmos.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.numero;
        opt.textContent = `Salmo ${s.numero} — ${s.titulo}`;
        select.appendChild(opt);
      });
    } catch (err) {
      // silently fail if metadata cannot load
    }
  }

  loadPsalmsMetadata();

  const psalmSelect = document.getElementById('psalmSelect');
  const psalmContent = document.getElementById('psalmContent');
  const psalmIntro = document.getElementById('psalmIntro');
  const psalmText = document.getElementById('psalmText');
  const psalmSpeakBtn = document.getElementById('psalmSpeakBtn');
  const reflectionEl = document.getElementById('reflection');
  const saveReflectionBtn = document.getElementById('saveReflectionBtn');
  const saveConfirm = document.getElementById('saveConfirm');

  let currentPsalmText = '';

  psalmSelect.addEventListener('change', async () => {
    const num = psalmSelect.value;
    if (!num) { psalmContent.hidden = true; return; }

    psalmContent.hidden = false;
    psalmText.textContent = '⏳ Carregando Salmo...';

    const p = psalmsDb[num];
    psalmIntro.textContent = p.intro;

    // Get text from JSON or Bible API
    const text = await getPsalmText(num);
    psalmText.textContent = text;
    currentPsalmText = text;

    saveConfirm.hidden = true;
    const saved = localStorage.getItem(`psalm_${num}_reflection`) || '';
    reflectionEl.value = saved;
  });

  psalmSpeakBtn.addEventListener('click', () => speakText(currentPsalmText, psalmSpeakBtn));

  saveReflectionBtn.addEventListener('click', () => {
    const text = reflectionEl.value.trim();
    const num = psalmSelect.value;
    if (!num) return;
    if (!text) { toast('Escreva sua reflexão antes de salvar'); return; }
    localStorage.setItem(`psalm_${num}_reflection`, text);
    saveConfirm.hidden = false;
    toast('✦ Reflexão guardada');
  });

  // ════════ DEVOTION TAB ════════
  const DEVOTIONS = [
    { v: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.', r: 'Mateus 11:28', re: 'Cristo não pede perfeição — pede presença. Hoje, leve seu cansaço a Ele e descanse na sua promessa de alívio.' },
    { v: 'Não andeis ansiosos por coisa alguma; em tudo, pela oração e súplicas com ações de graças, sejam conhecidas, diante de Deus, as vossas petições.', r: 'Filipenses 4:6', re: 'A ansiedade se dissolve quando trocamos o controle pelo louvor. Hoje, pratique transformar uma preocupação em oração agradecida.' },
    { v: 'O Senhor é o meu pastor, nada me faltará.', r: 'Salmos 23:1', re: 'Antes que o dia comece a pedir tanto de você, lembre: você já tem o Pastor. Tudo o que vier, vem com Ele a seu lado.' },
    { v: 'Amai-vos cordialmente uns aos outros com amor fraternal, preferindo-vos em honra uns aos outros.', r: 'Romanos 12:10', re: 'Hoje, escolha uma pessoa para honrar com palavras simples e verdadeiras. Pequenos gestos constroem o Reino.' },
    { v: 'Bem-aventurados os puros de coração, porque verão a Deus.', r: 'Mateus 5:8', re: 'A pureza de coração não é ausência de erro — é direção. Hoje, ofereça a Cristo um coração honesto e veja como Ele se revela.' },
    { v: 'Tudo posso naquele que me fortalece.', r: 'Filipenses 4:13', re: 'A força de Cristo não elimina o desafio — ela acompanha você dentro dele. Comece o que parece impossível, dando o primeiro passo.' },
    { v: 'Em verdade, em verdade vos digo: aquele que ouve a minha palavra e crê naquele que me enviou tem a vida eterna.', r: 'João 5:24', re: 'A vida eterna começa hoje, na escolha de ouvir e confiar. Que palavra de Cristo você pode escutar com mais atenção neste dia?' }
  ];

  function dayIndex() {
    const start = new Date(2026, 0, 1);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return ((diff % DEVOTIONS.length) + DEVOTIONS.length) % DEVOTIONS.length;
  }
  function formatDate() {
    const d = new Date();
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const devotion = DEVOTIONS[dayIndex()];
  document.getElementById('devotionDate').textContent = formatDate();
  document.getElementById('devotionVerse').textContent = devotion.v;

  const devotionRefEl = document.getElementById('devotionRef');
  devotionRefEl.textContent = `— ${devotion.r}`;

  const refMatch = devotion.r.match(/(.+?)\s+(\d+):(\d+)/);
  let readableDevotionRef = devotion.r;
  if (refMatch) {
    const [, livro, cap, ver] = refMatch;
    readableDevotionRef = `${livro}, capítulo ${cap}, versículo ${ver}`;
    devotionRefEl.setAttribute('aria-label', readableDevotionRef);
  }

  document.getElementById('devotionReflection').textContent = devotion.re;

  const devotionSpeakBtn = document.getElementById('devotionSpeakBtn');
  devotionSpeakBtn.addEventListener('click', () => {
    const txt = `Versículo do dia. ${devotion.v}. ${readableDevotionRef}. Reflexão. ${devotion.re}`;
    speakText(txt, devotionSpeakBtn);
  });

  // ════════ PRAYER JOURNAL ════════
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
    if (prayers.length === 0) {
      prayerEmpty.hidden = false;
      return;
    }
    prayerEmpty.hidden = true;
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
  renderPrayers();

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

  // ════════ PWA INSTALL ════════
  let deferredInstall = null;
  const installBanner = document.getElementById('installBanner');
  const installBtn = document.getElementById('installBtn');
  const installClose = document.getElementById('installClose');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstall = e;
    if (localStorage.getItem('installDismissed') !== '1') {
      installBanner.hidden = false;
    }
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredInstall) { installBanner.hidden = true; return; }
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    deferredInstall = null;
    installBanner.hidden = true;
    if (outcome === 'accepted') toast('✦ Aplicativo instalado');
  });
  installClose.addEventListener('click', () => {
    installBanner.hidden = true;
    localStorage.setItem('installDismissed', '1');
  });

  refreshStatus();
})();
