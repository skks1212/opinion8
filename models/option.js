"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Option extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Option.belongsTo(models.Question, {
                foreignKey: "questionId",
                onDelete: "CASCADE",
            });
        }

        static async createOption({ option }, questionId, adminId) {
            const verify = await sequelize.models.Question.findOne({
                where: {
                    id: questionId,
                },
                include: [
                    {
                        model: sequelize.models.Election,
                        as: "election",
                        where: {
                            adminId,
                        },
                    },
                ],
            });
            if (!verify) {
                throw { errors: [{ message: "Question does not exist" }] };
            }
            const newOption = await this.create({
                option,
                questionId,
            });
            return newOption;
        }

        static async updateOption({ option }, optionId, adminId) {
            const verify = await sequelize.models.Question.findOne({
                where: {
                    id: this.questionId,
                },
                include: [
                    {
                        model: sequelize.models.Election,
                        as: "election",
                    },
                ],
            }).election.adminId;
            if (verify !== adminId) {
                throw { errors: [{ message: "Question does not exist" }] };
            }
            const updatedOption = await this.update(
                {
                    option,
                },
                {
                    where: {
                        id: optionId,
                    },
                }
            );
            return updatedOption;
        }

        static async deleteOption(optionId, adminId) {
            const verify = await sequelize.models.Question.findAll({
                where: {
                    id: this.questionId,
                },
                include: [
                    {
                        model: sequelize.models.Election,
                        as: "election",
                    },
                ],
            });

            if (
                verify.find((q) => q.id === optionId).election.adminId !==
                adminId
            ) {
                throw { errors: [{ message: "Question does not exist" }] };
            }
            if (verify.length < 2) {
                throw {
                    errors: [
                        { message: "Question must have at least 1 option" },
                    ],
                };
            }
            const deletedOption = await this.destroy({
                where: {
                    id: optionId,
                },
            });
            return deletedOption;
        }
    }
    Option.init(
        {
            option: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Option is required",
                    },
                },
            },
        },
        {
            sequelize,
            modelName: "Option",
        }
    );
    return Option;
};
