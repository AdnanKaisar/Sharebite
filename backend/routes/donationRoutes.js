import express from 'express';
import {
  createDonation,
  listDonations,
  getDonationDetails,
  rateDonation,
  createEmergencyRequest,
  listEmergencyRequests,
  fulfillEmergencyRequest
} from '../controllers/donationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('donor', 'admin'), createDonation);
router.get('/', listDonations);

router.get('/emergency', listEmergencyRequests);
router.post('/emergency', protect, restrictTo('ngo', 'admin'), createEmergencyRequest);
router.put('/emergency/:id/fulfill', protect, fulfillEmergencyRequest);

router.get('/:id', protect, getDonationDetails);
router.post('/:id/rate', protect, restrictTo('ngo', 'admin'), rateDonation);

export default router;
