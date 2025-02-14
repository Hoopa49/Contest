/**
 * Модель истории системных настроек
 */

const { Model, DataTypes } = require('sequelize')

class SystemSettingsHistory extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      settings_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'system_settings',
          key: 'id'
        }
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      changes: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      tableName: 'system_settings_history',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['settings_id'] },
        { fields: ['category'] },
        { fields: ['created_at'] }
      ]
    })
    return this
  }

  static associate(models) {
    SystemSettingsHistory.belongsTo(models.SystemSettings, {
      foreignKey: 'settings_id',
      as: 'systemSettings'
    })
    
    SystemSettingsHistory.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updatedBy'
    })
  }
}

module.exports = SystemSettingsHistory 