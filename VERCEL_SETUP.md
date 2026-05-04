# Setup do Vercel - Gemini + ElevenLabs

## 🔑 Configuração de Variáveis de Ambiente

No Vercel, você precisa adicionar as chaves de API como **Environment Variables**:

### Passo 1: Acesse o Dashboard do Vercel
1. Vá para https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **Settings** → **Environment Variables**

### Passo 2: Adicione as Variáveis

#### `GEMINI_API_KEY`
- **Valor:** Sua chave do Google Gemini API
- **Como obter:** https://aistudio.google.com/app/apikey
- **Onde usar:** `/api/wisdom.js` - Interpreta confissões e devolve sabedoria de Jesus
- **Ambientes:** Production + Preview

#### `ELEVEN_LABS_API_KEY`
- **Valor:** Sua chave do ElevenLabs
- **Como obter:** https://elevenlabs.io/app/home
- **Onde usar:** `/api/speak.js` - Gera áudio das respostas
- **Ambientes:** Production + Preview

### Passo 3: Redeploy

Após adicionar as variáveis:
1. Vá para **Deployments**
2. Clique no último deploy
3. Clique em **Redeploy**

Ou faça um novo push no Git:
```bash
git add -A
git commit -m "trigger redeploy"
git push
```

---

## 🧪 Testar Localmente com `vercel dev`

### Setup Local

1. **Crie `.env.local`:**
```bash
cp .env.local.example .env.local
```

2. **Adicione suas chaves:**
```
GEMINI_API_KEY=sua_chave_aqui
ELEVEN_LABS_API_KEY=sua_chave_aqui
```

3. **Execute o servidor Vercel local:**
```bash
npm run dev:vercel
```

Isso rodará em http://localhost:3000 com as funções serverless funcionando!

### Testando os Endpoints

**Teste Gemini (Wisdom):**
```bash
curl -X POST http://localhost:3000/api/wisdom \
  -H "Content-Type: application/json" \
  -d '{"situation":"Estou ansioso com o futuro"}'
```

**Teste ElevenLabs (Speak):**
```bash
curl -X POST http://localhost:3000/api/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Bem-vindo ao aplicativo","voice_id":"nPczCjzI2devNBz1zQrb"}' \
  --output audio.mp3
```

---

## 🐛 Troubleshooting

### Erro: `GEMINI_API_KEY is missing`
- ❌ A variável não foi adicionada no Vercel
- ✅ Solução: Vá em Settings → Environment Variables e adicione

### Erro: `405 Method Not Allowed`
- ❌ O endpoint foi chamado com GET em vez de POST
- ✅ Solução: Certifique-se que app.js está fazendo `fetch(..., { method: 'POST' })`

### Erro: `Erro ao gerar áudio`
- ❌ ElevenLabs rejeitou a requisição (chave inválida ou limite excedido)
- ✅ Solução: Verifique sua quota em https://elevenlabs.io/app/account

### Erro: `Resposta vazia do Gemini`
- ❌ Gemini não retornou conteúdo válido
- ✅ Solução: Verifique se sua chave Gemini está ativa em https://console.cloud.google.com

---

## 📊 Fluxo de Funcionamento

```
Usuário escreve "estou triste"
                 ↓
     app.js faz POST /api/wisdom
                 ↓
    /api/wisdom chama Gemini API
                 ↓
    Gemini responde com conselho + versículo
                 ↓
    app.js exibe resposta
                 ↓
    Usuário clica "Ouvir em voz alta"
                 ↓
     app.js faz POST /api/speak
                 ↓
    /api/speak chama ElevenLabs API
                 ↓
    ElevenLabs retorna áudio MP3
                 ↓
    app.js toca o áudio no navegador
```

---

## 🎯 Checklist de Produção

- [ ] GEMINI_API_KEY configurada no Vercel
- [ ] ELEVEN_LABS_API_KEY configurada no Vercel
- [ ] vercel.json presente e correto
- [ ] package.json com `"node": "24.x"`
- [ ] Testado localmente com `npm run dev:vercel`
- [ ] Deploy realizado e funcionando
- [ ] Endpoints /api/wisdom e /api/speak respondendo corretamente
