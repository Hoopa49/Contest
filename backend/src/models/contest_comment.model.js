const { Model, DataTypes } = require('sequelize')
const { logger } = require('../logging')

class ContestComment extends Model {
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
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'contest_comments',
          key: 'id'
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_edited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      sequelize,
      modelName: 'ContestComment',
      tableName: 'contest_comments',
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

    // Связь с родительским комментарием
    this.belongsTo(models.ContestComment, {
      foreignKey: 'parent_id',
      as: 'parent'
    })

    // Связь с ответами
    this.hasMany(models.ContestComment, {
      foreignKey: 'parent_id',
      as: 'replies'
    })
  }
}

module.exports = ContestComment 