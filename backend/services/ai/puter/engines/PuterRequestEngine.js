/**
 * Puter Request Processing Engine
 * Handles request processing with brutal efficiency and validation
 * Mirrors the request processing patterns from the tailoring system
 */

class PuterRequestEngine {
  constructor() {
    this.name = 'Puter Request Processing Engine';
    this.version = '1.0.0';
    this.requestTimeout = 30000; // 30 seconds
    this.maxConcurrentRequests = 10;
    this.requestQueue = [];
    this.activeRequests = new Map();
    this.requestHistory = [];
    this.retryPolicy = {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000
    };
    
    console.log('🔄 Puter Request Processing Engine initialized');
  }

  /**
   * Process Puter request with brutal efficiency
   * @param {Object} puterData - Authenticated Puter data
   * @param {string} operation - Operation type
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Processed request result
   */
  async processRequest(puterData, operation, options = {}) {
    const requestId = this.generateRequestId();
    
    try {
      console.log(`🔄 Processing Puter request: ${requestId} - ${operation}`);
      
      // 1. Validate request parameters
      this.validateRequestParams(puterData, operation, options);
      
      // 2. Check rate limiting
      this.checkRateLimit(options.userId);
      
      // 3. Queue management
      await this.manageRequestQueue(requestId, operation);
      
      // 4. Process with timeout and retry logic
      const result = await this.processWithRetry(
        () => this.executeRequest(puterData, operation, options),
        requestId
      );
      
      // 5. Post-processing validation
      const validatedResult = this.validateResult(result, operation);
      
      // 6. Log successful processing
      this.logRequest(requestId, operation, puterData.model, true);
      
      return {
        success: true,
        requestId,
        operation,
        data: validatedResult,
        metadata: {
          engine: this.name,
          version: this.version,
          model: puterData.model,
          processingTime: Date.now(),
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error(`❌ Request processing failed: ${requestId}`, error.message);
      
      // Log failed processing
      this.logRequest(requestId, operation, puterData?.model || 'unknown', false);
      
      throw new Error(`Request processing failed: ${error.message}`);
    } finally {
      // Clean up active request
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Validate request parameters
   */
  validateRequestParams(puterData, operation, options) {
    if (!puterData) {
      throw new Error('Puter data is required');
    }

    if (!operation) {
      throw new Error('Operation type is required');
    }

    const supportedOperations = [
      'extract-cv',
      'enhance-cv',
      'tailor-cv',
      'generate-cover-letter',
      'process-file',
      'analyze-job'
    ];

    if (!supportedOperations.includes(operation)) {
      throw new Error(`Unsupported operation: ${operation}`);
    }

    // Validate operation-specific requirements
    this.validateOperationRequirements(puterData, operation, options);
  }

  /**
   * Validate operation-specific requirements
   */
  validateOperationRequirements(puterData, operation, options) {
    const response = puterData.originalResponse;

    switch (operation) {
      case 'extract-cv':
        if (!response.toLowerCase().includes('name') && 
            !response.toLowerCase().includes('email')) {
          console.warn('⚠️ CV extraction may not contain basic contact info');
        }
        break;
        
      case 'enhance-cv':
        if (!options.enhancementType) {
          throw new Error('Enhancement type is required for CV enhancement');
        }
        break;
        
      case 'tailor-cv':
        if (!options.jobDescription) {
          throw new Error('Job description is required for CV tailoring');
        }
        break;
        
      case 'generate-cover-letter':
        if (!options.jobDescription || !options.companyName) {
          throw new Error('Job description and company name are required for cover letter generation');
        }
        break;
        
      case 'process-file':
        if (!options.fileType) {
          throw new Error('File type is required for file processing');
        }
        break;
        
      case 'analyze-job':
        if (!options.jobDescription) {
          throw new Error('Job description is required for job analysis');
        }
        break;
    }
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(userId) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 30; // 30 requests per minute
    
    if (!userId) {
      userId = 'anonymous';
    }

    const userRequests = this.requestHistory.filter(req => 
      req.userId === userId && 
      (now - req.timestamp) < windowMs
    );

    if (userRequests.length >= maxRequests) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
  }

  /**
   * Manage request queue
   */
  async manageRequestQueue(requestId, operation) {
    // Add to active requests
    this.activeRequests.set(requestId, {
      operation,
      startTime: Date.now(),
      status: 'processing'
    });

    // Check concurrent request limit
    if (this.activeRequests.size > this.maxConcurrentRequests) {
      console.log(`⏳ Request ${requestId} queued due to concurrent limit`);
      
      // Wait for a slot to become available
      await this.waitForSlot();
    }
  }

  /**
   * Wait for available processing slot
   */
  async waitForSlot() {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.activeRequests.size < this.maxConcurrentRequests) {
          resolve();
        } else {
          setTimeout(checkSlot, 100);
        }
      };
      checkSlot();
    });
  }

