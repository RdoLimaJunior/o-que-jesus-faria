# Configuração da API do Gemini

## 1. Obter sua Chave API do Gemini

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Clique em **"Create API Key"**
3. Selecione o projeto desejado ou crie um novo
4. Copie a chave gerada

## 2. Adicionar à Vercel (Produção)

Se você está usando Vercel para deploy:

1. Acesse seu dashboard em [vercel.com](https://vercel.com)
2. Selecione o seu projeto **"o-que-jesus-faria"**
3. Vá para **Settings** → **Environment Variables**
4. Clique em **"Add New"** e configure:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Cole sua chave API
   - **Environments:** Selecione *Production*, *Preview*, e *Development*
5. Clique **"Save"** e aguarde o redeploy automático

## 3. Testar Localmente

Para testar em desenvolvimento local, crie um arquivo `.env.local` na raiz do projeto:

```bash
GEMINI_API_KEY=sua_chave_aqui
```

Depois execute seu servidor local:

```bash
vercel dev
```

## 4. Segurança

⚠️ **IMPORTANTE:** Nunca commit sua chave no GitHub! Use apenas variáveis de ambiente.

- A chave está segura no backend (`/api/wisdom.js`)
- O frontend nunca vê a chave
- Só funciona via seu servidor/Vercel

## 5. Testar a Integração

1. Abra a aba **"Buscar Sabedoria"**
2. Digite uma situação ou dúvida
3. Clique **"Buscar Sabedoria"**
4. Você deve ver a resposta em alguns segundos

Se não funcionar, verifique:
- [ ] Chave API está configurada na Vercel
- [ ] Sua cota do Gemini não foi excedida
- [ ] Sem erros no console do navegador (F12)

---

**Documentação do Gemini API:** https://ai.google.dev/docs
