const express = require('express');
const router = express.Router();

/**
 * Lyria 3 Audio Engine routes
 * Handles AI music generation requests powered by Google Lyria 3.
 */

// POST /api/lyria/generate  –  Generate a track from a prompt
router.post('/generate', async (req, res) => {
  const { prompt, style, bpm, key } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'A prompt is required to generate a track.' });
  }

  // TODO: Integrate with Google Lyria 3 API
  // const track = await lyriaClient.generate({ prompt, style, bpm, key });

  res.status(202).json({
    message: 'Track generation queued.',
    params: { prompt, style, bpm, key },
  });
});

// GET /api/lyria/styles  –  List available Lyria style presets
router.get('/styles', (_req, res) => {
  const styles = ['afrobeats', 'amapiano', 'grime', 'drill', 'garage', 'soul', 'jazz-fusion'];
  res.json({ styles });
});

module.exports = router;
