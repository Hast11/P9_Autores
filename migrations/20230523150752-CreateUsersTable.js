'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('Users',
          {
              id: {
                  type: Sequelize.INTEGER,
                  allowNull: false,
                  primaryKey: true,
                  autoIncrement: true,
                  unique: true
              },
              username: {
                  type: Sequelize.STRING,
                  unique: true,
                  validate: {
                      notEmpty: {msg: "Username must not be empty."}
                  }
              },
              password: {
                  type: Sequelize.STRING,
                  validate: {notEmpty: {msg: "Password must not be empty."}}
              },
              salt: {
                type: Sequelize.STRING
              },
              email: {
                type: Sequelize.STRING,
                  validate: {inEmail: {msg: "Email format wrong."}}
              },
              isAdmin: {
                  type: Sequelize.BOOLEAN,
                  defaultValue: false
              }
            ,
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

  down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('Users');
  }
};