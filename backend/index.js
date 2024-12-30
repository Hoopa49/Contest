require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runYouTubeScheduler } = require('./schedulers/youtubeScheduler');
const app = express();

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { router: authRoutes } = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const contestRoutes = require('./routes/contestRoutes');
const contentMakerRoutes = require('./routes/contentMakerRoutes');


// Подключаем роуты
app.use('/api', authRoutes); 
app.use('/api', videoRoutes);
app.use('/api', contestRoutes);
app.use('/api', contentMakerRoutes);

runYouTubeScheduler();

// Добавляем логирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});