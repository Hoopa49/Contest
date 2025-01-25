const { Model, DataTypes } = require('sequelize');

class YoutubeApiQuota extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          unique: true,
        },
        quota_used: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        quota_limit: {
          type: DataTypes.INTEGER,
          defaultValue: 10000,
        },
        search_requests: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        video_requests: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        channel_requests: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        captions_requests: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        error_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        last_request_time: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('active', 'warning', 'exceeded'),
          defaultValue: 'active',
        },
      },
      {
        sequelize,
        modelName: 'youtube_api_quota',
        tableName: 'youtube_api_quotas',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models) {
    // Здесь будут определены связи с другими моделями, если потребуется
  }
}

module.exports = YoutubeApiQuota; 