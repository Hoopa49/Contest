module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define('Videos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    publicationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: { 
      type: DataTypes.TEXT,
      allowNull: true
    },
    channelTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    viewCount: {
      type: DataTypes.STRING,
      allowNull: true
    },
    likeCount: {
      type: DataTypes.STRING,
      allowNull: true
    },
    youtubeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    metadata: { 
      type: DataTypes.JSONB,
      allowNull: true
    },
    status: { 
      type: DataTypes.JSONB,
      allowNull: true
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return Video;
};