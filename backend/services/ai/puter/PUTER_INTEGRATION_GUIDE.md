# Puter Modular System Integration Guide

## Overview

This guide provides comprehensive instructions for integrating the Puter Modular System v2.0 into your application. The system follows the same modular architecture as the backend Gemini AI system but with Puter-specific brutal authentication, request processing, and response handling.

## Quick Start

### 1. Basic Setup

```javascript
// Import the modular service
const { puterModularService } = require('../services/ai/puter');

// Check service status
const status = puterModularService.getStatus();
console.log('Service Status:', status);
```

### 2. Simple CV Extraction

```javascript
async function extractCV(puterData) {
  try {
    const result = await puterModularService.extractCVFromPuterData(puterData, {
      userId: 'user123',
      extractionDepth: 'comprehensive'
    });
    
    console.log('Extracted CV:', result.data);
    return result;
  } catch (error) {
    console.error('Extraction failed:', error.message);
    throw error;
  }
}
```

## Integration Patterns

### 1. Frontend Integration

#### React Component Example

```javascript
import React, { useState } from 'react';
import axios from 'axios';

const PuterCVExtractor = () => {
  const [puterData, setPuterData] = useState(null);
  const [extractedCV, setExtractedCV] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractCV = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/puter/v2/extract-cv', {
        puterData,
        options: {
          extractionDepth: 'comprehensive',
          validateStructure: true
        }
      });
      
      setExtractedCV(response.data.data);
    } catch (error) {
      console.error('CV extraction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={extractCV} disabled={loading}>
        {loading ? 'Extracting...' : 'Extract CV'}
      </button>
      {extractedCV && (
        <div>
          <h3>Extracted CV</h3>
          <pre>{JSON.stringify(extractedCV, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

### 2. Backend Integration

#### Express Route Integration

```javascript
const express = require('express');
const { puterModularService } = require('../services/ai/puter');

const router = express.Router();

