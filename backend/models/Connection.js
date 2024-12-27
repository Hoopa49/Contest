// models/connection.js

const Video = require('./Video');
const Contest = require('./Contest');
const User = require('./User');

// Настраиваем связь один-ко-многим (One-to-Many):
// 1) Один Video может иметь много Contests
Video.hasMany(Contest, {
  foreignKey: 'videoId',
  as: 'contests',    // алиас для доступа, например video.getContests()
});

// 2) Один Contest принадлежит конкретному Video
Contest.belongsTo(Video, {
  foreignKey: 'videoId',
  as: 'video',       // алиас для доступа, например contest.getVideo()
});

// Экспортируем обе модели
module.exports = { Video, Contest, User };