  /**
   * Process with retry logic
   */
  async processWithRetry(processor, requestId) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.retryPolicy.maxRetries; attempt++) {
      try {
        return await Promise.race([
          processor(),
          this.createTimeoutPromise(this.requestTimeout)
        ]);
      } catch (error) {
        lastError = error;
        
        if (attempt === this.retryPolicy.maxRetries) {
          break;
        }
        
        if (this.isRetryableError(error)) {
          const delay = this.retryPolicy.initialDelay * 
                       Math.pow(this.retryPolicy.backoffMultiplier, attempt);
          
          console.log(`⏳ Retry ${attempt + 1}/${this.retryPolicy.maxRetries} for ${requestId} after ${delay}ms`);
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Execute the actual request processing
   */
  async executeRequest(puterData, operation, options) {
    const response = puterData.originalResponse;
    
    // Clean and parse the response
    const cleanedResponse = this.cleanResponse(response);
    let parsedData;
    
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (error) {
      // If JSON parsing fails, try to extract structured data
      parsedData = this.extractStructuredData(cleanedResponse, operation);
    }
    
    // Apply operation-specific processing
    const processedData = await this.applyOperationProcessing(
      parsedData, 
      operation, 
      options, 
      puterData
    );
    
    return processedData;
  }

  /**
   * Clean response for processing
   */
  cleanResponse(response) {
    let cleaned = response.trim();
    
    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove common AI response prefixes
    const prefixes = [
      'Here is the',
      'Here\'s the',
      'Based on',
      'According to',
      'The following is'
    ];
    
    prefixes.forEach(prefix => {
      if (cleaned.startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    });
    
    return cleaned;
  }

  /**
   * Extract structured data from unstructured response
   */
  extractStructuredData(response, operation) {
    // Basic pattern matching for different operations
    const patterns = {
      'extract-cv': this.extractCVPatterns(response),
      'enhance-cv': this.extractEnhancementPatterns(response),
      'tailor-cv': this.extractTailoringPatterns(response),
      'generate-cover-letter': this.extractCoverLetterPatterns(response),
      'process-file': this.extractFileProcessingPatterns(response),
      'analyze-job': this.extractJobAnalysisPatterns(response)
    };
    
    return patterns[operation] || { content: response };
  }

  /**
   * Extract CV patterns from response
   */
  extractCVPatterns(response) {
    const extracted = {
      personalInfo: {},
      experience: [],
      skills: {},
      education: [],
      rawContent: response
    };
    
    // Extract name
    const nameMatch = response.match(/name[:\s]+"?([^",\n]+)"?/i);
    if (nameMatch) {
      extracted.personalInfo.name = nameMatch[1].trim();
    }
    
    // Extract email
    const emailMatch = response.match(/email[:\s]+"?([^",\s]+@[^",\s]+)"?/i);
    if (emailMatch) {
      extracted.personalInfo.email = emailMatch[1].trim();
    }
    
    // Extract phone
    const phoneMatch = response.match(/phone[:\s]+"?([^",\n]+)"?/i);
    if (phoneMatch) {
      extracted.personalInfo.phone = phoneMatch[1].trim();
    }
    
    return extracted;
  }

  /**
   * Extract enhancement patterns
   */
  extractEnhancementPatterns(response) {
    return {
      enhancedContent: response,
      improvements: [],
      suggestions: []
    };
  }

  /**
   * Extract tailoring patterns
   */
  extractTailoringPatterns(response) {
    return {
      tailoredContent: response,
      jobMatch: {},
      optimizations: []
    };
  }

  /**
   * Extract cover letter patterns
   */
  extractCoverLetterPatterns(response) {
    return {
      content: response,
      structure: 'standard',
      wordCount: response.split(/\s+/).length
    };
  }

  /**
   * Extract file processing patterns
   */
  extractFileProcessingPatterns(response) {
    return {
      processedContent: response,
      fileType: 'unknown',
      metadata: {}
    };
  }

  /**
   * Extract job analysis patterns
   */
  extractJobAnalysisPatterns(response) {
    return {
      analysis: response,
      requirements: [],
      skills: []
    };
  }

  /**
   * Apply operation-specific processing
   */
  async applyOperationProcessing(parsedData, operation, options, puterData) {
    const processors = {
      'extract-cv': () => this.processExtractCV(parsedData, options, puterData),
      'enhance-cv': () => this.processEnhanceCV(parsedData, options, puterData),
      'tailor-cv': () => this.processTailorCV(parsedData, options, puterData),
      'generate-cover-letter': () => this.processGenerateCoverLetter(parsedData, options, puterData),
      'process-file': () => this.processFile(parsedData, options, puterData),
      'analyze-job': () => this.processAnalyzeJob(parsedData, options, puterData)
    };
    
    const processor = processors[operation];
    if (!processor) {
      throw new Error(`No processor found for operation: ${operation}`);
    }
    
    return await processor();
  }

  /**
   * Process CV extraction
   */
  async processExtractCV(parsedData, options, puterData) {
    return {
      ...parsedData,
      _extractionMetadata: {
        confidence: 85,
        model: puterData.model,
        extractedAt: new Date().toISOString(),
        engine: this.name
      }
    };
  }

  /**
   * Process CV enhancement
   */
  async processEnhanceCV(parsedData, options, puterData) {
    return {
      ...parsedData,
      _enhancementMetadata: {
        enhancementType: options.enhancementType,
        model: puterData.model,
        enhancedAt: new Date().toISOString(),
        engine: this.name
      }
    };
  }

  /**
   * Process CV tailoring
   */
  async processTailorCV(parsedData, options, puterData) {
    return {
      ...parsedData,
      _tailoringMetadata: {
        jobDescription: options.jobDescription,
        model: puterData.model,
        tailoredAt: new Date().toISOString(),
        engine: this.name
      }
    };
  }

  /**
   * Process cover letter generation
   */
  async processGenerateCoverLetter(parsedData, options, puterData) {
    return {
      ...parsedData,
      _coverLetterMetadata: {
        companyName: options.companyName,
        jobDescription: options.jobDescription,
        model: puterData.model,
        generatedAt: new Date().toISOString(),
        engine: this.name
      }
    };
  }

  /**
   * Process file processing
   */
  async processFile(parsedData, options, puterData) {
    return {
      ...parsedData,
      _fileMetadata: {
        fileType: options.fileType,
        model: puterData.model,
        processedAt: new Date().toISOString(),
        engine: this.name
      }
    };
  }

  /**
   * Process job analysis
   */
  async processAnalyzeJob(parsedData, options, puterData) {
    return {
      ...parsedData,
      _analysisMetadata: {
        jobDescription: options.jobDescription,
        model: puterData.model,
        analyzedAt: new Date().toISOString(),
        engine: this.name
      }
    };
  }

  /**
   * Validate processing result
   */
  validateResult(result, operation) {
    if (!result) {
      throw new Error('Processing result is empty');
    }

    // Operation-specific validation
    switch (operation) {
      case 'extract-cv':
        if (!result.personalInfo && !result.rawContent) {
          throw new Error('CV extraction failed - no personal info or content found');
        }
        break;
        
      case 'generate-cover-letter':
        if (!result.content && !result.rawContent) {
          throw new Error('Cover letter generation failed - no content generated');
        }
        break;
    }

    return result;
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'timeout',
      'network',
      'rate limit',
      'server error',
      'connection'
    ];
    
    return retryableErrors.some(type => 
      error.message.toLowerCase().includes(type)
    );
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise(timeoutMs) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);
    });
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `puter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log request processing
   */
  logRequest(requestId, operation, model, success) {
    const logEntry = {
      requestId,
      operation,
      model,
      success,
      timestamp: Date.now(),
      userId: 'system' // Will be updated by service manager
    };

    this.requestHistory.push(logEntry);
    
    // Keep only last 1000 entries
    if (this.requestHistory.length > 1000) {
      this.requestHistory = this.requestHistory.slice(-1000);
    }
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      engine: this.name,
      version: this.version,
      status: 'active',
      metrics: {
        activeRequests: this.activeRequests.size,
        queuedRequests: this.requestQueue.length,
        totalProcessed: this.requestHistory.length,
        successRate: this.calculateSuccessRate()
      },
      capabilities: [
        'Brutal request processing',
        'Rate limiting',
        'Retry logic',
        'Timeout handling',
        'Queue management',
        'Result validation'
      ],
      configuration: {
        timeout: this.requestTimeout,
        maxConcurrentRequests: this.maxConcurrentRequests,
        retryPolicy: this.retryPolicy
      }
    };
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate() {
    if (this.requestHistory.length === 0) return 0;
    
    const successful = this.requestHistory.filter(req => req.success).length;
    return Math.round((successful / this.requestHistory.length) * 100);
  }

  /**
   * Clear request history and reset metrics
   */
  clearHistory() {
    this.requestHistory = [];
    this.activeRequests.clear();
    this.requestQueue = [];
    console.log('🧹 Puter request engine history cleared');
  }
}

module.exports = PuterRequestEngine;
