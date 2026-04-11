require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

app.listen(PORT, () => {
  console.log(`JukeBox London backend running on port ${PORT}`);
});
