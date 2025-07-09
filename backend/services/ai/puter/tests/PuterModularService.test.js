/**
 * Puter Modular Service Test Suite
 * Comprehensive testing for the modular Puter architecture
 */

const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');
const PuterModularService = require('../PuterModularService');

describe('PuterModularService', () => {
  let puterService;
  let mockPuterData;
  let mockOptions;

  beforeEach(() => {
    puterService = new PuterModularService();
    
    // Mock valid Puter data
    mockPuterData = {
      model: 'claude-3-5-sonnet-20241022',
      originalResponse: '{"personalInfo":{"name":"John Doe","email":"john@example.com"},"experience":[{"title":"Software Engineer","company":"Tech Corp","duration":"2020-2023"}]}',
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'puter-ai'
      }
    };

    mockOptions = {
      language: 'en',
      format: 'json',
      strict: true
    };
  });

  afterEach(() => {
    // Clean up any resources
    if (puterService && puterService.cleanup) {
      puterService.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should initialize with correct properties', () => {
      expect(puterService.name).toBe('Puter Modular Service');
      expect(puterService.version).toBe('2.0.0');
      expect(puterService.architecture).toBe('Modular');
      expect(puterService.config.brutalMode).toBe(true);
    });

    it('should initialize all engines', () => {
      expect(puterService.authEngine).toBeDefined();
      expect(puterService.requestEngine).toBeDefined();
      expect(puterService.responseEngine).toBeDefined();
      expect(puterService.jobAnalysisEngine).toBeDefined();
      expect(puterService.cvTailoringEngine).toBeDefined();
    });

    it('should initialize utilities', () => {
      expect(puterService.dataValidator).toBeDefined();
      expect(puterService.responseParser).toBeDefined();
    });
  });

  describe('CV Extraction', () => {
    it('should extract CV data successfully', async () => {
      const result = await puterService.extractCVFromPuterData(mockPuterData, mockOptions);
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('extract-cv');
      expect(result.data).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should handle invalid Puter data', async () => {
      const invalidData = { ...mockPuterData, model: null };
      
      await expect(puterService.extractCVFromPuterData(invalidData, mockOptions))
        .rejects.toThrow();
    });

    it('should track metrics for CV extraction', async () => {
      const initialCount = puterService.metrics.operationCounts['extract-cv'] || 0;
      
      await puterService.extractCVFromPuterData(mockPuterData, mockOptions);
      
      expect(puterService.metrics.operationCounts['extract-cv']).toBe(initialCount + 1);
    });
  });

  describe('CV Enhancement', () => {
    it('should enhance CV data successfully', async () => {
      const result = await puterService.enhanceCVFromPuterData(mockPuterData, mockOptions);
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('enhance-cv');
      expect(result.data).toBeDefined();
    });

    it('should apply enhancement algorithms', async () => {
      const result = await puterService.enhanceCVFromPuterData(mockPuterData, {
        ...mockOptions,
        enhancement: {
          improveDescriptions: true,
          optimizeKeywords: true,
          enhanceFormatting: true
        }
      });
      
      expect(result.data.enhanced).toBe(true);
      expect(result.data.enhancements).toBeDefined();
    });
  });

  describe('Job Analysis', () => {
    it('should analyze job description successfully', async () => {
      const jobData = {
        ...mockPuterData,
        originalResponse: '{"jobTitle":"Senior Developer","requirements":["React","Node.js"],"responsibilities":["Lead development team"]}'
      };
      
      const result = await puterService.analyzeJobFromPuterData(jobData, mockOptions);
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('analyze-job');
      expect(result.data.analysis).toBeDefined();
    });

    it('should extract job requirements', async () => {
      const jobData = {
        ...mockPuterData,
        originalResponse: '{"requirements":["Python","Django","PostgreSQL"]}'
      };
      
      const result = await puterService.analyzeJobFromPuterData(jobData, mockOptions);
      
      expect(result.data.requirements).toBeDefined();
      expect(Array.isArray(result.data.requirements)).toBe(true);
    });
  });

  describe('CV Tailoring', () => {
    it('should tailor CV successfully', async () => {
      const tailoringData = {
        cv: mockPuterData,
        jobDescription: {
          ...mockPuterData,
          originalResponse: '{"jobTitle":"Frontend Developer","requirements":["React","TypeScript"]}'
        }
      };
      
      const result = await puterService.tailorCVFromPuterData(tailoringData, mockOptions);
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('tailor-cv');
      expect(result.data.tailored).toBe(true);
    });

    it('should match CV skills to job requirements', async () => {
      const tailoringData = {
        cv: mockPuterData,
        jobDescription: {
          ...mockPuterData,
          originalResponse: '{"requirements":["JavaScript","React","Node.js"]}'
        }
      };
      
      const result = await puterService.tailorCVFromPuterData(tailoringData, mockOptions);
      
      expect(result.data.matching).toBeDefined();
      expect(result.data.matching.score).toBeGreaterThan(0);
    });
  });

  describe('Cover Letter Generation', () => {
    it('should generate cover letter successfully', async () => {
      const coverLetterData = {
        cv: mockPuterData,
        jobDescription: {
          ...mockPuterData,
          originalResponse: '{"jobTitle":"Software Engineer","company":"Tech Corp"}'
        }
      };
      
      const result = await puterService.generateCoverLetterFromPuterData(coverLetterData, mockOptions);
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('generate-cover-letter');
      expect(result.data.coverLetter).toBeDefined();
    });

    it('should personalize cover letter content', async () => {
      const coverLetterData = {
        cv: mockPuterData,
        jobDescription: {
          ...mockPuterData,
          originalResponse: '{"jobTitle":"Developer","company":"StartupCorp"}'
        }
      };
      
      const result = await puterService.generateCoverLetterFromPuterData(coverLetterData, {
        ...mockOptions,
        personalization: {
          tone: 'professional',
          length: 'medium',
          highlight: ['experience', 'skills']
        }
      });
      
      expect(result.data.personalized).toBe(true);
      expect(result.data.personalization).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication failures', async () => {
      const invalidData = { model: 'invalid-model' };
      
      await expect(puterService.extractCVFromPuterData(invalidData, mockOptions))
        .rejects.toThrow('Data validation failed');
    });

    it('should handle parsing errors', async () => {
      const malformedData = {
        ...mockPuterData,
        originalResponse: 'invalid json'
      };
      
      await expect(puterService.extractCVFromPuterData(malformedData, mockOptions))
        .rejects.toThrow();
    });

    it('should track failed operations', async () => {
      const initialFailures = puterService.metrics.failedRequests;
      
      try {
        await puterService.extractCVFromPuterData({}, mockOptions);
      } catch (error) {
        // Expected to fail
      }
      
      expect(puterService.metrics.failedRequests).toBe(initialFailures + 1);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track response times', async () => {
      const result = await puterService.extractCVFromPuterData(mockPuterData, mockOptions);
      
      expect(puterService.metrics.averageResponseTime).toBeGreaterThan(0);
      expect(result.metadata.processingTime).toBeGreaterThan(0);
    });

    it('should track successful operations', async () => {
      const initialSuccesses = puterService.metrics.successfulRequests;
      
      await puterService.extractCVFromPuterData(mockPuterData, mockOptions);
      
      expect(puterService.metrics.successfulRequests).toBe(initialSuccesses + 1);
    });
  });

  describe('Service Status', () => {
    it('should return comprehensive status', () => {
      const status = puterService.getStatus();
      
      expect(status.service).toBe('Puter Modular Service');
      expect(status.version).toBe('2.0.0');
      expect(status.architecture).toBe('Modular');
      expect(status.status).toBe('operational');
      expect(status.engines).toBeDefined();
      expect(status.metrics).toBeDefined();
    });

    it('should report engine health', () => {
      const status = puterService.getStatus();
      
      expect(status.engines.auth).toBe('healthy');
      expect(status.engines.request).toBe('healthy');
      expect(status.engines.response).toBe('healthy');
      expect(status.engines.jobAnalysis).toBe('healthy');
      expect(status.engines.cvTailoring).toBe('healthy');
    });
  });

  describe('Configuration', () => {
    it('should allow configuration updates', () => {
      const newConfig = {
        brutalMode: false,
        timeout: 60000,
        retryAttempts: 5
      };
      
      puterService.updateConfiguration(newConfig);
      
      expect(puterService.config.brutalMode).toBe(false);
      expect(puterService.config.timeout).toBe(60000);
      expect(puterService.config.retryAttempts).toBe(5);
    });

    it('should validate configuration changes', () => {
      const invalidConfig = {
        timeout: -1000,
        retryAttempts: 'invalid'
      };
      
      expect(() => puterService.updateConfiguration(invalidConfig))
        .toThrow('Invalid configuration');
    });
  });
});
