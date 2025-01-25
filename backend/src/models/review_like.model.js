const { Model, DataTypes } = require('sequelize')

class ReviewLike extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      review_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'contest_reviews',
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
    }, {
      sequelize,
      modelName: 'ReviewLike',
      tableName: 'review_likes',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['review_id', 'user_id'],
          name: 'review_likes_review_user_unique'
        },
        { fields: ['review_id'], name: 'review_likes_review_id_idx' },
        { fields: ['user_id'], name: 'review_likes_user_id_idx' }
      ]
    })
    return this
  }

  static associate(models) {
    this.belongsTo(models.ContestReview, {
      foreignKey: 'review_id',
      as: 'review'
    })
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    })
  }
}

module.exports = ReviewLike