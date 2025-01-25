const { Model, DataTypes } = require('sequelize');

class YoutubeSettings extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      api_key: {
        type: DataTypes.STRING,
        allowNull: true
      },
      quota_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10000
      },
      search_interval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30 // минуты
      },
      channel_check_interval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60 // минуты
      },
      max_results: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'RU'
      },
      language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ru'
      },
      contest_probability_threshold: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.7
      },
      min_contest_videos_for_channel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3
      },
      last_sync: {
        type: DataTypes.DATE,
        allowNull: true
      },
      next_sync: {
        type: DataTypes.DATE,
        allowNull: true
      },
      video_order: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'date'
      },
      video_duration: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'any'
      },
      video_definition: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'any'
      },
      video_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'video'
      },
      min_subscriber_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      min_view_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      min_video_age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      max_video_age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
      }
    }, {
      sequelize,
      tableName: 'youtube_settings',
      timestamps: true,
      underscored: true
    });
  }
}

module.exports = YoutubeSettings; 