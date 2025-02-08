const { Model, DataTypes } = require('sequelize')
const logger = require('../logging')

class IntegrationActivity extends Model {
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
      platform: {
        type: DataTypes.STRING,
        allowNull: false
      },
      action_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      action_data: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      status: {
        type: DataTypes.ENUM('success', 'error', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: true,
          isNotFuture(value) {
            if (value > new Date()) {
              throw new Error('Дата не может быть в будущем');
            }
          }
        }
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: true,
          isNotFuture(value) {
            if (value > new Date()) {
              throw new Error('Дата не может быть в будущем');
            }
          }
        }
      }
    }, {
      sequelize,
      modelName: 'IntegrationActivity',
      tableName: 'integration_activities',
      timestamps: true,
      underscored: true
    })
    return this
  }

  static associate(models) {
    // Связь с пользователем
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    })
  }
}

module.exports = IntegrationActivity 