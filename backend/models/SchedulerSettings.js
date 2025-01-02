module.exports = (sequelize, DataTypes) => {
  const SchedulerSettings = sequelize.define('scheduler_settings', {
    maxVideosPerRun: {
      type: DataTypes.INTEGER,
      defaultValue: 200,
      field: 'max_videos_per_run'
    },
    maxApiRequestsPerRun: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
      field: 'max_api_requests_per_run'
    },
    minVideoViews: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
      field: 'min_video_views'
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ["конкурс розыгрыш", "giveaway приз", "розыгрыш приза"]
    },
    titleWeight: {
      type: DataTypes.FLOAT,
      defaultValue: 1.0,
      field: 'title_weight'
    },
    descriptionWeight: {
      type: DataTypes.FLOAT,
      defaultValue: 0.7,
      field: 'description_weight'
    },
    tagsWeight: {
      type: DataTypes.FLOAT,
      defaultValue: 0.3,
      field: 'tags_weight'
    },
    minimumTotalScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0.5,
      field: 'minimum_total_score'
    },
    minDurationMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'min_duration_minutes'
    },
    maxDurationMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'max_duration_minutes'
    },
    minLikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'min_likes'
    }
  }, {
    timestamps: true
  });

  return SchedulerSettings;
}; 