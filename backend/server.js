/**
 * CV Builder Backend Server
 * Main Express.js server for CV generation and management
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
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

// Routes
app.use('/api/cvs', cvRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/files', aiRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/download', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CV Builder API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CV Builder API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
