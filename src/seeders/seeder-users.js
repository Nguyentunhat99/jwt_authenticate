'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      username: 'admin',
      email: 'nguyentunhat99@gmail.com',
      password: '$2a$10$/Y8w6yXTecmWDv/z7XNNwOHeQEC00roHgosBsP563LpqgyBNCTw6i',
      roleId:  1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
