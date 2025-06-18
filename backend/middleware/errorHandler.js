/**
 * Error Handling Middleware
 * Centralized error handling for the CV Builder API
 */

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Development error response with full stack trace
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      name: err.name
    }
  });
};

/**
 * Production error response with minimal details
 */
const sendErrorProd = (err, res) => {
  // Operational errors: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // Programming errors: don't leak error details
    console.error('ERROR 💥:', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong on our server'
    });
  }
};

/**
 * Handle MongoDB validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new APIError(message, 400);
};

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateFieldsError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value for ${field}: '${value}'. Please use another value.`;
  return new APIError(message, 400);
};

/**
 * Handle MongoDB cast errors (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new APIError(message, 400);
};

/**
 * Handle PDF generation errors
 */
const handlePDFError = (err) => {
  const message = `PDF generation failed: ${err.message}`;
  return new APIError(message, 500);
};

/**
 * Main error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error(`Error: ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  });

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateFieldsError(err);
  }

  // MongoDB cast error
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // PDF generation errors
  if (err.name === 'PDFError' || err.message.includes('PDF')) {
    error = handlePDFError(err);
  }

  // Puppeteer errors
  if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
    error = new APIError('PDF generation timeout. Please try again.', 408);
  }

  // JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    error = new APIError('Invalid JSON in request body', 400);
  }

  // Request size errors
  if (err.type === 'entity.too.large') {
    error = new APIError('Request payload too large', 413);
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = {
  APIError,
  errorHandler
};
