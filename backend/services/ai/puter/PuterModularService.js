/**
 * Puter Modular Service - Main Orchestrator
 * Follows the CVTailoringService pattern with brutal efficiency
 * Handles all Puter AI operations with modular architecture
 */

const PuterAuthEngine = require('./engines/PuterAuthEngine');
const PuterRequestEngine = require('./engines/PuterRequestEngine');
const PuterResponseEngine = require('./engines/PuterResponseEngine');
const PuterJobAnalysisEngine = require('./tailoring/PuterJobAnalysisEngine');
const PuterCVTailoringEngine = require('./tailoring/PuterCVTailoringEngine');
const PuterDataValidator = require('./utils/PuterDataValidator');
const PuterResponseParser = require('./utils/PuterResponseParser');
const PuterPerformanceMonitor = require('./utils/PuterPerformanceMonitor');
const PuterErrorHandler = require('./utils/PuterErrorHandler');

class PuterModularService {
  constructor() {
    this.name = 'Puter Modular Service';
    this.version = '2.0.0';
    this.architecture = 'Modular';
    
    // Initialize engines
    this.authEngine = new PuterAuthEngine();
    this.requestEngine = new PuterRequestEngine();
    this.responseEngine = new PuterResponseEngine();
    this.jobAnalysisEngine = new PuterJobAnalysisEngine();
    this.cvTailoringEngine = new PuterCVTailoringEngine();
    
    // Initialize utilities
    this.dataValidator = new PuterDataValidator();
    this.responseParser = new PuterResponseParser();
    this.performanceMonitor = new PuterPerformanceMonitor();
    this.errorHandler = new PuterErrorHandler();
    
    // Service configuration
    this.config = {
      brutalMode: true,
      maxConcurrentRequests: 10,
      timeout: 30000,
      retryAttempts: 3,
      enableCaching: true,
      enableMetrics: true,
      enablePerformanceMonitoring: true
    };
    
    // Legacy metrics tracking (maintained for backward compatibility)
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      operationCounts: {}
    };
    
