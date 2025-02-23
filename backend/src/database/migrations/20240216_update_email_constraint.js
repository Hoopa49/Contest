'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Сначала удаляем ограничение NOT NULL
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Возвращаем ограничение NOT NULL
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  }
}; 