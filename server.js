require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const lyriaRoutes = require('./src/api/lyria');
const producerRoutes = require('./src/api/producer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/lyria', lyriaRoutes);
app.use('/api/producer', producerRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'JukeBox London' });
});

// Serve the Next.js static export (built to client/out/)
const clientOut = path.join(__dirname, 'client', 'out');
app.use(express.static(clientOut));

const staticRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});

app.get(/^(?!\/api\/).*$/, staticRateLimit, (_req, res) => {
  res.sendFile(path.join(clientOut, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`JukeBox London backend running on port ${PORT}`);
});