    console.log('🚀 Puter Modular Service v2.0 initialized with brutal efficiency and performance monitoring');
  }

  /**
   * Extract CV from Puter data - Main entry point
   * @param {Object} puterData - Puter AI response data
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Extracted CV data
   */
  async extractCVFromPuterData(puterData, options = {}) {
    const startTime = Date.now();
    let operationId;
    
    try {
      console.log('📄 Starting CV extraction from Puter data...');
      
      // Start performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        operationId = this.performanceMonitor.startOperation('extract-cv', 'request');
      }
      
      // 1. Brutal authentication
      const authResult = await this.authEngine.brutalAuth(puterData);
      
      // 2. Validate data
      const validation = await this.dataValidator.validatePuterData(puterData, 'extract-cv', options);
      if (!validation.valid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }
      
      // 3. Parse response
      const parsedData = await this.responseParser.parseResponse(
        puterData.originalResponse, 
        'extract-cv', 
        options
      );
      
      // 4. Process request
      const requestResult = await this.requestEngine.processRequest(
        puterData, 
        'extract-cv', 
        { ...options, parsedData }
      );
      
      // 5. Handle response
      const responseResult = await this.responseEngine.handleResponse(
        requestResult.data,
        'extract-cv',
        options
      );
      
      // 6. Track metrics
      this.trackMetrics('extract-cv', true, Date.now() - startTime);
      
      // End performance monitoring
      if (this.config.enablePerformanceMonitoring && operationId) {
        this.performanceMonitor.endOperation(operationId, true, {
          startTime,
          engine: 'request',
          operation: 'extract-cv'
        });
      }
      
      console.log('✅ CV extraction completed successfully');
      return this.buildSuccessResponse(responseResult, 'extract-cv', puterData);
      
    } catch (error) {
      this.trackMetrics('extract-cv', false, Date.now() - startTime);
      
      // End performance monitoring for failed operation
      if (this.config.enablePerformanceMonitoring && operationId) {
        this.performanceMonitor.endOperation(operationId, false, {
          startTime,
          engine: 'request',
          operation: 'extract-cv',
          error: error.message
        });
      }
      
      console.error('❌ CV extraction failed:', error.message);
      
      // Use error handler for robust error handling
      try {
        const errorHandlingResult = await this.errorHandler.handleError(error, 'extract-cv', {
          originalCV: options.originalCV,
          puterData,
          fallbackData: options.originalCV,
          error: error
        });
        
        if (errorHandlingResult.success) {
          console.log('✅ Error recovery successful, returning fallback data');
          return {
            success: true,
            data: errorHandlingResult.data,
            fallback: true,
            metadata: {
              service: this.name,
              version: this.version,
              operation: 'extract-cv',
              recoveryStrategy: errorHandlingResult.strategy,
              processedAt: new Date().toISOString(),
              warning: 'Returned using error recovery'
            }
          };
        }
      } catch (handlingError) {
        console.error('❌ Error handling failed:', handlingError.message);
      }
      
      throw this.buildErrorResponse(error, 'extract-cv', puterData, options.originalCV);
    }
  }

  /**
   * Enhance CV from Puter data
   * @param {Object} puterData - Puter AI response data
   * @param {Object} options - Enhancement options
   * @returns {Promise<Object>} - Enhanced CV data
   */
  async enhanceCVFromPuterData(puterData, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log('⚡ Starting CV enhancement from Puter data...');
      
      // 1. Brutal authentication
      await this.authEngine.brutalAuth(puterData);
      
      // 2. Validate data
      const validation = await this.dataValidator.validatePuterData(puterData, 'enhance-cv', options);
      if (!validation.valid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }
      
      // 3. Parse response
      const parsedData = await this.responseParser.parseResponse(
        puterData.originalResponse, 
        'enhance-cv', 
        options
      );
      
      // 4. Process request
      const requestResult = await this.requestEngine.processRequest(
        puterData, 
        'enhance-cv', 
        { ...options, parsedData }
      );
      
      // 5. Handle response
      const responseResult = await this.responseEngine.handleResponse(
        requestResult.data,
        'enhance-cv',
        options
      );
      
      // 6. Track metrics
      this.trackMetrics('enhance-cv', true, Date.now() - startTime);
      
      console.log('✅ CV enhancement completed successfully');
      return this.buildSuccessResponse(responseResult, 'enhance-cv', puterData);
      
    } catch (error) {
      this.trackMetrics('enhance-cv', false, Date.now() - startTime);
      console.error('❌ CV enhancement failed:', error.message);
      throw this.buildErrorResponse(error, 'enhance-cv', puterData, options.originalCV);
    }
  }

  /**
   * Tailor CV from Puter data
   * @param {Object} puterData - Puter AI response data
   * @param {Object} originalCV - Original CV data
   * @param {Object} jobData - Job description data
   * @param {Object} options - Tailoring options
   * @returns {Promise<Object>} - Tailored CV data
   */
  async tailorCVFromPuterData(puterData, originalCV, jobData, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log('🎯 Starting CV tailoring from Puter data...');
      
      // 1. Brutal authentication
      await this.authEngine.brutalAuth(puterData);
      
      // 2. Validate data
      const validation = await this.dataValidator.validatePuterData(puterData, 'tailor-cv', options);
      if (!validation.valid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }
      
      // 3. Use specialized tailoring engine
      const tailoredCV = await this.cvTailoringEngine.tailorCVFromPuter(
        puterData,
        originalCV,
        jobData,
        options
      );
      
      // 4. Track metrics
      this.trackMetrics('tailor-cv', true, Date.now() - startTime);
      
      console.log('✅ CV tailoring completed successfully');
      return this.buildTailoringResponse(tailoredCV, puterData);
      
    } catch (error) {
      this.trackMetrics('tailor-cv', false, Date.now() - startTime);
      console.error('❌ CV tailoring failed:', error.message);
      
      // Use error handler for CV tailoring errors
      try {
        const errorHandlingResult = await this.errorHandler.handleError(error, 'tailor-cv', {
          originalCV,
          jobData,
          puterData,
          fallbackData: originalCV,
          error: error
        });
        
        if (errorHandlingResult.success) {
          console.log('✅ CV tailoring error recovery successful, returning original CV with metadata');
          return {
            success: true,
            data: {
              ...originalCV,
              _tailoringFallback: true,
              _tailoringFallbackReason: error.message,
              _tailoringFallbackTimestamp: new Date().toISOString()
            },
            fallback: true,
            metadata: {
              service: this.name,
              version: this.version,
              operation: 'tailor-cv',
              recoveryStrategy: errorHandlingResult.strategy,
              processedAt: new Date().toISOString(),
              warning: 'Returned original CV due to tailoring error'
            }
          };
        }
      } catch (handlingError) {
        console.error('❌ CV tailoring error handling failed:', handlingError.message);
      }
      
      throw this.buildErrorResponse(error, 'tailor-cv', puterData, originalCV);
    }
  }

  /**
   * Generate cover letter from Puter data
   * @param {Object} puterData - Puter AI response data
   * @param {Object} options - Cover letter options
   * @returns {Promise<Object>} - Generated cover letter
   */
  async generateCoverLetterFromPuterData(puterData, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log('📝 Starting cover letter generation from Puter data...');
      
      // 1. Brutal authentication
      await this.authEngine.brutalAuth(puterData);
      
      // 2. Validate data
      const validation = await this.dataValidator.validatePuterData(puterData, 'generate-cover-letter', options);
      if (!validation.valid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }
      
      // 3. Parse response
      const parsedData = await this.responseParser.parseResponse(
        puterData.originalResponse, 
        'generate-cover-letter', 
        options
      );
      
      // 4. Process request
      const requestResult = await this.requestEngine.processRequest(
        puterData, 
        'generate-cover-letter', 
        { ...options, parsedData }
      );
      
      // 5. Handle response
      const responseResult = await this.responseEngine.handleResponse(
        requestResult.data,
        'generate-cover-letter',
        options
      );
      
      // 6. Track metrics
      this.trackMetrics('generate-cover-letter', true, Date.now() - startTime);
      
      console.log('✅ Cover letter generation completed successfully');
      return this.buildSuccessResponse(responseResult, 'generate-cover-letter', puterData);
      
    } catch (error) {
      this.trackMetrics('generate-cover-letter', false, Date.now() - startTime);
      console.error('❌ Cover letter generation failed:', error.message);
      throw this.buildErrorResponse(error, 'generate-cover-letter', puterData, options.cvData);
    }
  }

  /**
   * Process file from Puter data
   * @param {Object} puterData - Puter AI response data
   * @param {Object} options - File processing options
   * @returns {Promise<Object>} - Processed file data
   */
  async processFileFromPuterData(puterData, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log('📁 Starting file processing from Puter data...');
      
      // 1. Brutal authentication
      await this.authEngine.brutalAuth(puterData);
      
      // 2. Validate data
      const validation = await this.dataValidator.validatePuterData(puterData, 'process-file', options);
      if (!validation.valid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }
      
      // 3. Parse response
      const parsedData = await this.responseParser.parseResponse(
        puterData.originalResponse, 
        'process-file', 
        options
      );
      
      // 4. Process request
      const requestResult = await this.requestEngine.processRequest(
        puterData, 
        'process-file', 
        { ...options, parsedData }
      );
      
      // 5. Handle response
      const responseResult = await this.responseEngine.handleResponse(
        requestResult.data,
        'process-file',
        options
      );
      
      // 6. Track metrics
      this.trackMetrics('process-file', true, Date.now() - startTime);
      
      console.log('✅ File processing completed successfully');
      return this.buildSuccessResponse(responseResult, 'process-file', puterData);
      
    } catch (error) {
      this.trackMetrics('process-file', false, Date.now() - startTime);
      console.error('❌ File processing failed:', error.message);
      throw this.buildErrorResponse(error, 'process-file', puterData, options.fileData);
    }
  }

  /**
   * Analyze job from Puter data
   * @param {Object} puterData - Puter AI response data
   * @param {Object} options - Job analysis options
   * @returns {Promise<Object>} - Job analysis result
   */
  async analyzeJobFromPuterData(puterData, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log('🎯 Starting job analysis from Puter data...');
      
      // 1. Brutal authentication
      await this.authEngine.brutalAuth(puterData);
      
      // 2. Validate data
      const validation = await this.dataValidator.validatePuterData(puterData, 'analyze-job', options);
      if (!validation.valid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }
      
      // 3. Use specialized job analysis engine
      const jobAnalysis = await this.jobAnalysisEngine.extractJobAnalysis(puterData, options);
      
      // 4. Track metrics
      this.trackMetrics('analyze-job', true, Date.now() - startTime);
      
      console.log('✅ Job analysis completed successfully');
      return this.buildJobAnalysisResponse(jobAnalysis, puterData);
      
    } catch (error) {
      this.trackMetrics('analyze-job', false, Date.now() - startTime);
      console.error('❌ Job analysis failed:', error.message);
      throw this.buildErrorResponse(error, 'analyze-job', puterData, options.jobData);
    }
  }

  /**
   * Build success response
   */
  buildSuccessResponse(responseResult, operation, puterData) {
    return {
      success: true,
      operation,
      data: responseResult.data,
      metadata: {
        service: this.name,
        version: this.version,
        architecture: this.architecture,
        model: puterData.model,
        processedAt: new Date().toISOString(),
        brutalMode: this.config.brutalMode,
        processingSteps: [
          'Authentication',
          'Validation',
          'Parsing',
          'Request Processing',
          'Response Handling'
        ]
      },
      responseMetadata: responseResult.metadata
    };
  }

  /**
   * Build tailoring response
   */
  buildTailoringResponse(tailoredCV, puterData) {
    return {
      success: true,
      operation: 'tailor-cv',
      tailoredCV,
      metadata: {
        service: this.name,
        version: this.version,
        architecture: this.architecture,
        model: puterData.model,
        processedAt: new Date().toISOString(),
        brutalMode: this.config.brutalMode,
        processingSteps: [
          'Authentication',
          'Validation',
          'Job Analysis',
          'CV Tailoring',
          'Authenticity Validation'
        ]
      },
      tailoringMetadata: tailoredCV.tailoringMetadata,
      puterMetadata: tailoredCV.puterMetadata
    };
  }

  /**
   * Build job analysis response
   */
  buildJobAnalysisResponse(jobAnalysis, puterData) {
    return {
      success: true,
      operation: 'analyze-job',
      jobAnalysis,
      metadata: {
        service: this.name,
        version: this.version,
        architecture: this.architecture,
        model: puterData.model,
        processedAt: new Date().toISOString(),
        brutalMode: this.config.brutalMode,
        processingSteps: [
          'Authentication',
          'Validation',
          'Job Analysis',
          'Enhancement'
        ]
      },
      analysisMetadata: jobAnalysis.analysisMetadata,
      puterMetadata: jobAnalysis.puterMetadata
    };
  }

  /**
   * Build error response with metadata preservation
   */
  buildErrorResponse(error, operation, puterData, originalData = null) {
    // Create enhanced error object that preserves metadata
    const enhancedError = new Error(`${this.name} ${operation} failed: ${error.message}`);
    
    // Preserve original metadata and data for fallback scenarios
    enhancedError.preservedData = {
      originalPuterData: puterData,
      originalData: originalData,
      errorDetails: {
        operation,
        timestamp: new Date().toISOString(),
        service: this.name,
        version: this.version
      },
      fallbackMetadata: this.extractFallbackMetadata(puterData, originalData),
      recovery: {
        canRecover: this.canRecoverFromError(error, operation),
        suggestedAction: this.getSuggestedRecoveryAction(error, operation)
      }
    };
    
    return enhancedError;
  }

  /**
   * Extract fallback metadata from original data
   */
  extractFallbackMetadata(puterData, originalData) {
    const fallbackMetadata = {
      preservedAt: new Date().toISOString(),
      service: this.name,
      version: this.version
    };
    
    // Extract metadata from puterData
    if (puterData) {
      fallbackMetadata.puterModel = puterData.model;
      fallbackMetadata.puterTimestamp = puterData.timestamp;
      fallbackMetadata.puterOperationType = puterData.operationType;
    }
    
    // Extract metadata from originalData (CV, job data, etc.)
    if (originalData) {
      if (originalData.personalInfo) {
        fallbackMetadata.cvMetadata = {
          hasPersonalInfo: true,
          name: originalData.personalInfo.name,
          email: originalData.personalInfo.email
        };
      }
      
      if (originalData.sections) {
        fallbackMetadata.cvSections = Object.keys(originalData.sections);
      }
      
      if (originalData.jobTitle || originalData.title) {
        fallbackMetadata.jobInfo = {
          title: originalData.jobTitle || originalData.title,
          company: originalData.company
        };
      }
    }
    
    return fallbackMetadata;
  }

  /**
   * Check if error can be recovered from
   */
  canRecoverFromError(error, operation) {
    const recoverableErrors = [
      'parsing',
      'validation',
      'timeout',
      'network'
    ];
    
    return recoverableErrors.some(type => 
      error.message.toLowerCase().includes(type)
    );
  }

  /**
   * Get suggested recovery action
   */
  getSuggestedRecoveryAction(error, operation) {
    if (error.message.includes('parsing')) {
      return 'retry_with_fallback_parser';
    }
    if (error.message.includes('validation')) {
      return 'use_degraded_validation';
    }
    if (error.message.includes('timeout')) {
      return 'retry_with_longer_timeout';
    }
    if (error.message.includes('network')) {
      return 'retry_with_backoff';
    }
    return 'graceful_degradation';
  }

  /**
   * Track metrics
   */
  trackMetrics(operation, success, responseTime) {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1)) + responseTime
    ) / this.metrics.totalRequests;
    
    // Update operation counts
    if (!this.metrics.operationCounts[operation]) {
      this.metrics.operationCounts[operation] = { total: 0, success: 0, failed: 0 };
    }
    
    this.metrics.operationCounts[operation].total++;
    if (success) {
      this.metrics.operationCounts[operation].success++;
    } else {
      this.metrics.operationCounts[operation].failed++;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: this.name,
      version: this.version,
      architecture: this.architecture,
      status: 'active',
      config: this.config,
      metrics: {
        ...this.metrics,
        successRate: this.metrics.totalRequests > 0 
          ? Math.round((this.metrics.successfulRequests / this.metrics.totalRequests) * 100) 
          : 0
      },
      engines: {
        auth: this.authEngine.getStatus(),
        request: this.requestEngine.getStatus(),
        response: this.responseEngine.getStatus(),
        jobAnalysis: this.jobAnalysisEngine.getStatus(),
        cvTailoring: this.cvTailoringEngine.getStatus()
      },
      utilities: {
        validator: this.dataValidator.getStatus(),
        parser: this.responseParser.getStatus(),
        errorHandler: this.errorHandler.getErrorStats()
      },
      capabilities: [
        'CV extraction',
        'CV enhancement',
        'CV tailoring',
        'Cover letter generation',
        'File processing',
        'Job analysis',
        'Brutal authentication',
        'Data validation',
        'Response parsing',
        'Metrics tracking',
        'Performance monitoring',
        'Advanced error handling',
        'Metadata preservation',
        'Fallback recovery'
      ]
    };
  }

  /**
   * Get enhanced performance metrics
   * @returns {Object} - Enhanced performance metrics
   */
  getEnhancedMetrics() {
    if (!this.config.enablePerformanceMonitoring) {
      return this.metrics;
    }
    
    return {
      legacy: this.metrics,
      performance: this.performanceMonitor.getMetrics(),
      health: this.performanceMonitor.getHealthStatus(),
      report: this.performanceMonitor.generatePerformanceReport()
    };
  }

  /**
   * Configure performance monitoring
   * @param {Object} thresholds - Performance thresholds
   */
  configurePerformanceMonitoring(thresholds) {
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.configureThresholds(thresholds);
    }
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.resetMetrics();
    }
    
    // Reset legacy metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      operationCounts: {}
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.authEngine.clearCache();
    this.requestEngine.clearHistory();
    this.responseEngine.clearCache();
    this.jobAnalysisEngine.clearCache();
    this.cvTailoringEngine.clearCache();
    this.dataValidator.clearCache();
    this.responseParser.clearCache();
    
    // Reset error handler statistics
    if (this.errorHandler) {
      this.errorHandler.resetErrorStats();
    }
    
    console.log('🧹 All Puter service caches cleared');
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      operationCounts: {}
    };
    
    console.log('📊 Puter service metrics reset');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Puter service configuration updated');
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    // Cleanup performance monitor
    if (this.config.enablePerformanceMonitoring && this.performanceMonitor) {
      this.performanceMonitor.cleanup();
    }
    
    // Clear all caches
    this.clearAllCaches();
    
    // Reset metrics
    this.resetPerformanceMetrics();
    
    console.log('🧹 Puter Modular Service cleanup completed');
  }
}

module.exports = PuterModularService;
