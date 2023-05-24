'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      'Posts', //TABLA QUE VOY A MODIFICAR
      'authorId', //COLUMNA QUE AÑADO
      {
          type: Sequelize.INTEGER,
          references: { //A que hace referencia
              model: "Users", // A la tabla de usuario
              key: "id" //A traves de su id
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
      });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Posts', 'authorId');
  }
};
