module.exports = async (req, res) => {
  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice_id } = req.body;
  const apiKey = process.env.ELEVEN_LABS_API_KEY;

  if (!apiKey) {
    console.error('ELEVEN_LABS_API_KEY is missing');
    return res.status(500).json({ error: 'Chave API não configurada na Vercel' });
  }

  if (!text || !voice_id) {
    return res.status(400).json({ error: 'Texto ou Voice ID faltando' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs Error:', errorText);
      return res.status(response.status).json({ error: 'Erro ao gerar áudio: ' + errorText });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.end(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
