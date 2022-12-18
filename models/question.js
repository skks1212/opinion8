"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Question extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Question.belongsTo(models.Election, {
                foreignKey: "electionId",
                as: "election",
                onDelete: "CASCADE",
            });
            Question.hasMany(models.Option, {
                foreignKey: "questionId",
                as: "options",
                onDelete: "CASCADE",
            });
        }

        static async createQuestion(
            { question, description },
            electionId,
            adminId
        ) {
            const verify = await sequelize.models.Election.findOne({
                where: {
                    id: electionId,
                    adminId,
                    [Op.or]: [{ status: null }, { status: 1 }],
                },
            });
            if (!verify) {
                throw { errors: [{ message: "Election does not exist" }] };
            }
            const newQuestion = await this.create({
                question,
                description,
                electionId,
            });
            await sequelize.models.Option.create({
                option: "Option",
                questionId: newQuestion.id,
            });
            return newQuestion;
        }

        static async updateQuestion(
            { question, description },
            questionId,
            adminId
        ) {
            const updatedQuestion = await this.update(
                {
                    question,
                    description,
                },
                {
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
                }
            );
            return updatedQuestion;
        }

        static async deleteQuestion(questionId, adminId) {
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
            await sequelize.models.Option.destroy({
                where: {
                    questionId,
                },
            });
            if (!verify) {
                throw { errors: [{ message: "Election does not exist" }] };
            }
            const deletedQuestion = await this.destroy({
                where: {
                    id: questionId,
                },
            });
            return deletedQuestion;
        }
    }
    Question.init(
        {
            question: {
                type: DataTypes.STRING,
                notEmpty: true,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Question is required",
                    },
                    notEmpty: {
                        msg: "Question is required",
                    },
                },
            },
            description: DataTypes.TEXT,
        },
        {
            sequelize,
            modelName: "Question",
        }
    );
    return Question;
};
