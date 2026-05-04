module.exports = async (req, res) => {
  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { situation } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing');
    return res.status(500).json({ error: 'Chave API do Gemini não configurada' });
  }

  if (!situation) {
    return res.status(400).json({ error: 'Situação não fornecida' });
  }

  try {
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

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: {
            text: systemPrompt
          }
        },
        contents: {
          parts: {
            text: situation
          }
        }
      }),
      params: {
        key: apiKey
      }
    });

    // Construir URL com query param corretamente
    const url = new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent');
    url.searchParams.append('key', apiKey);

    const response2 = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: {
            text: systemPrompt
          }
        },
        contents: {
          parts: {
            text: situation
          }
        }
      })
    });

    if (!response2.ok) {
      const errorText = await response2.text();
      console.error('Gemini API Error:', errorText);
      return res.status(response2.status).json({ error: 'Erro ao chamar API do Gemini' });
    }

    const data = await response2.json();

    // Extrair texto da resposta do Gemini
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return res.status(500).json({ error: 'Resposta vazia do Gemini' });
    }

    // Parse JSON da resposta
    const clean = String(generatedText).replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    const jsonStr = (start >= 0 && end > start) ? clean.slice(start, end + 1) : clean;
    const parsed = JSON.parse(jsonStr);

    res.status(200).json({
      conselho: parsed.conselho || '',
      versiculo: parsed.versiculo || '',
      referencia: parsed.referencia || ''
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Erro interno no servidor: ' + error.message });
  }
};
