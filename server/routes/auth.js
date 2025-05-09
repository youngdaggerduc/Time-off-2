const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

console.log('Auth route loaded');

// Hardcoded credentials
const hardcodedUsers = [
  {
    username: 'fayadali',
    password: '$2b$10$WqCxzvEMs9dzVLS.Z/7vEO91xQoy..9wUzM69BqRNZyvIEUzll5A.', // password123
    name: 'Fayad Ali',
    role: 'boss',
    userId: 'hardcoded_fayadali'
  },
  {
    username: 'Radian123',
    password: '$2b$10$WqCxzvEMs9dzVLS.Z/7vEO91xQoy..9wUzM69BqRNZyvIEUzll5A.', // password123
    name: 'Admin Staff',
    role: 'admin',
    userId: 'hardcoded_admin'
  }
];

router.post('/signup', async (req, res) => {
  const { username, password, name, role } = req.body;
  try {
    console.log('Signup request received:', { username, name, role });
    if (!username || !password || !name || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (role !== 'employee') {
      console.log('Invalid role for signup');
      return res.status(400).json({ message: 'Signup restricted to employees' });
    }

    const existingUser = await User.findOne({ username });
    console.log('Checked for existing user:', existingUser);
    if (existingUser) {
      console.log('Username exists:', username);
      return res.status(400).json({ message: 'Username exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');
    const user = new User({ username, password: hashedPassword, name, role });
    console.log('User created:', user);
    await user.save();
    console.log('User saved:', user);

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generated');
    res.status(201).json({ token, user: { id: user._id, username, name, role } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('Login request:', { username });

    // Check hardcoded users
    const hardcodedUser = hardcodedUsers.find(u => u.username === username);
    if (hardcodedUser) {
      const isMatch = await bcrypt.compare(password, hardcodedUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { userId: hardcodedUser.userId, role: hardcodedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.json({
        token,
        user: {
          id: hardcodedUser.userId,
          username: hardcodedUser.username,
          name: hardcodedUser.name,
          role: hardcodedUser.role
        }
      });
    }

    // Check database users
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, username, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;