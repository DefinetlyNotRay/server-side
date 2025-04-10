import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      console.log('Token received in middleware:', token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('Decoded token:', decoded);

      // Get user from the token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!req.user) {
        console.log('User not found for token');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      console.log('User found:', req.user.id, req.user.name);

      next();
    } catch (error) {
      console.error('Error in auth middleware:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('No token provided in request');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };