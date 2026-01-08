const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database (non-blocking in development)
connectDB().catch((err) => {
  console.error('Database connection failed:', err.message);
});

const app = express();

// Middleware - Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} (${req.protocol})`);
  // Only log headers if there's an error (to avoid spam)
  if (req.url.includes('/auth/login')) {
    console.log('Login request - Protocol:', req.protocol, 'Secure:', req.secure);
  }
  next();
});

// CORS configuration - explicitly allow HTTP origins
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/wardrobe', require('./routes/wardrobeRoutes'));
app.use('/api/outfits', require('./routes/outfitRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'StyloAI API is running', status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    protocol: req.protocol,
  });
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Explicitly listen on HTTP (not HTTPS)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`StyloAI Backend server running on HTTP://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Protocol: HTTP (not HTTPS)`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
  }
});

// Ensure we're not using HTTPS
if (process.env.HTTPS === 'true' || process.env.SSL_KEY) {
  console.warn('WARNING: HTTPS/SSL configuration detected. This server should use HTTP only for development.');
}

module.exports = app;

