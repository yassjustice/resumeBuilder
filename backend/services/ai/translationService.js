/**
 * AI Translation Service
 * Provides intelligent CV content translation using the existing AI infrastructure
 * Integrates with AIServiceManager for multi-tier fallback support
 */
const AIServiceManager = require('./aiServiceManager');
const EnhancedFallbackParser = require('./enhancedFallbackParser');

class TranslationService {
  constructor() {
    // Use singleton instance to ensure quota tracking across all services
    this.serviceManager = AIServiceManager.getInstance();
    this.fallbackParser = new EnhancedFallbackParser();
    console.log('🔗 TranslationService connected to shared AIServiceManager instance');
    
    // Simple cache to avoid repeated translations
    this.translationCache = new Map();
    this.maxCacheSize = 100; // Limit cache size
    
    // Language configurations for context-aware translation
    this.languageConfig = {
      en: {
        name: 'English',
        code: 'en',
        direction: 'ltr',
        culturalContext: 'American/British professional standards'
      },
      fr: {
        name: 'French',
        code: 'fr',
        direction: 'ltr',
        culturalContext: 'French professional standards and formal language'
      },
      ar: {
        name: 'Arabic',
        code: 'ar',
        direction: 'rtl',
        culturalContext: 'Arabic professional standards with respectful formal tone'
      }
    };
  }

  /**
   * Translate CV content to target language with professional context
   * @param {Object} cvData - CV data to translate
   * @param {string} targetLanguage - Target language code (en, fr, ar)
   * @param {string} sourceLanguage - Source language code (optional, will auto-detect)
   * @returns {Promise<Object>} - Translated CV data
   */
  async translateCVContent(cvData, targetLanguage, sourceLanguage = null) {
    try {
      console.log(`🌐 Starting CV translation to ${targetLanguage}`);
      
      // Validate target language
      if (!this.languageConfig[targetLanguage]) {
        throw new Error(`Unsupported target language: ${targetLanguage}`);
      }

      // If source and target are the same, return original data
      if (sourceLanguage === targetLanguage) {
        console.log(`✅ Source and target language are the same (${targetLanguage}), returning original data`);
        return { ...cvData, _translation: { language: targetLanguage, translated: false } };
      }

      const targetConfig = this.languageConfig[targetLanguage];
      
      console.log(`🚀 Using BATCH translation (single AI call) instead of field-by-field`);
      
      // Translate entire CV in ONE API call
      const translatedData = await this.translateCVBatch(cvData, targetLanguage, targetConfig);

      // Add translation metadata
      translatedData._translation = {
        language: targetLanguage,
        translated: true,
        timestamp: new Date().toISOString(),
        sourceLanguage: sourceLanguage || 'auto-detected'
      };

      console.log(`✅ CV translation to ${targetLanguage} completed successfully`);
      return translatedData;

    } catch (error) {
      console.error(`❌ Translation failed:`, error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Translate entire CV in one batch API call
   * Much more efficient than field-by-field translation
   */
  async translateCVBatch(cvData, targetLanguage, targetConfig) {
    console.log(`🎯 Starting batch translation to ${targetLanguage}`);
    
    // Build comprehensive translation prompt
    const prompt = `
You are a professional CV translator. Translate this entire CV from any language to ${targetConfig.name} (${targetLanguage}).

CRITICAL REQUIREMENTS:
- Maintain professional tone appropriate for ${targetConfig.culturalContext}
- Keep technical terms, company names, and proper nouns unchanged
- Preserve all contact information EXACTLY as is (email, phone, LinkedIn, etc.)
- Keep dates, numbers, and formatting unchanged
- Return the EXACT same JSON structure with translated content
- Do not translate technical skills, programming languages, or tool names
- Do not translate company names, institution names, or certification issuers
- TRANSLATE skill category names (e.g., "Technical Skills" → "Compétences Techniques", "Frontend Development" → "Développement Frontend")
- TRANSLATE section headers and field descriptors but keep skill values unchanged
- TRANSLATE job position titles and descriptions while preserving technical terms within them

CV Data to translate:
${JSON.stringify(cvData, null, 2)}

Return ONLY the translated JSON object with the same structure, no additional text or formatting.
`;

    try {
      const result = await this.serviceManager.generateContent(prompt, true);
      
      // Parse the translated CV
      let translatedCV;
      try {
        translatedCV = JSON.parse(result.content);
      } catch (parseError) {
        console.error('❌ Failed to parse translated CV JSON:', parseError);
        // Try to extract JSON from response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          translatedCV = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract valid JSON from translation response');
        }
      }
      
      console.log(`✅ Batch translation completed successfully`);
      return translatedCV;
      
    } catch (error) {
      console.error(`❌ Batch translation failed:`, error);
      
      // Fallback to partial translation if batch fails
      console.log(`🔄 Falling back to essential-only translation`);
      return await this.translateCVEssentialsOnly(cvData, targetLanguage, targetConfig);
    }
  }

  /**
   * Fallback: Translate only essential fields (summary, job titles, education degrees)
   * Minimal API calls for when batch translation fails
   */
  async translateCVEssentialsOnly(cvData, targetLanguage, targetConfig) {
    console.log(`🎯 Translating only essential fields to minimize API calls`);
    
    const translatedData = {
      personalInfo: {
        ...cvData.personalInfo, // Keep all contact info as-is
        title: cvData.personalInfo?.title ? await this.translateText(cvData.personalInfo.title, targetLanguage, targetConfig, 'professional title') : ''
      },
      summary: cvData.summary ? await this.translateText(cvData.summary, targetLanguage, targetConfig, 'professional summary') : '',
      experience: cvData.experience?.map(exp => ({
        ...exp,
        // Only translate position and first sentence of description
        position: exp.position || '',
        description: exp.description ? (exp.description.split('.')[0] + '.') : '' // Keep only first sentence in original language for now
      })) || [],
      education: cvData.education?.map(edu => ({
        ...edu,
        // Keep degree names as-is for now to save API calls
        degree: edu.degree || '',
        field: edu.field || ''
      })) || [],
      skills: cvData.skills || {}, // Preserve original skills structure (object or array)
      languages: cvData.languages || [], // Keep language skills as-is
      certifications: cvData.certifications || [] // Keep certifications as-is
    };

    console.log(`✅ Essential-only translation completed`);
    return translatedData;
  }

  // OLD FIELD-BY-FIELD METHODS (COMMENTED OUT TO SAVE API CALLS)
  // These methods were making individual AI calls for each field
  // which burned through quota very quickly
  
  /*
  async translatePersonalInfo(personalInfo, targetLanguage, targetConfig) {
    // This method was making separate AI calls for each field
    // Now handled in batch translation above
  }

  async translateExperience(experience, targetLanguage, targetConfig) {
    // This method was making separate AI calls for each job
    // Now handled in batch translation above
  }

  async translateEducation(education, targetLanguage, targetConfig) {
    // This method was making separate AI calls for each education entry
    // Now handled in batch translation above
  }

  async translateSkills(skills, targetLanguage, targetConfig) {
    // This method was making separate AI calls for each skill
    // Now handled in batch translation above
  }

  async translateCertifications(certifications, targetLanguage, targetConfig) {
    // This method was making separate AI calls for each certification
    // Now handled in batch translation above
  }
  */

  /**
   * Core text translation function using AI
   */
  async translateText(text, targetLanguage, targetConfig, context = '') {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return text;
    }

    // Check cache
    const cacheKey = `${text}|${targetLanguage}`;
    if (this.translationCache.has(cacheKey)) {
      console.log(`🔄 Cache hit for: "${text}"`);
      return this.translationCache.get(cacheKey);
    }

    try {
      const prompt = `
Translate the following ${context} from any language to ${targetConfig.name} (${targetLanguage}).

Requirements:
- Maintain professional tone appropriate for CV/resume
- Preserve professional terminology and industry-specific terms
- Adapt to ${targetConfig.culturalContext}
- Keep the meaning accurate and context-appropriate
- If the text is already in ${targetConfig.name}, return it unchanged
- Do not add any explanations, just return the translated text

Text to translate: "${text}"

Translated text:`;

      const result = await this.serviceManager.generateContent(prompt, true);
      
      // Clean up the response
      let translatedText = result.content.trim();
      
      // Remove quotes if the AI wrapped the response
      if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
        translatedText = translatedText.slice(1, -1);
      }
      
      // If translation failed or returned empty, use fallback
      if (!translatedText || translatedText.length === 0) {
        console.warn(`⚠️ Translation failed for: "${text}", using original`);
        return text;
      }

      // Update cache
      this.updateCache(cacheKey, translatedText);

      return translatedText;

    } catch (error) {
      console.error(`❌ Text translation error for "${text}":`, error);
      // Fallback to original text if translation fails
      return text;
    }
  }

