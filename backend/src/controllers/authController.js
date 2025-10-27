const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateUserRegistration, validateUserLogin } = require('../utils/validators');

exports.register = async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is empty. Make sure you are sending JSON and using app.use(express.json()).' });
    }

    console.log('Request body:', { ...req.body, password: '***' });

    const validation = validateUserRegistration(req.body);
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }

    const { name, email, password } = req.body;

    console.log('Checking if user exists:', email);
    const userExists = await User.emailExists(email);
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists', 
        errors: { email: 'Email address is already registered' } 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating new user...');
    const newUser = await User.create({ 
      name, 
      email, 
      // Ensure this matches your DB column name:
      hashed_password: hashedPassword, 
      role: 'user' 
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Full error:', error);

    if (error.code && error.sqlMessage) {
      // MySQL-specific error
      return res.status(500).json({
        message: 'Database error',
        error: `${error.code}: ${error.sqlMessage}`
      });
    }

    res.status(500).json({ 
      message: 'Error registering user', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('=== LOGIN REQUEST ===');
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is empty. Make sure you are sending JSON and using app.use(express.json()).' });
    }

    console.log('Request body:', { ...req.body, password: '***' });

    const validation = validateUserLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }

    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        message: 'Authentication failed',
        errors: { email: 'Invalid email or password' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Authentication failed',
        errors: { password: 'Invalid email or password' }
      });
    }

    const token = jwt.sign(
      { 
        id: parseInt(user.id),
        role: user.role,
        email: user.email 
      }, 
      process.env.JWT_SECRET || 'your-secret-key-here', 
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        id: parseInt(user.id),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Full error:', error);

    if (error.code && error.sqlMessage) {
      return res.status(500).json({
        message: 'Database error',
        error: `${error.code}: ${error.sqlMessage}`
      });
    }

    res.status(500).json({ 
      message: 'Error processing login request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};
