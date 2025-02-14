'use strict'

const { Model, DataTypes } = require('sequelize')
const logger = require('../logging')

class ContestShareStats extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
      platform: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['VK', 'Telegram', 'WhatsApp', 'Instagram', 'X', 'Facebook']]
        }
      },
      shares_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      }
    }, {
      sequelize,
      modelName: 'ContestShareStats',
      tableName: 'contest_share_stats',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['contest_id', 'platform']
        }
      ]
    })
    return this
  }

  static associate(models) {
    this.belongsTo(models.Contest, {
      foreignKey: 'contest_id',
      as: 'contest'
    })
  }
}

module.exports = ContestShareStats 