const Joi = require('joi')

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email должен быть корректным',
      'any.required': 'Email обязателен'
    }),
  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      'string.min': 'Пароль должен содержать минимум {#limit} символов',
      'string.max': 'Пароль должен содержать максимум {#limit} символов',
      'any.required': 'Пароль обязателен'
    }),
  first_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Имя должно содержать минимум {#limit} символа',
      'string.max': 'Имя должно содержать максимум {#limit} символов',
      'any.required': 'Имя обязательно'
    }),
  last_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Фамилия должна содержать минимум {#limit} символа',
      'string.max': 'Фамилия должна содержать максимум {#limit} символов',
      'any.required': 'Фамилия обязательна'
    })
})

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email должен быть корректным',
      'any.required': 'Email обязателен'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Пароль обязателен'
    }),
  remember: Joi.boolean()
    .default(false)
})

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Текущий пароль обязателен'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      'string.min': 'Новый пароль должен содержать минимум {#limit} символов',
      'string.max': 'Новый пароль должен содержать максимум {#limit} символов',
      'any.required': 'Новый пароль обязателен'
    })
})

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema
} 