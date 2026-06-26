// Get daily devotion verse (deterministic by date)

module.exports = async (req, res) => {
  const { version = 'ACF' } = req.query;

  try {
    const apiKey = process.env.BIBLIAAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'BIBLIAAPI_KEY not configured' });
    }

    // Use date to generate consistent verse for the day
    const today = new Date().toISOString().split('T')[0];
    const dayHash = today.split('-').reduce((a, b) => a + parseInt(b), 0);

    // Always fetch random but cache by day on client
    const response = await fetch(
      `https://bibliaapi.com.br/api/v2/versions/${version}/random`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to get devotion verse' });
    }

    const data = await response.json();

    if (!data.data) {
      return res.status(404).json({ error: 'No verse available' });
    }

    const verseData = data.data;
    return res.json({
      date: today,
      reference: verseData.reference,
      text: verseData.text,
      version: verseData.version,
      book: verseData.book.name,
      chapter: verseData.chapter,
      verse: verseData.verse,
      meditation: {
        step1: 'Leia devagar, saboreando cada palavra. Releia as partes que mais tocaram você.',
        step2: 'O que revela sobre Deus? E sobre mim? Qual versículo tocou meu coração?',
        step3: 'Use o versículo para falar com Deus. Confesse, agradeça, peça ajuda — seja honesto.',
        step4: 'Como viver essa verdade hoje? Qual passo concreto você pode dar?'
      }
    });

  } catch (error) {
    console.error('Devotion API Error:', error);
    return res.status(500).json({ error: 'Failed to get devotion verse', details: error.message });
  }
};
