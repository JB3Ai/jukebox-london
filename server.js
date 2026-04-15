require('dotenv').config();
const path = require('path');
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = Number(process.env.PORT) || 3000;
const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'JukeBox London' });
});

app.post('/api/conduct', async (req, res) => {
  const { phase, atmosphere, artistSeed } = req.body || {};

  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured.',
      message: 'Set GEMINI_API_KEY in cPanel Node.js environment variables.',
    });
    return;
  }

  try {
    const prompt = [
      `Generate a ${phase || 'main-floor'} electronic track.`,
      `Atmosphere: ${atmosphere || 'warehouse pulse'}.`,
      `Artist seed: ${artistSeed || 'London club lineage'}.`,
      'Style: London warehouse, DJ-friendly transitions, detailed low end.',
    ].join(' ');

    const result = await ai.models.generateContent({
      model: 'lyria-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['AUDIO', 'TEXT'],
        responseMimeType: 'audio/wav',
      },
    });

    const candidate = result.candidates && result.candidates[0];
    const parts = (candidate && candidate.content && candidate.content.parts) || [];
    const audioPart = parts.find((part) => part.inlineData && part.inlineData.data);
    const textPart = parts.find((part) => typeof part.text === 'string');

    if (!audioPart || !audioPart.inlineData || !audioPart.inlineData.data) {
      res.status(502).json({ error: 'No audio payload returned by model.' });
      return;
    }

    res.json({
      audioData: audioPart.inlineData,
      lyrics: (textPart && textPart.text) || 'Instrumental stream generated.',
    });
  } catch (error) {
    console.error('Conduct endpoint failed:', error);
    res.status(500).json({ error: 'Neural Buffer Error: Transition Failed.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`JukeBox Node.js server live on port ${port}`);
});
