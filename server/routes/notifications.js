// Notification routes — fetch and mark in-app notifications
import express from 'express';
import Notification from '../models/Notification.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notifications — get all notifications for current user
router.get('/', protectRoute, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.userId,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ message: 'Server error loading notifications.' });
  }
});

// PUT /api/notifications/:id/read — mark single notification as read
router.put('/:id/read', protectRoute, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found.' });

    res.json({ message: 'Notification marked as read.', notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/notifications/read-all — mark all notifications as read
router.put('/read-all', protectRoute, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.userId, read: false }, { read: true });

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
