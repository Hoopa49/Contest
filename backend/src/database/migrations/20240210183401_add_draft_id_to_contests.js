'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contests', 'draft_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'draft_contests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Создаем индекс для оптимизации поиска
    await queryInterface.addIndex('contests', ['draft_id']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индекс
    await queryInterface.removeIndex('contests', ['draft_id']);
    
    // Удаляем колонку
    await queryInterface.removeColumn('contests', 'draft_id');
  }
}; 