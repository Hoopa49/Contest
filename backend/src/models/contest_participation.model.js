const { Model, DataTypes } = require('sequelize')
const logger = require('../logging')

class ContestParticipation extends Model {
  static init(sequelize) {

    super.init({
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
        }
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      submission_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      submission_data: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'ContestParticipation',
      tableName: 'contest_participations',
      timestamps: true,
      underscored: true
    })
  }

  static associate(models) {

    // Связь с конкурсом
    this.belongsTo(models.Contest, {
      foreignKey: 'contest_id',
      as: 'contest'
    })

    // Связь с участником
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'participant'
    })
  }
}

module.exports = ContestParticipation 