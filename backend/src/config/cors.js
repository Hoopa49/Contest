/**
 * Настройки CORS
 */

const whitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://84.252.134.215',
  'http://84.252.134.215:3000',
  'http://84.252.134.215:5173'
]

const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, от мобильных приложений)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Разрешаем отправку куки
  maxAge: 86400 // Кэшируем preflight запросы на 24 часа
}

module.exports = corsOptions 