module.exports = (sequelize, DataTypes) => {
  const ContentMakerYoutube = sequelize.define('ContentMakerYoutube', {
    youtubeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contestCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastVideoCheck: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'content_makers_youtube',
    timestamps: true
  });

  return ContentMakerYoutube;
};