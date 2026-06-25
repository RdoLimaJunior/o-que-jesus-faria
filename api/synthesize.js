// Vercel Function to proxy Nvidia ResembleAI TTS API
// This avoids CORS issues by calling the API from the backend

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text, language, voice_name, encoding, sample_rate_hz, rate, emotion_control } = req.body;

    // Validate input
    if (!text || !language || !voice_name) {
      return res.status(400).json({ error: 'Missing required fields: text, language, voice_name' });
    }

    // Get API key from environment variable (never expose in client)
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'NVIDIA_API_KEY not configured' });
    }

    // Call Nvidia ResembleAI API
    const response = await fetch('https://integrate.api.nvidia.com/v1/audio/synthesize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        language,
        voice_name,
        encoding: encoding || 'MP3',
        sample_rate_hz: sample_rate_hz || 24000,
        rate: rate || 1.0,
        emotion_control: emotion_control || 'calm'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nvidia API Error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Nvidia API Error',
        details: errorText
      });
    }

    // Get audio as blob
    const audioBuffer = await response.arrayBuffer();

    // Set response headers for audio file
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Send audio buffer to client
    return res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('Synthesis Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
