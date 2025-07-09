/**
 * Puter Service Manager - Frontend-Backend Integration
 * Manages communication between frontend Puter.js and backend processing
 * Handles quota tracking and service coordination for Puter AI models
 */

class PuterServiceManager {
  constructor() {
    // Singleton pattern - return existing instance if already created
    if (PuterServiceManager.instance) {
      console.log('🔄 Returning existing PuterServiceManager instance');
      return PuterServiceManager.instance;
    }
    
    console.log('🆕 Creating new PuterServiceManager instance');
    this.requestCache = new Map(); // Cache to avoid duplicate requests
    this.pendingRequests = new Map(); // Track pending requests to avoid duplicates
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.processingHistory = []; // Track processing history
    this.initializeService();
    
    // Store the instance for singleton pattern
    PuterServiceManager.instance = this;
  }

  /**
   * Initialize Puter service configuration
   */
  initializeService() {
    this.serviceConfig = {
      maxConcurrentRequests: 5,
      timeout: 30000, // 30 seconds
      retryAttempts: 2,
      supportedModels: [
        'gpt-4o-mini',
        'claude-3-5-haiku-20241022',
        'gemini-1.5-flash',
        'meta-llama/llama-3.2-3b-instruct'
      ],
      defaultModel: 'gpt-4o-mini'
    };
    
    console.log('✅ Puter Service Manager initialized');
    console.log('🎯 Supported models:', this.serviceConfig.supportedModels.join(', '));
  }

  /**
   * Validate Puter data from frontend
   */
  validatePuterData(puterData) {
    if (!puterData) {
      throw new Error('No Puter data provided');
    }

    // Check if we have either originalResponse (raw) or processed content
    const hasOriginalResponse = puterData.originalResponse;
    const hasProcessedContent = puterData.content || puterData.response || puterData.data;
    
    if (!hasOriginalResponse && !hasProcessedContent) {
      throw new Error('Missing required fields: originalResponse or processed content');
    }

    // If we have processed content but no originalResponse, create it
    if (!hasOriginalResponse && hasProcessedContent) {
      const content = puterData.content || puterData.response || puterData.data;
      puterData.originalResponse = typeof content === 'string' ? content : JSON.stringify(content);
    }

    // Ensure we have a model (use a default if not provided)
    if (!puterData.model) {
      puterData.model = 'gpt-4o-mini'; // Default model from frontend logs
      console.log(`🔧 Using default model: ${puterData.model}`);
    }

    if (!this.serviceConfig.supportedModels.includes(puterData.model)) {
      console.warn(`⚠️ Unsupported model: ${puterData.model}, proceeding anyway`);
    }

    return true;
  }

  /**
   * Process request with caching and deduplication
   */
  async processWithCache(requestKey, processor) {
    // Check cache first
    if (this.requestCache.has(requestKey)) {
      const cached = this.requestCache.get(requestKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📋 Returning cached result for:', requestKey);
        return cached.data;
      }
    }

    // Check if request is already pending
    if (this.pendingRequests.has(requestKey)) {
      console.log('⏳ Waiting for pending request:', requestKey);
      return await this.pendingRequests.get(requestKey);
    }

    // Create new request
    const requestPromise = this.executeProcessor(processor);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache the result
      this.requestCache.set(requestKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * Execute processor with error handling
   */
  async executeProcessor(processor) {
    try {
      return await processor();
    } catch (error) {
      console.error('❌ Puter processor error:', error);
      throw error;
    }
  }

  /**
   * Log processing activity
   */
  logProcessing(userId, operation, model, timestamp, success = true) {
    const logEntry = {
      userId,
      operation,
      model,
      timestamp: timestamp || new Date().toISOString(),
      success,
      processingTime: Date.now()
    };

    this.processingHistory.push(logEntry);
    
    // Keep only last 100 entries
    if (this.processingHistory.length > 100) {
      this.processingHistory = this.processingHistory.slice(-100);
    }

    console.log(`📝 Logged Puter processing: ${userId} - ${operation} - ${model} - ${success ? '✅' : '❌'}`);
  }

  /**
   * Get service statistics
   */
  getServiceStats() {
    const recentLogs = this.processingHistory.slice(-50);
    const successRate = recentLogs.length > 0 
      ? (recentLogs.filter(log => log.success).length / recentLogs.length) * 100 
      : 0;

    return {
      totalRequests: this.processingHistory.length,
      recentRequests: recentLogs.length,
      successRate: Math.round(successRate),
      cacheSize: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      supportedModels: this.serviceConfig.supportedModels
    };
  }

  /**
   * Clear cache and reset counters
   */
  clearCache() {
    this.requestCache.clear();
    this.pendingRequests.clear();
    console.log('🧹 Puter service cache cleared');
  }
}

module.exports = PuterServiceManager;
