import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Form = sequelize.define('Form', {
  id: {
    type: DataTypes.BIGINT(20),
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  limit_one_response: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0
  },
  creator_id: {
    type: DataTypes.BIGINT(20),
    allowNull: false
  }
}, {
  tableName: 'forms', // Use the existing table name without prefix
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Form;