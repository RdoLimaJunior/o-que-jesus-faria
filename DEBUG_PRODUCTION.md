# 🔍 Debug - Verificando o Erro em Produção

## 1️⃣ Verifique os Logs do Vercel

No dashboard do Vercel:

1. Vá para **Deployments**
2. Clique no deploy mais recente
3. Vá em **Logs** → **Runtime Logs**
4. **Tente usar o app** (escreva algo na seção "Sabedoria")
5. **Veja os logs em tempo real**

Procure por:
- ❌ `GEMINI_API_KEY is missing`
- ❌ `ELEVEN_LABS_API_KEY is missing`
- ❌ `Gemini API Error`
- ❌ `ElevenLabs Error`
- ✅ `Status 200`

---

## 2️⃣ Teste os Endpoints Diretamente

Substitua `{seu-dominio}` pelo domínio do seu Vercel (ex: o-que-jesus-faria.vercel.app)

### Teste Gemini (Wisdom):
```bash
curl -X POST https://{seu-dominio}.vercel.app/api/wisdom \
  -H "Content-Type: application/json" \
  -d '{"situation":"Estou ansioso com o futuro"}' \
  -v
```

**Resposta esperada:**
```json
{
  "conselho": "...",
  "versiculo": "...",
  "referencia": "..."
}
```

### Teste ElevenLabs (Speak):
```bash
curl -X POST https://{seu-dominio}.vercel.app/api/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Jesus ama você","voice_id":"nPczCjzI2devNBz1zQrb"}' \
  -v --output audio.mp3
```

**Resposta esperada:** Um arquivo MP3

---

## 3️⃣ Checklist de Produção

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy mais recente contém `/api/wisdom.js` e `/api/speak.js`
- [ ] vercel.json configurado corretamente
- [ ] Node.js versão 24.x
- [ ] Sem erros na seção de Runtime Logs
- [ ] Endpoints respondem corretamente (teste com curl acima)

---

## 4️⃣ Se Ainda Não Funcionar

### Opção A: Redeploy Forçado
1. Vá para **Deployments**
2. Selecione o último deploy
3. Clique em **...** → **Redeploy**

### Opção B: Novo Commit
```bash
git add -A
git commit -m "trigger redeploy for production"
git push
```

### Opção C: Verificar Variáveis
1. Vá em **Settings** → **Environment Variables**
2. Confirme que **ambas** as variáveis estão em **Production** e **Preview**
3. Se mudou algo, redeploy

---

## 5️⃣ Erros Comuns e Soluções

### Erro: "GEMINI_API_KEY is missing"
```
❌ A variável não foi adicionada ou está vazia
✅ Solução: Vá em Environment Variables e adicione a chave
```

### Erro: "405 Method Not Allowed"
```
❌ Há um proxy ou firewall bloqueando POST
✅ Solução: Tente recarregar a página ou fazer redeploy
```

### Erro: "Erro ao gerar áudio"
```
❌ Sua chave ElevenLabs expirou ou quota excedida
✅ Solução: Verifique em https://elevenlabs.io/app/account
```

### Erro: "Resposta vazia do Gemini"
```
❌ Gemini está rejeitando a requisição
✅ Solução: Verifique a chave em https://aistudio.google.com/app/apikey
```

---

## 6️⃣ Teste Local com vercel dev

Antes de fazer deploy, teste localmente:

```bash
# 1. Copie o exemplo de env
cp .env.local.example .env.local

# 2. Edite e adicione suas chaves REAIS
# GEMINI_API_KEY=sk-...
# ELEVEN_LABS_API_KEY=sk-...

# 3. Rode o servidor local
npm run dev:vercel

# 4. Teste em http://localhost:3000
# Abra DevTools (F12) → Console e Network
# Tente usar o app e veja os logs
```

Se funcionar localmente, vai funcionar em produção!

---

## 📊 O que Deveria Acontecer

```
1. Usuário escreve: "Estou triste"
   ↓
2. app.js faz: POST /api/wisdom
   Request Body: { "situation": "Estou triste" }
   ↓
3. /api/wisdom.js recebe
   - Lê process.env.GEMINI_API_KEY ✅
   - Chama Gemini API ✅
   - Retorna JSON com conselho + versículo ✅
   ↓
4. app.js exibe a resposta ✅
   ↓
5. Usuário clica "Ouvir em voz alta"
   ↓
6. app.js faz: POST /api/speak
   Request Body: { "text": "...", "voice_id": "..." }
   ↓
7. /api/speak.js recebe
   - Lê process.env.ELEVEN_LABS_API_KEY ✅
   - Chama ElevenLabs API ✅
   - Retorna áudio MP3 ✅
   ↓
8. app.js toca o áudio ✅
```

Se alguma etapa falhar, você verá no console ou nos logs!
