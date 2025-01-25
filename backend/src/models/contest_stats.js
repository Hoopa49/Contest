const { Model, DataTypes } = require('sequelize')

class ContestStats extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      contest_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'contests',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      participants_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      favorites_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      activity_data: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'contest_stats',
      tableName: 'contest_stats',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  static associate(models) {
    this.belongsTo(models.Contest, {
      foreignKey: 'contest_id',
      as: 'contest'
    })
  }
}

module.exports = ContestStats 