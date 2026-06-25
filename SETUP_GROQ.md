# 🚀 Guia de Configuração — Groq API

Este projeto agora suporta **Groq** como alternativa para as consultas de IA, oferecendo respostas **mais rápidas** que o Gemini.

## O que é Groq?

Groq é uma plataforma que oferece inferência de LLMs (Large Language Models) extremamente rápida. Para este projeto, usamos o modelo **Mixtral-8x7b-32768**, que é:
- ✅ **Rápido** — respostas em milissegundos
- ✅ **Gratuito** — 14.400 tokens gratuitos por dia
- ✅ **Compatível** — funciona como fallback se Gemini falhar

## Passo 1: Criar uma Conta no Groq

1. Acesse [console.groq.com](https://console.groq.com)
2. Clique em **"Sign Up"**
3. Use Google, GitHub ou crie uma conta com email
4. Verifique seu email

## Passo 2: Gerar uma API Key

1. No console do Groq, acesse **API Keys** (no menu lateral)
2. Clique em **"Create API Key"**
3. Dê um nome (exemplo: "O Que Jesus Faria")
4. **Copie a chave** (ela aparece apenas uma vez!)

## Passo 3: Adicionar ao Projeto

1. Abra o arquivo `.env.local` na raiz do projeto
2. Procure por `GROQ_API_KEY=`
3. Cole sua chave assim:
   ```env
   GROQ_API_KEY=gsk_SUA_CHAVE_AQUI
   ```
4. Salve o arquivo

**⚠️ IMPORTANTE:** Nunca compartilhe sua API key! O arquivo `.env.local` está configurado para não ser enviado ao Git.

## Passo 4: Usar o Groq

1. Abra a aplicação no seu navegador
2. Clique no ⚙️ (Configurações) no topo
3. Procure por **"Modelo de IA"**
4. Selecione **"Groq (rápido)"**
5. Clique em **"Salvar"**

Pronto! A próxima consulta usará Groq automaticamente.

## Alternancia Entre Modelos

- **Gemini**: Melhor para respostas mais refinadas
- **Groq**: Melhor para respostas rápidas

Você pode alternar entre eles a qualquer momento pelas configurações.

## Troubleshooting

### "Chave de API do Groq não configurada"
- Verifique se adicionou a chave ao `.env.local`
- Reinicie o servidor (`npm run dev`)

### Limite de tokens atingido
- Groq oferece 14.400 tokens/dia gratuitamente
- Você pode usar Gemini como fallback ou aguardar o reset diário

### Conexão recusada
- Verifique sua conexão com a internet
- Confirme se a chave está correta

## Mais Informações

- [Documentação do Groq](https://console.groq.com/docs/quickstart)
- [Modelos disponíveis](https://console.groq.com/docs/models)

---

*Com fé, toda resposta vem do alto.* · **WWJD**
