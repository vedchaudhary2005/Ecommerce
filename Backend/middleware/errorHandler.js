/**
 * Error Handling Middleware for SweetHub Backend
 * Provides consistent error responses and logging across all endpoints
 * NETWORK ERROR FIX: Enhanced to prevent hanging responses
 */

/**
 * Global error handler middleware
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (error, req, res, next) => {
  // NETWORK ERROR FIX: Always check if headers are already sent
  // This prevents "Cannot set headers after they are sent" errors
  if (res.headersSent) {
    console.log('⚠️ Response already sent, skipping error handler');
    // Close the connection to prevent hanging
    res.end();
    return;
  }

  // Log error details for debugging
  console.error('=== ERROR HANDLER ===');
  console.error('Time:', new Date().toISOString());
  console.error('Method:', req.method);
  console.error('URL:', req.originalUrl);
  console.error('User:', req.user?.id || 'Unauthenticated');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('=====================');

  // Handle specific error types
  
  // MongoDB/Mongoose validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validationErrors
    });
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // MongoDB cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Multer file upload errors
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error'
    });
  }

  // Custom application errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message || 'Application error'
    });
  }

  // Network/connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable'
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};

/**
 * Async error wrapper - wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
