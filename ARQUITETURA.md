# 🏗️ ARQUITETURA TÉCNICA — "O Que Jesus Faria?"

## 📡 FLUXO COMPLETO DE DADOS

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO                                   │
└────────────┬────────────────────────────┬────────────────────┘
             │                            │
    ┌────────▼────────┐         ┌─────────▼──────────┐
    │  VOZ DO USUÁRIO │         │  TEXTO DO USUÁRIO  │
    │  (Microfone)    │         │  (Digitação)       │
    └────────┬────────┘         └─────────┬──────────┘
             │                            │
             └────────────┬───────────────┘
                          │
             ┌────────────▼──────────────┐
             │  APP.JS (JavaScript)      │
             │  Captura & Processa       │
             └────────────┬──────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼─────┐    ┌─────▼─────┐    ┌─────▼──────────┐
   │   GROQ   │    │  BIBLIAAPI │    │  NVIDIA AUDIO  │
   │ (IA: LLM)│    │ (Salmos)   │    │  (TTS)         │
   └────┬─────┘    └─────┬─────┘    └─────┬──────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
             ┌───────────▼──────────┐
             │   RESPOSTA AO USUÁRIO│
             │   (Áudio + Texto)    │
             └──────────────────────┘
```

---

## 🎙️ 1. CAPTURA DE VOZ DO USUÁRIO

### **Tecnologia: Web Speech API (Nativa do Navegador)**

**Arquivo:** `app.js` linhas 440-532

```javascript
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SR) {
  const recognition = new SR();
  recognition.lang = 'pt-BR';              // ✅ Português Brasil
  recognition.continuous = true;            // ✅ Ouve continuamente
  recognition.interimResults = true;        // ✅ Mostra parciais
}
```

### **Como Funciona:**

1. **Usuário clica no botão 🎙️ "Microfone"**
   - Navegador solicita permissão: "Pode usar seu microfone?"
   
2. **Web Speech API ouve continuamente**
   - Captura: "Estou triste com a morte de um ente querido"
   - Em tempo real (interim): "Estou tri... Estou triste... Estou triste com..."
   
3. **Transcrição aparece na caixa de texto**
   ```javascript
   situationEl.value = baseTranscript + interimTranscript;
   ```

4. **Quando para de falar** (silêncio > 2s):
   - Web Speech API marca como "final"
   - Texto fica congelado (usuário pode editar)

5. **Usuário clica "Buscar Sabedoria"**
   - Texto envia para Groq API

### **Navegadores que Suportam:**
- ✅ Chrome/Edge (100%)
- ✅ Firefox (90%)
- ⚠️ Safari (50% - apenas em iOS)
- ❌ IE11 (não suporta)

### **Limitações:**
- Só funciona com **HTTPS** (ou localhost)
- Precisa de permissão de microfone
- Idioma fixo (pt-BR) — sem auto-detecção

---

## 🧠 2. GERAÇÃO DE CONSELHO (IA GROQ)

### **Tecnologia: Groq API + LLM Llama 3.3 70B**

**Arquivo:** `app.js` linhas 318-344 + `api-config.js`

```javascript
async function callGroqAPI(situation, systemPrompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: situation }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });
}
```

### **Prompt de Sistema (System Prompt):**

```
Você é uma voz amorosa e sábia que reflete os ensinamentos de Jesus Cristo.

REGRAS:
- Tom caloroso, simples, como um amigo sábio
- Frases curtas, palavras simples
- Em PORTUGUÊS DO BRASIL

Para qualquer situação:
1. Conselho de como Cristo aconselharia (3-4 frases simples)
2. UM versículo bíblico curto dos Evangelhos ou Epístolas

