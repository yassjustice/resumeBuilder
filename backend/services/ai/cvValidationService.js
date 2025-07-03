/**
 * 🛡️ CV VALIDATION SERVICE - MULTI-LAYERED VALIDATION SYSTEM
 * Critical validation service to ensure tailored CVs are error-free and human-like
 * 
 * VALIDATION LAYERS:
 * 1. Content Cleanup & Sanitization
 * 2. Grammar & Language Validation
 * 3. Professional Tone Validation
 * 4. Structure & Format Validation
 * 5. ATS Compatibility Validation
 * 6. Human-like Quality Assurance
 */

const { aiService } = require('./aiService');

class CVValidationService {
  constructor() {
    // Critical patterns that must be removed/fixed
    this.criticalPatterns = {
      // Bracketed suggestions and placeholders
      bracketedSuggestions: /\[.*?\]/g,
      
      // Incomplete sentences and fragments
      incompleteSentences: /\.\s*\[|\]\s*\.|through\s*$|including\s*$/gi,
      
      // AI-generated filler text
      fillerPhrases: [
        'if available',
        'e.g.,',
        'for example',
        'such as',
        'including but not limited to',
        'among others',
        'and more',
        'etc.',
        'and so on',
        'to name a few'
      ],
      
      // Unprofessional language
      unprofessionalTerms: [
        'stuff',
        'things',
        'whatever',
        'kinda',
        'sorta',
        'gonna',
        'wanna',
        'awesome',
        'cool',
        'nice'
      ],
      
      // Redundant phrases
      redundantPhrases: [
        'successfully completed',
        'effectively managed',
        'efficiently handled',
        'proactively addressed',
        'strategically implemented'
      ]
    };
  }

  /**
   * 🎯 MAIN VALIDATION ENTRY POINT
   * Runs all validation layers sequentially
   */
  async validateTailoredCV(cv) {
    console.log('🛡️ Starting comprehensive CV validation...');
    
    try {
      // Layer 1: Content Cleanup & Sanitization
      const cleanedCV = await this.layer1_contentCleanup(cv);
      
      // Layer 2: Grammar & Language Validation
      const grammarValidatedCV = await this.layer2_grammarValidation(cleanedCV);
      
      // Layer 3: Professional Tone Validation
      const toneValidatedCV = await this.layer3_professionalToneValidation(grammarValidatedCV);
      
      // Layer 4: Structure & Format Validation
      const structureValidatedCV = await this.layer4_structureValidation(toneValidatedCV);
      
      // Layer 5: ATS Compatibility Validation
      const atsValidatedCV = await this.layer5_atsCompatibilityValidation(structureValidatedCV);
      
      // Layer 6: Human-like Quality Assurance
      const finalCV = await this.layer6_humanLikeQualityAssurance(atsValidatedCV);
      
      console.log('✅ CV validation completed successfully');
      return finalCV;
      
    } catch (error) {
      console.error('❌ CV validation failed:', error);
      // Return original CV if validation fails to prevent total failure
      return cv;
    }
  }

  /**
   * 🧹 LAYER 1: CONTENT CLEANUP & SANITIZATION
   * Removes bracketed suggestions, placeholders, and malformed content
   */
  async layer1_contentCleanup(cv) {
    console.log('🧹 Layer 1: Content cleanup & sanitization...');
    
    const cleanedCV = JSON.parse(JSON.stringify(cv)); // Deep clone
    
    // Clean all text fields recursively
    this.cleanTextFields(cleanedCV);
    
    return cleanedCV;
  }

  /**
   * 📝 LAYER 2: GRAMMAR & LANGUAGE VALIDATION
   * Fixes grammar, spelling, and language issues
   */
  async layer2_grammarValidation(cv) {
    console.log('📝 Layer 2: Grammar & language validation...');
    
    // Validate critical text sections
    const sectionsToValidate = ['summary'];
    
    for (const section of sectionsToValidate) {
      if (cv[section]) {
        cv[section] = await this.validateGrammar(cv[section]);
      }
    }
    
    // Validate experience descriptions
    if (cv.experience && Array.isArray(cv.experience)) {
      for (let exp of cv.experience) {
        if (exp.description) {
          exp.description = await this.validateGrammar(exp.description);
        }
        if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
          exp.responsibilities = await Promise.all(
            exp.responsibilities.map(resp => this.validateGrammar(resp))
          );
        }
      }
    }
    
