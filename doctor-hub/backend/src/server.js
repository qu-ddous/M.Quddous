require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('node:http');
const { Server } = require('socket.io');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const userRoutes = require('./routes/userRoutes');
const assistantRoutes = require('./routes/assistantRoutes');

const app = express();
const server = http.createServer(app);

// CORS configuration - supports multiple frontend origins for production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174', // Vite alternate port
  'http://localhost:4173', // Vite preview
].filter(Boolean);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_connected', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('User online:', userId);
  });

  socket.on('send_message', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', data);
    }
  });

  socket.on('video_call', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming_call', data);
    }
  });

  socket.on('accept_call', (data) => {
    const callerSocketId = onlineUsers.get(data.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_accepted', data);
    }
  });

  socket.on('end_call', (data) => {
    const otherUserId = data.otherUserId;
    const otherSocketId = onlineUsers.get(otherUserId);
    if (otherSocketId) {
      io.to(otherSocketId).emit('call_ended', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assistants', assistantRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Doctor Hub API is running', environment: process.env.NODE_ENV || 'development' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origins: ${allowedOrigins.join(', ')}`);
});

module.exports = { app, server, io };
