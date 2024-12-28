module.exports = (sequelize, DataTypes) => {
  const Contest = sequelize.define('Contest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true // временно разрешим null
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Videos',
        key: 'id'
      }
    }
  }, {
    tableName: 'Contests',
    timestamps: true
  });

  return Contest;
};