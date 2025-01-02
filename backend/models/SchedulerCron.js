module.exports = (sequelize, DataTypes) => {
  const SchedulerCron = sequelize.define('scheduler_cron', {
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    frequency: {
      type: DataTypes.STRING,
      defaultValue: 'daily'
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    days: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: []
    },
    last_run: {
      type: DataTypes.DATE,
      allowNull: true
    },
    next_run: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return SchedulerCron;
}; 