import { Chat } from '../models/Chat.js';

// Send a message
export const sendMessage = async (req, res) => {
  const { donationId, message } = req.body;

  try {
    if (!donationId || !message) {
      return res.status(400).json({ message: 'Donation ID and message content are required' });
    }

    const newMessage = await Chat.create({
      donationId,
      senderId: req.user.id,
      senderName: req.user.name,
      message
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send Chat Message Error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// Retrieve messages for a donation
export const getMessages = async (req, res) => {
  const { donationId } = req.params;

  try {
    const messages = await Chat.find({ donationId });
    // Sort by createdAt ascending
    const sorted = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.status(200).json(sorted);
  } catch (error) {
    console.error('Get Chat Messages Error:', error);
    res.status(500).json({ message: 'Server error retrieving messages' });
  }
};
