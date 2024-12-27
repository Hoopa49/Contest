// backend/models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ваш экземпляр Sequelize

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // e-mail не должен дублироваться
    validate: {
      isEmail: true // встроенная проверка формата
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
    // Внимание: Это будет хранить хеш (не сам пароль)
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user' 
    // Можно хранить "user", "admin" и т. д.
  }
}, {
  tableName: 'users',
  timestamps: true // createdAt, updatedAt
});

module.exports = User;
