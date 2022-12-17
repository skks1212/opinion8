"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Voter extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Voter.belongsToMany(models.Election, {
                through: "VoterElection",
                foreignKey: "voterId",
                as: "elections",
            });
        }
    }
    Voter.init(
        {
            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
                isEmail: true,
                validate: {
                    isEmail: true,
                    notNull: {
                        msg: "Email is required",
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Password is required",
                    },
                },
            },
        },
        {
            sequelize,
            modelName: "Voter",
        }
    );
    return Voter;
};
