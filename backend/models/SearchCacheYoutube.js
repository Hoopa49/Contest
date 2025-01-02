module.exports = (sequelize, DataTypes) => {
  const SearchCache = sequelize.define('SearchCacheYoutube', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cacheKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    videos: {
      type: DataTypes.JSON,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'search_cache_youtube',
    timestamps: true,
    indexes: [
      {
        fields: ['cacheKey']
      },
      {
        fields: ['timestamp']
      }
    ]
  });

  return SearchCache;
}; 