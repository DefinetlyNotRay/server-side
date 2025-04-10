import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(422).json({
        message: 'Invalid field',
        errors: {
          email: !email ? ['The email field is required.'] : [],
          password: !password ? ['The password field is required.'] : []
        }
      });
    }

    // Check for user
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? user.email : 'No user found');

    if (!user) {
      return res.status(401).json({ message: 'Email or password incorrect' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email or password incorrect' });
    }

    // Generate token
    const token = generateToken(user.id);
    console.log('Generated token:', token);

    // Return user and token
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = (req, res) => {
  res.status(200).json({ message: 'Logout success' });
};

export { login, logout };