import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Response = sequelize.define('Response', {
  id: {
    type: DataTypes.BIGINT(20),
    primaryKey: true,
    autoIncrement: true
  },
  form_id: {
    type: DataTypes.BIGINT(20),
    allowNull: false
  },
  user_id: {
    type: DataTypes.BIGINT(20),
    allowNull: true  // Change this from false to true
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'responses', // Use the existing table name without prefix
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Response;
