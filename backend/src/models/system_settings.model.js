/**
 * Модель системных настроек
 */

const { Model, DataTypes } = require('sequelize')

class SystemSettings extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      sequelize,
      tableName: 'system_settings',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['category'] },
        { fields: ['is_active'] }
      ]
    })
    return this
  }

  static associate(models) {
    SystemSettings.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'lastUpdatedBy'
    })
  }
}

module.exports = SystemSettings 