'use strict';
const { v4: uuidv4 } = require("uuid");

            let expiredAt = new Date();
            expiredAt.setSeconds(expiredAt.getSeconds() + 86400);
            let _token = uuidv4();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('RefTokens', [{
      token: _token,
      userId: 1,
      expiryDate: expiredAt.getTime(),
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
