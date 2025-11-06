import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import autoDataRoutes from './routes/autoDataRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:5173',
  'https://localhost:5173',
  'https://securityplusuniform.com',
  'https://securityplusuniform.com/'
];

if (process.env.CORS_ORIGINS) {
  allowedOrigins.push(
    ...process.env.CORS_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;
      return normalizedAllowed === normalizedOrigin;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auto-import', autoDataRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Security Plus Admin API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Security Plus Admin Backend API',
    version: '1.0.0',
    description: 'Automatic JSON to MongoDB converter for Security Plus frontend',
    endpoints: {
      health: '/api/health',
      auth: {
        signin: 'POST /api/auth/signin',
        signup: 'POST /api/auth/signup',
        profile: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      },
      autoImport: {
        import: 'POST /api/auto-import/import',
        status: 'GET /api/auto-import/status',
        sync: 'POST /api/auto-import/sync',
        collections: 'GET /api/auto-import/collections',
        data: 'GET /api/auto-import/data/:collection'
      },
      products: {
        list: 'GET /api/products',
        create: 'POST /api/products',
        detail: 'GET /api/products/:id',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      }
    },
    usage: {
      autoImport: 'npm run auto-import',
      watchSync: 'npm run watch-sync',
      apiImport: 'POST /api/auto-import/import'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Security Plus Admin API running on port ${PORT}`);
  console.log(`📊 Auto MongoDB converter ready`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}`);
  console.log(`📁 Auto-import: npm run auto-import`);
  console.log(`👀 Watch sync: npm run watch-sync`);
});