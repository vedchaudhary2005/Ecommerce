require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// FIX: CORS must explicitly allow frontend origin when credentials:true
// When credentials:true, origin cannot be '*' or callback returning true for all
const corsOptions = {
  origin: function(origin, callback) {
    // Allowed origins for development
    const allowedOrigins = [
      'http://localhost:5173',      // Vite dev server
      'http://localhost:5174',      // Vite alternate port
      'http://localhost:3000',      // React dev server
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000'
    ];

    // Add production frontend URL from environment variable
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For mobile testing on LAN, allow any origin during development
      // In production, this should be restricted
      console.log(`⚠️ CORS: Allowing origin ${origin} for development`);
      callback(null, true);
    }
  },
  credentials: true,  // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // Cache preflight for 24 hours
  optionsSuccessStatus: 200 // Legacy browser support
};

app.use(cors(corsOptions));

// FIX: Preflight handler must be BEFORE body parsers and other middleware
// OPTIONS requests should be handled by cors() middleware above
// Remove custom handler to avoid conflicts

// FIX: Body parsers MUST come BEFORE routes but AFTER CORS
app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} from ${req.get('origin') || 'no-origin'}`);
  
  // Add response logging
  const originalJson = res.json;
  res.json = function(data) {
    console.log(`📤 Response sent for ${req.method} ${req.path}:`, data.success ? '✅ Success' : '❌ Failed');
    return originalJson.call(this, data);
  };
  
  next();
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// CRITICAL FIX: Simple test endpoint
app.post('/api/test-login', (req, res) => {
  console.log('🧪 Test login endpoint hit:', req.body);
  res.status(200).json({ 
    success: true, 
    message: 'Backend is working correctly',
    receivedData: req.body
  });
});

// Routes with enhanced error handling
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sweets', require('./routes/sweets'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/slider', require('./routes/slider')); // Slider images management

// Health check endpoint
app.get('/', (req, res) => {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
  res.json({ 
    message: 'SweetHub Backend API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    device: isMobile ? 'mobile' : 'desktop',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      adminLogin: 'POST /api/admin/login',
      addSweet: 'POST /api/admin/add-sweet',
      getSweets: 'GET /api/admin/get-sweets',
      updateSweet: 'PUT /api/admin/update-sweet/:id',
      deleteSweet: 'DELETE /api/admin/delete-sweet/:id',
      publicSweets: 'GET /api/sweets',
      placeOrder: 'POST /api/orders/place'
    },
    uploads: {
      imageAccess: 'GET /uploads/:filename'
    }
  });
});

// Debug endpoint to check data availability
app.get('/api/debug/data', async (req, res) => {
  try {
    const Sweet = require('./models/Sweet');
    const User = require('./models/User');
    const Order = require('./models/Order');
    
    const sweetCount = await Sweet.countDocuments();
    const visibleSweetCount = await Sweet.countDocuments({ isActive: true, isVisible: true });
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const orderCount = await Order.countDocuments();
    
    const sampleSweets = await Sweet.find({ isActive: true, isVisible: true }).limit(3);
    
    res.json({
      success: true,
      message: 'Data debug information',
      data: {
        counts: {
          totalSweets: sweetCount,
          visibleSweets: visibleSweetCount,
          users: userCount,
          admins: adminCount,
          orders: orderCount
        },
        sampleSweets: sampleSweets.map(s => ({
          id: s._id,
          name: s.name,
          price: s.price,
          visible: s.isVisible,
          active: s.isActive
        })),
        database: {
          connected: require('mongoose').connection.readyState === 1,
          uri: process.env.MONGODB_URI ? 'configured' : 'missing'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Debug endpoint error',
      error: error.message
    });
  }
});

// Network test endpoint for debugging connection issues
app.get('/api/health', (req, res) => {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
  res.json({
    success: true,
    message: 'Network connection is working',
    device: isMobile ? 'mobile' : 'desktop',
    timestamp: new Date().toISOString(),
    server: 'SweetHub Backend'
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// FIX: Bind to 0.0.0.0 for mobile access on LAN
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 SWEETHUB BACKEND STARTED`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Local: http://127.0.0.1:${PORT}`);
  console.log(`📍 LAN:   http://<your-ip>:${PORT} (for mobile testing)`);
  console.log(`\n✅ CORS: Configured for http://localhost:5173 (dev) + FRONTEND_URL env (prod)`);
  console.log(`✅ Admin: ${process.env.ADMIN_EMAIL}`);
  console.log(`✅ MongoDB: ${process.env.MONGODB_URI ? 'configured' : 'MISSING'}`);
  console.log(`\n✅ Backend Ready\n`);
});