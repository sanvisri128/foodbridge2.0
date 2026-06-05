// Authentication routes — register and login
// POST /api/auth/register  → create a new account
// POST /api/auth/login     → authenticate and receive a JWT

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Helper: create a signed JWT for the given user
const createToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // token valid for 7 days
  );

// ─── Register ─────────────────────────────────────────────────
// Creates a new provider or NGO account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, description, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required.' });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Create the user (password is hashed by the pre-save hook in the model)
    const user = await User.create({ name, email, password, role, description, phone });

    // Issue a JWT so the user is immediately logged in after registration
    const token = createToken(user);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user, // password is stripped by toJSON()
    });
  } catch (err) {
    // Handle mongoose validation errors nicely
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─── Login ────────────────────────────────────────────────────
// Authenticates an existing user and returns a JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Use a generic message to avoid leaking whether the email exists
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare the provided password with the stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user);

    res.json({
      message: 'Logged in successfully!',
      token,
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─── Get current user (protected) ─────────────────────────────
// Used by the frontend to re-hydrate auth state from a stored token
import { protectRoute } from '../middleware/authMiddleware.js';

router.get('/me', protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
