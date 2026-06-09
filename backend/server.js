const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// Allowed origins for CORS — local dev + deployed frontends
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://e-commerce-full-stack-pi.vercel.app', // Vercel production
  process.env.FRONTEND_URL,  // Any extra domain via env var (e.g. custom domain)
].filter(Boolean);

// CORS configuration - allows credentials (cookies) to be sent cross-origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true, // Required for cookies to work cross-origin
  })
);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'E-Commerce API is running...' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
