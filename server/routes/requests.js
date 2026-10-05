// Food Request routes — allow NGOs to broadcast urgent food needs and providers to fulfill them
import express from 'express';
import FoodRequest from '../models/FoodRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protectRoute, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/requests — list open food requests
router.get('/', async (req, res) => {
  try {
    const filter = { status: 'open', neededBy: { $gt: new Date() } };

    if (req.query.category && req.query.category !== 'any') {
      filter.category = req.query.category;
    }
    if (req.query.dietaryType && req.query.dietaryType !== 'any') {
      filter.dietaryType = req.query.dietaryType;
    }
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    const requests = await FoodRequest.find(filter)
      .populate('requestedBy', 'name email phone description')
      .sort({ neededBy: 1 })
      .lean();

    res.json({ requests });
  } catch (err) {
    console.error('List requests error:', err);
    res.status(500).json({ message: 'Server error loading requests.' });
  }
});

// GET /api/requests/my — requests created by logged-in NGO
router.get('/my', protectRoute, requireRole('ngo'), async (req, res) => {
  try {
    const requests = await FoodRequest.find({ requestedBy: req.user.userId })
      .populate('fulfilledBy', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/requests — create a new food request (NGO only)
router.post('/', protectRoute, requireRole('ngo'), async (req, res) => {
  try {
    const { title, servingsNeeded, location, neededBy, category, dietaryType, urgency, notes } =
      req.body;

    if (!title || !servingsNeeded || !location || !neededBy) {
      return res.status(400).json({
        message: 'Title, servings needed, location, and needed-by date are required.',
      });
    }

    const request = await FoodRequest.create({
      title,
      servingsNeeded: Number(servingsNeeded),
      location,
      neededBy,
      category: category || 'cooked',
      dietaryType: dietaryType || 'veg',
      urgency: urgency || 'high',
      notes: notes || '',
      requestedBy: req.user.userId,
    });

    await request.populate('requestedBy', 'name email phone description');

    res.status(201).json({ message: 'Food request broadcasted successfully!', request });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create request error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/requests/:id/fulfill — provider offers to fulfill request
router.post('/:id/fulfill', protectRoute, requireRole('provider'), async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id).populate('requestedBy');

    if (!request) return res.status(404).json({ message: 'Food request not found.' });

    if (request.status !== 'open') {
      return res.status(400).json({ message: 'This request is already fulfilled or closed.' });
    }

    const providerUser = await User.findById(req.user.userId);

    request.status = 'fulfilled';
    request.fulfilledBy = req.user.userId;
    request.fulfilledAt = new Date();
    await request.save();
    await request.populate('fulfilledBy', 'name email phone');

    // Notify NGO
    await Notification.create({
      recipient: request.requestedBy._id,
      sender: req.user.userId,
      title: 'Food Request Matched! 🎉',
      message: `${providerUser?.name || 'A food provider'} has accepted to fulfill your request: "${request.title}". Check details to coordinate!`,
      type: 'request',
      link: '/requests',
    });

    res.json({ message: 'Thank you! You have accepted to fulfill this food request.', request });
  } catch (err) {
    console.error('Fulfill request error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/requests/:id — NGO closes/deletes request
router.delete('/:id', protectRoute, requireRole('ngo'), async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found.' });

    if (request.requestedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this request.' });
    }

    await request.deleteOne();
    res.json({ message: 'Food request removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
