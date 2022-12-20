"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Election extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Election.belongsTo(models.Admin, {
                foreignKey: "adminId",
                onDelete: "CASCADE",
            });
            Election.hasMany(models.Question, {
                foreignKey: "electionId",
                as: "questions",
            });
            Election.hasMany(models.Voter, {
                foreignKey: "electionId",
                as: "voters",
            });
        }

        static getElections(adminId) {
            try {
                const elections = this.findAll({
                    where: {
                        adminId,
                    },
                });
                return elections;
            } catch (error) {
                console.log(error);
                return [];
            }
        }

        static getElection(id, adminId) {
            try {
                const election = this.findOne({
                    where: {
                        id,
                        adminId,
                    },
                    include: [
                        {
                            model: sequelize.models.Question,
                            as: "questions",
                            order: [["createdAt", "ASC"]],
                            include: [
                                {
                                    model: sequelize.models.Option,
                                    as: "options",
                                    order: [["createdAt", "ASC"]],
                                },
                            ],
                        },
                        {
                            model: sequelize.models.Voter,
                            as: "voters",
                            order: [["createdAt", "ASC"]],
                        },
                    ],
                });
                return election;
            } catch (error) {
                console.log(error);
                return null;
            }
        }

        static createElection(name, adminId) {
            try {
                const election = this.create({
                    name,
                    adminId,
                });
                return election;
            } catch (error) {
                console.log(error);
                return null;
            }
        }

        static async updateElection(id, { name, status, customUrl }, adminId) {
            const object = await this.getElection(id, adminId);
            if (object.status >= status) {
                throw { errors: [{ message: "You cannot update status" }] };
            }
            if (customUrl === "") {
                customUrl = null;
            }
            if (status == 1 && object.questions.length === 0) {
                throw {
                    errors: [
                        {
                            message:
                                "Please add questions to the election first",
                        },
                    ],
                };
            } else if (status == 1 && object.voters.length === 0) {
                throw {
                    errors: [
                        {
                            message:
                                "Please add atleast one voter to the election first",
                        },
                    ],
                };
            }
            let additionalDate = {};
            if (status == 1) {
                additionalDate = {
                    startDate: new Date(),
                };
            } else if (status == 2) {
                additionalDate = {
                    endDate: new Date(),
                };
            }

            const election = await this.update(
                {
                    name,
                    status,
                    customUrl,
                    ...additionalDate,
                },
                {
                    where: {
                        id,
                        adminId,
                    },
                }
            );
            return election;
        }

        static async deleteElection(id, adminId) {
            const object = await this.getElection(id, adminId);
            if (object.status >= 1) {
                throw {
                    errors: [
                        {
                            message:
                                "Cannot delete an election that has started",
                        },
                    ],
                };
            }
            try {
                const election = await this.destroy({
                    where: {
                        id,
                        adminId,
                    },
                });
                return election;
            } catch (error) {
                console.log(error);
                return null;
            }
        }
    }
    Election.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Name is required",
                    },
                    notEmpty: {
                        msg: "Name is required",
                    },
                },
            },
            customUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: {
                    args: true,
                    msg: "Custom URL has already been taken",
                },
                validate: {
                    is: {
                        args: /^[a-zA-Z0-9-]+$/,
                        msg: "Custom URL can only contain letters, numbers and hyphens",
                    },
                },
            },
            status: DataTypes.INTEGER,
            startDate: DataTypes.DATE,
            endDate: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "Election",
        }
    );
    return Election;
};
