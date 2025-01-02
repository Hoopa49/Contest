const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Импорт моделей
const models = {
  SearchCache: require('./SearchCacheYoutube')(sequelize, DataTypes),
  SchedulerSettings: require('./SchedulerSettings')(sequelize, DataTypes),
  SchedulerHistory: require('./SchedulerHistory')(sequelize, DataTypes),
  User: require('./User')(sequelize, DataTypes),
  Video: require('./Video')(sequelize, DataTypes),
  Contest: require('./Contest')(sequelize, DataTypes),
  ContentMakerYoutube: require('./contentMakerYoutube')(sequelize, DataTypes),
  SchedulerCron: require('./SchedulerCron')(sequelize, DataTypes),
  QuotaHistory: require('./QuotaYoutubeHistory')(sequelize, DataTypes)
};

// Определяем связи
models.Video.belongsTo(models.ContentMakerYoutube, { 
  foreignKey: 'channelId', 
  targetKey: 'youtubeId' 
});

models.ContentMakerYoutube.hasMany(models.Video, { 
  foreignKey: 'channelId', 
  sourceKey: 'youtubeId' 
});

module.exports = { sequelize, ...models };