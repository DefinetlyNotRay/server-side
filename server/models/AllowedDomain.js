import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AllowedDomain = sequelize.define(
  "AllowedDomain",
  {
    id: {
      type: DataTypes.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
    },
    form_id: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "allowed_domains", // Use the existing table name without prefix
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default AllowedDomain;
