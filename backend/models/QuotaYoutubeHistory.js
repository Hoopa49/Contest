module.exports = (sequelize, DataTypes) => {
  const QuotaHistory = sequelize.define('QuotaHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quotaUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    dailyLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10000
    },
    resetDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'quota_histories_youtube',
    timestamps: true
  });

  return QuotaHistory;
}; 