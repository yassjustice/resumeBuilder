/**
 * Puter Authentication Engine
 * Handles brutal authentication and validation for Puter AI requests
 * Mirrors the authentication patterns from the tailoring system
 */

class PuterAuthEngine {
  constructor() {
    this.name = 'Puter Authentication Engine';
    this.version = '1.0.0';
    this.authTimeout = 30000; // 30 seconds
    this.maxRetries = 3;
    this.validationCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    console.log('🔐 Puter Authentication Engine initialized');
  }

  /**
   * Brutal authentication - validate Puter data structure and integrity
   * @param {Object} puterData - Raw Puter data from frontend
   * @returns {Promise<Object>} - Validated authentication result
   */
  async brutalAuth(puterData) {
    try {
      console.log('🔐 Starting brutal Puter authentication...');
      
      // 1. Basic structure validation
      this.validateBasicStructure(puterData);
      
      // 2. Model validation
      this.validateModel(puterData);
      
      // 3. Response integrity check
      this.validateResponseIntegrity(puterData);
      
      // 4. Content validation
      const contentValidation = await this.validateContent(puterData);
      
      // 5. Security checks
      this.performSecurityChecks(puterData);
      
      const authResult = {
        authenticated: true,
        model: puterData.model,
        timestamp: new Date().toISOString(),
        confidence: contentValidation.confidence,
        validationPassed: true,
        metadata: {
          engine: this.name,
          version: this.version,
          authMethod: 'brutal',
          validationSteps: [
            'structure',
            'model',
            'integrity',
            'content',
            'security'
          ]
        }
      };
      
      console.log('✅ Brutal authentication passed');
      return authResult;
      
    } catch (error) {
      console.error('❌ Brutal authentication failed:', error.message);
      throw new Error(`Puter authentication failed: ${error.message}`);
    }
  }

  /**
   * Validate basic Puter data structure
   */
  validateBasicStructure(puterData) {
    if (!puterData) {
      throw new Error('Puter data is required');
    }

    const requiredFields = ['model', 'originalResponse'];
    const missingFields = requiredFields.filter(field => !puterData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (typeof puterData.originalResponse !== 'string') {
      throw new Error('originalResponse must be a string');
    }

    if (puterData.originalResponse.length === 0) {
      throw new Error('originalResponse cannot be empty');
    }
  }

  /**
   * Validate Puter model
   */
  validateModel(puterData) {
    const supportedModels = [
      'gpt-4o-mini',
      'claude-3-5-haiku-20241022',
      'gemini-1.5-flash',
      'meta-llama/llama-3.2-3b-instruct'
    ];

    if (!supportedModels.includes(puterData.model)) {
      console.warn(`⚠️ Model ${puterData.model} not in supported list, but proceeding`);
    }

    // Check for model-specific validation
    if (puterData.model.includes('gpt') && !puterData.originalResponse.includes('```')) {
      console.warn('⚠️ GPT model response might not be properly formatted');
    }
  }

  /**
   * Validate response integrity
   */
  validateResponseIntegrity(puterData) {
    const response = puterData.originalResponse;
    
    // Check for common integrity issues
    if (response.length < 10) {
      throw new Error('Response too short to be valid');
    }

    if (response.length > 100000) {
      throw new Error('Response too long, possible data corruption');
    }

    // Check for malformed JSON indicators
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.warn('⚠️ Response may not contain valid JSON structure');
    }

    // Basic security checks
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /eval\(/i,
      /function\s*\(/i
    ];

    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(response)
    );

    if (hasSuspiciousContent) {
      throw new Error('Response contains suspicious content');
    }
  }

  /**
   * Validate content quality and structure
   */
  async validateContent(puterData) {
    const response = puterData.originalResponse;
    let confidence = 0;

    // Try to extract JSON content
    try {
      const cleanedResponse = this.cleanResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      if (parsed && typeof parsed === 'object') {
        confidence += 40;
      }
      
      // Check for common CV/job-related fields
      const expectedFields = ['name', 'email', 'experience', 'skills', 'education'];
      const foundFields = expectedFields.filter(field => 
        response.toLowerCase().includes(field.toLowerCase())
      );
      
      confidence += (foundFields.length / expectedFields.length) * 30;
      
      // Check response completeness
      if (response.length > 200) confidence += 20;
      if (response.length > 500) confidence += 10;
      
    } catch (error) {
      console.warn('⚠️ Content validation warning:', error.message);
      confidence = Math.max(confidence, 20); // Minimum confidence
    }

    return {
      confidence: Math.min(confidence, 100),
      hasValidStructure: confidence > 50,
      isComplete: confidence > 70
    };
  }

  /**
   * Perform security checks
   */
  performSecurityChecks(puterData) {
    const response = puterData.originalResponse;
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i
    ];

    const hasSqlInjection = sqlPatterns.some(pattern => 
      pattern.test(response)
    );

    if (hasSqlInjection) {
      throw new Error('Potential SQL injection detected');
    }

    // Check for XSS patterns
    const xssPatterns = [
      /<script.*?>.*?<\/script>/gi,
      /on\w+\s*=/i,
      /javascript:/i
    ];

    const hasXss = xssPatterns.some(pattern => 
      pattern.test(response)
    );

    if (hasXss) {
      throw new Error('Potential XSS attack detected');
    }

    console.log('✅ Security validation passed');
  }

  /**
   * Clean response for parsing
   */
  cleanResponse(response) {
    let cleaned = response.trim();
    
    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    return cleaned;
  }

  /**
   * Get authentication status
   */
  getStatus() {
    return {
      engine: this.name,
      version: this.version,
      status: 'active',
      capabilities: [
        'Brutal authentication',
        'Structure validation',
        'Model validation',
        'Integrity checks',
        'Content validation',
        'Security scanning'
      ],
      supportedModels: [
        'gpt-4o-mini',
        'claude-3-5-haiku-20241022',
        'gemini-1.5-flash',
        'meta-llama/llama-3.2-3b-instruct'
      ],
      metrics: {
        cacheSize: this.validationCache.size,
        maxRetries: this.maxRetries,
        timeout: this.authTimeout
      }
    };
  }

  /**
   * Clear authentication cache
   */
  clearCache() {
    this.validationCache.clear();
    console.log('🧹 Puter authentication cache cleared');
  }
}

module.exports = PuterAuthEngine;
