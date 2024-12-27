// backend/models/Video.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // <-- тот самый файл db.js

const Video = sequelize.define('Video', {
  // id будет создан автоматически (PRIMARY KEY)
  title: {
    type: DataTypes.STRING, // VARCHAR(255)
    allowNull: false,       // NOT NULL
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Unknown'
  },
  transcript: {
    type: DataTypes.TEXT,
    allowNull: true,        // можно оставить пустым
  },
}, {
  tableName: 'videos', // название таблицы в БД
  timestamps: true,    // включает поля createdAt, updatedAt
});

module.exports = Video;
