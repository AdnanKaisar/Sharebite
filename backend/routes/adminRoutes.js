import express from 'express';
import {
  getAnalytics,
  listUsers,
  toggleUserVerification,
  deleteUser,
  deleteDonation
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, restrictTo('admin'), getAnalytics);
router.get('/users', protect, restrictTo('admin'), listUsers);
router.post('/verify-ngo', protect, restrictTo('admin'), toggleUserVerification);
router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);
router.delete('/donations/:id', protect, restrictTo('admin'), deleteDonation);

export default router;
