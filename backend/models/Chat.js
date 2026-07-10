import mongoose from 'mongoose';
import { isMongoDB } from '../config/db.js';
import { getCollection } from '../config/jsonDb.js';

const chatSchema = new mongoose.Schema({
  donationId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseChat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

const JSONChat = {
  find: async (query) => getCollection('chats').find(query),
  findOne: async (query) => getCollection('chats').findOne(query),
  findById: async (id) => getCollection('chats').findById(id),
  create: async (data) => getCollection('chats').create(data),
  findByIdAndUpdate: async (id, update) => getCollection('chats').findByIdAndUpdate(id, update),
  deleteOne: async (query) => getCollection('chats').deleteOne(query),
};

export const Chat = {
  find: (query) => isMongoDB() ? MongooseChat.find(query) : JSONChat.find(query),
  findOne: (query) => isMongoDB() ? MongooseChat.findOne(query) : JSONChat.findOne(query),
  findById: (id) => isMongoDB() ? MongooseChat.findById(id) : JSONChat.findById(id),
  create: (data) => isMongoDB() ? MongooseChat.create(data) : JSONChat.create(data),
  findByIdAndUpdate: (id, update) => isMongoDB() ? MongooseChat.findByIdAndUpdate(id, update, { new: true }) : JSONChat.findByIdAndUpdate(id, update),
  deleteOne: (query) => isMongoDB() ? MongooseChat.deleteOne(query) : JSONChat.deleteOne(query)
};
