import User from './User.js';
import Form from './Form.js';
import Question from './Question.js';
import AllowedDomain from './AllowedDomain.js';
import Response from './Response.js';
import Answer from './Answer.js';

// Define associations
Form.belongsTo(User, { foreignKey: 'creator_id' });
User.hasMany(Form, { foreignKey: 'creator_id' });

Form.hasMany(Question, { foreignKey: 'form_id' });
Question.belongsTo(Form, { foreignKey: 'form_id' });

Form.hasMany(AllowedDomain, { foreignKey: 'form_id' });
AllowedDomain.belongsTo(Form, { foreignKey: 'form_id' });

Form.hasMany(Response, { foreignKey: 'form_id' });
Response.belongsTo(Form, { foreignKey: 'form_id' });

Response.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Response, { foreignKey: 'user_id' });

Response.hasMany(Answer, { foreignKey: 'response_id' });
Answer.belongsTo(Response, { foreignKey: 'response_id' });

Question.hasMany(Answer, { foreignKey: 'question_id' });
Answer.belongsTo(Question, { foreignKey: 'question_id' });

export {
  User,
  Form,
  Question,
  AllowedDomain,
  Response,
  Answer
};
