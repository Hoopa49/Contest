/**
 * Модель аналитических данных
 */

const { Model, DataTypes } = require('sequelize')

class AnalyticsData extends Model {
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
      data: {
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
      }
    }, {
      sequelize,
      tableName: 'analytics_data',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['category'] },
        { fields: ['created_at'] }
      ]
    })
    return this
  }

  static associate(models) {
    AnalyticsData.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'lastUpdatedBy'
    })
  }
}

module.exports = AnalyticsData 