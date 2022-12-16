"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Votes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      voterId: {
        type: Sequelize.INTEGER,
      },
      optionId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addConstraint("Votes", {
      fields: ["voterId"],
      type: "foreign key",
      references: {
        table: "Voters",
        field: "id",
      },
    });
    await queryInterface.addConstraint("Votes", {
      fields: ["optionId"],
      type: "foreign key",
      references: {
        table: "Options",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Votes");
  },
};
