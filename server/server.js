import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import initDB from './config/db-init.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload folder (for custom uploaded products)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Root API info endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Home Made Foods API is running',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      reviews: '/api/reviews',
      health: '/api/health'
    }
  });
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error stack:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start Database & Server
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`================================================`);
      console.log(`  Backend API server running on port: ${PORT}`);
      console.log(`  API Base URL: http://localhost:${PORT}/api`);
      console.log(`================================================`);
    });
  } catch (error) {
    console.error('\n!!! DATABASE INITIALIZATION FAILED !!!');
    console.error('Please verify that:');
    console.error('1. Your MySQL Service is running locally.');
    console.error('2. You have configured server/.env with valid password.');
    console.error('Error Details:', error.message);
    console.error('Exiting...\n');
    process.exit(1);
  }
}

startServer();
