/**
 * Модель настроек уведомлений
 */

const { Model, DataTypes } = require('sequelize')

class NotificationSettings extends Model {
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
          unique: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        channels: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {
            email: {
              enabled: true,
              address: '',
              frequency: 'instant'
            },
            push: {
              enabled: true,
              desktop: true,
              mobile: true
            },
            telegram: {
              enabled: false,
              username: ''
            }
          }
        },
        types: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {
            system: {
              enabled: true,
              channels: ['push'],
              importance: 'normal'
            },
            contest: {
              enabled: true,
              channels: ['email', 'push'],
              importance: 'high'
            },
            platform: {
              enabled: true,
              channels: ['push'],
              importance: 'low'
            },
            security: {
              enabled: true,
              channels: ['email', 'push', 'telegram'],
              importance: 'critical'
            }
          }
        },
        schedule: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {
            quietHours: {
              enabled: false,
              start: '23:00',
              end: '07:00'
            },
            days: {
              mon: true,
              tue: true,
              wed: true,
              thu: true,
              fri: true,
              sat: true,
              sun: true
            }
          }
        }
      },
      {
        sequelize,
        modelName: 'NotificationSettings',
        tableName: 'notification_settings',
        underscored: true,
        timestamps: true,
        indexes: [
          { unique: true, fields: ['user_id'] }
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

module.exports = NotificationSettings 