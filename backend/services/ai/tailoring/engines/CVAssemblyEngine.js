/**
 * CV Assembly Engine
 * Handles final CV assembly, translation, and validation
 * Orchestrates the final stages of CV tailoring
 */

class CVAssemblyEngine {
  constructor(translationService, authenticityEngine) {
    this.translationService = translationService;
    this.authenticityEngine = authenticityEngine;
    this.name = 'CV Assembly Engine';
    this.version = '1.0.0';
  }

  /**
   * Assemble final CV with proper structure and validation
   */
  async assembleFinalCV(normalizedCV, tailoredSections, jobAnalysis, targetLanguage) {
    try {
      console.log('🔧 Assembling final CV structure...');
      
      // 1. Build base CV structure
      let assembledCV = this.buildBaseStructure(normalizedCV, tailoredSections, jobAnalysis, targetLanguage);
      
      // 1.5. Calculate match score
      assembledCV.tailoringMetadata.matchScore = await this.calculateMatchScore(tailoredSections, jobAnalysis);
      
      // 2. Apply translation if needed
      if (targetLanguage !== 'en') {
        assembledCV = await this.applyTranslation(assembledCV, targetLanguage);
      }
      
      // 3. Validate authenticity
      await this.validateFinalCV(normalizedCV, assembledCV);
      
      // 4. Final validation and cleanup
      assembledCV = this.performFinalValidation(assembledCV);
      
      console.log('✅ CV assembly completed successfully');
      this.logFinalCVAnalysis(assembledCV);
      
      return assembledCV;
      
    } catch (error) {
      console.error('❌ CV assembly failed:', error.message);
      throw error;
    }
  }

  /**
   * Build base CV structure
   */
  buildBaseStructure(normalizedCV, tailoredSections, jobAnalysis, targetLanguage) {
    return {
      // Personal info (name, contact) - ALWAYS preserved with tailored title
      personalInfo: {
        ...tailoredSections.personalInfo,
        title: tailoredSections.title || tailoredSections.personalInfo.title
      },
      
      // Other sections
      summary: tailoredSections.summary || normalizedCV.summary || '',
      experience: Array.isArray(tailoredSections.experience) ? tailoredSections.experience : 
                 Array.isArray(normalizedCV.experience) ? normalizedCV.experience : [],
      skills: tailoredSections.skills || normalizedCV.skills || {},
      projects: Array.isArray(tailoredSections.projects) ? tailoredSections.projects : 
               Array.isArray(normalizedCV.projects) ? normalizedCV.projects : [],
      education: Array.isArray(tailoredSections.education) ? tailoredSections.education : 
                Array.isArray(normalizedCV.education) ? normalizedCV.education : [],
      certifications: Array.isArray(tailoredSections.certifications) ? tailoredSections.certifications : 
                     Array.isArray(normalizedCV.certifications) ? normalizedCV.certifications : [],
      languages: Array.isArray(tailoredSections.languages) ? tailoredSections.languages : 
                Array.isArray(normalizedCV.languages) ? normalizedCV.languages : [],
      awards: Array.isArray(normalizedCV.awards) ? normalizedCV.awards : [],
      volunteering: Array.isArray(normalizedCV.volunteering) ? normalizedCV.volunteering : [],
      interests: Array.isArray(normalizedCV.interests) ? normalizedCV.interests : [],
      
      // Language setting
      language: targetLanguage,
      
      // Metadata
      tailoringMetadata: {
        engine: 'True Tailoring Engine v2.0',
        architecture: 'Modular',
        jobTitle: jobAnalysis.jobTitle,
        targetLanguage,
        tailoredAt: new Date().toISOString(),
        matchScore: 0, // Will be calculated separately
        processingStages: [
          'Job Analysis',
          'Data Normalization', 
          'Section Tailoring',
          'Experience Processing',
          'Assembly & Validation'
        ]
      }
    };
  }

