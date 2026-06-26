// Search verses by word/keyword

module.exports = async (req, res) => {
  const { q, version = 'ACF', limit = 10, offset = 0 } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  try {
    const apiKey = process.env.BIBLIAAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'BIBLIAAPI_KEY not configured' });
    }

    const response = await fetch(
      `https://bibliaapi.com.br/api/v2/versions/${version}/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Search failed' });
    }

    const data = await response.json();

    if (!data.data) {
      return res.status(404).json({ error: 'No results found' });
    }

    const searchData = data.data;
    return res.json({
      query: searchData.query,
      version: searchData.version,
      limit: searchData.limit,
      offset: searchData.offset,
      results: searchData.results.map(v => ({
        reference: v.reference,
        text: v.text,
        book: v.book.name,
        chapter: v.chapter,
        verse: v.verse
      }))
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ error: 'Search failed', details: error.message });
  }
};
