import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretfoodbridgesecretkey12345', {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  const { name, email, password, role, donorType, contactNumber, address, avatar } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (role === 'admin') {
      return res.status(403).json({ message: 'Registering as an Administrator is not permitted.' });
    }

    const emailLower = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default avatars
    // Custom avatars for Restaurant vs Individual
    const defaultAvatars = {
      donor: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=60',
      ngo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&auto=format&fit=crop&q=60',
      volunteer: 'https://images.unsplash.com/photo-1559024094-4a1e4495c3c1?w=100&auto=format&fit=crop&q=60',
      admin: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'
    };

    const finalAvatar = avatar || (role === 'donor' && donorType === 'restaurant'
      ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&auto=format&fit=crop&q=60'
      : defaultAvatars[role] || defaultAvatars['donor']);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role,
      donorType: role === 'donor' ? (donorType || 'individual') : 'none',
      contactNumber: contactNumber || '',
      address: address || '',
      avatar: finalAvatar,
      isVerifiedNgo: role === 'ngo' ? false : true // Admin will verify NGOs, others are auto-active
    });

    const userId = user._id || user.id;

    res.status(201).json({
      token: generateToken(userId),
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        donorType: user.donorType,
        avatar: user.avatar,
        contactNumber: user.contactNumber,
        address: user.address,
        isVerifiedNgo: user.isVerifiedNgo
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const userId = user._id || user.id;

    res.status(200).json({
      token: generateToken(userId),
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        donorType: user.donorType,
        avatar: user.avatar,
        contactNumber: user.contactNumber,
        address: user.address,
        isVerifiedNgo: user.isVerifiedNgo
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      donorType: user.donorType,
      avatar: user.avatar,
      contactNumber: user.contactNumber,
      address: user.address,
      isVerifiedNgo: user.isVerifiedNgo
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

export const updateProfile = async (req, res) => {
  const { name, contactNumber, address, avatar } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (address !== undefined) updateData.address = address;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData);

    res.status(200).json({
      id: updatedUser._id || updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      donorType: updatedUser.donorType,
      avatar: updatedUser.avatar,
      contactNumber: updatedUser.contactNumber,
      address: updatedUser.address,
      isVerifiedNgo: updatedUser.isVerifiedNgo
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
