import mongoose from 'mongoose';
import { isMongoDB } from '../config/db.js';
import { getCollection } from '../config/jsonDb.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['donor', 'ngo', 'volunteer', 'admin'], default: 'donor' },
  donorType: { type: String, enum: ['individual', 'restaurant', 'none'], default: 'none' },
  avatar: { type: String },
  isVerifiedNgo: { type: Boolean, default: false },
  contactNumber: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

const JSONUser = {
  find: async (query) => getCollection('users').find(query),
  findOne: async (query) => getCollection('users').findOne(query),
  findById: async (id) => getCollection('users').findById(id),
  create: async (data) => getCollection('users').create({ donorType: 'none', ...data }),
  findByIdAndUpdate: async (id, update) => getCollection('users').findByIdAndUpdate(id, update),
  deleteOne: async (query) => getCollection('users').deleteOne(query),
};

export const User = {
  find: (query) => isMongoDB() ? MongooseUser.find(query) : JSONUser.find(query),
  findOne: (query) => isMongoDB() ? MongooseUser.findOne(query) : JSONUser.findOne(query),
  findById: (id) => isMongoDB() ? MongooseUser.findById(id) : JSONUser.findById(id),
  create: (data) => isMongoDB() ? MongooseUser.create(data) : JSONUser.create(data),
  findByIdAndUpdate: (id, update) => isMongoDB() ? MongooseUser.findByIdAndUpdate(id, update, { new: true }) : JSONUser.findByIdAndUpdate(id, update),
  deleteOne: (query) => isMongoDB() ? MongooseUser.deleteOne(query) : JSONUser.deleteOne(query)
};