Responda APENAS em JSON:
{"conselho": "...", "versiculo": "...", "referencia": "Livro Cap:Ver"}
```

### **Fluxo:**

1. **Usuário digita:** "Estou com raiva de meu chefe"
2. **Sistema envia para Groq:**
   ```json
   {
     "messages": [
       {"role": "system", "content": "Você é uma voz amorosa..."},
       {"role": "user", "content": "Estou com raiva de meu chefe"}
     ]
   }
   ```

3. **Groq retorna (em ~2-5 segundos):**
   ```json
   {
     "choices": [{
       "message": {
         "content": "{\"conselho\": \"Cristo ensinou a amar nossos inimigos...\", \"versiculo\": \"Amai vossos inimigos\", \"referencia\": \"Mateus 5:44\"}"
       }
     }]
   }
   ```

4. **App extrai JSON e mostra:**
   - Conselho: "Cristo ensinou a amar nossos inimigos..."
   - Versículo: "Amai vossos inimigos"
   - Referência: Mateus 5:44

### **Vantagens do Groq:**
- ⚡ **Rápido** (2-5s vs. 10-30s Gemini)
- 💰 **Gratuito** (14.4k tokens/dia)
- 🤖 **Modelo poderoso** (Llama 3.3 70B)

### **Limitações:**
- Limite diário de tokens
- Sem histórico de conversa (stateless)
- Pode gerar versículos "aproximados" (nem sempre exatos)

---

## 📖 3. BUSCA DE SALMOS E BÍBLIA

### **Tecnologia Atual: api-bible.com (Genérica)**

**Arquivo:** `api-config.js` linha 10 + `app.js` linhas 570-630

```javascript
endpoints: {
  bible: 'https://api.api-bible.com/v1/bibles/de4e12af7f28f599-02'
}
```

**ID da Bíblia:** `de4e12af7f28f599-02` = **Português (Almeida Corrigida)**

### **Como Funciona:**

1. **Aba "Salmos" carrega lista de 150 salmos**
   ```javascript
   async function loadPsalmsMetadata() {
     // IndexedDB busca cache local
     // Se vazio, faz fetch da API-BIBLE
     const data = await fetch(`${API_CONFIG.endpoints.bible}/search?query=psalm`);
     // Processa resposta e cachea
   }
   ```

2. **Usuário clica em "Salmo 23"**
   ```javascript
   async function getPsalmText(psalmNumber) {
     const res = await fetch(`${API}/passages/PSA${psalmNumber}`);
     // Retorna texto completo do Salmo 23
   }
   ```

3. **Aba "Devocional" mostra versículo do dia**
   ```javascript
   const devotion = {
     text: "Porque Deus amou o mundo...",
     reference: "João 3:16"
   };
   ```

### **Problema Atual:**
- ❌ API genérica (não otimizada para português BR)
- ❌ Sem suporte a múltiplas versões bíblicas
- ❌ Sem busca por palavras-chave
- ❌ Sem notas explicativas

### **Solução: BíbliaAPI**

Você ofereceu usar **BíbliaAPI**! 🎉 Aqui está a integração:

```javascript
// NOVO: Atualizar api-config.js

window.API_CONFIG = {
  BIBLIAAPI_KEY: '',  // ← Sua chave BíbliaAPI
  
  endpoints: {
    bibliaapi: 'https://www.bible-api.com/'  // ← Novo
  }
};

// NOVO: Função getPsalmTextBibliaAPI()

async function getPsalmText(psalmNumber) {
  try {
    // Usar BíbliaAPI ao invés de api-bible.com
    const res = await fetch(
      `https://www.bible-api.com/Salmos+${psalmNumber}?translation=jfa`
    );
    // jfa = João Ferreira de Almeida (português)
    
    const data = await res.json();
    return {
      text: data.text,
      reference: data.reference,
      version: 'JFA'  // Versão Almeida
    };
  } catch (e) {
    console.error('BíbliaAPI erro:', e);
    // Fallback para versão em cache
  }
}
```

### **Vantagens de Usar BíbliaAPI:**

| Aspecto | api-bible.com | BíbliaAPI |
|---------|---|---|
| **Português BR** | ⚠️ Limitado | ✅ Otimizado |
| **Velocidade** | Média | ⚡ Rápida |
| **Custo** | Pago | ✅ Gratuito |
| **Múltiplas versões** | Muitas | Várias |
| **Busca por palavra** | Sim | ✅ Sim |
| **Cache offline** | Precisa setup | ✅ Fácil |

---

## 🔊 4. GERAÇÃO DE ÁUDIO (NVIDIA AUDIO)

### **Tecnologia: Nvidia ResembleAI TTS**

**Arquivo:** `app.js` linhas 158-226 + `api-config.js`

```javascript
async function speakText(text, btn) {
  const res = await fetch(
    'https://integrate.api.nvidia.com/v1/audio/synthesize',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Amai vossos inimigos',
        language: 'pt-BR',           // ✅ Português Brasil
        voice_name: 'Padre',          // ✅ Voz customizada
        encoding: 'MP3',
        sample_rate_hz: 24000,
        rate: 1.0,
        emotion_control: 'calm'       // ✅ Emoção controlada
      })
    }
  );
  
  const audioBlob = await res.blob();
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
}
```

### **Fluxo:**

1. **Usuário clica "🔊 Ouvir em voz alta"**
2. **App envia texto para Nvidia ResembleAI**
3. **Nvidia converte para áudio MP3 (3-5 segundos)**
4. **Navegador reproduz áudio**
5. **Se falhar → Fallback Web Speech API** (navegador)

### **Vantagens:**
- 🎯 Voz natural em português BR
- 😊 Controle emocional (calm, happy, sad)
- ⚡ Rápido (< 5s)
- 💰 Créditos gratuitos iniciais

---

## 🔄 FLUXO COMPLETO: "MOMENTO DE SABEDORIA"

```
USUÁRIO DÚVIDA
    ↓
