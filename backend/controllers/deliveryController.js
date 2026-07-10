import { Donation } from '../models/Donation.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { sendEmailNotification } from '../config/email.js';

// NGO claims a donation listing (and automatically dispatches a delivery partner)
export const acceptDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Donation is already claimed or closed' });
    }

    const donationId = donation._id || donation.id;

    // Determine claiming NGO (if Admin, assign to the first NGO in database or default)
    let claimNgoId = req.user.id;
    let claimNgoName = req.user.name;

    if (req.user.role === 'admin') {
      const ngos = await User.find({ role: 'ngo' });
      if (ngos && ngos.length > 0) {
        claimNgoId = ngos[0]._id || ngos[0].id;
        claimNgoName = ngos[0].name;
      } else {
        claimNgoId = 'auto-ngo';
        claimNgoName = 'Hope Shelter Net';
      }
    }

    // Automated assignment: Query database for a registered Volunteer
    const volunteers = await User.find({ role: 'volunteer' });
    let assignedVolId = 'auto-volunteer';
    let assignedVolName = 'Eco-Courier Alex';

    if (volunteers && volunteers.length > 0) {
      // Automatically assign the first registered volunteer
      const vol = volunteers[0];
      assignedVolId = vol._id || vol.id;
      assignedVolName = vol.name;
    }

    const updated = await Donation.findByIdAndUpdate(donationId, {
      status: 'assigned', // Automatically transitions straight to 'assigned' state
      ngoId: claimNgoId,
      ngoName: claimNgoName,
      volunteerId: assignedVolId,
      volunteerName: assignedVolName
    });

    // Notify Donor
    await Notification.create({
      userId: donation.donorId,
      title: 'Food Approved & Partner Assigned!',
      message: `Your food has been approved and delivery partner "${assignedVolName}" is assigned to pick it up.`,
      donationId: donationId,
      type: 'success'
    });

    // Notify NGO
    await Notification.create({
      userId: claimNgoId,
      title: 'Donation Claimed successfully',
      message: `You claimed "${donation.title}". Volunteer "${assignedVolName}" has been automatically dispatched to deliver it to you.`,
      donationId: donationId,
      type: 'success'
    });

    // Notify Volunteer
    await Notification.create({
      userId: assignedVolId,
      title: '🚨 Automated Delivery Assignment!',
      message: `You have been automatically assigned to pick up food from "${donation.donorName}" and deliver to NGO "${req.user.name}".`,
      donationId: donationId,
      type: 'info'
    });

    // Email notifications for Accept Donation
    try {
      const donor = await User.findById(donation.donorId);
      if (donor) {
        await sendEmailNotification({
          to: donor.email,
          subject: '🎉 Food Listing Approved & Scheduled - ShareBite',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #10B981;">Listing Claimed!</h2>
              <p>Hi <strong>${donor.name}</strong>,</p>
              <p>Great news! Your food donation <strong>"${donation.title}"</strong> has been claimed by NGO <strong>${claimNgoName}</strong>.</p>
              <p>Courier partner <strong>${assignedVolName}</strong> has been assigned to pick it up shortly.</p>
              <p><strong>Verification Code:</strong> <span style="font-family: monospace; font-weight: bold; background: #e0f2fe; padding: 4px 8px; border-radius: 4px; color: #0284c7;">${donation.qrCode}</span></p>
              <p style="font-size: 12px; color: #666; margin-top: 10px;">Please show this code or verify it with the courier when they arrive.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
              <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
            </div>
          `
        });
      }
    } catch (err) {
      console.error('Error sending accept donation email:', err);
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Accept Donation Error:', error);
    res.status(500).json({ message: 'Server error claiming donation' });
  }
};

// Volunteer claims the delivery task
export const claimDelivery = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({ message: 'Donation is not in a claimable delivery state' });
    }

    const donationId = donation._id || donation.id;

    const updated = await Donation.findByIdAndUpdate(donationId, {
      status: 'assigned',
      volunteerId: req.user.id,
      volunteerName: req.user.name
    });

    // Notify Donor
    await Notification.create({
      userId: donation.donorId,
      title: 'Volunteer Assigned to Pickup!',
      message: `Volunteer "${req.user.name}" has been assigned to pick up your food donation "${donation.title}".`,
      donationId: donationId,
      type: 'info'
    });

    // Notify NGO
    await Notification.create({
      userId: donation.ngoId,
      title: 'Volunteer Assigned to Delivery!',
      message: `Volunteer "${req.user.name}" is handling the delivery of "${donation.title}".`,
      donationId: donationId,
      type: 'info'
    });

    // Email notifications for Volunteer Claiming Delivery
    try {
      const donor = await User.findById(donation.donorId);
      const ngo = await User.findById(donation.ngoId);
      
      if (donor) {
        await sendEmailNotification({
          to: donor.email,
          subject: '🚚 Courier En Route to Pickup - ShareBite',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #3b82f6;">Courier Assigned</h2>
              <p>Hi <strong>${donor.name}</strong>,</p>
              <p>Volunteer courier <strong>${req.user.name}</strong> has accepted the task to deliver <strong>"${donation.title}"</strong>.</p>
              <p>They are heading to your pickup address: <strong>${donation.pickupAddress}</strong>.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
              <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
            </div>
          `
        });
      }

      if (ngo) {
        await sendEmailNotification({
          to: ngo.email,
          subject: '🚚 Delivery Partner Dispatched - ShareBite',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #3b82f6;">Courier En Route</h2>
              <p>Hi <strong>${ngo.name}</strong>,</p>
              <p>Volunteer courier <strong>${req.user.name}</strong> is picking up your claimed donation <strong>"${donation.title}"</strong> from <strong>${donation.donorName}</strong>.</p>
              <p>You can track their status on your dashboard.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
              <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
            </div>
          `
        });
      }
    } catch (err) {
      console.error('Error sending claim delivery email:', err);
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Claim Delivery Error:', error);
    res.status(500).json({ message: 'Server error claiming delivery task' });
  }
};

// Update delivery status (Assigned -> Picked Up -> Delivered)
export const updateStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!['picked_up', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid delivery status change' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Verify ownership
    if (donation.volunteerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not assigned to this delivery task' });
    }

    const donationId = donation._id || donation.id;

    const updated = await Donation.findByIdAndUpdate(donationId, { status });

    // Generate notifications
    if (status === 'picked_up') {
      // Notify Donor & NGO
      await Notification.create({
        userId: donation.donorId,
        title: 'Food Picked Up!',
        message: `Volunteer "${req.user.name}" has picked up the food: "${donation.title}".`,
        donationId: donationId,
        type: 'info'
      });
      await Notification.create({
        userId: donation.ngoId,
        title: 'Food En Route!',
        message: `Volunteer "${req.user.name}" has collected the food "${donation.title}" and is heading to you.`,
        donationId: donationId,
        type: 'info'
      });
    } else if (status === 'delivered') {
      // Notify Donor & NGO
      await Notification.create({
        userId: donation.donorId,
        title: 'Delivery Completed!',
        message: `Your food donation "${donation.title}" has been successfully delivered to "${donation.ngoName}". Thank you!`,
        donationId: donationId,
        type: 'success'
      });
      await Notification.create({
        userId: donation.ngoId,
        title: 'Delivery Received!',
        message: `The food donation "${donation.title}" has been delivered by "${req.user.name}". Please rate the donation.`,
        donationId: donationId,
        type: 'success'
      });
    }

    // Email notifications for status changes
    try {
      const donor = await User.findById(donation.donorId);
      const ngo = await User.findById(donation.ngoId);

      if (status === 'picked_up') {
        if (ngo) {
          await sendEmailNotification({
            to: ngo.email,
            subject: '📦 Food Picked Up & En Route - ShareBite',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #8b5cf6;">Food is on the Way!</h2>
                <p>Hi <strong>${ngo.name}</strong>,</p>
                <p>Volunteer courier <strong>${req.user.name}</strong> has picked up <strong>"${donation.title}"</strong> and is now en route to you.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
                <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
              </div>
            `
          });
        }
      } else if (status === 'delivered') {
        if (donor) {
          await sendEmailNotification({
            to: donor.email,
            subject: '✅ Food Donation Safely Delivered! - ShareBite',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #10B981;">Thank You!</h2>
                <p>Hi <strong>${donor.name}</strong>,</p>
                <p>Your food donation <strong>"${donation.title}"</strong> has been successfully delivered to NGO <strong>${donation.ngoName}</strong>.</p>
                <p>Your contribution has helped feed <strong>${donation.peopleServed} people</strong> and reduce food waste! Thank you for partnering with ShareBite.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
                <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
              </div>
            `
          });
        }
        if (ngo) {
          await sendEmailNotification({
            to: ngo.email,
            subject: '🎁 Food Donation Received - ShareBite',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #10B981;">Delivery Completed</h2>
                <p>Hi <strong>${ngo.name}</strong>,</p>
                <p>Surplus food <strong>"${donation.title}"</strong> has been delivered to your center by courier <strong>${req.user.name}</strong>.</p>
                <p>Please review and rate the donation quality in your dashboard.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
                <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
              </div>
            `
          });
        }
      }
    } catch (err) {
      console.error('Error sending delivery status email:', err);
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Server error updating delivery status' });
  }
};

