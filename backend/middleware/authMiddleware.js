// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Подтянем секретный ключ из .env
// (Убедитесь, что в index.js (или раньше) вызван `require('dotenv').config();`)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function authMiddleware(req, res, next) {
  try {
    // 1) Извлекаем токен из заголовка (или из других мест, если хотите)
    // Обычно токен приходит в "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Разделим по пробелу: ["Bearer", "xxxxxx"]
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Token error' });
    }

    const token = parts[1];

    // 2) Проверяем токен
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // 3) Если всё ок, decoded содержит то, что мы зашили в jwt.sign(...)
      // Например, { userId, role, iat, exp }
      req.user = { id: decoded.userId, role: decoded.role };

      // Двигаемся дальше (к роуту, который вызвали)
      return next();
    });

  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
