/**
 * AI Service Manager - Multi-tier fallback system with Hugging Face integration
 * Manages multiple AI service instances with different API keys and models
 * Supports both Gemini and Hugging Face APIs with provider toggle
 * Singleton pattern to ensure quota tracking across all services
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { HfInference } = require('@huggingface/inference');

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
    
    // Provider configuration
    this.preferredProvider = process.env.AI_PROVIDER_PREFERENCE || 'gemini'; // 'gemini' or 'huggingface'
    this.enableProviderToggle = process.env.ENABLE_AI_PROVIDER_TOGGLE === 'true';
    
    this.initializeServices();
    
    // Store the instance for singleton pattern
    AIServiceManager.instance = this;
  }

  /**
   * Initialize AI services with both Gemini and Hugging Face support
   * Uses consistent models across providers for optimal performance
   */
  initializeServices() {
    // Initialize based on preference and availability
    const geminiServices = this.initializeGeminiServices();
    const huggingFaceServices = this.initializeHuggingFaceServices();
    
    // Combine services based on preference
    if (this.preferredProvider === 'huggingface' && huggingFaceServices.length > 0) {
      this.services = [...huggingFaceServices, ...geminiServices];
      console.log(`🤗 Preferred provider: Hugging Face (${huggingFaceServices.length} services)`);
    } else if (geminiServices.length > 0) {
      this.services = [...geminiServices, ...huggingFaceServices];
      console.log(`💎 Preferred provider: Gemini (${geminiServices.length} services)`);
    } else {
      this.services = [...huggingFaceServices];
      console.log(`🤗 Fallback to Hugging Face only (${huggingFaceServices.length} services)`);
    }

    if (this.services.length === 0) {
      throw new Error('No valid AI services could be initialized. Check your API keys.');
    }

    // Display service configuration
    this.displayServiceSummary();
  }

  /**
   * Initialize Gemini services with existing configuration
   */
  initializeGeminiServices() {
    const services = [];
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY2,
      process.env.GEMINI_API_KEY3,
      process.env.GEMINI_API_KEY4,
      process.env.GEMINI_API_KEY5,
      process.env.GEMINI_API_KEY6
    ].filter(key => key);

    // Use consistent model for better performance
    const primaryModel = 'gemini-1.5-flash-latest';
    const fallbackModels = ['gemini-1.5-flash', 'gemini-1.5-pro-latest'];

    let serviceId = 1;
    
    apiKeys.forEach((apiKey, keyIndex) => {
      // Primary model for each key
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({ model: primaryModel });
        
        services.push({
          id: serviceId++,
          provider: 'gemini',
          apiKeyIndex: keyIndex + 1,
          model: primaryModel,
          modelInstance: modelInstance,
          requestCount: 0,
          dailyRequestCount: 0,
          lastResetTime: Date.now(),
          lastDailyReset: new Date().toDateString(),
          lastMinuteStart: new Date().getMinutes(),
          maxRequestsPerMinute: 15, // Google's limit: 15 RPM
          maxRequestsPerDay: 50, // Google's FREE tier limit: 50 RPD
          isQuotaExceeded: false,
          isTemporarilyDisabled: false,
          quotaExceededAt: null,
          lastSuccessfulRequest: null,
          consecutiveFailures: 0,
          displayName: `Gemini Service ${serviceId-1} (Key${keyIndex + 1}-${primaryModel})`
        });
        
        console.log(`✅ Initialized Gemini Service ${serviceId-1} with API key ${keyIndex + 1}`);
      } catch (error) {
        console.log(`⚠️ Failed to initialize Gemini service with API key ${keyIndex + 1}:`, error.message);
      }
      
      // Add fallback models for resilience (only first 2 keys to avoid overcrowding)
      if (keyIndex < 2) {
        fallbackModels.forEach(model => {
          try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelInstance = genAI.getGenerativeModel({ model: model });
            
            services.push({
              id: serviceId++,
              provider: 'gemini',
              apiKeyIndex: keyIndex + 1,
              model: model,
              modelInstance: modelInstance,
              requestCount: 0,
              dailyRequestCount: 0,
              lastResetTime: Date.now(),
              lastDailyReset: new Date().toDateString(),
              lastMinuteStart: new Date().getMinutes(),
              maxRequestsPerMinute: 15,
              maxRequestsPerDay: 50,
              isQuotaExceeded: false,
              isTemporarilyDisabled: false,
              quotaExceededAt: null,
              lastSuccessfulRequest: null,
              consecutiveFailures: 0,
              displayName: `Gemini Service ${serviceId-1} (Key${keyIndex + 1}-${model})`
            });
            
            console.log(`✅ Initialized Gemini fallback service with ${model}`);
          } catch (error) {
            console.log(`⚠️ Failed to initialize Gemini fallback service:`, error.message);
          }
        });
      }
    });

    return services;
  }

  /**
   * Initialize Hugging Face services with free tier models
   */
  initializeHuggingFaceServices() {
    const services = [];
    const hfToken = process.env.HUGGING_FACE_AI_TOKEN;
    
    if (!hfToken) {
      console.log('⚠️ No Hugging Face API token found, skipping HF services');
      return services;
    }

    // Best free models for different tasks - using consistent model for performance
    const primaryModel = 'mistralai/Mistral-7B-Instruct-v0.1'; // Primary model for all tasks
    const fallbackModels = [
      'microsoft/DialoGPT-medium',
      'google/flan-t5-large',
      'meta-llama/Llama-2-7b-chat-hf'
    ];

    let serviceId = 1000; // Start HF services from 1000 to distinguish

    try {
      // Primary Hugging Face service with Mistral-7B
      const hfInference = new HfInference(hfToken);
      
      services.push({
        id: serviceId++,
        provider: 'huggingface',
        apiKeyIndex: 1,
        model: primaryModel,
        modelInstance: hfInference,
        hfToken: hfToken,
        requestCount: 0,
        dailyRequestCount: 0,
        lastResetTime: Date.now(),
        lastDailyReset: new Date().toDateString(),
        lastMinuteStart: new Date().getMinutes(),
        maxRequestsPerMinute: 30, // HF free tier: more generous rate limits
        maxRequestsPerDay: 1000, // HF free tier: much higher daily limit
        isQuotaExceeded: false,
        isTemporarilyDisabled: false,
        quotaExceededAt: null,
        lastSuccessfulRequest: null,
        consecutiveFailures: 0,
        displayName: `Hugging Face Service ${serviceId-1} (${primaryModel})`
      });
      
      console.log(`🤗 Initialized primary Hugging Face service with ${primaryModel}`);
      
      // Add fallback models for resilience
      fallbackModels.forEach(model => {
        try {
          services.push({
            id: serviceId++,
            provider: 'huggingface',
            apiKeyIndex: 1,
            model: model,
            modelInstance: hfInference,
            hfToken: hfToken,
            requestCount: 0,
            dailyRequestCount: 0,
            lastResetTime: Date.now(),
            lastDailyReset: new Date().toDateString(),
            lastMinuteStart: new Date().getMinutes(),
            maxRequestsPerMinute: 30,
            maxRequestsPerDay: 1000,
            isQuotaExceeded: false,
            isTemporarilyDisabled: false,
            quotaExceededAt: null,
            lastSuccessfulRequest: null,
            consecutiveFailures: 0,
            displayName: `Hugging Face Service ${serviceId-1} (${model.split('/').pop()})`
          });
          
          console.log(`🤗 Initialized HF fallback service with ${model}`);
        } catch (error) {
          console.log(`⚠️ Failed to initialize HF fallback service with ${model}:`, error.message);
        }
      });
      
    } catch (error) {
      console.log(`⚠️ Failed to initialize Hugging Face services:`, error.message);
    }

    return services;
  }

  /**
   * Display comprehensive service summary
   */
  displayServiceSummary() {
    const geminiCount = this.services.filter(s => s.provider === 'gemini').length;
    const hfCount = this.services.filter(s => s.provider === 'huggingface').length;
    const totalDailyCapacity = this.services.reduce((sum, service) => sum + service.maxRequestsPerDay, 0);
    
    console.log(`\n🤖 AI SERVICE CONFIGURATION SUMMARY`);
    console.log(`=====================================`);
    console.log(`✅ Total Services: ${this.services.length}`);
    console.log(`💎 Gemini Services: ${geminiCount}`);
    console.log(`🤗 Hugging Face Services: ${hfCount}`);
    console.log(`🎯 Preferred Provider: ${this.preferredProvider.toUpperCase()}`);
    console.log(`🔄 Provider Toggle: ${this.enableProviderToggle ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📊 Total Daily Capacity: ${totalDailyCapacity} requests`);
    console.log(`\n📋 INDIVIDUAL SERVICES:`);
    
    this.services.forEach((service, index) => {
      const isCurrent = index === this.currentServiceIndex;
      console.log(`${isCurrent ? '👉' : '   '} ${service.displayName}:`);
      console.log(`     • Provider: ${service.provider.toUpperCase()}`);
      console.log(`     • Model: ${service.model}`);
      console.log(`     • Daily Limit: ${service.maxRequestsPerDay} requests`);
      console.log(`     • Rate Limit: ${service.maxRequestsPerMinute} requests/min`);
      console.log(`     • Current Usage: ${service.dailyRequestCount}/${service.maxRequestsPerDay} daily`);
      console.log(`     • Status: ${service.isQuotaExceeded ? '❌ EXCEEDED' : '✅ AVAILABLE'}`);
    });
    
    console.log(`\n🎯 PERFORMANCE OPTIMIZATION:`);
    console.log(`• Using consistent primary model across providers for reduced latency`);
    console.log(`• Fallback models available for resilience`);
    console.log(`• Provider preference: ${this.preferredProvider}`);
    console.log(`=====================================\n`);
  }

  /**
   * Toggle between AI providers if enabled
   */
  toggleProvider() {
    if (!this.enableProviderToggle) {
      console.log('❌ Provider toggle is disabled in configuration');
      return false;
    }

    const currentProvider = this.services[this.currentServiceIndex]?.provider;
    const targetProvider = currentProvider === 'gemini' ? 'huggingface' : 'gemini';
    
    // Find next available service with target provider
    const targetServices = this.services.filter(s => 
      s.provider === targetProvider && 
      this.isServiceAvailable(s)
    );

    if (targetServices.length === 0) {
      console.log(`❌ No available ${targetProvider} services found`);
      return false;
    }

    // Switch to first available service of target provider
    const targetServiceIndex = this.services.findIndex(s => s.id === targetServices[0].id);
    this.currentServiceIndex = targetServiceIndex;
    
    console.log(`🔄 Switched from ${currentProvider} to ${targetProvider}`);
    console.log(`👉 Now using: ${this.services[this.currentServiceIndex].displayName}`);
    
    return true;
  }

  /**
   * Get current provider information
   */
  getCurrentProviderInfo() {
    const currentService = this.services[this.currentServiceIndex];
    if (!currentService) {
      return {
        error: 'No current service available',
        provider: 'none',
        model: 'none'
      };
    }

    const providerServices = this.services.filter(s => s.provider === currentService.provider);
    const availableInProvider = providerServices.filter(s => this.isServiceAvailable(s)).length;

    return {
      provider: currentService.provider,
      model: currentService.model,
      displayName: currentService.displayName,
      serviceId: currentService.id,
      isToggleEnabled: this.enableProviderToggle,
      availableProviders: [...new Set(this.services.map(s => s.provider))],
      dailyUsage: `${currentService.dailyRequestCount}/${currentService.maxRequestsPerDay}`,
      minuteUsage: `${currentService.requestCount}/${currentService.maxRequestsPerMinute}`,
      usagePercentage: currentService.maxRequestsPerDay > 0 ? 
        Math.round((currentService.dailyRequestCount / currentService.maxRequestsPerDay) * 100) : 0,
      isAvailable: this.isServiceAvailable(currentService),
      providerStats: {
        totalServices: providerServices.length,
        availableServices: availableInProvider,
        provider: currentService.provider
      },
      lastUsed: currentService.lastSuccessfulRequest || 'Never',
      consecutiveFailures: currentService.consecutiveFailures || 0
    };
  }

  /**
   * Get comprehensive service status for quota monitoring
   */
  getServiceStatus() {
    return this.services.map((service, index) => ({
      id: service.id,
      displayName: service.displayName,
      provider: service.provider,
      model: service.model,
      apiKeyIndex: service.apiKeyIndex,
      requestCount: service.requestCount || 0,
      dailyRequestCount: service.dailyRequestCount || 0,
      maxRequestsPerMinute: service.maxRequestsPerMinute || 0,
      maxRequestsPerDay: service.maxRequestsPerDay || 0,
      isQuotaExceeded: service.isQuotaExceeded || false,
      isTemporarilyDisabled: service.isTemporarilyDisabled || false,
      consecutiveFailures: service.consecutiveFailures || 0,
      lastSuccessfulRequest: service.lastSuccessfulRequest,
      quotaExceededAt: service.quotaExceededAt,
      lastResetTime: service.lastResetTime,
      lastDailyReset: service.lastDailyReset,
      isCurrent: index === this.currentServiceIndex,
      isAvailable: this.isServiceAvailable(service),
      usagePercentage: service.maxRequestsPerDay > 0 ? 
        Math.round((service.dailyRequestCount / service.maxRequestsPerDay) * 100) : 0
    }));
  }

  /**
   * Get system-wide AI service statistics
   */
  getSystemStats() {
    const providers = ['gemini', 'huggingface'];
    const stats = {
      totalServices: this.services.length,
      currentProvider: this.services[this.currentServiceIndex]?.provider || 'none',
      preferredProvider: this.preferredProvider,
      toggleEnabled: this.enableProviderToggle,
      providers: {}
    };

    providers.forEach(provider => {
      const providerServices = this.services.filter(s => s.provider === provider);
      if (providerServices.length > 0) {
        const totalDaily = providerServices.reduce((sum, s) => sum + (s.dailyRequestCount || 0), 0);
        const totalDailyLimit = providerServices.reduce((sum, s) => sum + (s.maxRequestsPerDay || 0), 0);
        const available = providerServices.filter(s => this.isServiceAvailable(s)).length;
        
        stats.providers[provider] = {
          totalServices: providerServices.length,
          availableServices: available,
          dailyUsage: totalDaily,
          dailyLimit: totalDailyLimit,
          usagePercentage: totalDailyLimit > 0 ? Math.round((totalDaily / totalDailyLimit) * 100) : 0,
          status: available > 0 ? 'available' : 'exhausted',
          primaryModel: providerServices[0]?.model || 'unknown'
        };
      }
    });

    return stats;
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

    // Check consecutive failures (disable after 3 failures)
    if (service.consecutiveFailures >= 3) {
      console.log(`📊 ${service.displayName} too many consecutive failures (${service.consecutiveFailures})`);
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
   * Execute the actual AI request with multi-provider support
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

      console.log(`🤖 Using ${service.displayName} (${service.provider.toUpperCase()}) (service ${serviceAttempt + 1}/${maxServiceAttempts})`);

      // Only ONE attempt per service to avoid wasting quota
      try {
        // Check rate limit and daily limit first (without incrementing)
        const canProceed = await this.checkRateLimit(service);
        if (!canProceed) {
          console.log(`🚫 ${service.displayName} daily limit reached, moving to next service`);
          continue; // Move to next service immediately
        }
        
        console.log(`🔄 Making single request to ${service.displayName}...`);
        
        let content;
        if (service.provider === 'gemini') {
          // Gemini API call
          const result = await service.modelInstance.generateContent(prompt);
          const response = await result.response;
          content = response.text();
        } else if (service.provider === 'huggingface') {
          // Hugging Face API call
          content = await this.executeHuggingFaceRequest(service, prompt);
        } else {
          throw new Error(`Unsupported provider: ${service.provider}`);
        }
        
        // Only increment counters AFTER successful API call
        this.incrementRequestCounters(service);
        
        console.log(`✅ Success with ${service.displayName} (${service.provider.toUpperCase()}) on first attempt`);
        
        // Cache the result (only for extraction)
        if (!isGeneration) {
          this.cacheResult(cacheKey, content, service.displayName);
        }
        
        return {
          content,
          serviceUsed: service.displayName,
          provider: service.provider,
          model: service.model
        };
        
      } catch (error) {
        lastError = error;
        console.log(`❌ ${service.displayName} (${service.provider.toUpperCase()}) failed:`, error.message);
        
        // Handle provider-specific failures
        if (service.provider === 'gemini') {
          this.handleGeminiFailure(service, error);
        } else if (service.provider === 'huggingface') {
          this.handleHuggingFaceFailure(service, error);
        }
        
        // Continue to next service immediately to preserve quota
        continue;
      }
    }

    // If we reach here, all AI services failed
    // No fallback - only AI is allowed
    const errorMessage = lastError?.message?.includes('quota') ? 
      'API quota exceeded across all providers. Please try again later or upgrade your plan.' : 
      `All AI services failed. Last error: ${lastError?.message || 'Unknown error'}`;
    
    throw new Error(errorMessage);
  }

  /**
   * Execute Hugging Face API request with proper formatting
   */
  async executeHuggingFaceRequest(service, prompt) {
    try {
      // Format prompt for different model types
      let formattedPrompt = prompt;
      
      if (service.model.includes('Mistral') || service.model.includes('Llama')) {
        // Chat format for instruction models
        formattedPrompt = `<s>[INST] ${prompt} [/INST]`;
      } else if (service.model.includes('flan-t5')) {
        // Simple prompt format for T5
        formattedPrompt = prompt;
      }

      // Use textGeneration for most models
      const response = await service.modelInstance.textGeneration({
        model: service.model,
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.3,
          do_sample: true,
          top_p: 0.9,
          return_full_text: false
        }
      });
      
      // Extract generated text
      let content = '';
      if (typeof response === 'string') {
        content = response;
      } else if (response.generated_text) {
        content = response.generated_text;
      } else if (Array.isArray(response) && response[0]?.generated_text) {
        content = response[0].generated_text;
      } else {
        throw new Error('Unexpected response format from Hugging Face');
      }
      
      // Clean up the response
      content = content.replace(formattedPrompt, '').trim();
      
      return content;
      
    } catch (error) {
      // Enhance error message for debugging
      if (error.message.includes('not available')) {
        throw new Error(`Model ${service.model} is not available on Hugging Face`);
      } else if (error.message.includes('rate limit')) {
        throw new Error(`Hugging Face rate limit exceeded for ${service.model}`);
      } else {
        throw new Error(`Hugging Face API error: ${error.message}`);
      }
    }
  }

  /**
   * Handle Gemini-specific failures
   */
  handleGeminiFailure(service, error) {
    // Enhanced error tracking for quota issues
    if (error.message.includes('429') || error.status === 429 || error.message.includes('quota')) {
      console.log(`🚨 GEMINI QUOTA ERROR for ${service.displayName}:`);
      console.log(`   - Error message: ${error.message}`);
      console.log(`   - Error status: ${error.status}`);
      console.log(`   - Current daily count: ${service.dailyRequestCount}/${service.maxRequestsPerDay}`);
      console.log(`   - Current minute count: ${service.requestCount}/${service.maxRequestsPerMinute}`);
      
      service.isQuotaExceeded = true;
      service.quotaExceededAt = Date.now();
    } else {
      // Non-quota error, track consecutive failures
      service.consecutiveFailures = (service.consecutiveFailures || 0) + 1;
      console.log(`   - Non-quota error, consecutive failures: ${service.consecutiveFailures}`);
    }
  }

  /**
   * Handle Hugging Face-specific failures
   */
  handleHuggingFaceFailure(service, error) {
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      console.log(`🚨 HUGGING FACE RATE LIMIT for ${service.displayName}:`);
      console.log(`   - Error message: ${error.message}`);
      console.log(`   - Current daily count: ${service.dailyRequestCount}/${service.maxRequestsPerDay}`);
      console.log(`   - Current minute count: ${service.requestCount}/${service.maxRequestsPerMinute}`);
      
      service.isQuotaExceeded = true;
      service.quotaExceededAt = Date.now();
    } else if (error.message.includes('not available') || error.message.includes('loading')) {
      console.log(`🚨 HUGGING FACE MODEL UNAVAILABLE: ${service.model}`);
      service.isTemporarilyDisabled = true;
      // Re-enable after 5 minutes
      setTimeout(() => {
        service.isTemporarilyDisabled = false;
        console.log(`🔄 Re-enabled ${service.displayName} after model loading timeout`);
      }, 5 * 60 * 1000);
    } else {
      // Other errors
      service.consecutiveFailures = (service.consecutiveFailures || 0) + 1;
      console.log(`   - HF error, consecutive failures: ${service.consecutiveFailures}`);
    }
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
