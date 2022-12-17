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

        static async updateElection(id, { name, status }, adminId) {
            const object = await this.getElection(id, adminId);
            if (object.status >= status) {
                return null;
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
            try {
                const election = await this.update(
                    {
                        name,
                        status,
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
            } catch (error) {
                console.log(error);
                return null;
            }
        }

        static async deleteElection(id, adminId) {
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
