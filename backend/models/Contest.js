module.exports = (sequelize, DataTypes) => {
  const Contest = sequelize.define('Contest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true 
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prize: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    conditions: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Условия не указаны'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    videoId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'Videos',
        key: 'youtubeId'
      }
    }
  }, {
    tableName: 'Contests',
    timestamps: true
  });

  return Contest;
};