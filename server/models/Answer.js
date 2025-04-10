import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Answer = sequelize.define(
  "Answer",
  {
    id: {
      type: DataTypes.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
    },
    response_id: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
    },
    question_id: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Answer;
