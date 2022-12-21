"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Vote extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Vote.belongsTo(models.Voter, {
                foreignKey: "voterId",
                as: "voter",
                onDelete: "CASCADE",
            });
            Vote.belongsTo(models.Option, {
                foreignKey: "optionId",
                as: "option",
                onDelete: "CASCADE",
            });
        }

        static async createVotes(electionId, voterId, votes) {
            const { Option, Election, Question } = sequelize.models;
            const election = await Election.findByPk(electionId, {
                where: {
                    [Op.or]: [{ status: 1 }, { status: 2 }],
                },
            });
            if (!election) {
                throw { errors: [{ message: "Election not found" }] };
            }

            const existingVotes = await Vote.findAll({
                where: { voterId },
            });
            if (existingVotes.length) {
                throw { errors: [{ message: "Vote already cast" }] };
            }

            const questions = Object.keys(votes).map((q) => {
                return {
                    question: parseInt(q.replace("question_", "")),
                    option: parseInt(votes[q]),
                };
            });
            const allQuestions = await Question.findAll({
                where: { electionId },
            });
            if (
                questions.length !== allQuestions.length ||
                !questions.every((q) =>
                    allQuestions.find((aq) => aq.id === q.question)
                )
            ) {
                throw { errors: [{ message: "Invalid questions" }] };
            }

            questions.forEach(async (q) => {
                const verify = await Option.findOne({
                    where: { questionId: q.question, id: q.option },
                });
                if (!verify) {
                    throw { errors: [{ message: "Invalid options" }] };
                }
            });

            const vote = await Vote.bulkCreate(
                questions.map((q) => {
                    return { voterId, optionId: q.option };
                })
            );

            return vote;
        }

        static async getVotes(electionId, voterId) {
            const votes = await Vote.findAll({
                where: { voterId },
                include: [
                    {
                        model: sequelize.models.Option,
                        as: "option",
                        include: [
                            {
                                model: sequelize.models.Question,
                                as: "question",
                            },
                        ],
                    },
                ],
            });

            return votes;
        }

        static async getResults(electionId, adminId) {
            const { Option, Question } = sequelize.models;
            adminId = parseInt(adminId) || null;
            const election = await sequelize.models.Election.findOne({
                where: {
                    id: electionId,
                    [Op.or]: [{ status: 2 }, { adminId }],
                },
            });
            if (!election) {
                return [];
            }

            const questions = await Question.findAll({
                where: { electionId },
                include: [
                    {
                        model: Option,
                        as: "options",
                        include: [
                            {
                                model: Vote,
                                as: "votes",
                            },
                        ],
                    },
                ],
            });

            return questions;
        }
    }
    Vote.init(
        {
            voterId: DataTypes.INTEGER,
            optionId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "Vote",
        }
    );
    return Vote;
};
