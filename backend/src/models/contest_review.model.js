const { Model, DataTypes } = require('sequelize')
const { logger } = require('../logging')

class ContestReview extends Model {
  static init(sequelize) {

    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      contest_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'contests',
          key: 'id'
        }
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_edited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      reports_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'ContestReview',
      tableName: 'contest_reviews',
      timestamps: true,
      underscored: true
    })
  }

  static associate(models) {

    // Связь с конкурсом
    this.belongsTo(models.Contest, {
      foreignKey: 'contest_id',
      as: 'contest'
    })

    // Связь с автором
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'author'
    })

    // Связь с лайками
    this.belongsToMany(models.User, {
      through: 'review_likes',
      foreignKey: 'review_id',
      as: 'liked_by'
    })

    // Связь с жалобами
    this.belongsToMany(models.User, {
      through: 'review_reports',
      foreignKey: 'review_id',
      as: 'reported_by'
    })
  }
}

module.exports = ContestReview 