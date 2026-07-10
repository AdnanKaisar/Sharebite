import { Donation } from '../models/Donation.js';
import { Request } from '../models/Request.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { sendEmailNotification } from '../config/email.js';

// Create food donation listing
export const createDonation = async (req, res) => {
  const { title, description, category, quantity, peopleServed, expiryTime, pickupAddress, pickupCoordinates, contactNumber, imageUrl } = req.body;

  try {
    if (!title || !category || !quantity || !peopleServed || !pickupAddress || !pickupCoordinates || !contactNumber) {
      return res.status(400).json({ message: 'Title, category, quantity, servings, address, coordinates, and contact are required.' });
    }

    const finalDescription = description || 'Fresh food donation. No extra details provided.';
    const finalExpiryTime = expiryTime ? new Date(expiryTime) : new Date(Date.now() + 12 * 60 * 60 * 1000); // Default 12 hours expiry

    // Assign random QR code
    const qrCode = 'FB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Default food category image if not provided
    const categoryImages = {
      'Cooked food': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      'Packaged food': 'https://images.unsplash.com/photo-1584263343327-cc4628654965?w=500&auto=format&fit=crop&q=60',
      'Fruits': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&auto=format&fit=crop&q=60',
      'Vegetables': 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=500&auto=format&fit=crop&q=60',
      'Bakery items': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      'Event leftovers': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500&auto=format&fit=crop&q=60'
    };

    const finalImage = imageUrl || categoryImages[category] || categoryImages['Cooked food'];

    const donation = await Donation.create({
      donorId: req.user.id,
      donorName: req.user.name,
      donorType: req.user.donorType || 'individual',
      title,
      description: finalDescription,
      category,
      quantity,
      peopleServed: Number(peopleServed),
      expiryTime: finalExpiryTime,
      pickupAddress,
      pickupCoordinates: {
        lat: Number(pickupCoordinates.lat),
        lng: Number(pickupCoordinates.lng)
      },
      image: finalImage,
      contactNumber,
      status: 'pending',
      qrCode
    });

    const donationId = donation._id || donation.id;

    // Notify NGOs about new listing
    await Notification.create({
      userId: 'ngo', // Broadcast to all NGOs
      title: 'New Food Donation Available!',
      message: `${req.user.name} has listed "${title}" (${quantity}, serves ${peopleServed}).`,
      donationId: donationId,
      type: 'info'
    });

    // Notify Volunteers about delivery task availability
    await Notification.create({
      userId: 'volunteer', // Broadcast to all volunteers
      title: 'New Delivery Run Available!',
      message: `Surplus food available at "${pickupAddress}". Route is ready for collection.`,
      donationId: donationId,
      type: 'info'
    });

    // Notify NGOs about new listing via Email
    try {
      const ngosList = await User.find({ role: 'ngo' });
      for (const ngo of ngosList) {
        await sendEmailNotification({
          to: ngo.email,
          subject: '🍎 New Food Donation Available - ShareBite',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #10B981;">New Surplus Food Listed!</h2>
              <p>Hi <strong>${ngo.name}</strong>,</p>
              <p>A new food donation has been published in your area by <strong>${req.user.name}</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Food Item</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${title}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Category</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Quantity</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${quantity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Serves</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${peopleServed} people</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Pickup Address</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${pickupAddress}</td>
                </tr>
              </table>
              <p style="margin-top: 20px;">Log in to your NGO dashboard to claim this listing before it expires!</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
              <p style="font-size: 11px; color: #888;">ShareBite Platform - Feeding Communities, Saving Food</p>
            </div>
          `
        });
      }
    } catch (err) {
      console.error('Error sending donation emails:', err);
    }

    res.status(201).json(donation);
  } catch (error) {
    console.error('Create Donation Error:', error);
    res.status(500).json({ message: 'Server error listing donation' });
  }
};

// List all donations
export const listDonations = async (req, res) => {
  const { status, donorId } = req.query;

  try {
    const query = {};
    if (status) query.status = status;
    if (donorId) query.donorId = donorId;

    const donations = await Donation.find(query);
    
    // Sort by createdAt descending
    const sorted = donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(sorted);
  } catch (error) {
    console.error('List Donations Error:', error);
    res.status(500).json({ message: 'Server error retrieving donations' });
  }
};

// Get donation details
export const getDonationDetails = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(200).json(donation);
  } catch (error) {
    console.error('Get Donation Details Error:', error);
    res.status(500).json({ message: 'Server error retrieving donation details' });
  }
};

// Rate completed donation
export const rateDonation = async (req, res) => {
  const { score, feedback } = req.body;

  try {
    if (!score) {
      return res.status(400).json({ message: 'Rating score is required' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const donationId = donation._id || donation.id;

    const updated = await Donation.findByIdAndUpdate(donationId, {
      rating: { score: Number(score), feedback: feedback || '' }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Rate Donation Error:', error);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
};

// Create Emergency Food Request (NGO / Admin / Anyone in need)
export const createEmergencyRequest = async (req, res) => {
  const { title, description, quantityNeeded, peopleCount, location, coordinates, contactNumber, urgency } = req.body;

  try {
    if (!title || !description || !quantityNeeded || !peopleCount || !location || !coordinates || !contactNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const request = await Request.create({
      requesterId: req.user.id,
      requesterName: req.user.name,
      title,
      description,
      quantityNeeded,
      peopleCount: Number(peopleCount),
      location,
      coordinates: {
        lat: Number(coordinates.lat),
        lng: Number(coordinates.lng)
      },
      contactNumber,
      urgency: urgency || 'medium',
      status: 'open'
    });

    // Notify all users about critical emergency requests
    await Notification.create({
      userId: 'all', // Broadcast to everyone
      title: '🚨 Emergency Food Request!',
      message: `${req.user.name} requires emergency food: "${title}" for ${peopleCount} people.`,
      donationId: request._id || request.id,
      type: 'emergency'
    });

    // Notify all Donors and Volunteers about Emergency Request via Email
    try {
      const usersList = await User.find({ role: { $in: ['donor', 'volunteer'] } });
      for (const recipient of usersList) {
        await sendEmailNotification({
          to: recipient.email,
          subject: '🚨 CRITICAL: Emergency Food Request Needed!',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #EF4444;">🚨 Urgent Food Aid Required</h2>
              <p>Hi <strong>${recipient.name}</strong>,</p>
              <p><strong>${req.user.name}</strong> has posted a critical emergency food request:</p>
              <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0;">
                <strong>${title}</strong><br/>
                ${description}<br/>
                <span style="font-size: 12px; color: #555;">Serves: ${peopleCount} people | Urgency: ${urgency}</span>
              </blockquote>
              <p><strong>Dropoff Location:</strong> ${location}</p>
              <p><strong>Contact:</strong> ${contactNumber}</p>
              <p style="margin-top: 20px; font-weight: bold;">If you have surplus food available, please log in to your dashboard to fulfill this emergency request immediately.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
              <p style="font-size: 11px; color: #888;">ShareBite Platform - Critical Aid Response</p>
            </div>
          `
        });
      }
    } catch (err) {
      console.error('Error sending emergency request emails:', err);
    }

    res.status(201).json(request);
  } catch (error) {
    console.error('Create Emergency Request Error:', error);
    res.status(500).json({ message: 'Server error posting emergency request' });
  }
};

// List Emergency Food Requests
export const listEmergencyRequests = async (req, res) => {
  const { status } = req.query;

  try {
    const query = {};
    if (status) query.status = status;
    const requests = await Request.find(query);
    
    // Sort by createdAt descending
    const sorted = requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(sorted);
  } catch (error) {
    console.error('List Emergency Requests Error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

// Fulfill Emergency Request
export const fulfillEmergencyRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Emergency request not found' });
    }

    const requestId = request._id || request.id;

    const updated = await Request.findByIdAndUpdate(requestId, {
      status: 'fulfilled',
      fulfilledById: req.user.id,
      fulfilledByName: req.user.name
    });

    // Notify requester
    await Notification.create({
      userId: request.requesterId,
      title: 'Emergency Request Fufilled!',
      message: `${req.user.name} has claimed and fulfilled your emergency request: "${request.title}".`,
      donationId: requestId,
      type: 'success'
    });

    // Notify requester about fulfillment via Email
    try {
      const requester = await User.findById(request.requesterId);
      if (requester) {
        await sendEmailNotification({
          to: requester.email,
          subject: '💖 Your Emergency Food Request Has Been Fufilled! - ShareBite',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #10B981;">Emergency Request Claimed!</h2>
              <p>Hi <strong>${requester.name}</strong>,</p>
              <p>We are happy to inform you that <strong>${req.user.name}</strong> has claimed and fulfilled your emergency request: <strong>"${request.title}"</strong>.</p>
              <p>They are currently preparing the food for handover. You can contact them directly or log in to check delivery status.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
              <p style="font-size: 11px; color: #888;">ShareBite Platform - Thank you for making a difference</p>
            </div>
          `
        });
      }
    } catch (err) {
      console.error('Error sending emergency fulfillment email:', err);
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Fulfill Emergency Request Error:', error);
    res.status(500).json({ message: 'Server error fulfilling request' });
  }
};
