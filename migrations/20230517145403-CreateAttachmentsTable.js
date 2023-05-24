'use strict';
'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    /*
     * Add altering commands here.
     */
    await queryInterface.createTable(
      'Attachments',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true
        },
        mime: {
          type: Sequelize.STRING
        },
        url: {
          type: Sequelize.STRING
        },
        image: {
          type: Sequelize.BLOB('long')
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      },
      {
        sync: {force: true}
      }
    );
  },

  async down (queryInterface, Sequelize) {
    /*
     * Add reverting commands here.
     *
     */
    await queryInterface.dropTable('Attachments');
  }
};