/**
 * Модель настроек пользователя
 */

const { Model, DataTypes } = require('sequelize')

class Settings extends Model {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      value: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'settings',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['name'] }
      ]
    })
    return this
  }

  static associate(models) {
    Settings.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    })
  }
}

module.exports = Settings 