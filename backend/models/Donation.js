import mongoose from 'mongoose';
import { isMongoDB } from '../config/db.js';
import { getCollection } from '../config/jsonDb.js';

const donationSchema = new mongoose.Schema({
  donorId: { type: String, required: true },
  donorName: { type: String, required: true },
  donorType: { type: String, default: 'individual' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: String, required: true },
  peopleServed: { type: Number, required: true },
  expiryTime: { type: Date, required: true },
  pickupAddress: { type: String, required: true },
  pickupCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  image: { type: String },
  contactNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'assigned', 'picked_up', 'delivered', 'cancelled', 'expired'],
    default: 'pending'
  },
  ngoId: { type: String },
  ngoName: { type: String },
  volunteerId: { type: String },
  volunteerName: { type: String },
  qrCode: { type: String },
  rating: {
    score: { type: Number },
    feedback: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

const MongooseDonation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);

const JSONDonation = {
  find: async (query) => getCollection('donations').find(query),
  findOne: async (query) => getCollection('donations').findOne(query),
  findById: async (id) => getCollection('donations').findById(id),
  create: async (data) => getCollection('donations').create(data),
  findByIdAndUpdate: async (id, update) => getCollection('donations').findByIdAndUpdate(id, update),
  deleteOne: async (query) => getCollection('donations').deleteOne(query),
};

export const Donation = {
  find: (query) => isMongoDB() ? MongooseDonation.find(query) : JSONDonation.find(query),
  findOne: (query) => isMongoDB() ? MongooseDonation.findOne(query) : JSONDonation.findOne(query),
  findById: (id) => isMongoDB() ? MongooseDonation.findById(id) : JSONDonation.findById(id),
  create: (data) => isMongoDB() ? MongooseDonation.create(data) : JSONDonation.create(data),
  findByIdAndUpdate: (id, update) => isMongoDB() ? MongooseDonation.findByIdAndUpdate(id, update, { new: true }) : JSONDonation.findByIdAndUpdate(id, update),
  deleteOne: (query) => isMongoDB() ? MongooseDonation.deleteOne(query) : JSONDonation.deleteOne(query)
};
