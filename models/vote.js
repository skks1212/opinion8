"use strict";
const { Model } = require("sequelize");
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
        onDelete: "CASCADE",
      });
      Vote.belongsTo(models.Option, {
        foreignKey: "optionId",
        onDelete: "CASCADE",
      });
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
