/* ═══════════════════════════════════════════════
   O QUE JESUS FARIA — App Logic
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  // Load environment variables from /api/env (Vercel)
  async function loadEnvVars() {
    try {
      const response = await fetch('/api/env');
      if (response.ok) {
        const env = await response.json();
        window.API_CONFIG.GROQ_API_KEY = env.GROQ_API_KEY || window.API_CONFIG.GROQ_API_KEY;
        window.API_CONFIG.NVIDIA_API_KEY = env.NVIDIA_API_KEY || window.API_CONFIG.NVIDIA_API_KEY;
        window.API_CONFIG.BIBLIAAPI_KEY = env.BIBLIAAPI_KEY || window.API_CONFIG.BIBLIAAPI_KEY;
      }
    } catch (e) {
      // Fallback to config.local.js values (local dev)
      console.log('Using local config');
    }
  }

  // Load env vars immediately
  loadEnvVars();

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

  // ════════ NVIDIA AUDIO ════════
  // Voz padrão: "Padre" (voz acolhedora e espiritual, guia de fé)

  function openSettings() {
    settingsModal.hidden = false;
    refreshStatus();
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      langSelect.value = window.I18N.currentLang;
    }
  }

  function closeSettings() {
    settingsModal.hidden = true;
  }

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === '1';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      darkModeToggle.checked = true;
    }
  }
  initDarkMode();

  darkModeToggle?.addEventListener('change', (e) => {
    const isDark = e.target.checked;
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('darkMode', '1');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('darkMode', '0');
    }
  });

  // ════════ NOTIFICATIONS ════════
  async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  function scheduleDailyNotification() {
    if (!('Notification' in window)) return;

    function sendNotif() {
      const devotions = DEVOTIONS;
      const devotion = devotions[dayIndex()];
      if (Notification.permission === 'granted') {
        new Notification('Versículo do Dia ✦', {
          body: `${devotion.v}\n— ${devotion.r}`,
          icon: '✦',
          tag: 'daily-verse',
          requireInteraction: false
        });
      }
    }

    // Schedule for 7:00 AM
    function scheduleNext() {
      const now = new Date();
      const target = new Date();
      target.setHours(7, 0, 0, 0);

      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();
      setTimeout(() => {
        sendNotif();
        scheduleNext();
      }, delay);
    }

    scheduleNext();
  }

  const notificationsToggle = document.getElementById('notificationsToggle');
  const isNotifEnabled = localStorage.getItem('notificationsEnabled') === '1';
  if (notificationsToggle) {
    notificationsToggle.checked = isNotifEnabled;
    notificationsToggle.addEventListener('change', async (e) => {
      if (e.target.checked) {
        const granted = await requestNotificationPermission();
        if (granted) {
          localStorage.setItem('notificationsEnabled', '1');
          scheduleDailyNotification();
          toast('🔔 Notificações ativadas para 7:00');
        } else {
          e.target.checked = false;
          toast('❌ Permissão de notificações recusada');
        }
      } else {
        localStorage.setItem('notificationsEnabled', '0');
        toast('🔔 Notificações desativadas');
      }
    });
  }

  if (isNotifEnabled) {
    requestNotificationPermission().then(granted => {
      if (granted) {
        scheduleDailyNotification();
      }
    });
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
    refreshStatus();
    toast(window.I18N.get('settings-saved'));
    setTimeout(closeSettings, 600);
  });

  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      window.I18N.setLanguage(e.target.value);
    });
  }

  document.getElementById('testVoiceBtn').addEventListener('click', () => {
    speakText('A paz esteja com você. Esta é uma demonstração da voz Padre do Nvidia ResembleAI.');
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

  async function speakText(text, btn) {
    if (!text) return;

    if (btn && currentBtn === btn) {
      stopAll();
      return;
    }
    stopAll();

    const origLabel = btn ? (btn.querySelector('.speak-label')?.textContent || 'Ouvir em voz alta') : '';
    if (btn) btn.dataset.label = origLabel;

    try {
      if (btn) {
        const labelEl = btn.querySelector('.speak-label');
        if (labelEl) labelEl.textContent = 'Carregando…';
        btn.classList.add('playing');
        currentBtn = btn;
      }

      // Call Vercel Function (proxies Nvidia API)
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          language: window.API_CONFIG.audio.language,
          voice_name: window.API_CONFIG.audio.voice,
          encoding: window.API_CONFIG.audio.encoding,
          sample_rate_hz: window.API_CONFIG.audio.sampleRate,
          rate: window.API_CONFIG.audio.rate,
          emotion_control: window.API_CONFIG.audio.emotion
        })
      });

      if (!res.ok) {
        // Fallback to Web Speech if /api/synthesize fails (local dev, Vercel Function not available)
        if (btn) setBtnPlaying(btn, false, origLabel);
        currentBtn = null;
        console.warn('Nvidia Synthesis unavailable, using Web Speech API fallback');
        browserSpeak(text, btn, origLabel);
        return;
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      if (btn) setBtnPlaying(btn, true, 'Parar');
      currentSource = audio;

      audio.onended = () => {
        if (currentSource === audio) currentSource = null;
        if (currentBtn === btn) {
          setBtnPlaying(btn, false, origLabel);
          currentBtn = null;
        }
      };

      audio.play();
    } catch (err) {
      console.error('Audio Error:', err);
      toast('⚠️ Áudio via Nvidia falhou. Usando navegador...');
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

  async function callGroqAPI(situation, systemPrompt) {
    const apiKey = window.API_CONFIG?.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Chave de API do Groq não configurada');
    }

    const requestBody = {
      model: window.API_CONFIG.models.groq,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: situation }
      ],
      temperature: 0.7,
      max_tokens: 1024
    };

    console.log('Groq Request:', {
      url: window.API_CONFIG?.endpoints?.groq,
      model: window.API_CONFIG.models.groq,
      hasApiKey: !!apiKey
    });

    const res = await fetch(window.API_CONFIG?.endpoints?.groq, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error('❌ Groq API Error Details:', {
        status: res.status,
        statusText: res.statusText,
        error: errorData
      });
      try {
        const errorJson = JSON.parse(errorData);
        console.error('Error JSON:', errorJson);
      } catch (e) {}
      throw new Error(`Status ${res.status}: ${errorData || 'Erro ao chamar Groq API'}`);
    }

    const data = await res.json();
    console.log('✅ Groq Response:', data);
    return data.choices?.[0]?.message?.content || '';
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
    askBtn.disabled = true;

    try {
      const systemPrompt = `Você é uma voz amorosa e sábia que reflete os ensinamentos de Jesus Cristo no Evangelho.

REGRAS:
- Tom caloroso, simples, como um amigo sábio.
- Frases curtas, palavras simples, sem jargões teológicos.
- Em PORTUGUÊS DO BRASIL.

Para qualquer situação:
1. Conselho de como Cristo aconselharia (3 a 4 frases simples).
2. UM versículo bíblico apropriado (pode ser de qualquer livro: Evangelhos, Salmos, Provérbios, etc).

Responda APENAS em JSON válido (sem markdown, sem comentários):
{"conselho": "...", "versiculo": "...", "referencia": "Livro Cap:Ver"}`;

      const apiKey = window.API_CONFIG?.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('Chave de API do Groq não configurada');
      }

      const generatedText = await callGroqAPI(situation, systemPrompt);

      if (!generatedText) {
        throw new Error('Resposta vazia do Groq');
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
        throw new Error('Resposta está malformada');
      }

      if (!parsed.conselho || !parsed.versiculo) {
        throw new Error('Resposta incompleta');
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

  // ════════ WhatsApp-STYLE MESSAGE INPUT ════════
  const msgSendBtn = document.getElementById('msgSendBtn');
  const msgMicIcon = document.querySelector('.msg-mic-icon');
  const msgSendIcon = document.querySelector('.msg-send-icon');
  const recordingIndicator = document.getElementById('recordingIndicator');
  const recordingTimer = document.getElementById('recordingTimer');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  let isRecording = false;
  let recordingStartTime = null;
  let recordingTimerInterval = null;
  let recognition = null;
  let lastYPosition = 0;

  // Update button state based on input
  function updateSendButton() {
    const hasText = situationEl.value.trim().length > 0;
    if (hasText) {
      msgMicIcon.style.display = 'none';
      msgSendIcon.style.display = 'block';
      msgSendBtn.classList.remove('recording');
    } else {
      msgMicIcon.style.display = 'block';
      msgSendIcon.style.display = 'none';
    }
  }

  situationEl.addEventListener('input', updateSendButton);
  updateSendButton();

  if (SR) {
    recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      isRecording = true;
      recordingStartTime = Date.now();
      recordingIndicator.hidden = false;
      msgSendBtn.classList.add('recording');

      recordingTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        recordingTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }, 100);
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          situationEl.value = (situationEl.value + ' ' + transcript).trim();
        } else {
          interim += transcript + ' ';
        }
      }
      updateSendButton();
    };

    recognition.onend = () => {
      isRecording = false;
      recordingIndicator.hidden = true;
      msgSendBtn.classList.remove('recording');
      clearInterval(recordingTimerInterval);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isRecording = false;
      recordingIndicator.hidden = true;
      msgSendBtn.classList.remove('recording');
      clearInterval(recordingTimerInterval);
      toast(`❌ Erro: ${event.error}`);
    };
  }

  // Send button click handler
  msgSendBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const hasText = situationEl.value.trim().length > 0;

    if (isRecording) {
      // If recording, stop and auto-send
      recognition.stop();
      setTimeout(() => {
        if (situationEl.value.trim()) {
          askJesus();
        }
      }, 200);
    } else if (hasText) {
      // Send text message
      askJesus();
    } else {
      // Start recording
      if (recognition) {
        lastYPosition = e.clientY;
        recognition.start();
      }
    }
  });

  // Mouse events for hold-to-record on mic
  msgSendBtn?.addEventListener('mousedown', (e) => {
    if (!situationEl.value.trim() && recognition && !isRecording) {
      e.preventDefault();
      lastYPosition = e.clientY;
      recognition.start();
    }
  });

  msgSendBtn?.addEventListener('mousemove', (e) => {
    if (isRecording) {
      const moveDistance = lastYPosition - e.clientY;
      const hint = document.querySelector('.recording-hint');
      if (hint) {
        hint.textContent = moveDistance > 50 ? '↑ Solte para cancelar' : '↑ Deslize para cima para cancelar';
      }
    }
  });

  msgSendBtn?.addEventListener('mouseup', (e) => {
    if (isRecording) {
      const moveDistance = lastYPosition - e.clientY;
      if (moveDistance > 50) {
        // Cancel
        recognition.abort();
        situationEl.value = '';
        toast('Gravação cancelada');
        updateSendButton();
      } else {
        // Auto-send
        recognition.stop();
      }
    }
  });

  // Touch events
  msgSendBtn?.addEventListener('touchstart', (e) => {
    if (!situationEl.value.trim() && recognition && !isRecording) {
      e.preventDefault();
      lastYPosition = e.touches[0].clientY;
      recognition.start();
    }
  });

  msgSendBtn?.addEventListener('touchmove', (e) => {
    if (isRecording && e.touches.length > 0) {
      const moveDistance = lastYPosition - e.touches[0].clientY;
      const hint = document.querySelector('.recording-hint');
      if (hint) {
        hint.textContent = moveDistance > 50 ? '↑ Solte para cancelar' : '↑ Deslize para cima para cancelar';
      }
    }
  });

  msgSendBtn?.addEventListener('touchend', (e) => {
    if (isRecording && e.changedTouches.length > 0) {
      const moveDistance = lastYPosition - e.changedTouches[0].clientY;
      if (moveDistance > 50) {
        recognition.abort();
        situationEl.value = '';
        toast('Gravação cancelada');
        updateSendButton();
      } else {
        recognition.stop();
      }
    }
  });

  // ════════ MIC INPUT (Speech-to-Text) - OLD ════════
  const micBtn = document.getElementById('micBtn');
  const micHint = document.getElementById('micHint');

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


  // Load psalm text from BíbliaAPI.com.br (Gratuito & Otimizado para PT-BR)
  async function getPsalmText(psalmNumber) {
    // 1. Verificar cache local (IndexedDB) - rápido & offline
    const cached = await getPsalmFromDB(psalmNumber);
    if (cached && cached.texto) {
      return cached.texto;
    }

    try {
      // 2. Buscar de /api/psalms (Vercel Function proxy para BíbliaAPI.com.br)
      const res = await fetch(`/api/psalms?number=${psalmNumber}&version=ACF`);

      if (!res.ok) {
        return `[Salmo ${psalmNumber} - Texto não disponível.]`;
      }

      const data = await res.json();
      const texto = data.text || '';

      if (!texto) {
        return `[Salmo ${psalmNumber} - Texto vazio.]`;
      }

      // 3. Cachear em IndexedDB para uso offline
      await savePsalmToDB({
        numero: psalmNumber,
        titulo: `Salmo ${psalmNumber}`,
        texto: texto,
        tipo: 'Salmo',
        autor: 'Davi (maioria)',
        referencia: data.reference || `Salmos ${psalmNumber}`,
        versao: data.version || 'ACF'
      });

      return texto;
    } catch (err) {
      // Se falhar e tiver em cache: usar cache mesmo que antigo
      const fallback = await getPsalmFromDB(psalmNumber);
      if (fallback && fallback.texto) {
        return fallback.texto + '\n\n[⚠️ Usando versão em cache - sem conexão]';
      }
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

  // Devotion reflection save
  const devotionReflectionInput = document.getElementById('devotionReflectionInput');
  const devotionSaveReflectionBtn = document.getElementById('devotionSaveReflectionBtn');
  const devotionSaveConfirm = document.getElementById('devotionSaveConfirm');

  if (devotionSaveReflectionBtn) {
    devotionSaveReflectionBtn.addEventListener('click', () => {
      const text = devotionReflectionInput.value.trim();
      if (!text) { toast('Escreva sua meditação antes de salvar'); return; }

      const reflections = getReflectionsData();
      reflections.unshift({
        ref: devotion.r,
        text: text,
        ts: Date.now(),
        favorite: false
      });
      saveReflectionsData(reflections);
      devotionSaveConfirm.hidden = false;
      devotionReflectionInput.value = '';
      toast('✦ Meditação guardada');
      setTimeout(() => { devotionSaveConfirm.hidden = true; }, 2000);
    });
  }

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

  // ════════ ABA 2: BIBLE EXPLORER ════════
  let currentBibleVersion = 'ACF';
  let currentRandomVerse = null;

  const bibleVersionSelect = document.getElementById('bibleVersionSelect') || (() => {
    const sel = document.createElement('select');
    sel.id = 'bibleVersionSelect';
    sel.className = 'bible-select';
    sel.innerHTML = '<option value="ACF">ACF - Almeida Corrigida</option><option value="ARA">ARA - Almeida Revista</option><option value="NVI">NVI - Nova Versão</option>';
    document.querySelector('[data-tab="bible"]')?.insertAdjacentElement('afterbegin', sel);
    return sel;
  })();

  async function getRandomVerse() {
    try {
      const res = await fetch(`/api/random?version=${currentBibleVersion}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      currentRandomVerse = data;
      return data;
    } catch (err) {
      console.error('Random verse error:', err);
      toast('Erro ao carregar versículo aleatório');
      return null;
    }
  }

  async function searchVerses(query, limit = 10) {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&version=${currentBibleVersion}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.error('Search error:', err);
      toast('Erro ao buscar versículos');
      return [];
    }
  }

  async function getBooks() {
    try {
      const res = await fetch(`/api/books?version=${currentBibleVersion}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data.books || [];
    } catch (err) {
      console.error('Books error:', err);
      return [];
    }
  }

  // ════════ ABA 4: HABITS ════════
  const HABITS_KEY = 'habits_data';

  function getHabitsData() {
    try { return JSON.parse(localStorage.getItem(HABITS_KEY) || '{}'); } catch (e) { return {}; }
  }

  function saveHabitsData(data) {
    localStorage.setItem(HABITS_KEY, JSON.stringify(data));
  }

  function getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  function getMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function updateHabitsDisplay() {
    const data = getHabitsData();
    const today = getTodayKey();
    const month = getMonthKey();

    // Church check-ins this month
    const churchCount = Object.keys(data).filter(k => k.startsWith(month + '-') && data[k].church).length;
    const churchEl = document.getElementById('churchCount');
    if (churchEl) churchEl.textContent = `${churchCount} vezes este mês`;

    // Bible reading this week
    const weekDays = 7;
    let bibleCount = 0;
    for (let i = 0; i < weekDays; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (data[key]?.bible) bibleCount++;
    }
    const bibleEl = document.getElementById('bibleCount');
    if (bibleEl) bibleEl.textContent = `${bibleCount}/5 dias esta semana`;
    const bibleProgress = document.getElementById('bibleProgress');
    if (bibleProgress) bibleProgress.style.width = `${(bibleCount / 5) * 100}%`;

    // Prayer this week
    let prayerCount = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (data[key]?.prayer) prayerCount++;
    }
    const prayerEl = document.getElementById('prayerCount');
    if (prayerEl) prayerEl.textContent = `${prayerCount}/7 dias esta semana`;
    const prayerProgress = document.getElementById('prayerProgress');
    if (prayerProgress) prayerProgress.style.width = `${(prayerCount / 7) * 100}%`;

    // Stats
    const statMsg = document.getElementById('statMessage');
    if (churchCount > 0 || bibleCount > 0 || prayerCount > 0) {
      if (statMsg) statMsg.textContent = '✦ Você está crescendo espiritualmente! 🌱';
    }
  }

  document.getElementById('checkInChurch')?.addEventListener('click', () => {
    const data = getHabitsData();
    const today = getTodayKey();
    if (!data[today]) data[today] = {};
    data[today].church = true;
    saveHabitsData(data);
    updateHabitsDisplay();
    toast('✦ Presença na Igreja registrada');
  });

  document.getElementById('checkInBible')?.addEventListener('click', () => {
    const data = getHabitsData();
    const today = getTodayKey();
    if (!data[today]) data[today] = {};
    data[today].bible = true;
    saveHabitsData(data);
    updateHabitsDisplay();
    toast('✦ Leitura Bíblica registrada');
  });

  document.getElementById('checkInPrayer')?.addEventListener('click', () => {
    const data = getHabitsData();
    const today = getTodayKey();
    if (!data[today]) data[today] = {};
    data[today].prayer = true;
    saveHabitsData(data);
    updateHabitsDisplay();
    toast('✦ Oração registrada');
  });

  updateHabitsDisplay();

  // ════════ ABA 5: REFLECTIONS ════════
  const REFLECTIONS_KEY = 'reflections_data';

  function getReflectionsData() {
    try { return JSON.parse(localStorage.getItem(REFLECTIONS_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveReflectionsData(data) {
    localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(data));
  }

  function renderReflections(filter = '') {
    const reflections = getReflectionsData();
    const list = document.getElementById('reflectionsList');
    const empty = document.getElementById('reflectionsEmpty');

    let filtered = reflections;
    if (filter === 'favorite') {
      filtered = reflections.filter(r => r.favorite);
    } else if (filter === 'week') {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      filtered = reflections.filter(r => r.ts > weekAgo);
    } else if (filter === 'month') {
      const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      filtered = reflections.filter(r => r.ts > monthAgo);
    }

    if (!list) return;

    list.innerHTML = '';
    if (filtered.length === 0) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    filtered.forEach(r => {
      const li = document.createElement('li');
      li.className = 'reflection-item';
      const date = new Date(r.ts).toLocaleDateString('pt-BR');
      li.innerHTML = `
        <div class="reflection-header">
          <div class="reflection-meta">
            <strong>${date}</strong> · ${r.ref}
          </div>
          <button class="btn-icon" aria-label="Favoritar">${r.favorite ? '♥' : '♡'}</button>
        </div>
        <p class="reflection-text">${r.text.substring(0, 100)}...</p>
      `;
      li.querySelector('.btn-icon').addEventListener('click', () => {
        r.favorite = !r.favorite;
        saveReflectionsData(reflections);
        renderReflections(filter);
      });
      list.appendChild(li);
    });
  }

  document.getElementById('reflectionFilter')?.addEventListener('change', (e) => {
    renderReflections(e.target.value);
  });

  renderReflections();

  // ════════ CHALLENGE: 30 DAYS ════════
  const CHALLENGE_KEY = 'challenge_30days';

  function getChallengeData() {
    try { return JSON.parse(localStorage.getItem(CHALLENGE_KEY) || '{}'); } catch (e) { return {}; }
  }

  function saveChallengeData(data) {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(data));
  }

  function updateChallengeDisplay() {
    const data = getChallengeData();
    if (!data.startDate) {
      document.getElementById('startChallengeBtn').hidden = false;
      document.getElementById('resetChallengeBtn').hidden = true;
      return;
    }

    document.getElementById('startChallengeBtn').hidden = true;
    document.getElementById('resetChallengeBtn').hidden = false;

    const startDate = new Date(data.startDate);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(daysPassed, 30);
    const isComplete = daysPassed >= 30 && data.days?.filter(d => d).length === 30;

    document.getElementById('challengeDay').textContent = isComplete ? '✦ 30' : currentDay;
    document.getElementById('challengeProgress').textContent = `${Math.round((currentDay / 30) * 100)}%`;
    document.getElementById('challengeProgressBar').style.width = `${(currentDay / 30) * 100}%`;

    const daysContainer = document.getElementById('challengeDays');
    if (daysContainer) {
      daysContainer.innerHTML = '';
      for (let i = 0; i < 30; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'challenge-day';
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dayKey = d.toISOString().split('T')[0];
        const isDone = data.days?.[i];

        dayEl.textContent = (i + 1);
        dayEl.classList.toggle('done', isDone);
        dayEl.classList.toggle('today', dayKey === getTodayKey());
        dayEl.title = d.toLocaleDateString('pt-BR');
        daysContainer.appendChild(dayEl);
      }
    }
  }

  document.getElementById('startChallengeBtn')?.addEventListener('click', () => {
    const data = getChallengeData();
    if (data.startDate) return;

    data.startDate = new Date().toISOString();
    data.days = new Array(30).fill(false);
    saveChallengeData(data);
    updateChallengeDisplay();
    toast('🎯 Desafio 30 Dias começou! Leia a Bíblia todos os dias.');
  });

  document.getElementById('resetChallengeBtn')?.addEventListener('click', () => {
    if (confirm('Tem certeza? Seu progresso será perdido.')) {
      localStorage.removeItem(CHALLENGE_KEY);
      updateChallengeDisplay();
      toast('Desafio resetado');
    }
  });

  // Mark day as complete when user checks in Bible
  const origCheckInBible = document.getElementById('checkInBible')?.onclick;
  document.getElementById('checkInBible')?.addEventListener('click', () => {
    const data = getChallengeData();
    if (data.startDate) {
      const today = getTodayKey();
      const startDate = new Date(data.startDate);
      const daysPassed = Math.floor((new Date(today) - startDate) / (1000 * 60 * 60 * 24));

      if (daysPassed >= 0 && daysPassed < 30) {
        data.days[daysPassed] = true;
        saveChallengeData(data);
        updateChallengeDisplay();
      }
    }
  });

  updateChallengeDisplay();

  // ════════ PRAYER GROUPS ════════
  const GROUPS_KEY = 'prayer_groups';
  const CURRENT_GROUP_KEY = 'current_group';

  function getGroups() {
    try { return JSON.parse(localStorage.getItem(GROUPS_KEY) || '{}'); } catch (e) { return {}; }
  }

  function saveGroups(groups) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }

  function getCurrentGroup() {
    return localStorage.getItem(CURRENT_GROUP_KEY);
  }

  function generateGroupCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  function updateGroupUI() {
    const groupCode = getCurrentGroup();
    const groups = getGroups();
    const groupSection = document.getElementById('groupSection');
    const currentGroupDiv = document.getElementById('currentGroup');
    const sharedSection = document.getElementById('sharedReflectionsSection');
    const shareSection = document.getElementById('shareSection');

    if (groupCode && groups[groupCode]) {
      const group = groups[groupCode];
      const nameDisplay = document.getElementById('groupNameDisplay');
      const codeDisplay = document.getElementById('groupCodeDisplay');
      const membersCount = document.getElementById('groupMembersCount');

      if (nameDisplay) nameDisplay.textContent = group.name;
      if (codeDisplay) codeDisplay.textContent = `Código: ${groupCode}`;
      if (membersCount) membersCount.textContent = `Membros: ${group.members?.length || 1}`;

      if (currentGroupDiv) currentGroupDiv.hidden = false;
      if (sharedSection) sharedSection.hidden = false;
      if (shareSection) shareSection.hidden = false;

      renderSharedReflections(groupCode);
      updateReflectionsToShare();
    } else {
      if (currentGroupDiv) currentGroupDiv.hidden = true;
      if (sharedSection) sharedSection.hidden = true;
      if (shareSection) shareSection.hidden = true;
    }
  }

  function renderSharedReflections(groupCode) {
    const groups = getGroups();
    const group = groups[groupCode];
    const list = document.getElementById('sharedReflectionsList');
    const empty = document.getElementById('sharedReflectionsEmpty');

    if (!list) return;

    list.innerHTML = '';
    const reflections = group.sharedReflections || [];

    if (reflections.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    reflections.forEach(r => {
      const li = document.createElement('li');
      li.className = 'shared-reflection-item';
      const date = new Date(r.ts).toLocaleDateString('pt-BR');
      li.innerHTML = `
        <div class="shared-reflection-meta">${date} · ${r.ref}</div>
        <p class="shared-reflection-text">${r.text}</p>
      `;
      list.appendChild(li);
    });
  }

  function updateReflectionsToShare() {
    const select = document.getElementById('reflectionsToShare');
    if (!select) return;

    const reflections = getReflectionsData();
    select.innerHTML = '<option value="">— Escolha uma reflexão —</option>';
    reflections.forEach((r, idx) => {
      const date = new Date(r.ts).toLocaleDateString('pt-BR');
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${date}: ${r.text.substring(0, 40)}...`;
      select.appendChild(opt);
    });
  }

  document.getElementById('createGroupBtn')?.addEventListener('click', () => {
    const form = document.getElementById('createGroupForm');
    const joinForm = document.getElementById('joinGroupForm');
    if (form) form.hidden = false;
    if (joinForm) joinForm.hidden = true;
  });

  document.getElementById('joinGroupBtn')?.addEventListener('click', () => {
    const form = document.getElementById('joinGroupForm');
    const createForm = document.getElementById('createGroupForm');
    if (form) form.hidden = false;
    if (createForm) createForm.hidden = true;
  });

  document.getElementById('cancelCreateGroup')?.addEventListener('click', () => {
    const form = document.getElementById('createGroupForm');
    if (form) form.hidden = true;
  });

  document.getElementById('cancelJoinGroup')?.addEventListener('click', () => {
    const form = document.getElementById('joinGroupForm');
    if (form) form.hidden = true;
  });

  document.getElementById('createGroupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('groupNameInput');
    const descInput = document.getElementById('groupDescInput');
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();

    if (!name) return;

    const code = generateGroupCode();
    const groups = getGroups();
    groups[code] = {
      name, desc, code,
      createdAt: new Date().toISOString(),
      members: [{ id: 'me', joined: new Date().toISOString() }],
      sharedReflections: []
    };

    saveGroups(groups);
    localStorage.setItem(CURRENT_GROUP_KEY, code);

    const form = document.getElementById('createGroupForm');
    if (form) form.hidden = true;
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';

    updateGroupUI();
    toast(`✦ Grupo "${name}" criado! Código: ${code}`);
  });

  document.getElementById('joinGroupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const codeInput = document.getElementById('groupCodeInput');
    const code = codeInput.value.trim().toUpperCase();

    if (!code) return;

    const groups = getGroups();
    if (!groups[code]) {
      toast('❌ Código de grupo inválido');
      return;
    }

    groups[code].members.push({ id: 'member-' + Date.now(), joined: new Date().toISOString() });
    saveGroups(groups);
    localStorage.setItem(CURRENT_GROUP_KEY, code);

    const form = document.getElementById('joinGroupForm');
    if (form) form.hidden = true;
    if (codeInput) codeInput.value = '';

    updateGroupUI();
    toast(`✦ Você entrou em "${groups[code].name}"`);
  });

  document.getElementById('leaveGroupBtn')?.addEventListener('click', () => {
    if (confirm('Tem certeza que quer sair do grupo?')) {
      localStorage.removeItem(CURRENT_GROUP_KEY);
      updateGroupUI();
      toast('Você saiu do grupo');
    }
  });

  document.getElementById('shareReflectionBtn')?.addEventListener('click', () => {
    const select = document.getElementById('reflectionsToShare');
    const idx = select.value;

    if (!idx) {
      toast('Escolha uma reflexão para compartilhar');
      return;
    }

    const reflections = getReflectionsData();
    const reflection = reflections[idx];
    const groupCode = getCurrentGroup();
    const groups = getGroups();
    const group = groups[groupCode];

    if (!group) return;

    group.sharedReflections = group.sharedReflections || [];
    group.sharedReflections.unshift({
      ref: reflection.ref,
      text: reflection.text,
      ts: Date.now()
    });

    saveGroups(groups);
    renderSharedReflections(groupCode);
    toast('✦ Reflexão compartilhada com o grupo (anonimamente)');
  });

  updateGroupUI();

  refreshStatus();
})();
