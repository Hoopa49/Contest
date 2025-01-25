const { Model, DataTypes } = require('sequelize');

class YoutubeChannel extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        channel_id: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        subscriber_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        video_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        view_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        thumbnail_url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        country: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        contest_channel: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        contest_videos_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        last_video_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        last_checked: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive', 'blocked'),
          defaultValue: 'active',
        },
      },
      {
        sequelize,
        modelName: 'youtube_channel',
        tableName: 'youtube_channels',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.youtube_video, {
      foreignKey: 'channel_id',
      sourceKey: 'channel_id',
      as: 'videos'
    });
  }
}

module.exports = YoutubeChannel; 