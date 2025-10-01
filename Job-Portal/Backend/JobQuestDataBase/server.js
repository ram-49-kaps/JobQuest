import express from 'express';
import cors from 'cors';
import net from 'net';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import recruiterRoutes from './routes/recruiters.js';
import applicationRoutes from './routes/applications.js';
import statsRoutes from './routes/stats.js';

import connectDB from './Config/db.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed!'));
  },
});

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
const profilesDir = path.join(uploadsDir, 'profiles');

[uploadsDir, resumesDir, profilesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Connect to MongoDB
connectDB();

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/jobs', jobRoutes);
app.use('/api/recruiters', authMiddleware, recruiterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/stats', statsRoutes);


// Root endpoint
app.get('/', (req, res) => {
  res.send('JobQuest Backend Running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack in dev
  });
});

// Find available port and start server
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      findAvailablePort(startPort + 1).then(resolve).catch(reject);
    });
  });
};

const startServer = async () => {
  try {
    const port = await findAvailablePort(5002);
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();