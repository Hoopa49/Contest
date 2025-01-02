const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SchedulerHistory = sequelize.define('SchedulerHistory', {
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('running', 'completed', 'error', 'stopped'),
      defaultValue: 'running'
    },
    totalVideos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    processedVideos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    foundContests: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    apiRequests: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    quotaUsed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'SchedulerHistories',
    timestamps: true
  });

  return SchedulerHistory;
}; 