'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Добавляем новую колонку
    await queryInterface.addColumn('users', 'telegram_id_new', {
      type: Sequelize.BIGINT,
      allowNull: true
    });

    // 2. Копируем данные с явным приведением типов
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET telegram_id_new = telegram_id::bigint 
      WHERE telegram_id IS NOT NULL
    `);

    // 3. Удаляем старую колонку
    await queryInterface.removeColumn('users', 'telegram_id');

    // 4. Переименовываем новую колонку
    await queryInterface.renameColumn('users', 'telegram_id_new', 'telegram_id');
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Добавляем временную колонку
    await queryInterface.addColumn('users', 'telegram_id_old', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // 2. Копируем данные обратно
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET telegram_id_old = telegram_id::integer 
      WHERE telegram_id IS NOT NULL
    `);

    // 3. Удаляем колонку BIGINT
    await queryInterface.removeColumn('users', 'telegram_id');

    // 4. Переименовываем обратно
    await queryInterface.renameColumn('users', 'telegram_id_old', 'telegram_id');
  }
}; 