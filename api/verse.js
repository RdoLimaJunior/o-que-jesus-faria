// Fetch specific verse by book, chapter, verse

module.exports = async (req, res) => {
  const { book, chapter, verse, version = 'ACF' } = req.query;

  if (!book || !chapter || !verse) {
    return res.status(400).json({ error: 'Missing: book, chapter, verse' });
  }

  try {
    const apiKey = process.env.BIBLIAAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'BIBLIAAPI_KEY not configured' });
    }

    const response = await fetch(
      `https://bibliaapi.com.br/api/v2/versions/${version}/books/${book}/chapters/${chapter}/verses/${verse}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Verse not found' });
    }

    const data = await response.json();
    if (!data.data) {
      return res.status(404).json({ error: 'Verse not found' });
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
    console.error('Verse API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch verse', details: error.message });
  }
};