  /**
   * Apply comprehensive translation if needed
   */
  async applyTranslation(assembledCV, targetLanguage) {
    console.log(`🌐 Applying comprehensive translation to ${targetLanguage}...`);
    
    try {
      // Use the translation service to ensure everything is properly translated
      const fullyTranslatedCV = await this.translationService.translateCVContent(
        assembledCV, 
        targetLanguage, 
        'en'
      );
      
      // Preserve critical personal info (names should not be translated)
      fullyTranslatedCV.personalInfo = {
        ...fullyTranslatedCV.personalInfo,
        name: assembledCV.personalInfo.name, // Original name preserved
        firstName: assembledCV.personalInfo.firstName,
        lastName: assembledCV.personalInfo.lastName,
        email: assembledCV.personalInfo.email,
        phone: assembledCV.personalInfo.phone,
        linkedin: assembledCV.personalInfo.linkedin,
        github: assembledCV.personalInfo.github,
        website: assembledCV.personalInfo.website
      };
      
      // Preserve metadata
      fullyTranslatedCV.tailoringMetadata = assembledCV.tailoringMetadata;
      
      console.log(`✅ Translation to ${targetLanguage} completed`);
      return fullyTranslatedCV;
      
    } catch (translationError) {
      console.error('⚠️ Translation failed, using tailored version in original language:', translationError.message);
      return assembledCV;
    }
  }

  /**
   * Validate final CV authenticity
   */
  async validateFinalCV(originalCV, assembledCV) {
    console.log('🔍 Performing final authenticity validation...');
    
    const validationResult = await this.authenticityEngine.validateAuthenticity(originalCV, assembledCV);
    
    if (!validationResult.authentic) {
      console.warn('⚠️ Authenticity validation failed:', validationResult.violations);
      console.warn('⚠️ Proceeding with warnings...');
    }
    
    // Add validation metadata
    assembledCV.tailoringMetadata.authenticityValidation = {
      score: this.authenticityEngine.calculateAuthenticityScore(validationResult),
      status: validationResult.authentic ? 'PASSED' : 'WARNING',
      warnings: validationResult.warnings.length,
      violations: validationResult.violations.length
    };
    
    return validationResult;
  }

  /**
   * Perform final validation and cleanup
   */
  performFinalValidation(assembledCV) {
    console.log('🔧 Performing final validation and cleanup...');
    
    // Ensure all array fields are properly formatted
    assembledCV.experience = Array.isArray(assembledCV.experience) ? assembledCV.experience : [];
    assembledCV.education = Array.isArray(assembledCV.education) ? assembledCV.education : [];
    assembledCV.certifications = Array.isArray(assembledCV.certifications) ? assembledCV.certifications : [];
    assembledCV.projects = Array.isArray(assembledCV.projects) ? assembledCV.projects : [];
    assembledCV.languages = Array.isArray(assembledCV.languages) ? assembledCV.languages : [];
    assembledCV.awards = Array.isArray(assembledCV.awards) ? assembledCV.awards : [];
    assembledCV.volunteering = Array.isArray(assembledCV.volunteering) ? assembledCV.volunteering : [];
    assembledCV.interests = Array.isArray(assembledCV.interests) ? assembledCV.interests : [];
    
    // Validate required fields
    if (!assembledCV.personalInfo?.name || assembledCV.personalInfo.name.toLowerCase() === 'cv') {
      console.warn('⚠️ Invalid or missing name, using fallback');
      assembledCV.personalInfo.name = 'Professional';
    }
    
    // Ensure skills structure
    if (!assembledCV.skills || typeof assembledCV.skills !== 'object') {
      assembledCV.skills = {};
    }
    
    console.log('✅ Final validation completed');
    return assembledCV;
  }

  /**
   * Log detailed final CV analysis
   */
  logFinalCVAnalysis(assembledCV) {
    console.log('📊 FINAL ASSEMBLED CV ANALYSIS:');
    console.log(`  📝 Name: ${assembledCV.personalInfo?.name}`);
    console.log(`  📝 Title: ${assembledCV.personalInfo?.title}`);
    console.log(`  📝 Language: ${assembledCV.language}`);
    console.log(`  📝 Summary length: ${assembledCV.summary?.length || 0} chars`);
    console.log(`  🔧 Skills categories: ${assembledCV.skills ? Object.keys(assembledCV.skills).join(', ') : 'None'}`);
    console.log(`  💼 Experience entries: ${assembledCV.experience?.length || 0}`);
    
    if (assembledCV.experience?.length > 0) {
      assembledCV.experience.forEach((exp, i) => {
        console.log(`    ${i+1}. ${exp.company} - ${exp.title} (${exp.responsibilities?.length || 0} responsibilities)`);
      });
    }
    
    console.log(`  🎓 Education entries: ${assembledCV.education?.length || 0}`);
    if (assembledCV.education?.length > 0) {
      assembledCV.education.forEach((edu, i) => {
        console.log(`    ${i+1}. ${edu.degree} at ${edu.institution} (${edu.year || edu.period || 'no date'})`);
      });
    }
    
    console.log(`  📜 Certifications: ${assembledCV.certifications?.length || 0}`);
    if (assembledCV.certifications?.length > 0) {
      assembledCV.certifications.forEach((cert, i) => {
        console.log(`    ${i+1}. ${cert.name} - ${cert.issuer}`);
      });
    }
    
    console.log(`📊 Final validation - Array fields confirmed:`, {
      experience: Array.isArray(assembledCV.experience),
      education: Array.isArray(assembledCV.education),
      certifications: Array.isArray(assembledCV.certifications),
      projects: Array.isArray(assembledCV.projects)
    });
  }

