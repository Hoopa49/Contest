const { Model, DataTypes } = require('sequelize')

// Модель для хранения избранных конкурсов пользователей
class FavoriteContest extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        contest_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'contests',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
        }
      },
      {
        sequelize,
        modelName: 'FavoriteContest',
        tableName: 'favorite_contests',
        underscored: true,
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['contest_id', 'user_id'],
            name: 'favorite_contests_contest_user_unique'
          },
          { fields: ['contest_id'], name: 'favorite_contests_contest_id_idx' },
          { fields: ['user_id'], name: 'favorite_contests_user_id_idx' }
        ]
      }
    )
  }

  static associate(models) {
    this.belongsTo(models.Contest, {
      foreignKey: 'contest_id',
      as: 'contest'
    })
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    })
  }
}

module.exports = FavoriteContest 