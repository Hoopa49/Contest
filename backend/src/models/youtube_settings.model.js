const { Model, DataTypes } = require('sequelize');

class YoutubeSettings extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      quota_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10000
      },
      search_interval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      channel_check_interval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60
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
      },
      last_sync: {
        type: DataTypes.DATE,
        allowNull: true
      },
      next_sync: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'YoutubeSettings',
      tableName: 'youtube_settings',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  static associate(models) {
    // Здесь можно определить связи с другими моделями, если они нужны
  }
}

module.exports = YoutubeSettings; 