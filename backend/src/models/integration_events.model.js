const { Model, DataTypes } = require('sequelize')
const logger = require('../logging')

class IntegrationEvent extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('success', 'error', 'warning', 'info'),
        allowNull: false,
        defaultValue: 'info'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      data: {
        type: DataTypes.JSONB,
        defaultValue: {}
      }
    }, {
      sequelize,
      modelName: 'IntegrationEvent',
      tableName: 'integration_events',
      timestamps: true,
      underscored: true
    })
    return this
  }

  static associate(models) {
    // В будущем здесь можно добавить связи с другими моделями
  }
}

module.exports = IntegrationEvent 