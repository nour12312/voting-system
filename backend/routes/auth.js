const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      hasVoted: false,
    });
    await user.save();
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });
});

// 2FA OTP
router.post('/otp', async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  req.session.otp = otp; // Requires express-session middleware
  // Send OTP via email (implement later)
  res.json({ message: 'OTP sent' });
});

module.exports = router;

router.post('/send-otp', async (req, res) => {
  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    req.session.otp = otp; // Store OTP in session

    // Send OTP via email
    await req.transporter.sendMail({
      to: req.body.email, // Ensure you have the user's email here
      subject: 'OTP for Voting',
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

module.exports = router;

// routes/auth.js
router.post('/verify-otp', (req, res) => {
  const enteredOTP = req.body.otp;
  const storedOTP = req.session.otp;

  if (!storedOTP) return res.status(400).json({ error: 'OTP not found' });
  if (enteredOTP === storedOTP) {
    req.session.hasVerifiedOTP = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid OTP' });
  }
});