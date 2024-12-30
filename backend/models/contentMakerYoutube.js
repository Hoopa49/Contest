module.exports = (sequelize, DataTypes) => {
    const contentMakerYoutube = sequelize.define('contentMakerYoutube', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      youtubeId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      contestCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      lastVideoCheck: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      }, {
      indexes: [
        {
          fields: ['contestCount'],
          name: 'idx_contest_count'
        },
        {
          fields: ['youtubeId'],
          unique: true,
          name: 'idx_youtube_id'
        }
      ]
    });
  
    return contentMakerYoutube;
  };