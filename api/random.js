// Get random verse

module.exports = async (req, res) => {
  const { version = 'ACF' } = req.query;

  try {
    const apiKey = process.env.BIBLIAAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'BIBLIAAPI_KEY not configured' });
    }

    const response = await fetch(
      `https://bibliaapi.com.br/api/v2/versions/${version}/random`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to get random verse' });
    }

    const data = await response.json();

    if (!data.data) {
      return res.status(404).json({ error: 'No verse available' });
    }

    const verseData = data.data;
    return res.json({
      reference: verseData.reference,
      text: verseData.text,
      version: verseData.version,
      book: verseData.book.name,
      chapter: verseData.chapter,
      verse: verseData.verse
    });

  } catch (error) {
    console.error('Random Verse API Error:', error);
    return res.status(500).json({ error: 'Failed to get random verse', details: error.message });
  }
};
