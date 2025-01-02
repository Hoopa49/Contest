require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runYouTubeScheduler } = require('./schedulers/youtubeScheduler');
const { initScheduler } = require('./services/cronService');
const app = express();
const http = require('http');
const server = http.createServer(app);
const WebSocketService = require('./services/websocketService');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes setup
const { router: authRoutes } = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const contestRoutes = require('./routes/contestRoutes');
const contentMakerRoutes = require('./routes/contentMakerRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/content-makers', contentMakerRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Initialize WebSocket service
const wss = new WebSocketService(server);
global.wss = wss;

// Initialize scheduler
initScheduler().catch(console.error);

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка остальных ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;