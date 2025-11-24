import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import autoDataRoutes from './routes/autoDataRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import brandRoutes from './routes/brandRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://localhost:5173',
  'https://localhost:5174',
  'https://securityplusuniform.com',
  'https://securityplusuniform.com/',
  'https://www.securityplusuniform.com',
  'https://www.securityplusuniform.com/',
  'http://www.securityplusuniform.com',
  'http://www.securityplusuniform.com/'
];

// Allow all localhost ports for development (flexible for any port)
allowedOrigins.push(/^http:\/\/localhost:\d+$/);
allowedOrigins.push(/^https:\/\/localhost:\d+$/);

// Allow securityplusuniform.com with or without www
allowedOrigins.push(/^https?:\/\/(www\.)?securityplusuniform\.com\/?$/);

// Add Vercel deployment URLs automatically
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

// Add custom Vercel domain if set
if (process.env.VERCEL_CUSTOM_DOMAIN) {
  allowedOrigins.push(`https://${process.env.VERCEL_CUSTOM_DOMAIN}`);
}

// Allow all Vercel preview deployments (for development/testing)
if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development') {
  allowedOrigins.push(/^https:\/\/.*\.vercel\.app$/);
}

// Allow all Netlify domains (for production frontend)
allowedOrigins.push(/^https:\/\/.*\.netlify\.app$/);
allowedOrigins.push(/^https:\/\/.*\.netlify\.com$/);

if (process.env.CORS_ORIGINS) {
  allowedOrigins.push(
    ...process.env.CORS_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    console.log(`CORS: Checking origin: ${normalizedOrigin}`);
    console.log(`CORS: Allowed origins count: ${allowedOrigins.length}`);
    
    // FIRST: Always allow securityplusuniform.com domain (production domain)
    // This should be checked first regardless of environment variables
    if (normalizedOrigin.includes('securityplusuniform.com')) {
      console.log(`CORS: Allowing production domain: ${normalizedOrigin}`);
      return callback(null, true);
    }
    
    // SECOND: Always allow netlify domains (for frontend deployments)
    if (normalizedOrigin.includes('netlify.app') || normalizedOrigin.includes('netlify.com')) {
      console.log(`CORS: Allowing Netlify domain: ${normalizedOrigin}`);
      return callback(null, true);
    }
    
    // THIRD: Check if origin matches any allowed origin (including regex patterns)
    const isAllowed = allowedOrigins.some(allowed => {
      // Handle regex patterns (for Vercel preview URLs)
      if (allowed instanceof RegExp) {
        const matches = allowed.test(normalizedOrigin);
        if (matches) {
          console.log(`CORS: Matched regex pattern: ${allowed}`);
        }
        return matches;
      }
      const normalizedAllowed = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;
      const matches = normalizedAllowed === normalizedOrigin;
      if (matches) {
        console.log(`CORS: Matched exact origin: ${normalizedAllowed}`);
      }
      return matches;
    });

    if (isAllowed) {
      console.log(`CORS: Allowing origin: ${normalizedOrigin}`);
      return callback(null, true);
    }

    // FOURTH: Additional production fallback - be more permissive in production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.VERCEL_ENV;
    if (isProduction) {
      // Allow any securityplusuniform.com subdomain (additional check)
      if (normalizedOrigin.includes('securityplusuniform.com')) {
        console.log(`CORS: Allowing production domain (fallback): ${normalizedOrigin}`);
        return callback(null, true);
      }
      // Allow any netlify domain (additional check)
      if (normalizedOrigin.includes('netlify')) {
        console.log(`CORS: Allowing Netlify domain (fallback): ${normalizedOrigin}`);
        return callback(null, true);
      }
    }
    
    // Log blocked origins for debugging
    console.error(`CORS: BLOCKED origin: ${origin}`);
    console.error(`CORS: Normalized origin: ${normalizedOrigin}`);
    console.error(`CORS: Is production: ${isProduction}`);
    console.error(`CORS: Allowed origins:`, allowedOrigins.map(o => o instanceof RegExp ? o.toString() : o));
    
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
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
app.use('/api/brands', brandRoutes);

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
      },
      brands: {
        list: 'GET /api/brands'
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

// Start server only in local development
// Vercel will use the exported app directly (serverless function)
// Listen only if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Security Plus Admin API running on port ${PORT}`);
    console.log(`📊 Auto MongoDB converter ready`);
    console.log(`🔗 API Documentation: http://localhost:${PORT}`);
    console.log(`📁 Auto-import: npm run auto-import`);
    console.log(`👀 Watch sync: npm run watch-sync`);
  });
}

// Export app for Vercel serverless functions
export default app;