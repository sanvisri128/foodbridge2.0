// Main Express server entry point for FoodBridge
// Loads environment variables, connects to MongoDB, and starts the server

// We use 'createRequire' because package.json has "type":"module" for Vite
// but server code uses CommonJS-style require via dynamic import
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import notificationRoutes from './routes/notifications.js';
import requestRoutes from './routes/requests.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
// Allow cross-origin requests from the Vite dev server (port 5173 / 4173)
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'] }));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────
// Authentication & Profile routes: /api/auth
app.use('/api/auth', authRoutes);

// Donation CRUD, claim, verification, & platform stats: /api/donations
app.use('/api/donations', donationRoutes);

// In-app notifications: /api/notifications
app.use('/api/notifications', notificationRoutes);

// Community food requests: /api/requests
app.use('/api/requests', requestRoutes);

// Health-check endpoint to verify server is running
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'FoodBridge API 2.0 is running smoothly' });
});

// ─── MongoDB Connection ───────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodbridge';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start listening only after DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 FoodBridge server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
