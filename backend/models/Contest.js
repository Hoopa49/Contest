// models/Contest.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // ваш объект Sequelize

// Опишем поля
const Contest = sequelize.define('Contest', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prize: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  conditions: {
    type: DataTypes.TEXT,
    allowNull: true // можно сделать тоже обязательным, если нужно
  }
}, {
  tableName: 'contests',
  timestamps: true
});

module.exports = Contest;
