import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/db.js';
import { login, logout } from './controllers/authController.js';
import { protect } from './middleware/authMiddleware.js';
// Add this import at the top with other imports
import { 
  createForm, 
  getForms, 
  getFormBySlug, 
  getPublicFormBySlug, 
  submitFormResponse,
  getPublicForms,
  getFormResponses 
} from './controllers/formController.js';
// Add these imports at the top of the file
import { addQuestion, removeQuestion, getFormQuestions } from './controllers/questionController.js';

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Update this to match your frontend URL
  credentials: true
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Public routes - MUST be defined BEFORE protected routes
app.get('/api/v1/forms/public', getPublicForms);
app.get('/api/v1/forms/:slug/public', getPublicFormBySlug);
// Replace the current form submission route with this one
// This will extract the user if authenticated but not require authentication
app.post('/api/v1/forms/:slug/submit', async (req, res, next) => {
  try {
    // Check if there's an authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // If there is, try to verify the token and attach the user to the request
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          // Import the jwt verification logic from authMiddleware
          const jwt = await import('jsonwebtoken');
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
          
          // Get the user from the database
          const { User } = await import('./models/index.js');
          const user = await User.findByPk(decoded.id);
          
          if (user) {
            // Attach the user to the request
            req.user = user;
          }
        } catch (err) {
          // If token verification fails, just continue without a user
          console.log('Token verification failed, continuing as anonymous');
        }
      }
    }
    // Continue to the form submission handler
    next();
  } catch (error) {
    console.error('Error in auth check middleware:', error);
    next();
  }
}, submitFormResponse);

// Routes
app.post('/api/v1/auth/login', login);
app.post('/api/v1/auth/logout', protect, logout);

// Form routes
app.post('/api/v1/forms', protect, createForm);
app.get('/api/v1/forms', protect, getForms);
app.get('/api/v1/forms/:slug', protect, getFormBySlug);

// Question routes
app.post('/api/v1/forms/:slug/questions', protect, addQuestion);
app.delete('/api/v1/forms/:slug/questions/:id', protect, removeQuestion);
app.get('/api/v1/forms/:slug/questions', protect, getFormQuestions);

// Test route
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Add this route to your server/index.js file
app.get('/api/v1/auth/verify', protect, (req, res) => {
  res.json({ 
    message: 'Token is valid', 
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Connect to database and start server
const PORT = process.env.PORT || 5000;

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    
    // Sync database models - set sync to false to prevent creating new tables
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log('Database synced');
    
    // Seed initial users if they don't exist
    const seedUsers = async () => {
      const { User } = await import('./models/index.js');
      const users = [
        { name: 'User 1', email: 'user1@webtech.id', password: 'password1' },
        { name: 'User 2', email: 'user2@webtech.id', password: 'password2' },
        { name: 'User 3', email: 'user3@worldskills.org', password: 'password3' }
      ];

      for (const userData of users) {
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (!existingUser) {
          await User.create(userData);
          console.log(`User ${userData.name} created`);
        } else {
          console.log(`User ${userData.email} already exists`);
        }
      }
    };

    seedUsers().catch(err => console.error('Error seeding users:', err));
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Add this route with other protected form routes
app.get('/api/v1/forms/:slug/responses', protect, getFormResponses);