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
  }
  Election.init(
    {
      name: DataTypes.STRING,
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
