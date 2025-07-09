/**
 * Puter Auth Engine Test Suite
 * Tests for brutal authentication and validation
 */

const { describe, it, beforeEach, expect } = require('@jest/globals');
const PuterAuthEngine = require('../engines/PuterAuthEngine');

describe('PuterAuthEngine', () => {
  let authEngine;
  let validPuterData;
  let invalidPuterData;

  beforeEach(() => {
    authEngine = new PuterAuthEngine();
    
    validPuterData = {
      model: 'claude-3-5-sonnet-20241022',
      originalResponse: '{"personalInfo":{"name":"John Doe","email":"john@example.com"}}',
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'puter-ai'
      }
    };

    invalidPuterData = {
      model: null,
      originalResponse: 'invalid json',
      metadata: {}
    };
  });

  describe('Initialization', () => {
    it('should initialize with correct properties', () => {
      expect(authEngine.name).toBe('Puter Authentication Engine');
      expect(authEngine.version).toBe('1.0.0');
      expect(authEngine.authTimeout).toBe(30000);
      expect(authEngine.maxRetries).toBe(3);
    });

    it('should initialize validation cache', () => {
      expect(authEngine.validationCache).toBeDefined();
      expect(authEngine.validationCache instanceof Map).toBe(true);
    });
  });

  describe('Brutal Authentication', () => {
    it('should authenticate valid Puter data', async () => {
      const result = await authEngine.brutalAuth(validPuterData);
      
      expect(result.authenticated).toBe(true);
      expect(result.model).toBe('claude-3-5-sonnet-20241022');
      expect(result.validationPassed).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should reject invalid model', async () => {
      await expect(authEngine.brutalAuth(invalidPuterData))
        .rejects.toThrow('Invalid model');
    });

    it('should validate response integrity', async () => {
      const malformedData = {
        ...validPuterData,
        originalResponse: 'malformed json'
      };
      
      await expect(authEngine.brutalAuth(malformedData))
        .rejects.toThrow('Response integrity validation failed');
    });
  });

  describe('Structure Validation', () => {
    it('should validate basic structure', () => {
      expect(() => authEngine.validateBasicStructure(validPuterData))
        .not.toThrow();
    });

    it('should reject missing required fields', () => {
      const incompleteData = { model: 'claude-3-5-sonnet-20241022' };
      
      expect(() => authEngine.validateBasicStructure(incompleteData))
        .toThrow('Missing required field: originalResponse');
    });

    it('should validate metadata structure', () => {
      const dataWithoutMetadata = {
        ...validPuterData,
        metadata: null
      };
      
      expect(() => authEngine.validateBasicStructure(dataWithoutMetadata))
        .toThrow('Missing required field: metadata');
    });
  });

  describe('Model Validation', () => {
    it('should validate supported models', () => {
      expect(() => authEngine.validateModel(validPuterData))
        .not.toThrow();
    });

    it('should reject unsupported models', () => {
      const unsupportedModelData = {
        ...validPuterData,
        model: 'unsupported-model-v1'
      };
      
      expect(() => authEngine.validateModel(unsupportedModelData))
        .toThrow('Unsupported model: unsupported-model-v1');
    });

    it('should reject null or undefined models', () => {
      const nullModelData = { ...validPuterData, model: null };
      
      expect(() => authEngine.validateModel(nullModelData))
        .toThrow('Invalid model: null');
    });
  });

  describe('Content Validation', () => {
    it('should validate content structure', async () => {
      const result = await authEngine.validateContent(validPuterData);
      
      expect(result.valid).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.structure).toBeDefined();
    });

    it('should detect malformed JSON', async () => {
      const malformedData = {
        ...validPuterData,
        originalResponse: '{"malformed": json}'
      };
      
      const result = await authEngine.validateContent(malformedData);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid JSON format');
    });

    it('should validate content quality', async () => {
      const lowQualityData = {
        ...validPuterData,
        originalResponse: '{"empty": ""}'
      };
      
      const result = await authEngine.validateContent(lowQualityData);
      
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Security Checks', () => {
    it('should perform security validation', () => {
      expect(() => authEngine.performSecurityChecks(validPuterData))
        .not.toThrow();
    });

    it('should detect suspicious patterns', () => {
      const suspiciousData = {
        ...validPuterData,
        originalResponse: '{"script": "<script>alert(1)</script>"}'
      };
      
      expect(() => authEngine.performSecurityChecks(suspiciousData))
        .toThrow('Security threat detected');
    });

    it('should validate data size limits', () => {
      const largeData = {
        ...validPuterData,
        originalResponse: JSON.stringify({ data: 'x'.repeat(10000000) })
      };
      
      expect(() => authEngine.performSecurityChecks(largeData))
        .toThrow('Data size exceeds limits');
    });
  });

  describe('Caching', () => {
    it('should cache validation results', async () => {
      const cacheKey = authEngine.generateCacheKey(validPuterData);
      
      await authEngine.brutalAuth(validPuterData);
      
      expect(authEngine.validationCache.has(cacheKey)).toBe(true);
    });

    it('should use cached results', async () => {
      // First call
      const result1 = await authEngine.brutalAuth(validPuterData);
      
      // Second call (should use cache)
      const result2 = await authEngine.brutalAuth(validPuterData);
      
      expect(result1.timestamp).toBe(result2.timestamp);
    });

    it('should expire cached results', async () => {
      const shortTimeoutEngine = new PuterAuthEngine();
      shortTimeoutEngine.cacheTimeout = 100; // 100ms
      
      await shortTimeoutEngine.brutalAuth(validPuterData);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const cacheKey = shortTimeoutEngine.generateCacheKey(validPuterData);
      expect(shortTimeoutEngine.validationCache.has(cacheKey)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication timeout', async () => {
      const timeoutEngine = new PuterAuthEngine();
      timeoutEngine.authTimeout = 1; // 1ms timeout
      
      const slowData = {
        ...validPuterData,
        originalResponse: JSON.stringify({ large: 'x'.repeat(1000000) })
      };
      
      await expect(timeoutEngine.brutalAuth(slowData))
        .rejects.toThrow('Authentication timeout');
    });

    it('should retry on transient failures', async () => {
      const retryEngine = new PuterAuthEngine();
      retryEngine.maxRetries = 2;
      
      // Mock a method to fail twice then succeed
      let attempts = 0;
      const originalValidateContent = retryEngine.validateContent;
      retryEngine.validateContent = async (data) => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Transient error');
        }
        return originalValidateContent.call(retryEngine, data);
      };
      
      const result = await retryEngine.brutalAuth(validPuterData);
      
      expect(result.authenticated).toBe(true);
      expect(attempts).toBe(3);
    });
  });

  describe('Performance', () => {
    it('should complete authentication within timeout', async () => {
      const startTime = Date.now();
      
      await authEngine.brutalAuth(validPuterData);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(authEngine.authTimeout);
    });

    it('should handle multiple concurrent authentications', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        const data = {
          ...validPuterData,
          metadata: { ...validPuterData.metadata, id: i }
        };
        return authEngine.brutalAuth(data);
      });
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.authenticated).toBe(true);
      });
    });
  });
});
