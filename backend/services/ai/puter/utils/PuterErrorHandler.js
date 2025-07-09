/**
 * Puter Error Handler
 * Advanced error handling and recovery system for Puter services
 * Mirrors the error handling patterns from the tailoring system
 */

class PuterErrorHandler {
  constructor() {
    this.name = 'Puter Error Handler';
    this.version = '1.0.0';
    
    // Error categories
    this.errorCategories = {
      AUTHENTICATION: 'authentication',
      VALIDATION: 'validation',
      PARSING: 'parsing',
      PROCESSING: 'processing',
      NETWORK: 'network',
      TIMEOUT: 'timeout',
      MEMORY: 'memory',
      SYSTEM: 'system',
      UNKNOWN: 'unknown'
    };
    
    // Error severity levels
    this.severityLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
    
    // Recovery strategies
    this.recoveryStrategies = {
      RETRY: 'retry',
      FALLBACK: 'fallback',
      GRACEFUL_DEGRADATION: 'graceful_degradation',
      CIRCUIT_BREAKER: 'circuit_breaker',
      FAIL_FAST: 'fail_fast'
    };
    
    // Error statistics
    this.errorStats = {
      totalErrors: 0,
      errorsByCategory: {},
      errorsBySeverity: {},
      recoveryAttempts: 0,
      successfulRecoveries: 0
    };
    
    // Circuit breaker state
    this.circuitBreaker = {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failures: 0,
      lastFailureTime: null,
      timeout: 60000, // 1 minute
      threshold: 5 // 5 failures to open circuit
    };
    
    console.log('🚨 Puter Error Handler initialized');
  }

  /**
   * Handle error with appropriate recovery strategy
   * @param {Error} error - The error to handle
   * @param {string} context - The context where error occurred
   * @param {Object} options - Handling options
   * @returns {Promise<Object>} - Error handling result
   */
  async handleError(error, context, options = {}) {
    const startTime = Date.now();
    
    try {
      // Classify error
      const errorInfo = this.classifyError(error, context);
      
      // Log error
      this.logError(error, errorInfo, context);
      
      // Update statistics
      this.updateErrorStats(errorInfo);
      
      // Check circuit breaker
      if (this.shouldTriggerCircuitBreaker(errorInfo)) {
        this.openCircuitBreaker();
        throw this.createCircuitBreakerError();
      }
      
      // Determine recovery strategy
      const recoveryStrategy = this.determineRecoveryStrategy(errorInfo, options);
      
      // Attempt recovery
      const recoveryResult = await this.attemptRecovery(
        error,
        errorInfo,
        recoveryStrategy,
        options
      );
      
      // Track recovery metrics
      this.trackRecoveryMetrics(recoveryStrategy, recoveryResult.success, startTime);
      
      return recoveryResult;
      
    } catch (handlingError) {
      console.error('❌ Error handling failed:', handlingError);
      
      // Create fail-safe error response
      return this.createFailSafeResponse(error, context, handlingError);
    }
  }