  /**
   * Calculate match score between CV and job
   */
  async calculateMatchScore(tailoredSections, jobAnalysis) {
    try {
      const cvText = JSON.stringify(tailoredSections).toLowerCase();
      const requiredSkills = jobAnalysis.requiredSkills || [];
      const keywords = jobAnalysis.keywords || [];
      
      const totalRequirements = requiredSkills.length + keywords.length;
      if (totalRequirements === 0) return 85;

      let matches = 0;
      [...requiredSkills, ...keywords].forEach(item => {
        if (cvText.includes(item.toLowerCase())) {
          matches++;
        }
      });

      return Math.min(95, Math.max(60, Math.round((matches / totalRequirements) * 100)));
    } catch (error) {
      console.warn('⚠️ Match score calculation failed:', error.message);
      return 75; // Default score
    }
  }

  /**
   * Create fallback CV in case of errors
   */
  async createFallbackCV(originalCV, errorMessage, targetLanguage = 'en', jobTitle = 'Position') {
    console.log('🚨 Creating fallback CV due to processing error...');
    console.log('🔧 Preserving metadata for PDF generation compatibility...');
    
    let processedCV = { ...originalCV };
    
    // Try to apply basic translation if targetLanguage is not English
    if (targetLanguage !== 'en' && this.translationService) {
      try {
        console.log('🌐 Attempting basic translation for fallback CV...');
        processedCV = await this.translationService.translateCVContent(
          originalCV, 
          targetLanguage, 
          originalCV.language || 'en'
        );
        console.log('✅ Basic translation applied to fallback CV');
      } catch (translationError) {
        console.warn('⚠️ Translation failed for fallback CV, using original:', translationError.message);
        processedCV = originalCV;
      }
    }
    
    const fallbackCV = {
      ...processedCV,
      experience: Array.isArray(processedCV.experience) ? processedCV.experience : [],
      education: Array.isArray(processedCV.education) ? processedCV.education : [],
      certifications: Array.isArray(processedCV.certifications) ? processedCV.certifications : [],
      projects: Array.isArray(processedCV.projects) ? processedCV.projects : [],
      languages: Array.isArray(processedCV.languages) ? processedCV.languages : [],
      awards: Array.isArray(processedCV.awards) ? processedCV.awards : [],
      volunteering: Array.isArray(processedCV.volunteering) ? processedCV.volunteering : [],
      interests: Array.isArray(processedCV.interests) ? processedCV.interests : [],
      
      // Critical metadata for PDF generation
      language: targetLanguage,
      
      // Error indicators
      error: errorMessage,
      fallback: true,
      
      // Complete tailoring metadata structure
      tailoringMetadata: {
        engine: 'True Tailoring Engine v2.0 - Fallback',
        architecture: 'Modular',
        status: 'failed',
        error: errorMessage,
        fallbackCreated: new Date().toISOString(),
        
        // Required fields for PDF generation
        targetLanguage: targetLanguage,
        jobTitle: jobTitle,
        tailoredAt: new Date().toISOString(),
        matchScore: 0,
        processingStages: [
          'Job Analysis',
          'Data Normalization', 
          'Fallback Creation'
        ],
        
        // Translation status
        translationStatus: targetLanguage !== 'en' ? 'attempted' : 'not_needed',
        originalLanguage: originalCV.language || 'en',
        
        // Fallback indicators
        isFallback: true,
        fallbackReason: errorMessage
      }
    };
    
    console.log('📊 Fallback CV created with original data preserved');
    console.log('🌐 Fallback CV language set to:', targetLanguage);
    console.log('📋 Fallback CV metadata structure preserved for PDF generation');
    
    return fallbackCV;
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: 'active',
      capabilities: [
        'CV structure assembly',
        'Translation integration',
        'Authenticity validation',
        'Final cleanup and validation',
        'Match score calculation',
        'Fallback CV creation'
      ]
    };
  }
}

module.exports = CVAssemblyEngine;
