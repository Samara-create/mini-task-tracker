const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VALID_STATUSES = ["To Do", "In Progress", "Done"];

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Title is required" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM(...VALID_STATUSES),
      allowNull: false,
      defaultValue: "To Do",
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
  }
);

module.exports = Task;
module.exports.VALID_STATUSES = VALID_STATUSES;
