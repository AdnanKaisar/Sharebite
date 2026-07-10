import express from 'express';
import { Notification } from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fetch notifications for the current user
router.get('/', protect, async (req, res) => {
  try {
    // Find notifications that belong to:
    // 1. This user's ID
    // 2. This user's role (e.g. 'ngo', 'volunteer')
    // 3. 'all' (broadcast to everyone)
    const notifications = await Notification.find({});
    
    const userNotifications = notifications.filter(n => 
      n.userId === req.user.id || 
      n.userId === req.user.role || 
      n.userId === 'all'
    );

    // Sort by createdAt descending
    const sorted = userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(sorted);
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ message: 'Server error retrieving notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ message: 'Server error marking notification read' });
  }
});

export default router;
