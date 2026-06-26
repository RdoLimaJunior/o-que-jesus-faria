// Get list of Bible books

module.exports = async (req, res) => {
  const { version = 'ACF' } = req.query;

  try {
    const apiKey = process.env.BIBLIAAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'BIBLIAAPI_KEY not configured' });
    }

    const response = await fetch(
      `https://bibliaapi.com.br/api/v2/versions/${version}/books`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to get books' });
    }

    const data = await response.json();

    if (!data.data) {
      return res.status(404).json({ error: 'No books available' });
    }

    return res.json({
      version,
      books: data.data.map(b => ({
        id: b.id,
        name: b.name,
        abbrev: b.abbrev,
        testament: b.testament
      }))
    });

  } catch (error) {
    console.error('Books API Error:', error);
    return res.status(500).json({ error: 'Failed to get books', details: error.message });
  }
};
