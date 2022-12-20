"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Voter extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Voter.belongsTo(models.Election, {
                foreignKey: "electionId",
                as: "election",
            });
        }

        static async createVoter({ voterId, password }, electionId, adminId) {
            const election = await sequelize.models.Election.findByPk(
                electionId,
                {
                    include: [
                        {
                            model: sequelize.models.Admin,
                            where: { id: adminId },
                        },
                    ],
                }
            );
            if (!election) {
                throw {
                    errors: [
                        { message: `Election with id ${electionId} not found` },
                    ],
                };
            }

            if (election.status !== 0 && election.status !== null) {
                throw {
                    errors: [{ message: "Election is in progress / ended" }],
                };
            }

            const voterWithSameName = await Voter.findOne({
                where: {
                    voterId,
                    electionId: electionId,
                },
            });
            if (voterWithSameName) {
                throw { errors: [{ message: "Voter ID already exists" }] };
            }
            const newVoter = await this.create({
                voterId,
                password,
                electionId,
            });
            return newVoter;
        }

        static async updateVoter({ voterId, password }, id, adminId) {
            const existingVoter = await Voter.findByPk(id);
            if (!existingVoter) {
                throw {
                    errors: [{ message: `Voter with id ${id} not found` }],
                };
            }

            const election = await sequelize.models.Election.findByPk(
                existingVoter.electionId,
                {
                    include: [
                        {
                            model: sequelize.models.Admin,
                            where: { id: adminId },
                        },
                    ],
                }
            );
            if (!election) {
                throw {
                    errors: [
                        {
                            message: `Election with id ${existingVoter.electionId} not found`,
                        },
                    ],
                };
            }

            if (election.status !== 0 && election.status !== null) {
                throw {
                    errors: [{ message: "Election is in progress / ended" }],
                };
            }

            const voterWithSameName = await Voter.findOne({
                where: {
                    voterId,
                    electionId: existingVoter.electionId,
                },
            });
            if (voterWithSameName && voterWithSameName.id !== id) {
                throw { errors: [{ message: "Voter ID already exists" }] };
            }

            return await existingVoter.update({
                voterId,
                password,
            });
        }

        static async deleteVoter(voterId, adminId) {
            const deletedVoter = await this.destroy({
                where: {
                    id: voterId,
                },
                include: [
                    {
                        model: sequelize.models.Election,
                        as: "elections",
                        where: {
                            adminId,
                            [Op.or]: [{ status: null }, { status: 1 }],
                        },
                    },
                ],
            });
            return deletedVoter;
        }
    }
    Voter.init(
        {
            voterId: {
                type: DataTypes.STRING,
                allowNull: false,
                notEmpty: true,
                validate: {
                    notNull: {
                        msg: "Voter ID is required",
                    },
                    notEmpty: {
                        msg: "Voter ID is required",
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
                    notEmpty: {
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
