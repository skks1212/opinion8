"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Voters", "voterId", {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            notEmpty: true,
            validate: {
                notNull: {
                    msg: "Voter ID is required",
                },
                notEmpty: {
                    msg: "Voter ID is required",
                },
            },
        });
        await queryInterface.removeColumn("Voters", "email");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Voters", "voterId");
        await queryInterface.addColumn("Voters", "email", {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            notEmpty: true,
            validate: {
                notNull: {
                    msg: "Email is required",
                },
                notEmpty: {
                    msg: "Email is required",
                },
            },
        });
    },
};
