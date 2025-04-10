import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.BIGINT(20),
    primaryKey: true,
    autoIncrement: true
  },
  form_id: {
    type: DataTypes.BIGINT(20),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  choice_type: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  choices: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_required: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0
  }
}, {
  tableName: 'questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Question;