/**
 * AI Service Manager - Multi-tier fallback system
 * Manages multiple AI service instances with different API keys and models
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIServiceManager {
  constructor() {
    this.services = [];
    this.currentServiceIndex = 0;
    this.initializeServices();
  }

  /**
   * Initialize AI services with different API keys and models
   * Priority: API Key 1 (latest models) -> API Key 2 (latest models) -> etc.
   * Models in order of capability: gemini-1.5-flash-latest -> gemini-1.5-flash -> gemini-1.0-pro
   */
  initializeServices() {
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY2,
      process.env.GEMINI_API_KEY3, // Future scalability
      process.env.GEMINI_API_KEY4  // Future scalability
    ].filter(key => key); // Remove undefined keys

    const models = [
      'gemini-1.5-flash-latest',  // Most powerful
      'gemini-1.5-flash'          // Stable fallback
      // Removed gemini-1.0-pro as it's deprecated in v1beta API
    ];

    let serviceId = 1;
    
    // For each API key, create services with each model (best to worst)
    apiKeys.forEach((apiKey, keyIndex) => {
      models.forEach((model, modelIndex) => {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const modelInstance = genAI.getGenerativeModel({ model });
          
          this.services.push({
            id: serviceId++,
            apiKeyIndex: keyIndex + 1,
            model: model,
            modelInstance: modelInstance,
            requestCount: 0,
            lastResetTime: Date.now(),
            maxRequestsPerMinute: 15,
            isQuotaExceeded: false,
            displayName: `AI Service ${keyIndex + 1} (${model})`
          });
        } catch (error) {
          console.log(`⚠️ Failed to initialize service with API key ${keyIndex + 1} and model ${model}:`, error.message);
        }
      });
    });

    if (this.services.length === 0) {
      throw new Error('No valid AI services could be initialized. Check your API keys.');
    }

    console.log(`✅ Initialized ${this.services.length} AI services`);
    this.services.forEach(service => {
      console.log(`   - ${service.displayName}`);
    });
  }

  /**
   * Get the next available service
   * @returns {Object|null} Available service or null if all are exhausted
   */
  getNextAvailableService() {
    // Check if current service is available
    if (this.currentServiceIndex < this.services.length) {
      const service = this.services[this.currentServiceIndex];
      if (!service.isQuotaExceeded) {
        return service;
      }
    }

    // Find next available service
    for (let i = this.currentServiceIndex + 1; i < this.services.length; i++) {
      const service = this.services[i];
      if (!service.isQuotaExceeded) {
        this.currentServiceIndex = i;
        console.log(`🔄 Switching to ${service.displayName}`);
        return service;
      }
    }

    // All services exhausted
    return null;
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
   * Check rate limit for a specific service
   */
  async checkRateLimit(service) {
    const now = Date.now();
    const timeSinceReset = now - service.lastResetTime;
    
    // Reset counter every minute
    if (timeSinceReset >= 60000) {
      service.requestCount = 0;
      service.lastResetTime = now;
    }
    
    service.requestCount++;
    
    if (service.requestCount > service.maxRequestsPerMinute) {
      const waitTime = Math.max(5000, 60000 - timeSinceReset + 1000);
      console.log(`⏳ ${service.displayName} rate limit reached, waiting ${Math.ceil(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      service.requestCount = 1;
      service.lastResetTime = Date.now();
    }
  }

  /**
   * Generate content with automatic fallback between services
   * @param {string} prompt - The prompt to send to AI
   * @param {boolean} isGeneration - Whether this is generation (true) or extraction (false)
   * @returns {Promise<{content: string, serviceUsed: string}>} - AI response and service info
   */
  async generateContent(prompt, isGeneration = false) {
    const maxServiceAttempts = this.services.length;
    let lastError;

    for (let serviceAttempt = 0; serviceAttempt < maxServiceAttempts; serviceAttempt++) {
      const service = this.getNextAvailableService();
      
      if (!service) {
        console.log('❌ All AI services exhausted');
        break;
      }

      console.log(`🤖 Using ${service.displayName} (attempt ${serviceAttempt + 1}/${maxServiceAttempts})`);

      // Try current service with retries
      const maxRetries = 2; // Reduced retries per service to move faster to next service
      
      for (let retry = 1; retry <= maxRetries; retry++) {
        try {
          await this.checkRateLimit(service);
          
          const result = await service.modelInstance.generateContent(prompt);
          const response = await result.response;
          const content = response.text();
          
          console.log(`✅ Success with ${service.displayName}`);
          return {
            content,
            serviceUsed: service.displayName
          };
          
        } catch (error) {
          lastError = error;
          console.log(`⚠️ ${service.displayName} attempt ${retry}/${maxRetries} failed:`, error.message);
          
          // Check if it's a quota error
          if (error.message.includes('quota') || error.message.includes('429')) {
            console.log(`📊 ${service.displayName} quota exceeded, moving to next service`);
            this.markCurrentServiceAsExceeded();
            break; // Move to next service immediately
          }
          
          // For other errors, wait and retry
          if (retry < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }

    // If we reach here, all AI services failed
    if (isGeneration) {
      // For generation tasks, we must use AI - throw error
      throw new Error(`All AI services failed. Last error: ${lastError?.message || 'Unknown error'}`);
    } else {
      // For extraction tasks, we can use fallback parser
      console.log('🔄 All AI services failed, falling back to systematic parser');
      return {
        content: null, // Indicates fallback needed
        serviceUsed: 'Systematic Fallback Parser'
      };
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
    return this.services.map(service => ({
      displayName: service.displayName,
      isQuotaExceeded: service.isQuotaExceeded,
      requestCount: service.requestCount,
      isCurrent: this.services.indexOf(service) === this.currentServiceIndex
    }));
  }
}

module.exports = AIServiceManager;
