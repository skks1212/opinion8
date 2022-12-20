"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint("Elections", {
            fields: ["customUrl"],
            type: "unique",
            name: "customUrl_unique",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint("Elections", "customUrl_unique");
    },
};