1️⃣ CAPTURA DE VOZ
   └─ Web Speech API (ou digita)
     └─ "Estou deprimido"

2️⃣ PROCESSA TEXTO
   └─ App valida se vazio
     └─ Mostra "⏳ Buscando Sabedoria…"

3️⃣ GROQ API (GERA CONSELHO)
   └─ POST a Groq
   └─ Sistema prompt: "Você é uma voz amorosa..."
   └─ Retorna JSON:
      {
        "conselho": "Cristo sofreu por nós...",
        "versiculo": "Vinde a mim...",
        "referencia": "Mateus 11:28"
      }

4️⃣ BUSCA BÍBLIA (VALIDA VERSÍCULO)
   └─ BíbliaAPI: GET /Mateus+11:28
   └─ Retorna: "Vinde a mim, vós que estais cansados..."

5️⃣ NVIDIA TTS (GERA ÁUDIO)
   └─ POST texto para Nvidia
   └─ Recebe MP3
   └─ Reproduz em tempo real

6️⃣ MOSTRA RESPOSTA
   ├─ Conselho em texto grande
   ├─ Versículo com referência
   ├─ Botão "🔊 Ouvir"
   └─ Salvo em localStorage para histórico

TEMPO TOTAL: ~8-12 segundos
```

---

## 📊 RESUMO DE APIS USADAS

| Funcionalidade | Tecnologia | Gratuito? | Latência | Implementação |
|---|---|---|---|---|
| **Captura de Voz** | Web Speech API | ✅ Sim | Real-time | Nativa |
| **Geração Conselho** | Groq (Llama 3.3) | ✅ Sim (14.4k tokens/dia) | 2-5s | Chamada HTTP |
| **Bíblia & Salmos** | api-bible.com | ⚠️ Limitado | 500ms | IndexedDB cache |
| **Áudio (TTS)** | Nvidia ResembleAI | ✅ Sim (créditos grátis) | 3-5s | Chamada HTTP |
| **Armazenamento** | IndexedDB + localStorage | ✅ Sim | <1ms | Nativa |

---

## 🎯 RECOMENDAÇÃO: MIGRAR PARA BIBLIAAPI

### **Por quê?**
1. ✅ **Otimizado para português BR**
2. ✅ **Gratuito** (sem API key)
3. ✅ **Rápido** (< 500ms)
4. ✅ **Simples** (sem autenticação)
5. ✅ **Offline-friendly** (cacheable)

### **Como Implementar:**

**Arquivo: app.js (substitua a função getPsalmText)**

```javascript
async function getPsalmText(psalmNumber) {
  const cacheKey = `psalm-${psalmNumber}`;
  
  // 1. Tentar IndexedDB primeiro
  let cached = await getPsalmFromDB(psalmNumber);
  if (cached) return cached;
  
  try {
    // 2. Se não em cache, buscar BíbliaAPI
    const res = await fetch(
      `https://www.bible-api.com/Salmos+${psalmNumber}?translation=jfa`
    );
    
    if (!res.ok) throw new Error(`Status ${res.status}`);
    
    const data = await res.json();
    
    // 3. Salvar em cache
    await savePsalmToDB({
      numero: psalmNumber,
      texto: data.text,
      referencia: data.reference,
      version: 'JFA'
    });
    
    return data;
    
  } catch (error) {
    console.error('Erro ao buscar salmo:', error);
    // Fallback: retornar salmo em português hardcoded
    return {
      text: `[Salmo ${psalmNumber} não disponível agora]`,
      reference: `Salmos ${psalmNumber}`
    };
  }
}
```

### **Atualizar api-config.js:**

```javascript
window.API_CONFIG = {
  GROQ_API_KEY: '',
  NVIDIA_API_KEY: '',
  
  endpoints: {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    nvidiaAudio: 'https://integrate.api.nvidia.com/v1/audio/synthesize',
    bibliaapi: 'https://www.bible-api.com/'  // ← NOVO: BíbliaAPI
  },
  
  models: {
    groq: 'llama-3.3-70b-versatile'
  },
  
  audio: {
    voice: 'Padre',
    language: 'pt-BR',
    encoding: 'MP3',
    sampleRate: 24000,
    rate: 1.0,
    emotion: 'calm'
  }
};
```

---

## 📝 DOCUMENTAÇÃO DE INTEGRAÇÃO

- **BíbliaAPI Docs:** https://www.bible-api.com/
- **Groq Docs:** https://console.groq.com/docs
- **Nvidia ResembleAI:** https://build.nvidia.com/resembleai/chatterbox-multilingual-tts
- **Web Speech API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

**Quer que eu implemente a integração com BíbliaAPI agora?** 👇
