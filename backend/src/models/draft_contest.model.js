/**
 * DraftContest Model
 * Модель для хранения черновиков конкурсов
 */

const { Model, DataTypes } = require('sequelize')

class DraftContest extends Model {
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
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      platform_type: {
        type: DataTypes.ENUM('youtube', 'instagram', 'telegram', 'vk'),
        allowNull: true
      },
      draft_status: {
        type: DataTypes.ENUM('in_progress', 'completed', 'cancelled'),
        defaultValue: 'in_progress',
        allowNull: false
      },
      platform_data: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: false
      },
      prizes_data: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: false
      },
      rules_data: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: false
      },
      requirements_data: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: false
      },
      current_step: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      completion_percentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'DraftContest',
      tableName: 'draft_contests',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['draft_status'] },
        { fields: ['created_at'] }
      ]
    });

    return this;
  }

  static associate(models) {
    DraftContest.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    DraftContest.hasOne(models.Contest, {
      foreignKey: 'draft_id',
      as: 'contest'
    });
  }
}

module.exports = DraftContest; 