// QR Code Verification (Donor scans / Volunteer inputs to verify pickup/delivery)
export const verifyQRCode = async (req, res) => {
  const { qrCode } = req.body;

  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.qrCode !== qrCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const donationId = donation._id || donation.id;

    // Cycle status: if 'assigned' -> 'picked_up'. If 'picked_up' -> 'delivered'.
    let nextStatus = 'picked_up';
    if (donation.status === 'picked_up') {
      nextStatus = 'delivered';
    } else if (donation.status !== 'assigned') {
      return res.status(400).json({ message: 'Donation is not in a valid state for QR verification' });
    }

    const updated = await Donation.findByIdAndUpdate(donationId, { status: nextStatus });

    // Generate notifications
    if (nextStatus === 'picked_up') {
      await Notification.create({
        userId: donation.donorId,
        title: 'QR Code Verified: Picked Up!',
        message: `Verification code matched! Volunteer "${req.user.name}" has collected the food.`,
        donationId: donationId,
        type: 'success'
      });
      await Notification.create({
        userId: donation.ngoId,
        title: 'Food En Route (QR Verified)',
        message: `Food collection verified via QR. Volunteer "${req.user.name}" is heading to you.`,
        donationId: donationId,
        type: 'info'
      });
    } else {
      await Notification.create({
        userId: donation.donorId,
        title: 'QR Code Verified: Delivered!',
        message: `Delivery confirmed! Your food donation was safely delivered to "${donation.ngoName}".`,
        donationId: donationId,
        type: 'success'
      });
      await Notification.create({
        userId: donation.ngoId,
        title: 'Delivery Received (QR Verified)',
        message: `Delivery confirmed via QR. Please check the food and submit your rating.`,
        donationId: donationId,
        type: 'success'
      });
    }

    // Email notifications for QR status changes
    try {
      const donor = await User.findById(donation.donorId);
      const ngo = await User.findById(donation.ngoId);

      if (nextStatus === 'picked_up') {
        if (ngo) {
          await sendEmailNotification({
            to: ngo.email,
            subject: '📦 Food Picked Up & En Route (QR Verified) - ShareBite',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #8b5cf6;">Food Collection Confirmed!</h2>
                <p>Hi <strong>${ngo.name}</strong>,</p>
                <p>Volunteer courier <strong>${req.user.name}</strong> has scanned the QR code, collected <strong>"${donation.title}"</strong> and is now en route to you.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
                <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
              </div>
            `
          });
        }
      } else if (nextStatus === 'delivered') {
        if (donor) {
          await sendEmailNotification({
            to: donor.email,
            subject: '✅ Food Donation Delivered (QR Verified) - ShareBite',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #10B981;">Handover Confirmed!</h2>
                <p>Hi <strong>${donor.name}</strong>,</p>
                <p>Your food donation <strong>"${donation.title}"</strong> has been successfully checked in at NGO <strong>${donation.ngoName}</strong> via QR handover code.</p>
                <p>Your support is highly appreciated!</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
                <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
              </div>
            `
          });
        }
        if (ngo) {
          await sendEmailNotification({
            to: ngo.email,
            subject: '🎁 Food Donation Checked In (QR Verified) - ShareBite',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #10B981;">Delivery Verified</h2>
                <p>Hi <strong>${ngo.name}</strong>,</p>
                <p>Surplus food <strong>"${donation.title}"</strong> has been verified and checked into your center by courier <strong>${req.user.name}</strong>.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
                <p style="font-size: 11px; color: #888;">ShareBite Platform</p>
              </div>
            `
          });
        }
      }
    } catch (err) {
      console.error('Error sending QR status email:', err);
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('QR Verification Error:', error);
    res.status(500).json({ message: 'Server error verifying QR code' });
  }
};
