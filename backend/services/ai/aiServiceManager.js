/**
 * AI Service Manager - Multi-tier fallback system
 * Ma          maxRequestsPerMinute: 15, // Google's actual limit: 15 RPM
          maxRequestsPerDay: 1500, // Google's actual limit: 1500 RPDges multiple AI service instances with different API keys and models
 * Singleton pattern to ensure quota tracking across all services
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIServiceManager {
  constructor() {
    // Singleton pattern - return existing instance if already created
    if (AIServiceManager.instance) {
      console.log('🔄 Returning existing AIServiceManager instance');
      return AIServiceManager.instance;
    }
    
    console.log('🆕 Creating new AIServiceManager instance');
    this.services = [];
    this.currentServiceIndex = 0;
    this.requestCache = new Map(); // Cache to avoid duplicate requests
    this.pendingRequests = new Map(); // Track pending requests to avoid duplicates
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.initializeServices();
    
    // Store the instance for singleton pattern
    AIServiceManager.instance = this;
  }

  /**
   * Initialize AI services with conservative approach
   * Only one service per API key, using the best model
   * No wasteful combinations - each API key gets ONE service only
   */
  initializeServices() {
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY2,
      process.env.GEMINI_API_KEY3,
      process.env.GEMINI_API_KEY4,
      process.env.GEMINI_API_KEY5,
      process.env.GEMINI_API_KEY6
    ].filter(key => key); // Remove undefined keys

    // Use only the best model per API key to avoid waste
    const bestModel = 'gemini-1.5-flash-latest';

    let serviceId = 1;
    
    // Create only ONE service per API key
    apiKeys.forEach((apiKey, keyIndex) => {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({ model: bestModel });
        
        this.services.push({
          id: serviceId++,
          apiKeyIndex: keyIndex + 1,
          model: bestModel,
          modelInstance: modelInstance,
          requestCount: 0,
          dailyRequestCount: 0,
          lastResetTime: Date.now(),
          lastDailyReset: Date.now(),
          maxRequestsPerMinute: 12, // Conservative - Google allows 15 RPM
          maxRequestsPerDay: 1200, // Conservative - Google allows 1500 RPD
          isQuotaExceeded: false,
          isTemporarilyDisabled: false,
          displayName: `AI Service ${keyIndex + 1} (Key${keyIndex + 1}-${bestModel})`
        });
        
        console.log(`✅ Initialized AI Service ${keyIndex + 1} with API key ${keyIndex + 1}`);
      } catch (error) {
        console.log(`⚠️ Failed to initialize service with API key ${keyIndex + 1}:`, error.message);
      }
    });

    if (this.services.length === 0) {
      throw new Error('No valid AI services could be initialized. Check your API keys.');
    }

    console.log(`✅ Initialized ${this.services.length} AI services (1 per API key, conservative limits)`);
    this.services.forEach(service => {
      console.log(`   - ${service.displayName} (${service.maxRequestsPerDay} req/day limit)`);
    });
    
    // Display total capacity
    const totalDailyCapacity = this.services.length * this.services[0].maxRequestsPerDay;
    console.log(`🎯 Total daily capacity: ${totalDailyCapacity} requests across ${this.services.length} API keys`);
  }

  /**
   * Get the next available service
   * @returns {Object|null} Available service or null if all are exhausted
   */
  getNextAvailableService() {
    // Reset counters if needed
    this.resetExpiredCounters();
    
    // Log current service status for debugging
    console.log('🔍 Current AI service status:');
    this.services.forEach((service, index) => {
      const isCurrent = index === this.currentServiceIndex;
      const available = this.isServiceAvailable(service);
      console.log(`   ${isCurrent ? '→' : ' '} ${service.displayName}: ${available ? '✅ Available' : '❌ Unavailable'} (${service.requestCount}/${service.maxRequestsPerMinute} per min, ${service.dailyRequestCount}/${service.maxRequestsPerDay} per day)`);
    });
    
    // Check if current service is available
    if (this.currentServiceIndex < this.services.length) {
      const service = this.services[this.currentServiceIndex];
      if (this.isServiceAvailable(service)) {
        return service;
      }
    }

    // Find next available service
    for (let i = this.currentServiceIndex + 1; i < this.services.length; i++) {
      const service = this.services[i];
      if (this.isServiceAvailable(service)) {
        this.currentServiceIndex = i;
        console.log(`🔄 Switching to ${service.displayName}`);
        return service;
      }
    }

    // All services exhausted - check if we can reset any
    this.resetExpiredCounters();
    
    // Try to find a service that's not permanently blocked
    for (let i = 0; i < this.services.length; i++) {
      const service = this.services[i];
      if (!service.isQuotaExceeded && this.isServiceAvailable(service)) {
        this.currentServiceIndex = i;
        console.log(`🔄 Reset and using ${service.displayName}`);
        return service;
      }
    }

    // All services exhausted - log detailed status
    console.log('❌ ALL AI SERVICES EXHAUSTED:');
    this.services.forEach((service, index) => {
      console.log(`   Service ${index + 1}: ${service.displayName}`);
      console.log(`     - Quota exceeded: ${service.isQuotaExceeded}`);
      console.log(`     - Temporarily disabled: ${service.isTemporarilyDisabled}`);
      console.log(`     - Requests this minute: ${service.requestCount}/${service.maxRequestsPerMinute}`);
      console.log(`     - Requests today: ${service.dailyRequestCount}/${service.maxRequestsPerDay}`);
      console.log(`     - Last reset: ${new Date(service.lastResetTime).toLocaleTimeString()}`);
      console.log(`     - Last daily reset: ${new Date(service.lastDailyReset).toLocaleDateString()}`);
    });

    return null;
  }

  /**
   * Check if a service is available for use
   */
  isServiceAvailable(service) {
    if (service.isQuotaExceeded || service.isTemporarilyDisabled) {
      return false;
    }

    // Check daily limit
    if (service.dailyRequestCount >= service.maxRequestsPerDay) {
      console.log(`📊 ${service.displayName} daily limit reached (${service.dailyRequestCount}/${service.maxRequestsPerDay})`);
      return false;
    }

    // Check minute limit
    if (service.requestCount >= service.maxRequestsPerMinute) {
      console.log(`📊 ${service.displayName} minute limit reached (${service.requestCount}/${service.maxRequestsPerMinute})`);
      return false;
    }

    return true;
  }

  /**
   * Reset expired counters
   */
  resetExpiredCounters() {
    const now = Date.now();
    
    this.services.forEach(service => {
      // Reset minute counter
      if (now - service.lastResetTime > 60000) { // 1 minute
        service.requestCount = 0;
        service.lastResetTime = now;
      }
      
      // Reset daily counter
      if (now - service.lastDailyReset > 86400000) { // 24 hours
        service.dailyRequestCount = 0;
        service.lastDailyReset = now;
        service.isQuotaExceeded = false; // Reset quota exceeded flag daily
        console.log(`🔄 Daily reset for ${service.displayName}`);
      }
    });
  }

  /**
   * Mark current service as quota exceeded and move to next
   */
  markCurrentServiceAsExceeded() {
    if (this.currentServiceIndex < this.services.length) {
      const service = this.services[this.currentServiceIndex];
      service.isQuotaExceeded = true;
      console.log(`❌ ${service.displayName} quota exceeded, marking as unavailable`);
    }
  }

  /**
   * Check rate limit for a specific service (without incrementing counters)
   */
  async checkRateLimit(service) {
    const now = Date.now();
    const timeSinceReset = now - service.lastResetTime;
    const timeSinceDailyReset = now - service.lastDailyReset;
    
    // Reset counter every minute
    if (timeSinceReset >= 60000) {
      console.log(`🔄 ${service.displayName} minute reset: ${service.requestCount} -> 0 (${Math.round(timeSinceReset/1000)}s elapsed)`);
      service.requestCount = 0;
      service.lastResetTime = now;
    }
    
    // Reset daily counter
    if (timeSinceDailyReset >= 86400000) {
      console.log(`🔄 ${service.displayName} daily reset: ${service.dailyRequestCount} -> 0 (${Math.round(timeSinceDailyReset/3600000)}h elapsed)`);
      service.dailyRequestCount = 0;
      service.lastDailyReset = now;
      service.isQuotaExceeded = false;
    }
    
    // Check daily limit first (don't increment yet)
    if (service.dailyRequestCount >= service.maxRequestsPerDay) {
      console.log(`🚫 ${service.displayName} daily limit reached, marking as unavailable`);
      service.isQuotaExceeded = true;
      return false;
    }
    
    // Check minute limit (don't increment yet)
    if (service.requestCount >= service.maxRequestsPerMinute) {
      const waitTime = Math.max(5000, 60000 - timeSinceReset + 1000);
      console.log(`⏳ ${service.displayName} rate limit reached, waiting ${Math.ceil(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      service.requestCount = 0;
      service.lastResetTime = Date.now();
    }
    
    return true;
  }

  /**
   * Increment request counters after successful API call
   */
  incrementRequestCounters(service) {
    const oldRequestCount = service.requestCount;
    const oldDailyCount = service.dailyRequestCount;
    
    service.requestCount++;
    service.dailyRequestCount++;
    
    console.log(`📊 ${service.displayName} usage incremented: minute ${oldRequestCount} -> ${service.requestCount}/${service.maxRequestsPerMinute}, daily ${oldDailyCount} -> ${service.dailyRequestCount}/${service.maxRequestsPerDay}`);
    
    // Immediate verification
    setTimeout(() => {
      console.log(`🔍 ${service.displayName} usage verification after 1s: minute ${service.requestCount}/${service.maxRequestsPerMinute}, daily ${service.dailyRequestCount}/${service.maxRequestsPerDay}`);
    }, 1000);
  }

  /**
   * Generate content with conservative service usage (one attempt per service)
   * Includes caching and request deduplication to avoid duplicate requests
   * @param {string} prompt - The prompt to send to AI
   * @param {boolean} isGeneration - Whether this is generation (true) or extraction (false)
   * @returns {Promise<{content: string, serviceUsed: string}>} - AI response and service info
   */
  async generateContent(prompt, isGeneration = false) {
    // Create cache key from prompt hash
    const cacheKey = this.createCacheKey(prompt);
    
    // Check cache first (only for extraction, not generation)
    if (!isGeneration) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        console.log(`💾 Using cached result for request (saves API quota)`);
        return {
          content: cached.content,
          serviceUsed: `${cached.serviceUsed} (Cached)`
        };
      }
    }
    
    // Check if same request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`⏳ Same request already pending, waiting for result...`);
      return await this.pendingRequests.get(cacheKey);
    }
    
    // Create promise for this request
    const requestPromise = this.executeRequest(prompt, isGeneration, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute the actual AI request
   */
  async executeRequest(prompt, isGeneration, cacheKey) {
    const maxServiceAttempts = this.services.length;
    let lastError;

    console.log(`🎯 Executing new AI request (not cached, not pending)`);

    for (let serviceAttempt = 0; serviceAttempt < maxServiceAttempts; serviceAttempt++) {
      const service = this.getNextAvailableService();
      
      if (!service) {
        console.log('❌ All AI services exhausted');
        break;
      }

      console.log(`🤖 Using ${service.displayName} (service ${serviceAttempt + 1}/${maxServiceAttempts})`);

      // Only ONE attempt per service to avoid wasting quota
      try {
        // Check rate limit and daily limit first (without incrementing)
        const canProceed = await this.checkRateLimit(service);
        if (!canProceed) {
          console.log(`🚫 ${service.displayName} daily limit reached, moving to next service`);
          continue; // Move to next service immediately
        }
        
        console.log(`🔄 Making single request to ${service.displayName}...`);
        const result = await service.modelInstance.generateContent(prompt);
        const response = await result.response;
        const content = response.text();
        
        // Only increment counters AFTER successful API call
        this.incrementRequestCounters(service);
        
        console.log(`✅ Success with ${service.displayName} on first attempt`);
        
        // Cache the result (only for extraction)
        if (!isGeneration) {
          this.cacheResult(cacheKey, content, service.displayName);
        }
        
        return {
          content,
          serviceUsed: service.displayName
        };
        
      } catch (error) {
        lastError = error;
        console.log(`❌ ${service.displayName} failed:`, error.message);
        
        // Log detailed error information for 429s
        if (error.message.includes('429') || error.status === 429) {
          console.log(`🚨 DETAILED 429 ERROR for ${service.displayName}:`);
          console.log(`   - Error message: ${error.message}`);
          console.log(`   - Error status: ${error.status}`);
          console.log(`   - Error code: ${error.code}`);
          console.log(`   - Full error:`, error);
          console.log(`   - Current daily count: ${service.dailyRequestCount}/${service.maxRequestsPerDay}`);
          console.log(`   - Current minute count: ${service.requestCount}/${service.maxRequestsPerMinute}`);
        }
        
        // DON'T increment counters on failed requests
        
        // Check if it's a quota error
        if (error.message.includes('quota') || error.message.includes('429') || error.status === 429) {
          console.log(`📊 ${service.displayName} quota exceeded, marking as unavailable`);
          this.markCurrentServiceAsExceeded();
        }
        
        // No retries - move to next service immediately
        console.log(`🔄 Moving to next service immediately (no retries to conserve quota)`);
        continue;
      }
    }

    // If we reach here, all AI services failed
    // No fallback - only AI is allowed
    throw new Error(`All AI services failed. ${lastError?.message?.includes('quota') ? 'API quota exceeded. Please try again later or upgrade your plan.' : `Last error: ${lastError?.message || 'Unknown error'}`}`);
  }

  /**
   * Create a cache key from prompt
   */
  createCacheKey(prompt) {
    // Simple hash function for caching
    const crypto = require('crypto');
    return crypto.createHash('md5').update(prompt).digest('hex');
  }

  /**
   * Get cached result if available and not expired
   */
  getCachedResult(cacheKey) {
    const cached = this.requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached;
    }
    // Remove expired cache
    if (cached) {
      this.requestCache.delete(cacheKey);
    }
    return null;
  }

  /**
   * Cache a result
   */
  cacheResult(cacheKey, content, serviceUsed) {
    this.requestCache.set(cacheKey, {
      content,
      serviceUsed,
      timestamp: Date.now()
    });
    
    // Clean old cache entries periodically
    if (this.requestCache.size > 100) {
      this.cleanOldCache();
    }
  }

  /**
   * Clean expired cache entries
   */
  cleanOldCache() {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if ((now - value.timestamp) > this.cacheTimeout) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Reset quota status for all services (useful for daily reset)
   */
  resetAllQuotaStatus() {
    this.services.forEach(service => {
      service.isQuotaExceeded = false;
    });
    this.currentServiceIndex = 0;
    console.log('🔄 All AI service quota status reset');
  }

  /**
   * Get service status for debugging
   */
  getServiceStatus() {
    this.resetExpiredCounters(); // Ensure fresh data
    
    return this.services.map((service, index) => ({
      displayName: service.displayName,
      id: service.id,
      apiKeyIndex: service.apiKeyIndex,
      model: service.model,
      isQuotaExceeded: service.isQuotaExceeded,
      isTemporarilyDisabled: service.isTemporarilyDisabled,
      requestCount: service.requestCount,
      dailyRequestCount: service.dailyRequestCount,
      maxRequestsPerMinute: service.maxRequestsPerMinute,
      maxRequestsPerDay: service.maxRequestsPerDay,
      isCurrent: index === this.currentServiceIndex,
      isAvailable: this.isServiceAvailable(service),
      lastResetTime: service.lastResetTime,
      lastDailyReset: service.lastDailyReset,
      usagePercentage: Math.round((service.dailyRequestCount / service.maxRequestsPerDay) * 100)
    }));
  }
  
  /**
   * Get the singleton instance of AIServiceManager
   */
  static getInstance() {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }
  
  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance() {
    AIServiceManager.instance = null;
  }
}

// Initialize static property
AIServiceManager.instance = null;

module.exports = AIServiceManager;
