/**
 * AI Service Manager - Multi-tier fallback system
 * Manages multiple AI service instances with different API keys and models
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
   * Initialize AI services with realistic quota tracking
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

    // Define model fallback hierarchy - different models for resilience
    const modelFallbackHierarchy = [
      'gemini-1.5-flash-latest',  // Primary (fastest)
      'gemini-1.5-flash',         // Secondary (stable)
      'gemini-1.5-pro-latest',    // Tertiary (most capable)
      'gemini-pro',               // Quaternary (classic)
      'gemini-1.5-flash-8b-latest', // Quinary (efficient)
      'gemini-1.5-flash-8b'       // Senary (fallback)
    ];

    let serviceId = 1;
    
    // Create multiple services per API key with different models for resilience
    apiKeys.forEach((apiKey, keyIndex) => {
      const modelsToUse = modelFallbackHierarchy.slice(0, Math.min(3, modelFallbackHierarchy.length)); // Use 3 models per key for better resilience
      
      modelsToUse.forEach((model, modelIndex) => {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const modelInstance = genAI.getGenerativeModel({ model: model });
          
          this.services.push({
            id: serviceId++,
            apiKeyIndex: keyIndex + 1,
            model: model,
            modelInstance: modelInstance,
            provider: 'gemini',
            requestCount: 0,
            dailyRequestCount: 0,
            lastResetTime: Date.now(),
            lastDailyReset: new Date().toDateString(),
            lastMinuteStart: new Date().getMinutes(),
            maxRequestsPerMinute: 15, // Google's actual limit: 15 RPM
            maxRequestsPerDay: 50, // Google's actual FREE tier limit: 50 RPD
            isQuotaExceeded: false,
            isTemporarilyDisabled: false,
            quotaExceededAt: null,
            lastSuccessfulRequest: null,
            consecutiveFailures: 0,
            displayName: `AI Service ${serviceId-1} (Key${keyIndex + 1}-${model})`
          });
          
          console.log(`✅ Initialized AI Service ${serviceId-1} with API key ${keyIndex + 1} and model ${model}`);
        } catch (error) {
          console.log(`⚠️ Failed to initialize service with API key ${keyIndex + 1} and model ${model}:`, error.message);
        }
      });
    });

    if (this.services.length === 0) {
      throw new Error('No valid AI services could be initialized. Check your API keys.');
    }

    // Display final service summary
    const totalDailyCapacity = this.services.reduce((sum, service) => sum + service.maxRequestsPerDay, 0);
    console.log(`✅ Initialized ${this.services.length} AI services with REALISTIC quota limits (ALL QUOTAS RESET)`);
    console.log(`🎯 Total daily capacity: ${totalDailyCapacity} requests across ${this.services.length} API keys`);
    
    this.services.forEach(service => {
      console.log(`   - ${service.displayName}:`);
      console.log(`     • Daily Limit: ${service.maxRequestsPerDay} requests (Google Free Tier)`);
      console.log(`     • Minute Limit: ${service.maxRequestsPerMinute} requests (Google Rate Limit)`);
      console.log(`     • Current Usage: ${service.dailyRequestCount}/${service.maxRequestsPerDay} daily, ${service.requestCount}/${service.maxRequestsPerMinute} per minute`);
      console.log(`     • Status: ${service.isQuotaExceeded ? '❌ EXCEEDED' : '✅ AVAILABLE'}`);
    });
    
    console.log(`⚠️ NOTE: Using Google's actual FREE TIER limits (50/day per key), not inflated numbers!`);
    console.log(`🔄 ALL QUOTA TRACKING RESET - Services should be available now`);
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

    // If no service found forward, check from beginning (cycling back)
    for (let i = 0; i < this.currentServiceIndex; i++) {
      const service = this.services[i];
      if (this.isServiceAvailable(service)) {
        this.currentServiceIndex = i;
        console.log(`🔄 Cycling back to ${service.displayName}`);
        return service;
      }
    }

    // All services exhausted - check if we can reset any
    this.resetExpiredCounters();
    
    // Try to find a service that's not permanently blocked (full cycle)
    for (let i = 0; i < this.services.length; i++) {
      const service = this.services[i];
      if (!service.isQuotaExceeded && this.isServiceAvailable(service)) {
        this.currentServiceIndex = i;
        console.log(`🔄 Reset and using ${service.displayName}`);
        return service;
      }
    }

    // All services exhausted - check if we should force reset
    const allMarkedAsExceeded = this.services.every(s => s.isQuotaExceeded);
    const anyWithZeroDaily = this.services.some(s => s.dailyRequestCount === 0);
    
    if (allMarkedAsExceeded && anyWithZeroDaily) {
      console.log('🔄 All services marked as exceeded but some have 0 daily requests - force resetting...');
      this.forceResetAllServices();
      
      // Try again after force reset
      for (let i = 0; i < this.services.length; i++) {
        const service = this.services[i];
        if (this.isServiceAvailable(service)) {
          this.currentServiceIndex = i;
          console.log(`🔄 Using ${service.displayName} after force reset`);
          return service;
        }
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
   * Reset expired counters with proper time boundary logic
   */
  resetExpiredCounters() {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentDateString = now.toDateString();
    
    this.services.forEach(service => {
      // Reset minute counter on clock minute boundary (not elapsed time)
      if (currentMinute !== service.lastMinuteStart) {
        const oldCount = service.requestCount;
        service.requestCount = 0;
        service.lastMinuteStart = currentMinute;
        service.lastResetTime = now.getTime();
        
        if (oldCount > 0) {
          console.log(`🔄 ${service.displayName} minute boundary reset: ${oldCount} -> 0 (minute ${service.lastMinuteStart} -> ${currentMinute})`);
        }
      }
      
      // Reset daily counter - check if it's a new day (proper date comparison)
      if (currentDateString !== service.lastDailyReset) {
        const oldDaily = service.dailyRequestCount;
        console.log(`🔄 Daily reset for ${service.displayName} (new day: ${service.lastDailyReset} -> ${currentDateString})`);
        service.dailyRequestCount = 0;
        service.lastDailyReset = currentDateString;
        service.isQuotaExceeded = false; // Reset quota exceeded flag daily
        service.quotaExceededAt = null;
        service.consecutiveFailures = 0;
        
        if (oldDaily > 0) {
          console.log(`   Daily count reset: ${oldDaily} -> 0`);
        }
      }
    });
  }

  /**
   * Mark current service as quota exceeded with detailed tracking
   */
  markCurrentServiceAsExceeded(errorDetails = null) {
    if (this.currentServiceIndex < this.services.length) {
      const service = this.services[this.currentServiceIndex];
      service.isQuotaExceeded = true;
      service.quotaExceededAt = new Date().toISOString();
      service.consecutiveFailures++;
      
      if (errorDetails) {
        console.log(`❌ ${service.displayName} quota exceeded with error:`, {
          status: errorDetails.status,
          message: errorDetails.message?.substring(0, 100) + '...',
          dailyCount: service.dailyRequestCount,
          minuteCount: service.requestCount,
          consecutiveFailures: service.consecutiveFailures
        });
      } else {
        console.log(`❌ ${service.displayName} quota exceeded, marking as unavailable`);
      }
    }
  }

  /**
   * Check rate limit with realistic timing and Google API compliance
   */
  async checkRateLimit(service) {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentDateString = now.toDateString();
    
    // Reset minute counter on minute boundary
    if (currentMinute !== service.lastMinuteStart) {
      const oldCount = service.requestCount;
      service.requestCount = 0;
      service.lastMinuteStart = currentMinute;
      service.lastResetTime = now.getTime();
      
      if (oldCount > 0) {
        console.log(`🔄 ${service.displayName} minute boundary reset: ${oldCount} -> 0`);
      }
    }
    
    // Reset daily counter if new day
    if (currentDateString !== service.lastDailyReset) {
      console.log(`🔄 ${service.displayName} daily reset: ${service.dailyRequestCount} -> 0 (new day: ${service.lastDailyReset} -> ${currentDateString})`);
      service.dailyRequestCount = 0;
      service.lastDailyReset = currentDateString;
      service.isQuotaExceeded = false;
      service.quotaExceededAt = null;
      service.consecutiveFailures = 0;
    }
    
    // Check daily limit first (Google Free Tier: 50 requests per day)
    if (service.dailyRequestCount >= service.maxRequestsPerDay) {
      console.log(`🚫 ${service.displayName} daily limit reached (${service.dailyRequestCount}/${service.maxRequestsPerDay}), marking as unavailable`);
      service.isQuotaExceeded = true;
      service.quotaExceededAt = now.toISOString();
      return false;
    }
    
    // Check minute limit (Google: 15 requests per minute)
    if (service.requestCount >= service.maxRequestsPerMinute) {
      // Calculate wait time until next minute boundary
      const secondsUntilNextMinute = 60 - now.getSeconds();
      const waitTime = (secondsUntilNextMinute + 1) * 1000; // Add 1 second buffer
      
      console.log(`⏳ ${service.displayName} rate limit reached (${service.requestCount}/${service.maxRequestsPerMinute}), waiting ${Math.ceil(waitTime/1000)}s until next minute...`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Reset after waiting
      service.requestCount = 0;
      service.lastMinuteStart = new Date().getMinutes();
      service.lastResetTime = Date.now();
    }
    
    return true;
  }

  /**
   * Increment request counters with realistic tracking
   */
  incrementRequestCounters(service) {
    const oldRequestCount = service.requestCount;
    const oldDailyCount = service.dailyRequestCount;
    
    service.requestCount++;
    service.dailyRequestCount++;
    service.lastSuccessfulRequest = new Date().toISOString();
    service.consecutiveFailures = 0; // Reset failure count on success
    
    console.log(`📊 ${service.displayName} usage incremented: minute ${oldRequestCount} -> ${service.requestCount}/${service.maxRequestsPerMinute}, daily ${oldDailyCount} -> ${service.dailyRequestCount}/${service.maxRequestsPerDay}`);
    
    // Show realistic quota status
    const minuteRemaining = service.maxRequestsPerMinute - service.requestCount;
    const dailyRemaining = service.maxRequestsPerDay - service.dailyRequestCount;
    
    if (minuteRemaining <= 2) {
      console.log(`⚠️ ${service.displayName} approaching minute limit: ${minuteRemaining} requests remaining this minute`);
    }
    
    if (dailyRemaining <= 5) {
      console.log(`⚠️ ${service.displayName} approaching daily limit: ${dailyRemaining} requests remaining today`);
    }
    
    // Immediate verification with more realistic logging
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
        
        // Handle model-specific failures
        this.handleModelFailure(service, error);
        
        // Enhanced error tracking for quota issues
        if (error.message.includes('429') || error.status === 429 || error.message.includes('quota')) {
          console.log(`🚨 DETAILED 429 ERROR for ${service.displayName}:`);
          console.log(`   - Error message: ${error.message}`);
          console.log(`   - Error status: ${error.status}`);
          console.log(`   - Error code: ${error.code}`);
          console.log(`   - Full error:`, error);
          console.log(`   - Current daily count: ${service.dailyRequestCount}/${service.maxRequestsPerDay}`);
          console.log(`   - Current minute count: ${service.requestCount}/${service.maxRequestsPerMinute}`);
          
          // Extract actual quota info from Google's error if available
          if (error.errorDetails) {
            try {
              const quotaFailure = error.errorDetails.find(detail => detail['@type']?.includes('QuotaFailure'));
              if (quotaFailure?.violations) {
                console.log(`   - Google quota violations:`, quotaFailure.violations);
                const violation = quotaFailure.violations[0];
                if (violation?.quotaValue) {
                  console.log(`   - Google's actual quota limit: ${violation.quotaValue}`);
                  // Update our tracking to match Google's actual limits
                  if (violation.quotaValue === "50" && service.maxRequestsPerDay > 50) {
                    console.log(`   - Adjusting daily limit from ${service.maxRequestsPerDay} to 50 (Google Free Tier)`);
                    service.maxRequestsPerDay = 50;
                  }
                }
              }
            } catch (parseError) {
              console.log(`   - Could not parse error details:`, parseError.message);
            }
          }
          
          service.isQuotaExceeded = true;
          service.quotaExceededAt = Date.now();
          console.log(`🔄 Moving to next service immediately (no retries to conserve quota)`);
        } else {
          // Non-quota error, track consecutive failures
          service.consecutiveFailures = (service.consecutiveFailures || 0) + 1;
          console.log(`   - Non-quota error, consecutive failures: ${service.consecutiveFailures}`);
        }
        
        // Continue to next service immediately to preserve quota
        continue;
      }
    }

    // If we reach here, all AI services failed
    // No fallback - only AI is allowed
    throw new Error(`All AI services failed. ${lastError?.message?.includes('quota') ? 'API quota exceeded. Please try again later or upgrade your plan.' : `Last error: ${lastError?.message || 'Unknown error'}`}`);
  }

  /**
   * Handle model-specific failures and promote alternative models
   */
  handleModelFailure(service, error) {
    // Check if this is a model-specific error (overload, not available, etc.)
    const isModelSpecificError = error.message.includes('503') || 
                                error.message.includes('model') ||
                                error.message.includes('overload') ||
                                error.message.includes('unavailable');
    
    if (isModelSpecificError) {
      console.log(`🔄 Model-specific error detected for ${service.model}:`);
      console.log(`   - Error: ${error.message}`);
      console.log(`   - Status: ${error.status}`);
      
      // Find alternative services with different models for the same API key
      const alternativeServices = this.services.filter(s => 
        s.apiKeyIndex === service.apiKeyIndex && 
        s.model !== service.model &&
        !s.isQuotaExceeded &&
        !s.isTemporarilyDisabled
      );
      
      if (alternativeServices.length > 0) {
        console.log(`   - Found ${alternativeServices.length} alternative models for Key${service.apiKeyIndex}:`);
        alternativeServices.forEach(alt => {
          console.log(`     • ${alt.model} (${alt.displayName})`);
        });
        
        // Promote the first alternative model by moving it up in the queue
        const nextAlternative = alternativeServices[0];
        const nextIndex = this.services.indexOf(nextAlternative);
        if (nextIndex > this.currentServiceIndex) {
          console.log(`   - Promoting ${nextAlternative.model} as next candidate`);
          // Move the alternative service to be tried next
          this.services.splice(nextIndex, 1);
          this.services.splice(this.currentServiceIndex + 1, 0, nextAlternative);
        }
      } else {
        console.log(`   - No alternative models available for Key${service.apiKeyIndex}`);
      }
    }
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
   * Force reset all services - use when all are incorrectly marked as unavailable
   */
  forceResetAllServices() {
    console.log('🔄 Force resetting all AI services...');
    const now = new Date();
    const currentDateString = now.toDateString();
    const currentMinute = now.getMinutes();
    
    this.services.forEach((service, index) => {
      const wasExceeded = service.isQuotaExceeded;
      const lastExceeded = service.quotaExceededAt;
      
      // Reset quota exceeded flag if enough time has passed
      if (wasExceeded && lastExceeded) {
        const exceededTime = new Date(lastExceeded);
        const timeSinceExceeded = now - exceededTime;
        
        // If it's been more than 1 hour since quota exceeded, allow retry
        if (timeSinceExceeded > 60 * 60 * 1000) {
          console.log(`   - ${service.displayName}: Quota exceeded ${Math.round(timeSinceExceeded / (60 * 1000))} minutes ago, allowing retry`);
          service.isQuotaExceeded = false;
          service.quotaExceededAt = null;
        }
      }
      
      // Reset daily counters if new day
      if (currentDateString !== service.lastDailyReset) {
        console.log(`   - ${service.displayName}: New day detected, resetting daily counter`);
        service.dailyRequestCount = 0;
        service.lastDailyReset = currentDateString;
        service.isQuotaExceeded = false;
        service.quotaExceededAt = null;
        service.consecutiveFailures = 0;
      }
      
      // Reset minute counters on minute boundary
      if (currentMinute !== service.lastMinuteStart) {
        service.requestCount = 0;
        service.lastMinuteStart = currentMinute;
        service.lastResetTime = now.getTime();
      }
      
      // Reset service index to start from beginning
      this.currentServiceIndex = 0;
      
      console.log(`   - ${service.displayName}: Status after reset: ${service.isQuotaExceeded ? 'STILL EXCEEDED' : 'AVAILABLE'} (daily: ${service.dailyRequestCount}/${service.maxRequestsPerDay}, minute: ${service.requestCount}/${service.maxRequestsPerMinute})`);
    });
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