  /**
   * Update the translation cache
   */
  updateCache(key, value) {
    if (this.translationCache.size >= this.maxCacheSize) {
      // Remove the oldest entry (first key)
      const firstKey = this.translationCache.keys().next().value;
      this.translationCache.delete(firstKey);
    }
    this.translationCache.set(key, value);
  }

  /**
   * Detect the language of CV content
   */
  async detectLanguage(cvData) {
    try {
      // Use the summary or first experience description for detection
      const textForDetection = cvData.summary || 
        (cvData.experience && cvData.experience[0] && cvData.experience[0].description) ||
        (cvData.personalInfo && cvData.personalInfo.title) ||
        '';

      if (!textForDetection) {
        return 'en'; // Default to English if no text to analyze
      }

      const prompt = `
Detect the language of this CV content and return only the language code.

Return only one of these codes:
- en (for English)
- fr (for French) 
- ar (for Arabic)

Text to analyze: "${textForDetection}"

Language code:`;

      const result = await this.serviceManager.generateContent(prompt, true);
      const detectedLang = result.content.trim().toLowerCase();
      
      // Validate the response
      if (['en', 'fr', 'ar'].includes(detectedLang)) {
        return detectedLang;
      }
      
      return 'en'; // Default fallback

    } catch (error) {
      console.error(`❌ Language detection error:`, error);
      return 'en'; // Default fallback
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Object.values(this.languageConfig);
  }

  /**
   * Test translation service
   */
  async testTranslation() {
    try {
      const testText = "Software Engineer";
      const result = await this.translateText(testText, 'fr', this.languageConfig.fr, 'job title');
      return `Translation test successful: "${testText}" -> "${result}"`;
    } catch (error) {
      throw new Error(`Translation test failed: ${error.message}`);
    }
  }
}

module.exports = TranslationService;
