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

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
// Allow cross-origin requests from the Vite dev server (port 5173)
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────
// Authentication routes: /api/auth/register, /api/auth/login
app.use('/api/auth', authRoutes);

// Donation CRUD + claim routes: /api/donations
app.use('/api/donations', donationRoutes);

// Health-check endpoint to verify server is running
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'FoodBridge API is running' });
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
