require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static('public')); // Serves your landing page

// STITCH HANDSHAKE ENDPOINT
app.get('/api/handshake', (req, res) => {
    res.json({
        status: "connected",
        project: "JukeBox London Legend",
        workspace_id: "JB3-LDN-2026-LEGEND",
        sync_provider: "github",
        repository: "JB3Ai/jukebox-london",
        environment: "hybrid-cloud",
        timestamp: new Date().toISOString()
    });
});

// AI CONDUCTOR ENDPOINT
app.post('/api/conduct', async (req, res) => {
    try {
        const { phase, vibe } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use 1.5 for speed or Lyria if available in your tier

        const prompt = `Act as a London music producer. Generate a music structure for Phase: ${phase} with Vibe: ${vibe}. Return JSON format.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ success: true, data: response.text() });
    } catch (error) {
        res.status(500).json({ error: "Neural Buffer Error" });
    }
});

// PASSENGER HANDSHAKE (Crucial for cPanel)
if (process.env.NODE_ENV === 'production') {
    module.exports = app; 
} else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`JukeBox running on http://localhost:${PORT}`));
}
