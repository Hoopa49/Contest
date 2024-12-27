// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/Connection');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_key'; 
// В идеале хранить секрет в .env

// -------------------- РЕГИСТРАЦИЯ (POST /register) --------------------
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны.' });
    }

    // Проверяем, существует ли уже пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует.' });
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём нового пользователя
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || 'user' // По умолчанию роль 'user'
    });

    return res.status(201).json({
      message: 'Пользователь успешно зарегистрирован.',
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    return res.status(500).json({ error: 'Не удалось зарегистрировать пользователя.' });
  }
});

// -------------------- ЛОГИН (POST /login) --------------------
router.post('/login', async (req, res) => {
  try {
    // Берём email и password из тела запроса
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1) Находим пользователя в БД по email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Нет такого email
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2) Сравниваем пароль с хешем
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Пароль не совпал
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3) Генерируем JWT
    // payload: userId, role
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1d' } // срок действия токена (1 день)
    );

    // 4) Отправляем токен и информацию о пользователе
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