  /**
   * Classify error by category and severity
   * @param {Error} error - The error to classify
   * @param {string} context - Error context
   * @returns {Object} - Error classification
   */
  classifyError(error, context) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      category: this.errorCategories.UNKNOWN,
      severity: this.severityLevels.MEDIUM
    };
    
    // Classify by error message/type
    if (error.message.includes('authentication') || error.message.includes('auth')) {
      errorInfo.category = this.errorCategories.AUTHENTICATION;
      errorInfo.severity = this.severityLevels.HIGH;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      errorInfo.category = this.errorCategories.VALIDATION;
      errorInfo.severity = this.severityLevels.MEDIUM;
    } else if (error.message.includes('parse') || error.message.includes('JSON')) {
      errorInfo.category = this.errorCategories.PARSING;
      errorInfo.severity = this.severityLevels.MEDIUM;
    } else if (error.message.includes('timeout')) {
      errorInfo.category = this.errorCategories.TIMEOUT;
      errorInfo.severity = this.severityLevels.HIGH;
    } else if (error.message.includes('memory') || error.message.includes('heap')) {
      errorInfo.category = this.errorCategories.MEMORY;
      errorInfo.severity = this.severityLevels.CRITICAL;
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      errorInfo.category = this.errorCategories.NETWORK;
      errorInfo.severity = this.severityLevels.HIGH;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorInfo.category = this.errorCategories.NETWORK;
      errorInfo.severity = this.severityLevels.HIGH;
    } else if (context.includes('processing')) {
      errorInfo.category = this.errorCategories.PROCESSING;
      errorInfo.severity = this.severityLevels.MEDIUM;
    }
    
    return errorInfo;
  }

  /**
   * Determine appropriate recovery strategy
   * @param {Object} errorInfo - Error classification
   * @param {Object} options - Recovery options
   * @returns {string} - Recovery strategy
   */
  determineRecoveryStrategy(errorInfo, options = {}) {
    const { category, severity } = errorInfo;
    
    // Force specific strategy if provided
    if (options.forceStrategy) {
      return options.forceStrategy;
    }
    
    // Strategy based on error category and severity
    switch (category) {
      case this.errorCategories.AUTHENTICATION:
        return this.recoveryStrategies.RETRY;
      
      case this.errorCategories.VALIDATION:
        return this.recoveryStrategies.GRACEFUL_DEGRADATION;
      
      case this.errorCategories.PARSING:
        return this.recoveryStrategies.FALLBACK;
      
      case this.errorCategories.TIMEOUT:
        return this.recoveryStrategies.RETRY;
      
      case this.errorCategories.MEMORY:
        return this.recoveryStrategies.CIRCUIT_BREAKER;
      
      case this.errorCategories.NETWORK:
        return this.recoveryStrategies.RETRY;
      
      case this.errorCategories.PROCESSING:
        return severity === this.severityLevels.CRITICAL ? 
          this.recoveryStrategies.CIRCUIT_BREAKER : 
          this.recoveryStrategies.FALLBACK;
      
      default:
        return this.recoveryStrategies.GRACEFUL_DEGRADATION;
    }
  }

  /**
   * Attempt error recovery
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Error classification
   * @param {string} strategy - Recovery strategy
   * @param {Object} options - Recovery options
   * @returns {Promise<Object>} - Recovery result
   */
  async attemptRecovery(error, errorInfo, strategy, options = {}) {
    this.errorStats.recoveryAttempts++;
    
    console.log(`🔄 Attempting recovery using strategy: ${strategy}`);
    
    try {
      let recoveryResult;
      
      switch (strategy) {
        case this.recoveryStrategies.RETRY:
          recoveryResult = await this.retryOperation(error, errorInfo, options);
          break;
        
        case this.recoveryStrategies.FALLBACK:
          recoveryResult = await this.fallbackOperation(error, errorInfo, options);
          break;
        
        case this.recoveryStrategies.GRACEFUL_DEGRADATION:
          recoveryResult = await this.gracefulDegradation(error, errorInfo, options);
          break;
        
        case this.recoveryStrategies.CIRCUIT_BREAKER:
          recoveryResult = await this.circuitBreakerRecovery(error, errorInfo, options);
          break;
        
        case this.recoveryStrategies.FAIL_FAST:
          recoveryResult = this.failFast(error, errorInfo, options);
          break;
        
        default:
          recoveryResult = await this.gracefulDegradation(error, errorInfo, options);
      }
      
      if (recoveryResult.success) {
        this.errorStats.successfulRecoveries++;
        console.log(`✅ Recovery successful using strategy: ${strategy}`);
      }
      
      return recoveryResult;
      
    } catch (recoveryError) {
      console.error(`❌ Recovery failed using strategy: ${strategy}`, recoveryError);
      
      return {
        success: false,
        strategy,
        error: recoveryError,
        fallbackData: this.createFallbackData(errorInfo)
      };
    }
  }

  /**
   * Retry operation with exponential backoff
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Error classification
   * @param {Object} options - Retry options
   * @returns {Promise<Object>} - Retry result
   */
  async retryOperation(error, errorInfo, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const baseDelay = options.baseDelay || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        
        // Attempt to re-execute the operation
        if (options.retryFunction) {
          const result = await options.retryFunction();
          
          return {
            success: true,
            strategy: this.recoveryStrategies.RETRY,
            attempt,
            data: result
          };
        }
        
        throw new Error('No retry function provided');
        
      } catch (retryError) {
        console.log(`❌ Retry attempt ${attempt} failed:`, retryError.message);
        
        if (attempt === maxRetries) {
          throw retryError;
        }
      }
    }
  }

  /**
   * Fallback operation with alternative data
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Error classification
   * @param {Object} options - Fallback options
   * @returns {Promise<Object>} - Fallback result
   */
  async fallbackOperation(error, errorInfo, options = {}) {
    console.log('🔄 Executing fallback operation');
    
    // Generate fallback data based on error context
    const fallbackData = this.createFallbackData(errorInfo, options);
    
    return {
      success: true,
      strategy: this.recoveryStrategies.FALLBACK,
      data: fallbackData,
      warnings: ['Using fallback data due to error']
    };
  }

  /**
   * Graceful degradation with reduced functionality
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Error classification
   * @param {Object} options - Degradation options
   * @returns {Promise<Object>} - Degradation result
   */
  async gracefulDegradation(error, errorInfo, options = {}) {
    console.log('🔄 Executing graceful degradation');
    
    // Create degraded response with limited functionality
    const degradedData = this.createDegradedData(errorInfo, options);
    
    return {
      success: true,
      strategy: this.recoveryStrategies.GRACEFUL_DEGRADATION,
      data: degradedData,
      warnings: ['Reduced functionality due to error'],
      degraded: true
    };
  }

  /**
   * Circuit breaker recovery
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Error classification
   * @param {Object} options - Circuit breaker options
   * @returns {Promise<Object>} - Circuit breaker result
   */
  async circuitBreakerRecovery(error, errorInfo, options = {}) {
    console.log('🔄 Circuit breaker recovery');
    
    this.openCircuitBreaker();
    
    return {
      success: false,
      strategy: this.recoveryStrategies.CIRCUIT_BREAKER,
      error: this.createCircuitBreakerError(),
      circuitBreakerState: this.circuitBreaker.state
    };
  }

  /**
   * Fail fast without recovery
   * @param {Error} error - Original error
   * @param {Object} errorInfo - Error classification
   * @param {Object} options - Fail fast options
   * @returns {Object} - Fail fast result
   */
  failFast(error, errorInfo, options = {}) {
    console.log('⚡ Fail fast execution');
    
    return {
      success: false,
      strategy: this.recoveryStrategies.FAIL_FAST,
      error,
      message: 'Operation failed fast without recovery attempt'
    };
  }

  /**
   * Create fallback data based on error context
   * @param {Object} errorInfo - Error classification
   * @param {Object} options - Fallback options
   * @returns {Object} - Fallback data
   */
  createFallbackData(errorInfo, options = {}) {
    const { context, category } = errorInfo;
    
    // Preserve original data if available
    const preservedData = this.extractPreservedData(options);
    
    switch (category) {
      case this.errorCategories.PARSING:
        return {
          fallback: true,
          data: this.createParsingFallbackData(preservedData, options),
          preservedMetadata: preservedData.metadata,
          message: 'Using fallback data due to parsing error'
        };
      
      case this.errorCategories.PROCESSING:
        return {
          fallback: true,
          data: this.createProcessingFallbackData(preservedData, options),
          preservedMetadata: preservedData.metadata,
          message: 'Using fallback data due to processing error'
        };
      
      default:
        return {
          fallback: true,
          data: this.createGenericFallbackData(preservedData, options),
          preservedMetadata: preservedData.metadata,
          message: 'Using fallback data due to unknown error'
        };
    }
  }

  /**
   * Extract preserved data from options or error context
   */
  extractPreservedData(options) {
    const preservedData = {
      metadata: {},
      cvData: null,
      jobData: null,
      originalResponse: null
    };
    
    // Check if error has preservedData
    if (options.error && options.error.preservedData) {
      const preserved = options.error.preservedData;
      
      preservedData.metadata = preserved.fallbackMetadata || {};
      preservedData.cvData = preserved.originalData;
      preservedData.originalResponse = preserved.originalPuterData?.originalResponse;
      
      if (preserved.originalPuterData) {
        preservedData.metadata.puterModel = preserved.originalPuterData.model;
        preservedData.metadata.puterTimestamp = preserved.originalPuterData.timestamp;
      }
    }
    
    // Check options for fallback data
    if (options.fallbackData) {
      preservedData.cvData = options.fallbackData;
    }
    
    if (options.originalCV) {
      preservedData.cvData = options.originalCV;
    }
    
    if (options.jobData) {
      preservedData.jobData = options.jobData;
    }
    
    return preservedData;
  }

  /**
   * Create parsing fallback data with preserved CV content
   */
  createParsingFallbackData(preservedData, options) {
    if (preservedData.cvData) {
      // Return the preserved CV data as fallback
      return {
        ...preservedData.cvData,
        _fallbackSource: 'preserved_cv_data',
        _fallbackReason: 'parsing_error',
        _fallbackTimestamp: new Date().toISOString()
      };
    }
    
    if (preservedData.originalResponse) {
      // Try to extract basic info from original response
      try {
        const basicExtraction = this.extractBasicInfoFromResponse(preservedData.originalResponse);
        return {
          ...basicExtraction,
          _fallbackSource: 'basic_extraction',
          _fallbackReason: 'parsing_error',
          _fallbackTimestamp: new Date().toISOString()
        };
      } catch (error) {
        console.warn('Failed to extract basic info from original response');
      }
    }
    
    return {
      _fallbackSource: 'empty_template',
      _fallbackReason: 'parsing_error',
      _fallbackTimestamp: new Date().toISOString(),
      personalInfo: { name: '', email: '', phone: '' },
      sections: {}
    };
  }

  /**
   * Create processing fallback data with preserved content
   */
  createProcessingFallbackData(preservedData, options) {
    if (preservedData.cvData) {
      return {
        ...preservedData.cvData,
        _fallbackSource: 'preserved_processing_data',
        _fallbackReason: 'processing_error',
        _fallbackTimestamp: new Date().toISOString(),
        _processingWarning: 'Some enhancements may not have been applied'
      };
    }
    
    return {
      _fallbackSource: 'minimal_processing_data',
      _fallbackReason: 'processing_error',
      _fallbackTimestamp: new Date().toISOString(),
      personalInfo: { name: '', email: '', phone: '' },
      sections: {}
    };
  }

  /**
   * Create generic fallback data
   */
  createGenericFallbackData(preservedData, options) {
    if (preservedData.cvData) {
      return {
        ...preservedData.cvData,
        _fallbackSource: 'preserved_generic_data',
        _fallbackReason: 'generic_error',
        _fallbackTimestamp: new Date().toISOString()
      };
    }
    
    return {
      _fallbackSource: 'empty_generic_data',
      _fallbackReason: 'generic_error',
      _fallbackTimestamp: new Date().toISOString(),
      personalInfo: { name: '', email: '', phone: '' },
      sections: {}
    };
  }

  /**
   * Extract basic info from response text
   */
  extractBasicInfoFromResponse(responseText) {
    const basicInfo = {
      personalInfo: {},
      sections: {}
    };
    
    // Simple regex patterns to extract basic info
    const emailMatch = responseText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = responseText.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
    const nameMatch = responseText.match(/(?:Name|Full Name):\s*([^\n\r]+)/i);
    
    if (emailMatch) basicInfo.personalInfo.email = emailMatch[1];
    if (phoneMatch) basicInfo.personalInfo.phone = phoneMatch[1];
    if (nameMatch) basicInfo.personalInfo.name = nameMatch[1].trim();
    
    return basicInfo;
  }

  /**
   * Create degraded data with reduced functionality
   * @param {Object} errorInfo - Error classification
   * @param {Object} options - Degradation options
   * @returns {Object} - Degraded data
   */
  createDegradedData(errorInfo, options = {}) {
    const preservedData = this.extractPreservedData(options);
    
    const degradedResponse = {
      degraded: true,
      data: preservedData.cvData || options.degradedData || {},
      preservedMetadata: preservedData.metadata,
      availableFeatures: options.availableFeatures || ['basic_cv_display'],
      unavailableFeatures: options.unavailableFeatures || ['advanced_processing', 'ai_enhancements'],
      message: 'Reduced functionality due to error - original CV data preserved'
    };
    
    // Add degradation metadata
    if (preservedData.cvData) {
      degradedResponse.data._degradationInfo = {
        degradedAt: new Date().toISOString(),
        reason: errorInfo.category,
        preservedContent: true,
        contentSource: 'original_cv_data'
      };
    }
    
    return degradedResponse;
  }

  /**
   * Circuit breaker operations
   */
  shouldTriggerCircuitBreaker(errorInfo) {
    return this.circuitBreaker.failures >= this.circuitBreaker.threshold;
  }

  openCircuitBreaker() {
    this.circuitBreaker.state = 'OPEN';
    this.circuitBreaker.lastFailureTime = Date.now();
    console.log('⚡ Circuit breaker opened');
  }

  closeCircuitBreaker() {
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailureTime = null;
    console.log('✅ Circuit breaker closed');
  }

  createCircuitBreakerError() {
    return new Error('Circuit breaker is open - service temporarily unavailable');
  }

  /**
   * Utility methods
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  logError(error, errorInfo, context) {
    console.error('🚨 Error occurred:', {
      message: error.message,
      category: errorInfo.category,
      severity: errorInfo.severity,
      context,
      timestamp: errorInfo.timestamp
    });
  }

  updateErrorStats(errorInfo) {
    this.errorStats.totalErrors++;
    
    if (!this.errorStats.errorsByCategory[errorInfo.category]) {
      this.errorStats.errorsByCategory[errorInfo.category] = 0;
    }
    this.errorStats.errorsByCategory[errorInfo.category]++;
    
    if (!this.errorStats.errorsBySeverity[errorInfo.severity]) {
      this.errorStats.errorsBySeverity[errorInfo.severity] = 0;
    }
    this.errorStats.errorsBySeverity[errorInfo.severity]++;
    
    // Update circuit breaker
    if (errorInfo.severity === this.severityLevels.CRITICAL) {
      this.circuitBreaker.failures++;
    }
  }

  trackRecoveryMetrics(strategy, success, startTime) {
    const duration = Date.now() - startTime;
    
    console.log(`📊 Recovery metrics: strategy=${strategy}, success=${success}, duration=${duration}ms`);
  }

  createFailSafeResponse(originalError, context, handlingError, options = {}) {
    // Try to preserve any data we can
    const preservedData = this.extractPreservedData(options);
    
    return {
      success: false,
      strategy: 'fail_safe',
      originalError: originalError.message,
      handlingError: handlingError.message,
      context,
      data: preservedData.cvData || {},
      preservedMetadata: preservedData.metadata,
      message: 'Error handling failed - using fail-safe response with preserved data',
      recoveryInfo: {
        hasPreservedData: !!preservedData.cvData,
        preservedDataSource: preservedData.cvData ? 'original_cv' : 'none',
        recommendedAction: 'retry_with_original_data'
      }
    };
  }

  /**
   * Get error statistics
   * @returns {Object} - Error statistics
   */
  getErrorStats() {
    return {
      ...this.errorStats,
      circuitBreaker: this.circuitBreaker,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset error statistics
   */
  resetErrorStats() {
    this.errorStats = {
      totalErrors: 0,
      errorsByCategory: {},
      errorsBySeverity: {},
      recoveryAttempts: 0,
      successfulRecoveries: 0
    };
    
    this.closeCircuitBreaker();
    
    console.log('📊 Error statistics reset');
  }

  /**
   * Configure error handling
   * @param {Object} config - Error handling configuration
   */
  configure(config) {
    if (config.circuitBreaker) {
      this.circuitBreaker = { ...this.circuitBreaker, ...config.circuitBreaker };
    }
    
    console.log('⚙️ Error handler configured');
  }
}

module.exports = PuterErrorHandler;
