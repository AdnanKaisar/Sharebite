// Trigger restart after port termination
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Seed admin account helper
const seedAdmin = async () => {
  try {
    // Delete any other admins to ensure only one Admin exists on the platform
    const admins = await User.find({ role: 'admin' });
    for (const adm of admins) {
      if (adm.email !== 'adnankaisar112@gmail.com') {
        const id = adm._id || adm.id;
        await User.deleteOne({ _id: id });
        console.log(`Pruned duplicate admin profile: ${adm.email}`);
      }
    }

    const admin = await User.findOne({ email: 'adnankaisar112@gmail.com' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Adnankaisarwani@7780946112', salt);
      await User.create({
        name: 'Adnan Kaisar',
        email: 'adnankaisar112@gmail.com',
        password: hashedPassword,
        role: 'admin',
        contactNumber: '+91 7780946112',
        address: 'Achabal, Anantnag, J&K, India',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
        isVerifiedNgo: true
      });
      console.log('Default Admin seeded successfully: adnankaisar112@gmail.com / Adnankaisarwani@7780946112');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

// Connect to Database (MongoDB or JSON fallback)
connectDB().then(() => {
  seedAdmin();
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.url}`);
  next();
});

// Routes wiring
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/ai', aiRoutes);

// Base test route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to ShareBite API' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

io.on('connection', (socket) => {
  socket.on('join_room', (donationId) => {
    socket.join(donationId);
  });

  socket.on('send_chat_message', (data) => {
    socket.to(data.donationId).emit('receive_chat_message', data);
  });

  socket.on('update_location', (data) => {
    socket.to(data.donationId).emit('location_updated', data);
  });

  socket.on('disconnect', () => {
    // console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
