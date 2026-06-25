// Return environment variables to client
// This allows Vercel Environment Variables to be accessible in the browser

module.exports = (req, res) => {
  return res.json({
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
    BIBLIAAPI_KEY: process.env.BIBLIAAPI_KEY || ''
  });
};
