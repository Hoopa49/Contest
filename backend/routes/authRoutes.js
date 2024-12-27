// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Импортируем модель User из "connection.js"
const { User } = require('../models/Connection');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_key'; 
// В идеале хранить секрет в .env

// -------------------- РЕГИСТРАЦИЯ (POST /register) --------------------
router.post('/register', async (req, res) => {
  try {
    // Из тела запроса берём email, password, role
    const { email, password, role } = req.body;

    // 1) Проверка: все ли поля пришли
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2) Проверка, нет ли пользователя с таким email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // 3) Хешируем пароль
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4) Создаём нового пользователя в БД
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    // 5) Возвращаем успешный ответ
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
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
