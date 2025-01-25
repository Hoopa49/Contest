/**
 * Модель системных логов
 */

const { Model, DataTypes } = require('sequelize')

class Log extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        type: {
          type: DataTypes.ENUM('api_request', 'user_action', 'error', 'system'),
          allowNull: false
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        action: {
          type: DataTypes.STRING,
          allowNull: false
        },
        details: {
          type: DataTypes.JSONB,
          allowNull: true
        },
        ip_address: {
          type: DataTypes.STRING,
          allowNull: true
        },
        user_agent: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'logs',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['user_id'] },
          { fields: ['type'] },
          { fields: ['created_at'] }
        ]
      }
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    })
  }
}

module.exports = Log 