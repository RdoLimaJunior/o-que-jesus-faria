// Vercel Function to proxy BíbliaAPI (avoids CORS issues)

export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: 'Psalm number required' });
  }

  try {
    // Call BíbliaAPI from backend (no CORS issues)
    const response = await fetch(
      `https://bible-api.com/Salmos+${number}?translation=jfa`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch psalm ${number}`
      });
    }

    const data = await response.json();

    // Return with CORS headers already set by Vercel
    return res.json({
      text: data.text,
      reference: data.reference,
      translation: data.translation
    });

  } catch (error) {
    console.error('Psalm API Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch psalm',
      details: error.message
    });
  }
}
