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
            const newVoter = await this.create({
                voterId,
                password,
                electionId,
            });
            return newVoter;
        }
        static async updateVoter({ voterId, password }, vId, adminId) {
            const updatedVoter = await this.update(
                {
                    voterId,
                    password,
                },
                {
                    where: {
                        id: vId,
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
                }
            );
            return updatedVoter;
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
