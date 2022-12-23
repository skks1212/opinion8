"use strict";
const { Model, Op } = require("sequelize");
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
                as: "question",
                onDelete: "CASCADE",
            });
            Option.hasMany(models.Vote, {
                foreignKey: "optionId",
                as: "votes",
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
                            [Op.or]: [{ status: null }, { status: 1 }],
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
            console.error(newOption);
            return newOption;
        }

        static async updateOption({ option }, optionId, adminId) {
            const verify = await this.findOne({
                where: {
                    id: optionId,
                },
                include: [
                    {
                        model: sequelize.models.Question,
                        as: "question",
                        include: [
                            {
                                model: sequelize.models.Election,
                                as: "election",
                                where: {
                                    adminId,
                                    [Op.or]: [{ status: null }, { status: 1 }],
                                },
                            },
                        ],
                    },
                ],
            });
            if (!verify) {
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
            const verify = await this.findOne({
                where: {
                    id: optionId,
                },
                include: [
                    {
                        model: sequelize.models.Question,
                        as: "question",
                        include: [
                            {
                                model: sequelize.models.Election,
                                as: "election",
                                where: {
                                    adminId,
                                    [Op.or]: [{ status: null }, { status: 1 }],
                                },
                            },
                        ],
                    },
                ],
            });
            if (!verify) {
                throw { errors: [{ message: "Question does not exist" }] };
            }
            const totalOptions = await this.count({
                where: {
                    questionId: verify.questionId,
                },
            });
            if (totalOptions < 2) {
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
                notEmpty: true,
                validate: {
                    notNull: {
                        msg: "Option is required",
                    },
                    notEmpty: {
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
