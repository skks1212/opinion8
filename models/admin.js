"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Admin.hasMany(models.Election, {
                foreignKey: "adminId",
                as: "elections",
            });
        }

        static createUser(userCreds) {
            return this.create(userCreds);
        }
    }
    Admin.init(
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
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Name is required",
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
            modelName: "Admin",
        }
    );
    return Admin;
};
