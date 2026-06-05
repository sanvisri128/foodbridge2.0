// Donation routes — CRUD operations and claim functionality
//
// GET    /api/donations          → list all unclaimed donations (public-ish)
// GET    /api/donations/my       → donations posted by the logged-in provider
// GET    /api/donations/claimed  → donations claimed by the logged-in NGO
// POST   /api/donations          → create a donation (provider only)
// PUT    /api/donations/:id      → update a donation (provider, owner only)
// DELETE /api/donations/:id      → delete a donation (provider, owner only)
// POST   /api/donations/:id/claim → claim a donation (NGO only)

import express from 'express';
import Donation from '../models/Donation.js';
import { protectRoute, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── List available donations (public) ───────────────────────
router.get('/', async (req, res) => {
  try {
    // Optional query params: ?category=cooked&location=Delhi
    const filter = { claimed: false };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    // Only show donations that haven't expired yet
    filter.expiryTime = { $gt: new Date() };

    const donations = await Donation.find(filter)
      .populate('donatedBy', 'name email phone') // include provider info
      .sort({ expiryTime: 1 }) // soonest-expiring first
      .lean();

    res.json({ donations });
  } catch (err) {
    console.error('List donations error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── My donations (provider) ─────────────────────────────────
router.get('/my', protectRoute, requireRole('provider'), async (req, res) => {
  try {
    const donations = await Donation.find({ donatedBy: req.user.userId })
      .populate('claimedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ donations });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── Claimed donations (NGO) ─────────────────────────────────
router.get('/claimed', protectRoute, requireRole('ngo'), async (req, res) => {
  try {
    const donations = await Donation.find({ claimedBy: req.user.userId })
      .populate('donatedBy', 'name email phone')
      .sort({ claimedAt: -1 })
      .lean();

    res.json({ donations });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── Get single donation ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donatedBy', 'name email phone')
      .populate('claimedBy', 'name email phone')
      .lean();

    if (!donation) return res.status(404).json({ message: 'Donation not found.' });

    res.json({ donation });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── Create donation (provider only) ─────────────────────────
router.post('/', protectRoute, requireRole('provider'), async (req, res) => {
  try {
    const { foodName, quantity, location, expiryTime, notes, category } = req.body;

    if (!foodName || !quantity || !location || !expiryTime) {
      return res.status(400).json({
        message: 'Food name, quantity, location, and expiry time are required.',
      });
    }

    const donation = await Donation.create({
      foodName,
      quantity,
      location,
      expiryTime,
      notes,
      category,
      donatedBy: req.user.userId,
    });

    await donation.populate('donatedBy', 'name email phone');

    res.status(201).json({ message: 'Donation posted successfully!', donation });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create donation error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── Update donation (provider, owner only) ──────────────────
router.put('/:id', protectRoute, requireRole('provider'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: 'Donation not found.' });

    // Ensure only the original donor can edit
    if (donation.donatedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorised to edit this donation.' });
    }

    // Prevent editing already-claimed donations
    if (donation.claimed) {
      return res.status(400).json({ message: 'Cannot edit a donation that has been claimed.' });
    }

    const allowed = ['foodName', 'quantity', 'location', 'expiryTime', 'notes', 'category'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) donation[field] = req.body[field];
    });

    await donation.save();
    await donation.populate('donatedBy', 'name email phone');

    res.json({ message: 'Donation updated.', donation });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── Delete donation (provider, owner only) ──────────────────
router.delete('/:id', protectRoute, requireRole('provider'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: 'Donation not found.' });

    if (donation.donatedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorised to delete this donation.' });
    }

    await donation.deleteOne();

    res.json({ message: 'Donation deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── Claim donation (NGO only) ───────────────────────────────
router.post('/:id/claim', protectRoute, requireRole('ngo'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: 'Donation not found.' });

    if (donation.claimed) {
      return res.status(400).json({ message: 'This donation has already been claimed.' });
    }

    if (new Date(donation.expiryTime) < new Date()) {
      return res.status(400).json({ message: 'This donation has expired.' });
    }

    // Mark as claimed
    donation.claimed = true;
    donation.claimedBy = req.user.userId;
    donation.claimedAt = new Date();

    await donation.save();
    await donation.populate('donatedBy', 'name email phone');
    await donation.populate('claimedBy', 'name email phone');

    res.json({ message: 'Donation claimed successfully!', donation });
  } catch (err) {
    console.error('Claim donation error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
