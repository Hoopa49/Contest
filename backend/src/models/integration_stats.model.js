const { Model, DataTypes } = require('sequelize')
const logger = require('../logging')

class IntegrationStats extends Model {
  static init(sequelize) {
    
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      last_sync: {
        type: DataTypes.DATE,
        allowNull: true
      },
      contests_found: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      error_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      requests_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      successful_requests: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      failed_requests: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'IntegrationStats',
      tableName: 'integration_stats',
      timestamps: true,
      underscored: true
    })
    return this
  }
}

module.exports = IntegrationStats 