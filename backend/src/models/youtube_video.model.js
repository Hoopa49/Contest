const { Model, DataTypes } = require('sequelize');

class YoutubeVideo extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        youtube_id: {
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
        channel_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        channel_title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        publish_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        views_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        likes_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        comments_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        tags: {
          type: DataTypes.JSON,
          defaultValue: [],
        },
        category_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        duration: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        thumbnail_url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        is_contest: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        contest_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        contest_status: {
          type: DataTypes.ENUM('active', 'ended', 'cancelled'),
          allowNull: true,
        },
        prize_value: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        contest_probability: {
          type: DataTypes.FLOAT,
          defaultValue: 0,
        },
        processed: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        last_updated: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        status: {
          type: DataTypes.ENUM('pending', 'processing', 'processed', 'error'),
          defaultValue: 'pending',
        },
        error_message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'youtube_video',
        tableName: 'youtube_videos',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.youtube_channel, {
      foreignKey: 'channel_id',
      targetKey: 'channel_id',
      as: 'channel'
    });
  }
}

module.exports = YoutubeVideo; 