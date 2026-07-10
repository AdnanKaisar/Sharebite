import express from 'express';
import { Inquiry } from '../models/Inquiry.js';
import { Notification } from '../models/Notification.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/inquiries - Submit an inquiry ticket (Public)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const inquiry = await Inquiry.create({ name, email, subject, message });

    // Notify admins about new contact inquiry ticket
    await Notification.create({
      userId: 'admin', // Broadcast alert specifically to Admin users
      title: '🚨 New Inquiry Ticket Received',
      message: `From ${name} (${email}): "${subject}"`,
      type: 'info'
    });

    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Submit Inquiry Error:', error);
    res.status(500).json({ message: 'Server error logging inquiry' });
  }
});

// GET /api/inquiries - Retrieve all inquiries (Admin Only)
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const inquiries = await Inquiry.find({});
    // Sort by newest first
    const sorted = inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(sorted);
  } catch (error) {
    console.error('Get Inquiries Error:', error);
    res.status(500).json({ message: 'Server error retrieving inquiries' });
  }
});

// DELETE /api/inquiries/:id - Delete/Resolve an inquiry (Admin Only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    await Inquiry.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Inquiry ticket resolved and deleted' });
  } catch (error) {
    console.error('Delete Inquiry Error:', error);
    res.status(500).json({ message: 'Server error deleting inquiry' });
  }
});

export default router;
