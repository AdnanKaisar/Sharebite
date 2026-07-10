import mongoose from 'mongoose';
import { isMongoDB } from '../config/db.js';
import { getCollection } from '../config/jsonDb.js';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Can be 'ngo' or user ID
  title: { type: String, required: true },
  message: { type: String, required: true },
  donationId: { type: String },
  type: { type: String, enum: ['info', 'success', 'warning', 'emergency'], default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const MongooseNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

const JSONNotification = {
  find: async (query) => getCollection('notifications').find(query),
  findOne: async (query) => getCollection('notifications').findOne(query),
  findById: async (id) => getCollection('notifications').findById(id),
  create: async (data) => getCollection('notifications').create(data),
  findByIdAndUpdate: async (id, update) => getCollection('notifications').findByIdAndUpdate(id, update),
  deleteOne: async (query) => getCollection('notifications').deleteOne(query),
};

export const Notification = {
  find: (query) => isMongoDB() ? MongooseNotification.find(query) : JSONNotification.find(query),
  findOne: (query) => isMongoDB() ? MongooseNotification.findOne(query) : JSONNotification.findOne(query),
  findById: (id) => isMongoDB() ? MongooseNotification.findById(id) : JSONNotification.findById(id),
  create: (data) => isMongoDB() ? MongooseNotification.create(data) : JSONNotification.create(data),
  findByIdAndUpdate: (id, update) => isMongoDB() ? MongooseNotification.findByIdAndUpdate(id, update, { new: true }) : JSONNotification.findByIdAndUpdate(id, update),
  deleteOne: (query) => isMongoDB() ? MongooseNotification.deleteOne(query) : JSONNotification.deleteOne(query)
};
