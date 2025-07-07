/**
 * Advanced CV Tailoring Service - Modular and Clean Architecture
 * Enhanced with all CV Builder advanced features: categorized skills, language support, advanced prompting, translation
 */
const AIService = require('./aiService');
const TranslationService = require('./translationService');

// Import modular components
const CVAnalyzer = require('./cvTailoring/CVAnalyzer');
const CoreOptimizer = require('./cvTailoring/CoreOptimizer');
const SectionOptimizer = require('./cvTailoring/SectionOptimizer');
const DateProcessor = require('./cvTailoring/DateProcessor');
const JobOfferExtractor = require('./cvTailoring/JobOfferExtractor');
const CVNormalizer = require('./cvTailoring/CVNormalizer');
const AuthenticityValidator = require('./cvTailoring/AuthenticityValidator');

class CVTailoringService {
  constructor() {
    this.aiService = new AIService();
    this.translationService = new TranslationService();
    
    // Initialize modular components
    this.analyzer = new CVAnalyzer(this.aiService);
    this.coreOptimizer = new CoreOptimizer(this.aiService);
    this.sectionOptimizer = new SectionOptimizer(this.aiService);
    this.dateProcessor = new DateProcessor();
    this.jobOfferExtractor = new JobOfferExtractor(this.aiService);
    this.normalizer = new CVNormalizer();
  }

  /**
   * Enhanced job offer extraction with advanced prompting from CV Builder
   * @param {string} text - Job offer text
   * @returns {Promise<Object>} - Structured job offer data
   */
  async extractJobOffer(text) {
    return await this.jobOfferExtractor.extractJobOffer(text);
  }

