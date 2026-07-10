import mongoose from 'mongoose';
import { isMongoDB } from '../config/db.js';
import { getCollection } from '../config/jsonDb.js';

const requestSchema = new mongoose.Schema({
  requesterId: { type: String, required: true },
  requesterName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  quantityNeeded: { type: String, required: true },
  peopleCount: { type: Number, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  contactNumber: { type: String, required: true },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'fulfilled', 'cancelled'], default: 'open' },
  fulfilledById: { type: String },
  fulfilledByName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MongooseRequest = mongoose.models.Request || mongoose.model('Request', requestSchema);

const JSONRequest = {
  find: async (query) => getCollection('requests').find(query),
  findOne: async (query) => getCollection('requests').findOne(query),
  findById: async (id) => getCollection('requests').findById(id),
  create: async (data) => getCollection('requests').create(data),
  findByIdAndUpdate: async (id, update) => getCollection('requests').findByIdAndUpdate(id, update),
  deleteOne: async (query) => getCollection('requests').deleteOne(query),
};

export const Request = {
  find: (query) => isMongoDB() ? MongooseRequest.find(query) : JSONRequest.find(query),
  findOne: (query) => isMongoDB() ? MongooseRequest.findOne(query) : JSONRequest.findOne(query),
  findById: (id) => isMongoDB() ? MongooseRequest.findById(id) : JSONRequest.findById(id),
  create: (data) => isMongoDB() ? MongooseRequest.create(data) : JSONRequest.create(data),
  findByIdAndUpdate: (id, update) => isMongoDB() ? MongooseRequest.findByIdAndUpdate(id, update, { new: true }) : JSONRequest.findByIdAndUpdate(id, update),
  deleteOne: (query) => isMongoDB() ? MongooseRequest.deleteOne(query) : JSONRequest.deleteOne(query)
};
