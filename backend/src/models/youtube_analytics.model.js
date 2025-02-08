const { Model, DataTypes } = require('sequelize');
const logger = require('../logging');

class YoutubeAnalytics extends Model {
  static init(sequelize) {

    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      contests_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      participants_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      contest_types: {
        type: DataTypes.JSONB,
        defaultValue: []
      }
    }, {
      sequelize,
      modelName: 'youtube_analytics',
      tableName: 'youtube_analytics',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['date']
        }
      ]
    });
    return this;
  }

  static associate(models) {
    // Здесь будут определены связи с другими моделями, если потребуется
  }
}

module.exports = YoutubeAnalytics; 