  /**
   * Enhanced CV tailoring with advanced features from CV Builder
   * @param {Object} originalCV - The original CV data
   * @param {Object} jobOffer - The job offer data
   * @param {string} additionalRequirements - Additional requirements
   * @param {string} language - Target language for tailoring
   * @returns {Promise<Object>} - Enhanced tailored CV data
   */
  async tailorCV(originalCV, jobOffer, additionalRequirements = '', language = 'en') {
    if (!originalCV || !jobOffer) {
      throw new Error('Original CV and job offer data are required');
    }

    console.log('🎯 Starting enhanced CV tailoring with advanced features...');
    console.log('🌐 Target language:', language);
    
    // Validate and normalize original CV structure with categorized skills support
    const normalizedCV = this.normalizer.normalizeOriginalCV(originalCV);
    
    console.log('📊 Enhanced CV analysis:', {
      hasPersonalInfo: !!normalizedCV.personalInfo,
      experienceCount: normalizedCV.experience?.length || 0,
      educationCount: normalizedCV.education?.length || 0,
      skillsStructure: this.analyzer.analyzeSkillsStructure(normalizedCV.skills),
      languagesCount: normalizedCV.languages?.length || 0,
      certificationsCount: normalizedCV.certifications?.length || 0,
      projectsCount: normalizedCV.projects?.length || 0,
      targetLanguage: language
    });

    try {
      // Step 1: Enhanced comprehensive analysis with language-aware processing
      const analysis = await this.analyzer.performEnhancedComprehensiveAnalysis(normalizedCV, jobOffer, language);
      console.log('✅ Enhanced comprehensive analysis completed');

      // Step 2: Generate enhanced core optimizations with cultural context
      const coreOptimizations = await this.coreOptimizer.generateEnhancedCoreOptimizations(normalizedCV, analysis, language);
      console.log('✅ Enhanced core optimizations completed');

      // Step 3: Optimize all sections with advanced categorized skills handling
      const sectionOptimizations = await this.sectionOptimizer.optimizeAllSectionsEnhanced(normalizedCV, analysis, language);
      console.log('✅ All sections optimized with advanced features');

      // Step 4: Advanced date formatting for experience and education
      const processedSections = this.dateProcessor.processAdvancedDateFormatting(sectionOptimizations);

      // Step 5: Merge all optimized data into tailored CV
      console.log('🔍 Debug: Normalized CV personalInfo structure:', {
        hasContact: !!normalizedCV.personalInfo?.contact,
        contactKeys: normalizedCV.personalInfo?.contact ? Object.keys(normalizedCV.personalInfo.contact) : 'no contact',
        flatEmail: normalizedCV.personalInfo?.email,
        nestedEmail: normalizedCV.personalInfo?.contact?.email
      });
      
      const tailoredCV = {
        ...normalizedCV,
        ...processedSections,
        personalInfo: {
          ...normalizedCV.personalInfo,
          title: coreOptimizations.title || normalizedCV.personalInfo.title || ''
        },
        summary: coreOptimizations.summary || normalizedCV.summary || '',
        metadata: {
          ...normalizedCV.metadata,
          tailored: true,
          language,
          tailoredAt: new Date().toISOString(),
          matchScore: analysis.matchScore || null
        }
      };

      console.log('🔍 Debug: Final tailored CV personalInfo structure:', {
        hasContact: !!tailoredCV.personalInfo?.contact,
        contactKeys: tailoredCV.personalInfo?.contact ? Object.keys(tailoredCV.personalInfo.contact) : 'no contact',
        flatEmail: tailoredCV.personalInfo?.email,
        nestedEmail: tailoredCV.personalInfo?.contact?.email,
        flatPhone: tailoredCV.personalInfo?.phone,
        nestedPhone: tailoredCV.personalInfo?.contact?.phone
      });

      // Step 6: Translate tailored CV if needed
      let finalCV = tailoredCV;
      if (language && language !== 'en') {
        try {
          finalCV = await this.translationService.translateCVContent(tailoredCV, language);
          finalCV.metadata = {
            ...tailoredCV.metadata,
            translated: true,
            translationTarget: language
          };
          console.log('🌐 Tailored CV translated to', language);
        } catch (translationError) {
          console.warn('⚠️ Tailored CV translation failed, using original:', translationError.message);
        }
      }

      // Step 7: Enhanced authenticity validation
      console.log('🛡️ Starting enhanced authenticity validation...');
      const authenticationReport = AuthenticityValidator.generateReport(normalizedCV, finalCV);
      
      finalCV.metadata.authenticityScore = authenticationReport.authenticityScore;
      finalCV.metadata.authenticityStatus = authenticationReport.status;
      finalCV.metadata.authenticityWarnings = authenticationReport.details?.warnings || [];
      
      console.log(`✅ Authenticity validation completed - Score: ${authenticationReport.authenticityScore}/100`);
      console.log('✅ CV tailoring completed successfully');
      return finalCV;
      
    } catch (error) {
      console.error('❌ CV tailoring failed:', error);
      throw new Error(`CV tailoring failed: ${error.message}`);
    }
  }

  // Legacy methods for backward compatibility - delegated to modules
  
  /**
   * Analyze skills structure for enhanced processing
   */
  analyzeSkillsStructure(skills) {
    return this.analyzer.analyzeSkillsStructure(skills);
  }

  /**
   * Normalize original CV structure to ensure consistency
   */
  normalizeOriginalCV(originalCV) {
    return this.normalizer.normalizeOriginalCV(originalCV);
  }

  /**
   * Process advanced date formatting
   */
  processAdvancedDateFormatting(sections) {
    return this.dateProcessor.processAdvancedDateFormatting(sections);
  }

  /**
   * Enhanced comprehensive analysis
   */
  async performEnhancedComprehensiveAnalysis(normalizedCV, jobOffer, language) {
    return await this.analyzer.performEnhancedComprehensiveAnalysis(normalizedCV, jobOffer, language);
  }

  /**
   * Generate enhanced core optimizations
   */
  async generateEnhancedCoreOptimizations(normalizedCV, analysis, language) {
    return await this.coreOptimizer.generateEnhancedCoreOptimizations(normalizedCV, analysis, language);
  }

  /**
   * Optimize all sections enhanced
   */
  async optimizeAllSectionsEnhanced(normalizedCV, analysis, language) {
    return await this.sectionOptimizer.optimizeAllSectionsEnhanced(normalizedCV, analysis, language);
  }
}

module.exports = CVTailoringService;
