/**
 * Модель пользователя
 * Определяет структуру и методы для работы с пользователями
 */

const { Model, DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const logger = require('../logging')

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
          validate: {
            isEmail: {
              msg: 'Некорректный email адрес'
            },
            emailRequiredForLocal() {
              if (this.auth_provider === 'local' && !this.email) {
                throw new Error('Email обязателен для локальной авторизации')
              }
            }
          }
        },
        telegram_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
          unique: true
        },
        auth_provider: {
          type: DataTypes.ENUM('local', 'google', 'vk', 'telegram'),
          allowNull: false,
          defaultValue: 'local'
        },
        password_hash: {
          type: DataTypes.STRING,
          allowNull: true
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: true
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: true
        },
        username: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true
        },
        avatar: {
          type: DataTypes.STRING,
          allowNull: true
        },
        role: {
          type: DataTypes.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user'
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        is_blocked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true
        },
        rating: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 5
          }
        }
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true, // использовать snake_case для полей
        timestamps: true, // использовать created_at и updated_at
        hooks: {
          beforeSave: async (user) => {
            if (user.changed('password_hash')) {
              // Проверяем, что пароль не хешированный
              if (!user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10)
              }
            }
          }
        }
      }
    )

    return this
  }

  // Виртуальные поля
  get fullName() {
    if (this.first_name && this.last_name) {
      return `${this.first_name} ${this.last_name}`
    }
    return this.first_name || this.last_name || 'Не указано'
  }

  // Методы для работы с паролем
  async validatePassword(password) {
    try {
      logger.debug('Проверка пароля для пользователя:', {
        email: this.email,
        storedHash: this.password_hash,
        providedPassword: password
      })

      const isValid = await bcrypt.compare(password, this.password_hash)
      logger.debug('Результат проверки пароля:', { isValid })
      
      return isValid
    } catch (error) {
      logger.error('Ошибка при сравнении паролей:', error)
      return false
    }
  }

  // Методы для сериализации
  toJSON() {
    const values = { ...this.get() }
    delete values.password_hash // Удаляем хеш пароля из ответа
    return values
  }

  // Ассоциации
  static associate(models) {
    // Связи с конкурсами
    this.hasMany(models.Contest, {
      foreignKey: 'user_id',
      as: 'contests'
    })
    
    this.hasMany(models.DraftContest, {
      foreignKey: 'user_id',
      as: 'draftContests'
    })
    
    this.hasMany(models.FavoriteContest, {
      foreignKey: 'user_id',
      as: 'favorites'
    })

    // Связи с уведомлениями
    this.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    })

    this.hasOne(models.NotificationSettings, {
      foreignKey: 'user_id',
      as: 'notificationSettings'
    })

    // Связь с активностью интеграций
    this.hasMany(models.IntegrationActivity, {
      foreignKey: 'user_id',
      as: 'integrationActivities'
    })
  }
}

module.exports = User 