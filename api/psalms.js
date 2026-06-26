// Vercel Function to proxy BíbliaAPI.com.br (avoids CORS issues)

module.exports = async (req, res) => {
  const { number, version = 'ACF' } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Psalm number required' });
  }

  try {
    const apiKey = process.env.BIBLIAAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'BIBLIAAPI_KEY not configured' });
    }

    // Call BíbliaAPI.com.br from backend (no CORS issues)
    const response = await fetch(
      `https://bibliaapi.com.br/api/v2/versions/${version}/books/salmos/chapters/${number}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch psalm ${number}`
      });
    }

    const data = await response.json();

    if (!data.data) {
      return res.status(404).json({ error: 'Psalm not found' });
    }

    const psalmsData = data.data;
    const textArray = psalmsData.verses.map(v => v.text);
    const fullText = textArray.join('\n\n');

    // Return formatted response
    return res.json({
      reference: psalmsData.reference,
      text: fullText,
      verses: psalmsData.verses,
      version: psalmsData.version,
      translation: `Bíblia ${psalmsData.version}`
    });

  } catch (error) {
    console.error('Psalm API Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch psalm',
      details: error.message
    });
  }
};
