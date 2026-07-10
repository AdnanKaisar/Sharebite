import express from 'express';
import {
  acceptDonation,
  claimDelivery,
  updateStatus,
  verifyQRCode
} from '../controllers/deliveryController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:id/claim-donation', protect, restrictTo('ngo', 'admin'), acceptDonation);
router.put('/:id/claim-delivery', protect, restrictTo('volunteer', 'admin'), claimDelivery);
router.put('/:id/status', protect, restrictTo('volunteer', 'admin'), updateStatus);
router.post('/:id/verify-qr', protect, restrictTo('volunteer', 'admin'), verifyQRCode);

export default router;
