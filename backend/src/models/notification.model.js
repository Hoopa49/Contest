/**
 * Модель уведомлений
 */

const { Model, DataTypes } = require('sequelize')

class Notification extends Model {
  static init(sequelize) {
    super.init(
      {
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
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        type: {
          type: DataTypes.ENUM('system', 'contest', 'platform', 'security'),
          allowNull: false,
          defaultValue: 'system'
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        data: {
          type: DataTypes.JSONB,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        underscored: true,
        timestamps: true,
        paranoid: true, // Включаем soft delete (deleted_at)
        indexes: [
          { fields: ['user_id'] },
          { fields: ['type'] },
          { fields: ['read'] },
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

module.exports = Notification 