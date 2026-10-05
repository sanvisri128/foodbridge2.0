// Main Express server entry point for FoodBridge 2.0
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import notificationRoutes from './routes/notifications.js';
import requestRoutes from './routes/requests.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Production & Development CORS Configuration ───────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (process.env.CLIENT_URL === '*' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow Vercel, Netlify, and Render domains automatically
      if (
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback to prevent CORS blocks
    },
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────
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
  res.json({
    status: 'ok',
    message: 'FoodBridge API 2.0 is running smoothly',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── Static Frontend Serving (For Monolith / Single-Service Deployments) ─
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For non-API routes, serve index.html (SPA Fallback)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// ─── Start Server & Connect MongoDB ───────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FoodBridge server running on http://127.0.0.1:${PORT}`);
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });


