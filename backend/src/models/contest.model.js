/**
 * Contest Model
 * Модель для хранения обработанных данных о конкурсах
 */

const { Model, DataTypes } = require('sequelize')
const { logger } = require('../logging')

class Contest extends Model {
  static init(sequelize) {

    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      rules_data: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      prizes_data: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      requirements_data: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      platform_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      platform_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      source_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      contest_status: {
        type: DataTypes.ENUM('draft', 'active', 'completed', 'cancelled'),
        defaultValue: 'draft'
      },
      allow_comments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      allow_reviews: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      allow_rating: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Contest',
      tableName: 'contests',
      timestamps: true,
      underscored: true
    })
  }

  static associate(models) {

    // Связь с создателем конкурса
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'author'
    })

    // Связь с участиями в конкурсе
    this.hasMany(models.ContestParticipation, {
      foreignKey: 'contest_id',
      as: 'participations'
    })

    // Связь с участниками
    this.belongsToMany(models.User, {
      through: models.ContestParticipation,
      foreignKey: 'contest_id',
      otherKey: 'user_id',
      as: 'participants'
    })

    // Связь с избранным
    this.hasMany(models.FavoriteContest, {
      foreignKey: 'contest_id',
      as: 'favorites'
    })

    // Связь с пользователями через избранное
    this.belongsToMany(models.User, {
      through: models.FavoriteContest,
      foreignKey: 'contest_id',
      otherKey: 'user_id',
      as: 'favorited_by'
    })

    // Связь с комментариями
    this.hasMany(models.ContestComment, {
      foreignKey: 'contest_id',
      as: 'comments'
    })

    // Связь с отзывами
    this.hasMany(models.ContestReview, {
      foreignKey: 'contest_id',
      as: 'reviews'
    })

    // Связь со статистикой
    this.hasOne(models.ContestStats, {
      foreignKey: 'contest_id',
      as: 'stats'
    })
  }
}

module.exports = Contest 