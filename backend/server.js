/**
 * CV Builder Backend Server
 * Main Express.js server for CV generation and management
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Import routes
const cvRoutes = require('./routes/cvRoutes');
const themeRoutes = require('./routes/themeRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter, responseCaching, performanceMonitor, errorTracker, healthCheck } = require('./middleware/performance');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  frameguard: false // Disable X-Frame-Options entirely
}));

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type']
}));

// Additional CORS headers for PDF responses
app.use('/api/cvs/:id/pdf-precise', (req, res, next) => {
  console.log('🔄 CORS middleware for PDF route hit:', req.method, req.originalUrl);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Cache-Control, Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Responding to OPTIONS preflight');
    return res.status(200).end();
  }
  
  console.log('🔄 Continuing to route handler...');
  next();
});

// Additional CORS headers for PDF generation endpoint
app.use('/api/cvs/generate-pdf', (req, res, next) => {
  console.log('🔄 CORS middleware for PDF generation route hit:', req.method, req.originalUrl);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Cache-Control, Pragma, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Responding to OPTIONS preflight for PDF generation');
    return res.status(200).end();
  }
  
  console.log('🔄 Continuing to PDF generation route handler...');
  next();
});

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring
app.use(performanceMonitor);

// Rate limiting - different limits for different endpoints
app.use('/api/ai', rateLimiter({ 
  max: 20, 
  windowMs: 60000, // 20 requests per minute for AI endpoints
  onLimitReached: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'AI rate limit exceeded. Please wait before making more requests.',
      retryAfter: 60
    });
  }
}));

app.use('/api', rateLimiter({ 
  max: 100, 
  windowMs: 60000 // 100 requests per minute for other endpoints
}));

// Response caching for static-ish content
app.use('/api/themes', responseCaching({ ttl: 3600 })); // Cache themes for 1 hour

// Health check endpoint
app.get('/health', healthCheck);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and image files are allowed.'));
    }
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/ai', aiRoutes);

// Error tracking middleware
app.use(errorTracker);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;
