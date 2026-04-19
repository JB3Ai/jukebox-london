import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT) || 3000;
const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const server = express();

server.use(express.json({ limit: '1mb' }));
server.use(express.static(path.join(__dirname, 'public')));

server.post('/api/conduct', async (req, res) => {
  const { phase, atmosphere, artistSeed } = req.body ?? {};

  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured.',
      message: 'Set GEMINI_API_KEY to enable AI music generation.',
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

    const candidate = result.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const audioPart = parts.find((part) => part.inlineData?.data);
    const textPart = parts.find((part) => typeof part.text === 'string');

    if (!audioPart?.inlineData?.data) {
      res.status(502).json({
        error: 'No audio payload returned by model.',
        rawParts: parts,
      });
      return;
    }

    res.json({
      audioData: audioPart.inlineData,
      lyrics: textPart?.text ?? 'Instrumental stream generated.',
    });
  } catch (error) {
    console.error('Conduct endpoint failed:', error);
    res.status(500).json({
      error: 'Neural Buffer Error: Transition Failed.',
    });
  }
});

server.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(port, () => {
  console.log(`JukeBox Node.js server live on port ${port}`);
});
