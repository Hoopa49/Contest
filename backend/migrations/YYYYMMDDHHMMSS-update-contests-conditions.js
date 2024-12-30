"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Обновляем существующие записи без условий
      await queryInterface.sequelize.query(`
        UPDATE "Contests" 
        SET conditions = 'Условия не указаны'
        WHERE conditions IS NULL
      `);

      // 2. Изменяем ограничение на колонку conditions
      await queryInterface.changeColumn("Contests", "conditions", {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "Условия не указаны",
      });
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Возвращаем возможность null значений
      await queryInterface.changeColumn("Contests", "conditions", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    } catch (error) {
      console.error("Migration rollback failed:", error);
      throw error;
    }
  },
};
