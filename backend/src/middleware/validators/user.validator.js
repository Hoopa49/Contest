/**
 * Валидатор пользователей
 * Правила валидации для запросов, связанных с пользователями
 */

const { body } = require('express-validator')
const { validateRequest } = require('./base.validator')

// Общие правила валидации
const emailRule = body('email')
  .isEmail()
  .withMessage('Некорректный email адрес')
  .normalizeEmail()

const passwordRule = body('password')
  .isLength({ min: 6 })
  .withMessage('Пароль должен содержать минимум 6 символов')
  .matches(/\d/)
  .withMessage('Пароль должен содержать хотя бы одну цифру')

const nameRule = (field) => 
  body(field)
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} должно содержать от 2 до 50 символов`)
    .matches(/^[a-zA-Zа-яА-Я\s-]*$/)
    .withMessage(`${field} может содержать только буквы, пробелы и дефисы`)

// Валидация регистрации
const validateRegister = validateRequest([
  emailRule,
  passwordRule,
  nameRule('first_name'),
  nameRule('last_name')
])

// Валидация входа
const validateLogin = validateRequest([
  emailRule,
  body('password').notEmpty().withMessage('Пароль обязателен')
])

// Валидация обновления профиля
const validateUpdateProfile = validateRequest([
  body('email')
    .optional()
    .isEmail()
    .withMessage('Некорректный email адрес')
    .normalizeEmail(),
  nameRule('first_name'),
  nameRule('last_name')
])

// Валидация смены пароля
const validateChangePassword = validateRequest([
  body('oldPassword')
    .notEmpty()
    .withMessage('Текущий пароль обязателен'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Новый пароль должен содержать минимум 6 символов')
    .matches(/\d/)
    .withMessage('Новый пароль должен содержать хотя бы одну цифру')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('Новый пароль должен отличаться от текущего')
      }
      return true
    })
])

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} 