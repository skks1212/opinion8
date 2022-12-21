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

        static async createUser(userCreds) {
            const verify = await this.findOne({
                where: {
                    email: userCreds.email,
                },
            });
            if (verify) {
                throw { errors: [{ message: "Email is already taken" }] };
            }
            return await this.create(userCreds);
        }

        static async updatePassword(password, id) {
            const user = await this.findByPk(id);
            if (!user) {
                throw { errors: [{ message: "User does not exist" }] };
            }
            user.password = password;
            return await user.save();
        }
    }
    Admin.init(
        {
            email: {
                type: DataTypes.STRING,
                unique: {
                    args: "email",
                    msg: "The email is already taken!",
                },
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
