module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('youtube_settings', 'api_key');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('youtube_settings', 'api_key', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 