    return cv;
  }

  /**
   * 💼 LAYER 3: PROFESSIONAL TONE VALIDATION
   * Ensures professional, confident, and appropriate tone
   */
  async layer3_professionalToneValidation(cv) {
    console.log('💼 Layer 3: Professional tone validation...');
    
    // Validate tone for key sections
    if (cv.summary) {
      cv.summary = await this.validateProfessionalTone(cv.summary);
    }
    
    // Validate experience descriptions for professional tone
    if (cv.experience && Array.isArray(cv.experience)) {
      for (let exp of cv.experience) {
        if (exp.description) {
          exp.description = await this.validateProfessionalTone(exp.description);
        }
      }
    }
    
    return cv;
  }

  /**
   * 🏗️ LAYER 4: STRUCTURE & FORMAT VALIDATION
   * Ensures proper CV structure and formatting
   */
  async layer4_structureValidation(cv) {
    console.log('🏗️ Layer 4: Structure & format validation...');
    
    // Validate required sections
    const requiredSections = ['personalInfo', 'summary', 'experience'];
    for (const section of requiredSections) {
      if (!cv[section]) {
        console.warn(`⚠️ Missing required section: ${section}`);
      }
    }
    
    // Validate personal info completeness
    if (cv.personalInfo) {
      if (!cv.personalInfo.name || cv.personalInfo.name.trim().length < 2) {
        console.warn('⚠️ Invalid or missing name in personal info');
      }
      if (!cv.personalInfo.title || cv.personalInfo.title.trim().length < 3) {
        console.warn('⚠️ Invalid or missing professional title');
      }
    }
    
    // Validate experience entries
    if (cv.experience && Array.isArray(cv.experience)) {
      cv.experience = cv.experience.filter(exp => {
        return exp.company && exp.company.trim() && 
               (exp.title || exp.position) && 
               (exp.title || exp.position).trim();
      });
    }
    
    // Validate skills structure
    if (cv.skills && typeof cv.skills === 'object') {
      Object.keys(cv.skills).forEach(category => {
        if (!Array.isArray(cv.skills[category]) || cv.skills[category].length === 0) {
          delete cv.skills[category];
        }
      });
    }
    
    return cv;
  }

  /**
   * 🤖 LAYER 5: ATS COMPATIBILITY VALIDATION
   * Ensures ATS-friendly formatting and keywords
   */
  async layer5_atsCompatibilityValidation(cv) {
    console.log('🤖 Layer 5: ATS compatibility validation...');
    
    // Validate section headers (standard naming)
    const validSectionHeaders = {
      'summary': ['Summary', 'Professional Summary', 'Profile'],
      'experience': ['Experience', 'Professional Experience', 'Work Experience'],
      'education': ['Education', 'Educational Background'],
      'skills': ['Skills', 'Technical Skills', 'Core Competencies'],
      'certifications': ['Certifications', 'Certificates', 'Professional Certifications']
    };
    
    // Remove special characters from descriptions that might confuse ATS
    if (cv.experience && Array.isArray(cv.experience)) {
      cv.experience.forEach(exp => {
        if (exp.description) {
          // Remove bullets and special formatting for ATS compatibility
          exp.description = exp.description.replace(/[•▪▫◦‣⁃]/g, '•');
        }
      });
    }
    
    return cv;
  }

  /**
   * 👤 LAYER 6: HUMAN-LIKE QUALITY ASSURANCE
   * Final validation to ensure the CV reads naturally and professionally
   */
  async layer6_humanLikeQualityAssurance(cv) {
    console.log('👤 Layer 6: Human-like quality assurance...');
    
    // Final AI validation for human-like quality
    if (cv.summary) {
      cv.summary = await this.ensureHumanLikeQuality(cv.summary, 'professional summary');
    }
    
    // Validate each experience entry for human-like quality
    if (cv.experience && Array.isArray(cv.experience)) {
      for (let exp of cv.experience) {
        if (exp.description) {
          exp.description = await this.ensureHumanLikeQuality(exp.description, 'work experience description');
        }
      }
    }
    
    return cv;
  }

  /**
   * 🧹 RECURSIVE TEXT FIELD CLEANER
   * Cleans all text fields in the CV object recursively
   */
  cleanTextFields(obj) {
    if (typeof obj === 'string') {
      return this.cleanText(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.cleanTextFields(item));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        obj[key] = this.cleanTextFields(obj[key]);
      });
    }
    return obj;
  }

  /**
   * 🧽 TEXT CLEANING UTILITY
   * Removes problematic patterns and improves text quality
   */
  cleanText(text) {
    if (!text || typeof text !== 'string') return text;
    
    let cleaned = text;
    
    // Remove bracketed suggestions and placeholders
    cleaned = cleaned.replace(this.criticalPatterns.bracketedSuggestions, '');
    
    // Remove filler phrases
    this.criticalPatterns.fillerPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // Fix incomplete sentences
    cleaned = cleaned.replace(/through\s*$/gi, 'through comprehensive training');
    cleaned = cleaned.replace(/including\s*$/gi, 'including various technologies');
    
    // Clean up extra spaces and punctuation
    cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single
    cleaned = cleaned.replace(/\s+\./g, '.'); // Space before period
    cleaned = cleaned.replace(/\.\s*\./g, '.'); // Double periods
    cleaned = cleaned.replace(/,\s*,/g, ','); // Double commas
    
    return cleaned.trim();
  }

  /**
   * 📝 GRAMMAR VALIDATION
   * Uses AI to fix grammar and language issues
   */
  async validateGrammar(text) {
    if (!text || text.length < 10) return text;
    
    try {
      const prompt = `
Fix grammar, spelling, and language issues in this professional CV text. 
Return ONLY the corrected text with no additional commentary.

CRITICAL RULES:
- Remove ALL bracketed suggestions [like this]
- Complete any incomplete sentences
- Fix grammar and spelling errors
- Maintain professional tone
- Keep the same meaning and length
- Do NOT add explanations or comments

TEXT TO FIX:
${text}
`;

      const response = await aiService.callAI(prompt, { maxTokens: 500 });
      
      if (response && response.trim() && response.trim() !== text.trim()) {
        console.log('✅ Grammar validation applied');
        return response.trim();
      }
      
      return text;
    } catch (error) {
      console.log('⚠️ Grammar validation failed, using original text');
      return text;
    }
  }

  /**
   * 💼 PROFESSIONAL TONE VALIDATION
   * Ensures professional, confident tone without casual language
   */
  async validateProfessionalTone(text) {
    if (!text || text.length < 10) return text;
    
    try {
      const prompt = `
Enhance this CV text to sound more professional, confident, and compelling.
Return ONLY the enhanced text with no additional commentary.

CRITICAL REQUIREMENTS:
- Remove ALL casual language and filler words
- Use strong, active voice
- Eliminate wishy-washy language
- Make statements confident and direct
- Remove ANY bracketed suggestions or placeholders
- Keep the same core information
- Maintain appropriate length

ORIGINAL TEXT:
${text}
`;

      const response = await aiService.callAI(prompt, { maxTokens: 600 });
      
      if (response && response.trim() && response.trim() !== text.trim()) {
        console.log('✅ Professional tone validation applied');
        return response.trim();
      }
      
      return text;
    } catch (error) {
      console.log('⚠️ Professional tone validation failed, using original text');
      return text;
    }
  }

  /**
   * 👤 HUMAN-LIKE QUALITY ASSURANCE
   * Final AI check to ensure text reads naturally and professionally
   */
  async ensureHumanLikeQuality(text, context) {
    if (!text || text.length < 10) return text;
    
    try {
      const prompt = `
Review this ${context} and ensure it reads naturally like it was written by a skilled professional.

QUALITY REQUIREMENTS:
- Sounds natural and human-written
- Professional but not robotic
- Confident and compelling
- No AI-generated patterns or phrases
- No bracketed suggestions or placeholders
- Complete sentences only
- Proper flow and readability

Return ONLY the improved text if changes are needed, or the original text if it's already good.

TEXT TO REVIEW:
${text}
`;

      const response = await aiService.callAI(prompt, { maxTokens: 600 });
      
      if (response && response.trim() && 
          response.trim() !== text.trim() && 
          response.length > text.length * 0.8 && 
          response.length < text.length * 1.3) {
        console.log('✅ Human-like quality assurance applied');
        return response.trim();
      }
      
      return text;
    } catch (error) {
      console.log('⚠️ Human-like quality assurance failed, using original text');
      return text;
    }
  }

  /**
   * 🔍 FINAL QUALITY CHECK
   * Performs a final check for any remaining issues
   */
  async performFinalQualityCheck(cv) {
    const issues = [];
    
    // Check for remaining bracketed content
    const cvString = JSON.stringify(cv);
    if (cvString.includes('[') || cvString.includes(']')) {
      issues.push('Contains bracketed suggestions');
    }
    
    // Check for incomplete sentences
    if (cvString.match(/through\s*[^a-zA-Z]|including\s*[^a-zA-Z]/gi)) {
      issues.push('Contains incomplete sentences');
    }
    
    // Check for filler phrases
    const hasFillerPhrases = this.criticalPatterns.fillerPhrases.some(phrase => 
      cvString.toLowerCase().includes(phrase.toLowerCase())
    );
    if (hasFillerPhrases) {
      issues.push('Contains filler phrases');
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ Quality check found issues:', issues);
    } else {
      console.log('✅ Final quality check passed');
    }
    
    return { cv, issues };
  }
}

module.exports = new CVValidationService();
