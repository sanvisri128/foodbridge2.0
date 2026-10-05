// Authentication routes — register, login, me, and profile management
// POST /api/auth/register  → create a new account
// POST /api/auth/login     → authenticate and receive a JWT
// GET  /api/auth/me        → get authenticated user info
// PUT  /api/auth/profile   → update user profile details
// GET  /api/auth/impact    → get user's individual impact stats

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { protectRoute } from '../middleware/authMiddleware.js';

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
router.get('/me', protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── Update Profile (protected) ───────────────────────────────
router.put('/profile', protectRoute, async (req, res) => {
  try {
    const { name, phone, description } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (description !== undefined) user.description = description.trim();

    await user.save();
    res.json({ message: 'Profile updated successfully!', user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── User Individual Impact Stats (protected) ──────────────────
router.get('/impact', protectRoute, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role === 'provider') {
      const allMyDonations = await Donation.find({ donatedBy: userId });
      const completedDonations = allMyDonations.filter(
        (d) => d.status === 'completed' || d.claimed === true
      );
      const activeDonations = allMyDonations.filter(
        (d) => !d.claimed && new Date(d.expiryTime) > new Date()
      );

      // Estimate servings
      const totalServings = completedDonations.reduce((acc, curr) => acc + (curr.servings || 15), 0);
      const co2SavedKg = Math.round(totalServings * 0.8 * 10) / 10; // ~0.8kg CO2e per meal saved

      return res.json({
        role: 'provider',
        totalDonations: allMyDonations.length,
        completedDonations: completedDonations.length,
        activeDonations: activeDonations.length,
        totalMealsRescued: totalServings,
        co2SavedKg,
      });
    } else {
      // NGO impact
      const allMyClaims = await Donation.find({ claimedBy: userId });
      const completedClaims = allMyClaims.filter((d) => d.status === 'completed');
      const totalServings = allMyClaims.reduce((acc, curr) => acc + (curr.servings || 15), 0);
      const co2SavedKg = Math.round(totalServings * 0.8 * 10) / 10;

      return res.json({
        role: 'ngo',
        totalClaims: allMyClaims.length,
        completedClaims: completedClaims.length,
        activeClaims: allMyClaims.filter((d) => d.status === 'claimed' || d.status === 'in_transit').length,
        totalMealsDistributed: totalServings,
        co2SavedKg,
      });
    }
  } catch (err) {
    console.error('Impact stats error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;

