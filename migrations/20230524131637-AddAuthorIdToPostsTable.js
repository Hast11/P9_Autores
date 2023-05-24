'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn(
          'Posts',//Tabla que voy a modificar
          'authorId', //Columna que añado
          {
              type: Sequelize.INTEGER,
              references: { //A que hace referencia
                  model: "Users", //A la tabla de usuario
                  key: "id" //A traves de su id
              },
              onUpdate: 'CASCADE',
              onDelete: 'SET NULL'
          }
      );
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Posts', 'authorId');
  }
};