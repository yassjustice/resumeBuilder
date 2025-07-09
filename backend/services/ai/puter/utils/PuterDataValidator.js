/**
 * Puter Data Validator
 * Comprehensive validation utility for Puter AI responses
 * Follows the validation patterns from the tailoring system
 */

class PuterDataValidator {
  constructor() {
    this.name = 'Puter Data Validator';
    this.version = '1.0.0';
    this.validationRules = this.initializeValidationRules();
    this.validationCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    console.log('✅ Puter Data Validator initialized');
  }

  /**
   * Initialize validation rules
   */
  initializeValidationRules() {
    return {
      structure: {
        required: ['model', 'originalResponse'],
        optional: ['timestamp', 'metadata', 'confidence']
      },
      models: [
        'gpt-4o-mini',
        'claude-3-5-haiku-20241022',
        'gemini-1.5-flash',
        'meta-llama/llama-3.2-3b-instruct'
      ],
      response: {
        minLength: 10,
        maxLength: 100000,
        patterns: {
          json: /^\s*\{[\s\S]*\}\s*$/,
          codeBlock: /^```(?:json)?\s*([\s\S]*?)\s*```$/,
          suspiciousScript: /<script|javascript:|eval\(|function\s*\(/i
        }
      },
      operations: [
        'extract-cv',
        'enhance-cv',
        'tailor-cv',
        'generate-cover-letter',
        'process-file',
        'analyze-job'
      ]
    };
  }

  /**
   * Validate Puter data comprehensively
   * @param {Object} puterData - Puter data to validate
   * @param {string} operation - Operation type
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation result
   */
  async validatePuterData(puterData, operation, options = {}) {
    try {
      console.log(`✅ Validating Puter data for operation: ${operation}`);
      
      const validation = {
        valid: true,
        confidence: 0,
        errors: [],
        warnings: [],
        metadata: {
          validator: this.name,
          version: this.version,
          validatedAt: new Date().toISOString(),
          operation: operation
        }
      };
      
      // 1. Structure validation
      const structureValidation = this.validateStructure(puterData);
      validation.errors.push(...structureValidation.errors);
      validation.warnings.push(...structureValidation.warnings);
      validation.confidence += structureValidation.confidence;
      
      // 2. Model validation
      const modelValidation = this.validateModel(puterData);
      validation.errors.push(...modelValidation.errors);
      validation.warnings.push(...modelValidation.warnings);
      validation.confidence += modelValidation.confidence;
      
      // 3. Response validation
      const responseValidation = this.validateResponse(puterData);
      validation.errors.push(...responseValidation.errors);
      validation.warnings.push(...responseValidation.warnings);
      validation.confidence += responseValidation.confidence;
      
      // 4. Content validation
      const contentValidation = await this.validateContent(puterData, operation);
      validation.errors.push(...contentValidation.errors);
      validation.warnings.push(...contentValidation.warnings);
      validation.confidence += contentValidation.confidence;
      
      // 5. Security validation
      const securityValidation = this.validateSecurity(puterData);
      validation.errors.push(...securityValidation.errors);
      validation.warnings.push(...securityValidation.warnings);
      validation.confidence += securityValidation.confidence;
      
      // 6. Operation-specific validation
      const operationValidation = this.validateOperation(puterData, operation, options);
      validation.errors.push(...operationValidation.errors);
      validation.warnings.push(...operationValidation.warnings);
      validation.confidence += operationValidation.confidence;
      
      // Determine overall validity
      validation.valid = validation.errors.length === 0;
      validation.confidence = Math.min(validation.confidence, 100);
      
      // Cache validation result
      this.cacheValidation(puterData, operation, validation);
      
      console.log(`${validation.valid ? '✅' : '❌'} Validation completed: ${validation.confidence}% confidence`);
      return validation;
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return {
        valid: false,
        confidence: 0,
        errors: [error.message],
        warnings: [],
        metadata: {
          validator: this.name,
          version: this.version,
          validatedAt: new Date().toISOString(),
          operation: operation,
          error: true
        }
      };
    }
  }

  /**
   * Validate data structure
   */
  validateStructure(puterData) {
    const result = {
      errors: [],
      warnings: [],
      confidence: 0
    };
    
    // Check if data exists
    if (!puterData) {
      result.errors.push('Puter data is required');
      return result;
    }
    
    if (typeof puterData !== 'object') {
      result.errors.push('Puter data must be an object');
      return result;
    }
    
    // Check required fields
    const missingRequired = this.validationRules.structure.required.filter(
      field => !puterData[field]
    );
    
    if (missingRequired.length > 0) {
      result.errors.push(`Missing required fields: ${missingRequired.join(', ')}`);
    } else {
      result.confidence += 25;
    }
    
    // Check optional fields
    const presentOptional = this.validationRules.structure.optional.filter(
      field => puterData[field]
    );
    
    result.confidence += (presentOptional.length / this.validationRules.structure.optional.length) * 15;
    
    return result;
  }

  /**
   * Validate model
   */
  validateModel(puterData) {
    const result = {
      errors: [],
      warnings: [],
      confidence: 0
    };
    
    if (!puterData.model) {
      result.errors.push('Model is required');
      return result;
    }
    
    if (typeof puterData.model !== 'string') {
      result.errors.push('Model must be a string');
      return result;
    }
    
    if (this.validationRules.models.includes(puterData.model)) {
      result.confidence += 25;
    } else {
      result.warnings.push(`Model '${puterData.model}' is not in the supported list`);
      result.confidence += 15; // Partial confidence
    }
    
    return result;
  }

  /**
   * Validate response
   */
  validateResponse(puterData) {
    const result = {
      errors: [],
      warnings: [],
      confidence: 0
    };
    
    const response = puterData.originalResponse;
    
    if (!response) {
      result.errors.push('Original response is required');
      return result;
    }
    
    if (typeof response !== 'string') {
      result.errors.push('Original response must be a string');
      return result;
    }
    
    // Check length
    if (response.length < this.validationRules.response.minLength) {
      result.errors.push(`Response too short (minimum ${this.validationRules.response.minLength} characters)`);
      return result;
    }
    
    if (response.length > this.validationRules.response.maxLength) {
      result.errors.push(`Response too long (maximum ${this.validationRules.response.maxLength} characters)`);
      return result;
    }
    
    result.confidence += 20;
    
    // Check for suspicious patterns
    if (this.validationRules.response.patterns.suspiciousScript.test(response)) {
      result.errors.push('Response contains suspicious script content');
      return result;
    }
    
    result.confidence += 10;
    
    return result;
  }

  /**
   * Validate content
   */
  async validateContent(puterData, operation) {
    const result = {
      errors: [],
      warnings: [],
      confidence: 0
    };
    
    const response = puterData.originalResponse;
    
    // Try to parse as JSON
    try {
      const cleaned = this.cleanResponse(response);
      const parsed = JSON.parse(cleaned);
      
      if (parsed && typeof parsed === 'object') {
        result.confidence += 20;
        
        // Check for operation-specific content
        const contentValidation = this.validateContentForOperation(parsed, operation);
        result.confidence += contentValidation.confidence;
        result.warnings.push(...contentValidation.warnings);
      }
      
    } catch (error) {
      result.warnings.push('Response is not valid JSON, attempting structured parsing');
      
      // Try structured parsing
      const structuredData = this.extractStructuredData(response, operation);
      if (structuredData && Object.keys(structuredData).length > 0) {
        result.confidence += 10;
      }
    }
    
    // Check content richness
    if (response.length > 200) result.confidence += 5;
    if (response.length > 500) result.confidence += 5;
    if (response.length > 1000) result.confidence += 5;
    
    return result;
  }

  /**
   * Validate content for specific operation
   */
  validateContentForOperation(parsedData, operation) {
    const result = {
      confidence: 0,
      warnings: []
    };
    
    switch (operation) {
      case 'extract-cv':
        if (parsedData.name || parsedData.personalInfo) result.confidence += 15;
        if (parsedData.experience || parsedData.workExperience) result.confidence += 15;
        if (parsedData.skills) result.confidence += 10;
        if (parsedData.education) result.confidence += 10;
        break;
        
      case 'enhance-cv':
        if (parsedData.enhancedContent || parsedData.improvements) result.confidence += 20;
        if (parsedData.suggestions) result.confidence += 10;
        break;
        
      case 'tailor-cv':
        if (parsedData.tailoredContent || parsedData.tailoredCV) result.confidence += 20;
        if (parsedData.jobMatch || parsedData.matchScore) result.confidence += 10;
        break;
        
      case 'generate-cover-letter':
        if (parsedData.content || parsedData.coverLetter) result.confidence += 20;
        if (parsedData.wordCount || parsedData.length) result.confidence += 5;
        break;
        
      case 'process-file':
        if (parsedData.processedContent) result.confidence += 15;
        if (parsedData.fileType) result.confidence += 10;
        break;
        
      case 'analyze-job':
        if (parsedData.analysis || parsedData.jobAnalysis) result.confidence += 15;
        if (parsedData.requirements) result.confidence += 10;
        if (parsedData.skills) result.confidence += 10;
        break;
    }
    
    return result;
  }

  /**
   * Validate security
   */
  validateSecurity(puterData) {
    const result = {
      errors: [],
      warnings: [],
      confidence: 0
    };
    
    const response = puterData.originalResponse;
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /alter\s+table/i,
      /create\s+table/i
    ];
    
    const hasSqlInjection = sqlPatterns.some(pattern => pattern.test(response));
    if (hasSqlInjection) {
      result.errors.push('Potential SQL injection detected');
      return result;
    }
    
    // Check for XSS patterns
    const xssPatterns = [
      /<script.*?>.*?<\/script>/gi,
      /on\w+\s*=/i,
      /javascript:/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
    
    const hasXss = xssPatterns.some(pattern => pattern.test(response));
    if (hasXss) {
      result.errors.push('Potential XSS attack detected');
      return result;
    }
    
    // Check for command injection
    const commandPatterns = [
      /\|\s*\w+/,
      /;\s*\w+/,
      /&&\s*\w+/,
      /\$\(/,
      /`[^`]*`/
    ];
    
    const hasCommandInjection = commandPatterns.some(pattern => pattern.test(response));
    if (hasCommandInjection) {
      result.warnings.push('Potential command injection patterns detected');
    }
    
    result.confidence += 20;
    
    return result;
  }

  /**
   * Validate operation
   */
  validateOperation(puterData, operation, options) {
    const result = {
      errors: [],
      warnings: [],
      confidence: 0
    };
    
    // Check if operation is supported
    if (!this.validationRules.operations.includes(operation)) {
      result.errors.push(`Unsupported operation: ${operation}`);
      return result;
    }
    
    result.confidence += 10;
    
    // Operation-specific validation
    switch (operation) {
      case 'enhance-cv':
        if (!options.enhancementType) {
          result.warnings.push('Enhancement type not specified');
        } else {
          result.confidence += 5;
        }
        break;
        
      case 'tailor-cv':
        if (!options.jobDescription) {
          result.warnings.push('Job description not provided');
        } else {
          result.confidence += 5;
        }
        break;
        
      case 'generate-cover-letter':
        if (!options.jobDescription || !options.companyName) {
          result.warnings.push('Job description and company name recommended');
        } else {
          result.confidence += 5;
        }
        break;
        
      case 'process-file':
        if (!options.fileType) {
          result.warnings.push('File type not specified');
        } else {
          result.confidence += 5;
        }
        break;
    }
    
    return result;
  }

  /**
   * Clean response for parsing
   */
  cleanResponse(response) {
    let cleaned = response.trim();
    
    // Remove markdown code blocks
    const codeBlockMatch = cleaned.match(this.validationRules.response.patterns.codeBlock);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1];
    }
    
    // Remove common AI response prefixes
    const prefixes = [
      'Here is the',
      'Here\'s the',
      'Based on',
      'According to',
      'The following is',
      'Here\'s a',
      'Here is a'
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
    const structured = {};
    
    // Extract key-value pairs
    const keyValueRegex = /(\w+):\s*([^,\n]+)/g;
    let match;
    
    while ((match = keyValueRegex.exec(response)) !== null) {
      const key = match[1].toLowerCase();
      const value = match[2].trim();
      structured[key] = value;
    }
    
    // Extract arrays
    const arrayRegex = /(\w+):\s*\[(.*?)\]/g;
    while ((match = arrayRegex.exec(response)) !== null) {
      const key = match[1].toLowerCase();
      const value = match[2].split(',').map(item => item.trim().replace(/['"]/g, ''));
      structured[key] = value;
    }
    
    return structured;
  }

  /**
   * Cache validation result
   */
  cacheValidation(puterData, operation, validation) {
    const cacheKey = `${puterData.model}_${operation}_${Date.now()}`;
    
    this.validationCache.set(cacheKey, {
      validation,
      timestamp: Date.now()
    });
    
    // Clean expired cache
    this.cleanExpiredCache();
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache() {
    const now = Date.now();
    
    for (const [key, value] of this.validationCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.validationCache.delete(key);
      }
    }
  }

  /**
   * Get validator status
   */
  getStatus() {
    return {
      validator: this.name,
      version: this.version,
      status: 'active',
      metrics: {
        cacheSize: this.validationCache.size,
        cacheTimeout: this.cacheTimeout
      },
      capabilities: [
        'Structure validation',
        'Model validation',
        'Response validation',
        'Content validation',
        'Security validation',
        'Operation validation'
      ],
      validationRules: {
        supportedModels: this.validationRules.models.length,
        supportedOperations: this.validationRules.operations.length,
        responseMinLength: this.validationRules.response.minLength,
        responseMaxLength: this.validationRules.response.maxLength
      }
    };
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
    console.log('🧹 Puter validator cache cleared');
  }
}

module.exports = PuterDataValidator;
