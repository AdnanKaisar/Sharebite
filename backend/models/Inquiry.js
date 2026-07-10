import mongoose from 'mongoose';
import { isMongoDB } from '../config/db.js';
import { getCollection } from '../config/jsonDb.js';

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseInquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);

const JSONInquiry = {
  find: async (query) => getCollection('inquiries').find(query),
  findOne: async (query) => getCollection('inquiries').findOne(query),
  findById: async (id) => getCollection('inquiries').findById(id),
  create: async (data) => getCollection('inquiries').create(data),
  deleteOne: async (query) => getCollection('inquiries').deleteOne(query),
};

export const Inquiry = {
  find: (query) => isMongoDB() ? MongooseInquiry.find(query) : JSONInquiry.find(query),
  findOne: (query) => isMongoDB() ? MongooseInquiry.findOne(query) : JSONInquiry.findOne(query),
  findById: (id) => isMongoDB() ? MongooseInquiry.findById(id) : JSONInquiry.findById(id),
  create: (data) => isMongoDB() ? MongooseInquiry.create(data) : JSONInquiry.create(data),
  deleteOne: (query) => isMongoDB() ? MongooseInquiry.deleteOne(query) : JSONInquiry.deleteOne(query)
};
