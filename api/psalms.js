// Serverless function para buscar Salmos da Bible API
// Protege a chave de API do cliente

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { numero } = req.body;

  if (!numero || isNaN(numero) || numero < 1 || numero > 150) {
    return res.status(400).json({ error: 'Número de Salmo inválido (1-150)' });
  }

  const BIBLE_API_KEY = process.env.BIBLE_API_KEY;
  if (!BIBLE_API_KEY) {
    console.error('BIBLE_API_KEY not configured');
    return res.status(500).json({ error: 'Configuração do servidor incompleta' });
  }

  try {
    // Buscar o Salmo na Bible API
    const searchRes = await fetch(
      `https://api.api-bible.com/v1/bibles/de4e12af7f28f599-02/search?query=psalm%20${numero}&limit=1`,
      { headers: { 'api-key': BIBLE_API_KEY } }
    );

    if (!searchRes.ok) {
      console.error('Bible API search error:', searchRes.status);
      return res.status(500).json({ error: 'Erro ao buscar Salmo' });
    }

    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      return res.status(404).json({ error: `Salmo ${numero} não encontrado` });
    }

    // Buscar o texto completo
    const verseId = searchData.results[0].verseId;
    const textRes = await fetch(
      `https://api.api-bible.com/v1/bibles/de4e12af7f28f599-02/verses/${verseId}?content-type=text`,
      { headers: { 'api-key': BIBLE_API_KEY } }
    );

    if (!textRes.ok) {
      console.error('Bible API verse error:', textRes.status);
      return res.status(500).json({ error: 'Erro ao buscar texto do Salmo' });
    }

    const textData = await textRes.json();
    const texto = textData.data?.content || '';

    if (!texto) {
      return res.status(500).json({ error: 'Texto vazio do Salmo' });
    }

    res.status(200).json({ numero, texto });

  } catch (error) {
    console.error('Server error:', error.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
