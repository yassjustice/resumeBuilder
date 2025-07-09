/**
 * CV Tailoring Service - Modular Architecture Entry Point
 * Maintains backward compatibility while providing clean modular structure
 */

const JobAnalysisEngine = require('./engines/JobAnalysisEngine');
const CVAssemblyEngine = require('./engines/CVAssemblyEngine');
const SectionTailoringEngine = require('./engines/SectionTailoringEngine');
const ExperienceEngine = require('./engines/ExperienceEngine');
const AuthenticityEngine = require('./engines/AuthenticityEngine');
const DataNormalizationEngine = require('./engines/DataNormalizationEngine');

const AIService = require('../aiService');
const TranslationService = require('../translationService');

class CVTailoringService {
  constructor() {
    this.name = 'True Tailoring Engine';
    this.version = '2.0.0';
    
    // Initialize AI services
    this.aiService = new AIService();
    this.translationService = new TranslationService();
    
    // Initialize specialized engines
    this.jobAnalysisEngine = new JobAnalysisEngine(this.aiService);
    this.dataEngine = new DataNormalizationEngine();
    this.sectionEngine = new SectionTailoringEngine(this.aiService);
    this.experienceEngine = new ExperienceEngine(this.aiService, this.dataEngine);
    this.authenticityEngine = new AuthenticityEngine();
    this.assemblyEngine = new CVAssemblyEngine(this.translationService, this.authenticityEngine);
    
    console.log('🔗 CVTailoringService v2.0 initialized with modular architecture');
  }

  /**
   * Main CV tailoring method - maintains exact same API for backward compatibility
   * @param {Object} originalCV - Original CV data
   * @param {string} jobOfferText - Job offer text
   * @param {string} additionalRequirements - Additional requirements (optional)
   * @param {string} targetLanguage - Target language ('en', 'fr', 'ar')
   * @returns {Promise<Object>} - Tailored CV
   */
  async tailorCV(originalCV, jobOfferText, additionalRequirements = '', targetLanguage = 'en') {
    let jobAnalysis = null;
    
    try {
      console.log('🎯 Starting modular CV tailoring process...');
      console.log('🔍 Input parameters:', {
        hasOriginalCV: !!originalCV,
        jobOfferLength: typeof jobOfferText === 'string' ? jobOfferText.length : 'not a string',
        targetLanguage,
        hasAdditionalRequirements: !!additionalRequirements
      });
      
      // 1. Analyze job offer using specialized engine
      jobAnalysis = await this.jobAnalysisEngine.extractJobOffer(jobOfferText);
      
      // 2. Normalize CV data using data engine
      const normalizedCV = this.dataEngine.normalizeCV(originalCV);
      
      // 3. Tailor sections using section engine
      const tailoredSections = await this.sectionEngine.tailorAllSections(normalizedCV, jobAnalysis, targetLanguage);
      
      // 4. Deep tailor experience using experience engine
      if (normalizedCV.experience && normalizedCV.experience.length > 0) {
        tailoredSections.experience = await this.experienceEngine.tailorExperience(
          normalizedCV.experience, 
          jobAnalysis, 
          targetLanguage
        );
      }
      
      // 5. Assemble and validate final CV using assembly engine
      const tailoredCV = await this.assemblyEngine.assembleFinalCV(
        normalizedCV,
        tailoredSections,
        jobAnalysis,
        targetLanguage
      );
      
      console.log('✅ Modular CV tailoring completed successfully');
      return tailoredCV;
      
    } catch (error) {
      console.error('❌ Modular CV tailoring failed:', error.message);
      
      // Extract job title from job analysis if available
      const jobTitle = jobAnalysis?.jobTitle || 'Position';
      
      // Return enhanced original CV as fallback with proper metadata
      return await this.assemblyEngine.createFallbackCV(originalCV, error.message, targetLanguage, jobTitle);
    }
  }

  /**
   * Extract and analyze job offer - exposed for direct access
   */
  async extractJobOffer(jobOfferText) {
    return this.jobAnalysisEngine.extractJobOffer(jobOfferText);
  }

  /**
   * Get service status and configuration
   */
  getStatus() {
    return {
      service: 'CVTailoringService',
      engine: 'True Tailoring Engine',
      version: this.version,
      architecture: 'Modular',
      status: 'active',
      engines: {
        jobAnalysis: this.jobAnalysisEngine.getStatus(),
        dataProcessing: this.dataEngine.getStatus(),
        sectionTailoring: this.sectionEngine.getStatus(),
        experience: this.experienceEngine.getStatus(),
        authenticity: this.authenticityEngine.getStatus(),
        assembly: this.assemblyEngine.getStatus()
      },
      capabilities: [
        'Job offer analysis',
        'Authentic CV tailoring',
        'Multi-language support',
        'ATS optimization',
        'Authenticity validation',
        'Modular processing'
      ]
    };
  }

  // Legacy methods for backward compatibility
  async generateContentWithTimeout(prompt, timeoutMs = 30000) {
    return this.jobAnalysisEngine.generateContentWithTimeout(prompt, timeoutMs);
  }

  parseAIResponse(response) {
    return this.jobAnalysisEngine.parseAIResponse(response);
  }

  async calculateMatchScore(tailoredCV, jobAnalysis) {
    return this.assemblyEngine.calculateMatchScore(tailoredCV, jobAnalysis);
  }

  async validateAuthenticity(originalCV, tailoredCV) {
    return this.authenticityEngine.validateAuthenticity(originalCV, tailoredCV);
  }
}

module.exports = CVTailoringService;
