/**
 * Advanced Rate Limiting and Caching Middleware
 * Provides request throttling, caching, and performance monitoring
 */

const NodeCache = require('node-cache');

class RateLimitCache {
  constructor() {
    // Cache for responses (TTL: 5 minutes)
    this.responseCache = new NodeCache({ 
      stdTTL: 300, 
      maxKeys: 1000,
      useClones: false 
    });
    
    // Cache for rate limiting (TTL: 1 minute)
    this.rateLimitCache = new NodeCache({ 
      stdTTL: 60, 
      maxKeys: 10000,
      useClones: false 
    });

    // Performance metrics cache
    this.metricsCache = new NodeCache({ 
      stdTTL: 3600, 
      maxKeys: 100 
    });

    // Statistics
    this.stats = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitHits: 0
    };
  }

  // Generate cache key from request
  generateCacheKey(req) {
    const { method, path, body, query } = req;
    const key = JSON.stringify({ method, path, body, query });
    return require('crypto').createHash('md5').update(key).digest('hex');
  }

  // Check rate limit for IP/user
  checkRateLimit(identifier, limit = 60, window = 60) {
    const key = `rateLimit:${identifier}`;
    const current = this.rateLimitCache.get(key) || 0;
    
    if (current >= limit) {
      this.stats.rateLimitHits++;
      return {
        allowed: false,
        current,
        limit,
        resetTime: this.rateLimitCache.getTtl(key)
      };
    }

    this.rateLimitCache.set(key, current + 1);
    return {
      allowed: true,
      current: current + 1,
      limit,
      remaining: limit - current - 1
    };
  }

  // Get cached response
  getCachedResponse(key) {
    const cached = this.responseCache.get(key);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }
    this.stats.cacheMisses++;
    return null;
  }

  // Set cached response
  setCachedResponse(key, data, ttl = 300) {
    this.responseCache.set(key, data, ttl);
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.stats,
      cacheHitRate: this.stats.requests > 0 ? 
        (this.stats.cacheHits / this.stats.requests * 100).toFixed(2) : 0,
      responseCacheSize: this.responseCache.keys().length,
      rateLimitCacheSize: this.rateLimitCache.keys().length
    };
  }
}

const cache = new RateLimitCache();

/**
 * Rate limiting middleware
 */
const rateLimiter = (config = {}) => {
  const {
    windowMs = 60000, // 1 minute
    max = 60, // 60 requests per minute
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    onLimitReached = null
  } = config;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const limit = cache.checkRateLimit(key, max, windowMs / 1000);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': limit.limit,
      'X-RateLimit-Remaining': limit.remaining || 0,
      'X-RateLimit-Reset': limit.resetTime || Date.now() + windowMs
    });

    if (!limit.allowed) {
      if (onLimitReached) {
        onLimitReached(req, res, next);
        return;
      }

      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000)
      });
    }

    cache.stats.requests++;
    next();
  };
};

/**
 * Response caching middleware
 */
const responseCaching = (config = {}) => {
  const {
    ttl = 300, // 5 minutes
    cacheableStatus = [200],
    skipCacheFor = [],
    varyBy = ['url', 'query']
  } = config;

  return (req, res, next) => {
    // Skip caching for specified paths or methods
    if (skipCacheFor.includes(req.path) || req.method !== 'GET') {
      return next();
    }

    const cacheKey = cache.generateCacheKey(req);
    const cachedResponse = cache.getCachedResponse(cacheKey);

    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.status(cachedResponse.status).json(cachedResponse.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      if (cacheableStatus.includes(res.statusCode)) {
        cache.setCachedResponse(cacheKey, {
          status: res.statusCode,
          data: data
        }, ttl);
      }
      
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * API Performance monitoring middleware
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    
    // Log performance metrics
    const metrics = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration,
      memoryUsed: endMemory.heapUsed - startMemory.heapUsed,
      timestamp: new Date().toISOString()
    };

    // Add to performance logs (in production, send to monitoring service)
    if (duration > 5000) { // Log slow requests (>5s)
      console.warn('🐌 Slow API request detected:', metrics);
    }

    // Set performance headers
    res.set({
      'X-Response-Time': `${duration}ms`,
      'X-Memory-Usage': `${Math.round(metrics.memoryUsed / 1024)}KB`
    });

    return originalEnd.apply(this, args);
  };

  next();
};

/**
 * Error tracking middleware
 */
const errorTracker = (err, req, res, next) => {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
    body: req.body,
    query: req.query,
    params: req.params
  };

  // In production, send to error tracking service (e.g., Sentry)
  console.error('🚨 API Error tracked:', errorInfo);

  // Continue with existing error handling
  next(err);
};

/**
 * Health check and metrics endpoint
 */
const healthCheck = (req, res) => {
  const metrics = cache.getMetrics();
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(uptime),
    memory: {
      used: Math.round(memory.heapUsed / 1024 / 1024),
      total: Math.round(memory.heapTotal / 1024 / 1024),
      external: Math.round(memory.external / 1024 / 1024)
    },
    cache: metrics,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = {
  rateLimiter,
  responseCaching,
  performanceMonitor,
  errorTracker,
  healthCheck,
  cache
};
