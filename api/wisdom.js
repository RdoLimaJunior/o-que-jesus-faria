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

    const url = new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent');
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString(), {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return res.status(response.status).json({ error: 'Erro ao chamar API do Gemini' });
    }

    const data = await response.json();

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      console.error('Empty response from Gemini');
      return res.status(500).json({ error: 'Resposta vazia do Gemini' });
    }

    const clean = String(generatedText).replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');

    if (start === -1 || end === -1) {
      console.error('Could not parse JSON from response:', clean);
      return res.status(500).json({ error: 'Formato de resposta inválido' });
    }

    const jsonStr = clean.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);

    return res.status(200).json({
      conselho: parsed.conselho || '',
      versiculo: parsed.versiculo || '',
      referencia: parsed.referencia || ''
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Erro interno no servidor: ' + error.message });
  }
};