router.post('/custom-cv-processing', async (req, res) => {
  try {
    const { puterData, originalCV, jobData } = req.body;
    
    // Step 1: Extract CV if needed
    let cvData = originalCV;
    if (!cvData && puterData) {
      const extraction = await puterModularService.extractCVFromPuterData(puterData);
      cvData = extraction.data;
    }
    
    // Step 2: Analyze job if provided
    let jobAnalysis = null;
    if (jobData) {
      const analysis = await puterModularService.analyzeJobFromPuterData(jobData);
      jobAnalysis = analysis.jobAnalysis;
    }
    
    // Step 3: Tailor CV if job analysis available
    let tailoredCV = cvData;
    if (jobAnalysis) {
      const tailoring = await puterModularService.tailorCVFromPuterData(
        puterData,
        cvData,
        jobData
      );
      tailoredCV = tailoring.tailoredCV;
    }
    
    res.json({
      success: true,
      originalCV: cvData,
      jobAnalysis,
      tailoredCV,
      processingPipeline: ['extraction', 'analysis', 'tailoring']
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 3. Service Integration

#### Custom Service Wrapper

```javascript
class CustomPuterService {
  constructor() {
    this.puterService = require('../services/ai/puter').puterModularService;
  }

  async processCompleteWorkflow(puterData, options = {}) {
    const results = {};
    
    try {
      // 1. Extract CV
      console.log('🔍 Extracting CV...');
      results.cvExtraction = await this.puterService.extractCVFromPuterData(
        puterData,
        { ...options, operation: 'extract' }
      );
      
      // 2. Enhance CV
      console.log('⚡ Enhancing CV...');
      results.cvEnhancement = await this.puterService.enhanceCVFromPuterData(
        puterData,
        { ...options, operation: 'enhance' }
      );
      
      // 3. Generate metrics
      results.metrics = this.calculateMetrics(results);
      
      return {
        success: true,
        results,
        workflow: 'complete'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        partialResults: results
      };
    }
  }

  calculateMetrics(results) {
    return {
      extractionConfidence: results.cvExtraction?.responseMetadata?.confidence || 0,
      enhancementQuality: results.cvEnhancement?.responseMetadata?.quality || 0,
      overallScore: 0 // Calculate based on your logic
    };
  }
}
```

## Advanced Usage

### 1. Batch Processing

```javascript
async function batchProcessCVs(puterDataArray) {
  const results = [];
  const batchSize = 5; // Process 5 at a time
  
  for (let i = 0; i < puterDataArray.length; i += batchSize) {
    const batch = puterDataArray.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (puterData, index) => {
      try {
        const result = await puterModularService.extractCVFromPuterData(puterData, {
          batchIndex: i + index,
          batchId: `batch_${Math.floor(i / batchSize)}`
        });
        
        return {
          success: true,
          index: i + index,
          data: result.data
        };
      } catch (error) {
        return {
          success: false,
          index: i + index,
          error: error.message
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Optional: Add delay between batches
    if (i + batchSize < puterDataArray.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
```

### 2. Stream Processing

```javascript
const { Readable, Transform } = require('stream');

class PuterProcessingStream extends Transform {
  constructor(options = {}) {
    super({ objectMode: true });
    this.puterService = require('../services/ai/puter').puterModularService;
    this.options = options;
  }

  async _transform(puterData, encoding, callback) {
    try {
      const result = await this.puterService.extractCVFromPuterData(
        puterData,
        this.options
      );
      
      this.push({
        input: puterData,
        output: result.data,
        metadata: result.metadata
      });
      
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

// Usage
const processingStream = new PuterProcessingStream({
  extractionDepth: 'comprehensive'
});

processingStream.on('data', (result) => {
  console.log('Processed:', result.output);
});

processingStream.on('error', (error) => {
  console.error('Processing error:', error);
});
```

### 3. Custom Validation

```javascript
class CustomPuterValidator {
  constructor() {
    this.puterService = require('../services/ai/puter').puterModularService;
  }

  async validateAndProcess(puterData, customRules = {}) {
    // Custom validation logic
    const customValidation = await this.customValidate(puterData, customRules);
    
    if (!customValidation.valid) {
      throw new Error(`Custom validation failed: ${customValidation.errors.join(', ')}`);
    }
    
    // Process with additional options based on validation
    const processingOptions = {
      ...customValidation.processingOptions,
      validationLevel: 'custom',
      customRules: customRules
    };
    
    return await this.puterService.extractCVFromPuterData(puterData, processingOptions);
  }

  async customValidate(puterData, rules) {
    const validation = {
      valid: true,
      errors: [],
      processingOptions: {}
    };
    
    // Custom rule: Minimum response length
    if (rules.minResponseLength && puterData.originalResponse.length < rules.minResponseLength) {
      validation.errors.push(`Response too short: ${puterData.originalResponse.length} < ${rules.minResponseLength}`);
      validation.valid = false;
    }
    
    // Custom rule: Required fields
    if (rules.requiredFields) {
      const missing = rules.requiredFields.filter(field => !puterData[field]);
      if (missing.length > 0) {
        validation.errors.push(`Missing required fields: ${missing.join(', ')}`);
        validation.valid = false;
      }
    }
    
    // Custom rule: Model preferences
    if (rules.preferredModels && !rules.preferredModels.includes(puterData.model)) {
      validation.processingOptions.modelWarning = true;
    }
    
    return validation;
  }
}
```

## Error Handling Patterns

### 1. Comprehensive Error Handling

```javascript
async function robustPuterProcessing(puterData, options = {}) {
  const maxRetries = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Processing attempt ${attempt}/${maxRetries}`);
      
      const result = await puterModularService.extractCVFromPuterData(puterData, {
        ...options,
        attempt,
        maxRetries
      });
      
      return {
        success: true,
        data: result.data,
        attempt,
        metadata: result.metadata
      };
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      // Check if error is retryable
      if (!isRetryableError(error) || attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return {
    success: false,
    error: lastError.message,
    attempts: maxRetries,
    retryable: isRetryableError(lastError)
  };
}

function isRetryableError(error) {
  const retryableErrors = [
    'timeout',
    'rate limit',
    'server error',
    'network error',
    'connection'
  ];
  
  return retryableErrors.some(type => 
    error.message.toLowerCase().includes(type)
  );
}
```

### 2. Graceful Degradation

```javascript
async function processWithFallback(puterData, options = {}) {
  try {
    // Try primary processing
    return await puterModularService.extractCVFromPuterData(puterData, options);
    
  } catch (primaryError) {
    console.warn('Primary processing failed, trying fallback:', primaryError.message);
    
    try {
      // Fallback to basic extraction
      return await puterModularService.extractCVFromPuterData(puterData, {
        ...options,
        extractionDepth: 'basic',
        fallbackMode: true
      });
      
    } catch (fallbackError) {
      console.error('Fallback processing failed:', fallbackError.message);
      
      // Return minimal structure
      return {
        success: false,
        data: {
          personalInfo: {},
          rawContent: puterData.originalResponse,
          fallbackMode: true,
          errors: [primaryError.message, fallbackError.message]
        },
        metadata: {
          processingMode: 'emergency_fallback',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}
```

## Performance Optimization

### 1. Caching Strategy

```javascript
class PuterCacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  generateCacheKey(puterData, operation, options) {
    const keyData = {
      model: puterData.model,
      responseHash: this.hashString(puterData.originalResponse),
      operation,
      options: JSON.stringify(options)
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  async getCachedResult(puterData, operation, options) {
    const cacheKey = this.generateCacheKey(puterData, operation, options);
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log('📋 Returning cached result');
      return cached.data;
    }
    
    return null;
  }

  setCachedResult(puterData, operation, options, result) {
    const cacheKey = this.generateCacheKey(puterData, operation, options);
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}
```

### 2. Rate Limiting

```javascript
class PuterRateLimiter {
  constructor(maxRequests = 30, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  async checkRateLimit(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests
    const validRequests = userRequests.filter(
      timestamp => (now - timestamp) < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(userId, validRequests);
    
    return true;
  }
}
```

## Testing Integration

### 1. Unit Tests

```javascript
const { puterModularService } = require('../services/ai/puter');

describe('Puter Modular Service', () => {
  beforeEach(() => {
    // Reset service state
    puterModularService.clearAllCaches();
    puterModularService.resetMetrics();
  });

  describe('CV Extraction', () => {
    it('should extract CV from valid Puter data', async () => {
      const mockPuterData = {
        model: 'gpt-4o-mini',
        originalResponse: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          experience: []
        })
      };

      const result = await puterModularService.extractCVFromPuterData(mockPuterData);
      
      expect(result.success).toBe(true);
      expect(result.data.personalInfo.name).toBe('John Doe');
      expect(result.data.personalInfo.email).toBe('john@example.com');
    });

    it('should handle invalid Puter data', async () => {
      const invalidPuterData = {
        model: 'invalid-model',
        originalResponse: 'invalid json'
      };

      await expect(
        puterModularService.extractCVFromPuterData(invalidPuterData)
      ).rejects.toThrow();
    });
  });
});
```

### 2. Integration Tests

```javascript
const request = require('supertest');
const app = require('../app');

describe('Puter API Integration', () => {
  describe('POST /api/puter/v2/extract-cv', () => {
    it('should extract CV via API', async () => {
      const response = await request(app)
        .post('/api/puter/v2/extract-cv')
        .send({
          puterData: {
            model: 'gpt-4o-mini',
            originalResponse: JSON.stringify({
              name: 'Jane Doe',
              email: 'jane@example.com'
            })
          },
          options: {
            extractionDepth: 'comprehensive'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.personalInfo.name).toBe('Jane Doe');
    });
  });
});
```

## Monitoring and Metrics

### 1. Metrics Collection

```javascript
class PuterMetricsCollector {
  constructor() {
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      averageResponseTime: 0,
      operationMetrics: {}
    };
  }

  recordRequest(operation, success, responseTime) {
    this.metrics.requests++;
    
    if (success) {
      this.metrics.successes++;
    } else {
      this.metrics.failures++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (this.metrics.requests - 1)) + responseTime
    ) / this.metrics.requests;
    
    // Update operation metrics
    if (!this.metrics.operationMetrics[operation]) {
      this.metrics.operationMetrics[operation] = {
        count: 0,
        successes: 0,
        failures: 0,
        avgResponseTime: 0
      };
    }
    
    const opMetrics = this.metrics.operationMetrics[operation];
    opMetrics.count++;
    
    if (success) {
      opMetrics.successes++;
    } else {
      opMetrics.failures++;
    }
    
    opMetrics.avgResponseTime = (
      (opMetrics.avgResponseTime * (opMetrics.count - 1)) + responseTime
    ) / opMetrics.count;
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.requests > 0 
        ? (this.metrics.successes / this.metrics.requests) * 100 
        : 0
    };
  }
}
```

### 2. Health Checks

```javascript
async function performHealthCheck() {
  const healthStatus = {
    service: 'healthy',
    engines: {},
    timestamp: new Date().toISOString()
  };

  try {
    // Check service status
    const status = puterModularService.getStatus();
    healthStatus.serviceStatus = status.status;
    healthStatus.version = status.version;
    
    // Check each engine
    for (const [engineName, engineStatus] of Object.entries(status.engines)) {
      healthStatus.engines[engineName] = engineStatus.status;
    }
    
    // Perform basic functionality test
    const testPuterData = {
      model: 'gpt-4o-mini',
      originalResponse: JSON.stringify({ test: 'data' })
    };
    
    await puterModularService.extractCVFromPuterData(testPuterData, {
      healthCheck: true
    });
    
    healthStatus.functionalityTest = 'passed';
    
  } catch (error) {
    healthStatus.service = 'unhealthy';
    healthStatus.error = error.message;
    healthStatus.functionalityTest = 'failed';
  }

  return healthStatus;
}
```

## Best Practices

### 1. **Always Validate Input**
```javascript
// Good
const validation = await puterModularService.dataValidator.validatePuterData(puterData, operation);
if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}

// Bad
await puterModularService.extractCVFromPuterData(puterData); // No validation
```

### 2. **Handle Errors Gracefully**
```javascript
// Good
try {
  const result = await puterModularService.extractCVFromPuterData(puterData);
  return result;
} catch (error) {
  console.error('Processing failed:', error.message);
  return fallbackResult;
}

// Bad
const result = await puterModularService.extractCVFromPuterData(puterData); // No error handling
```

### 3. **Use Appropriate Options**
```javascript
// Good
const result = await puterModularService.extractCVFromPuterData(puterData, {
  extractionDepth: 'comprehensive',
  validateStructure: true,
  userId: currentUser.id
});

// Bad
const result = await puterModularService.extractCVFromPuterData(puterData); // No options
```

### 4. **Monitor Performance**
```javascript
// Good
const startTime = Date.now();
const result = await puterModularService.extractCVFromPuterData(puterData);
const responseTime = Date.now() - startTime;
console.log(`Processing took ${responseTime}ms`);

// Bad
const result = await puterModularService.extractCVFromPuterData(puterData); // No monitoring
```

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Failures**
   - Check Puter data structure
   - Verify model compatibility
   - Ensure response format is correct

2. **Rate Limiting**
   - Implement exponential backoff
   - Use user-specific rate limiting
   - Monitor request patterns

3. **Performance Issues**
   - Enable caching
   - Use appropriate batch sizes
   - Monitor resource usage

4. **Memory Leaks**
   - Clear caches regularly
   - Monitor memory usage
   - Use proper cleanup

---

This integration guide provides comprehensive examples and patterns for implementing the Puter Modular System v2.0 in your applications. Follow the best practices and monitoring guidelines to ensure optimal performance and reliability.
