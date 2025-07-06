/**
 * Client-side Language Transformation Service
 * Handles formatting and transformation of CV data based on selected language
 * Now includes AI-powered translation capabilities
 */
import { api } from './api';

// Language-specific formatting rules
const LANGUAGE_CONFIGS = {
  en: {
    name: 'English',
    code: 'en',
    direction: 'ltr',
    dateFormat: 'MM/YYYY',
    phoneFormat: (phone) => phone, // Keep as is for English
    nameOrder: 'first-last',
    addressFormat: 'city, country'
  },
  fr: {
    name: 'Français',
    code: 'fr',
    direction: 'ltr',
    dateFormat: 'MM/YYYY',
    phoneFormat: (phone) => phone, // Keep as is for French
    nameOrder: 'first-last',
    addressFormat: 'city, country'
  },
  ar: {
    name: 'العربية',
    code: 'ar',
    direction: 'rtl',
    dateFormat: 'YYYY/MM',
    phoneFormat: (phone) => phone, // Keep as is for Arabic
    nameOrder: 'first-last', // Could be changed to 'last-first' if needed
    addressFormat: 'country, city'
  }
};

// Field labels by language
const FIELD_LABELS = {
  en: {
    personalInfo: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    title: 'Professional Title',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills & Languages',
    jobAnalysis: 'Job Analysis Results',
    generateDocuments: 'Generate Tailored Documents',
    reviewEdit: 'Review & Edit Your Tailored CV',
    downloadDocuments: 'Download Your Documents'
  },
  fr: {
    personalInfo: 'Informations Personnelles',
    firstName: 'Prénom',
    lastName: 'Nom',
    title: 'Titre Professionnel',
    email: 'Email',
    phone: 'Téléphone',
    location: 'Localisation',
    summary: 'Résumé Professionnel',
    experience: 'Expérience Professionnelle',
    education: 'Formation',
    skills: 'Compétences et Langues',
    jobAnalysis: 'Résultats de l\'Analyse d\'Emploi',
    generateDocuments: 'Générer des Documents Personnalisés',
    reviewEdit: 'Réviser et Modifier Votre CV Personnalisé',
    downloadDocuments: 'Télécharger Vos Documents',
    // Additional labels for form elements
    currentlyWorking: 'Travaille actuellement ici',
    currentlyStudying: 'Étudie actuellement ici',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    company: 'Entreprise',
    position: 'Poste',
    institution: 'Institution',
    degree: 'Diplôme',
    grade: 'Note/Mention'
  },
  ar: {
    personalInfo: 'المعلومات الشخصية',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    title: 'المسمى الوظيفي',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    location: 'الموقع',
    summary: 'الملخص المهني',
    experience: 'الخبرة المهنية',
    education: 'التعليم',
    skills: 'المهارات واللغات',
    jobAnalysis: 'نتائج تحليل الوظيفة',
    generateDocuments: 'إنشاء مستندات مخصصة',
    reviewEdit: 'مراجعة وتعديل سيرتك الذاتية المخصصة',
    downloadDocuments: 'تحميل مستنداتك'
  }
};

class LanguageTransformationService {
  /**
   * Get available languages
   */
  static getAvailableLanguages() {
    return Object.values(LANGUAGE_CONFIGS);
  }

  /**
   * Get language configuration
   */
  static getLanguageConfig(languageCode) {
    return LANGUAGE_CONFIGS[languageCode] || LANGUAGE_CONFIGS.en;
  }

  /**
   * Get field labels for a language
   */
  static getFieldLabels(languageCode) {
    return FIELD_LABELS[languageCode] || FIELD_LABELS.en;
  }

  /**
   * Detect language and translate CV data using AI
   * @param {Object} cvData - CV data to translate
   * @param {string} targetLanguage - Target language code
   * @returns {Promise<Object>} - Translated and formatted CV data
   */
  static async translateCVWithAI(cvData, targetLanguage) {
    try {
      console.log(`🌐 translateCVWithAI: Starting AI translation to ${targetLanguage}`);
      console.log(`📋 translateCVWithAI: Input CV data:`, cvData);

      // First, detect the source language
      console.log(`🔍 translateCVWithAI: Calling language detection API...`);
      const detectionResult = await api.detectLanguage(cvData);
      console.log(`🔍 translateCVWithAI: Detection result:`, detectionResult);
      
      if (!detectionResult.success) {
        throw new Error(`Language detection failed: ${detectionResult.error}`);
      }

      const sourceLanguage = detectionResult.detectedLanguage;
      console.log(`🔍 translateCVWithAI: Detected source language: ${sourceLanguage}`);

      // If source and target are the same, just format without translation
      if (sourceLanguage === targetLanguage) {
        console.log(`✅ translateCVWithAI: Same language detected (${sourceLanguage} = ${targetLanguage}), formatting only`);
        return this.formatCVData(cvData, targetLanguage);
      }

      // Translate using AI
      console.log(`🤖 translateCVWithAI: Calling translation API from ${sourceLanguage} to ${targetLanguage}`);
      const translationResult = await api.translateCV(cvData, targetLanguage, sourceLanguage);
      console.log(`🤖 translateCVWithAI: Translation result:`, translationResult);
      
      if (!translationResult.success) {
        throw new Error(`Translation failed: ${translationResult.error}`);
      }

      console.log(`✅ translateCVWithAI: AI translation completed successfully`);
      console.log(`📄 translateCVWithAI: Translated CV:`, translationResult.translatedCV);
      
      // Apply additional formatting to the translated data
      const finalData = this.formatCVData(translationResult.translatedCV, targetLanguage);
      console.log(`🎨 translateCVWithAI: Final formatted data:`, finalData);
      return finalData;

    } catch (error) {
      console.error(`❌ translateCVWithAI: AI translation error:`, error);
      
      // Fallback to local formatting if AI translation fails
      console.log(`🔄 translateCVWithAI: Falling back to local formatting only`);
      return this.formatCVData(cvData, targetLanguage);
    }
  }

  /**
   * Format CV data according to language preferences (without translation)
   */
  static formatCVData(cvData, languageCode) {
    if (!cvData) return cvData;

    const config = this.getLanguageConfig(languageCode);
    const formattedData = JSON.parse(JSON.stringify(cvData)); // Deep clone

    // Format dates in experience
    if (formattedData.experience && Array.isArray(formattedData.experience)) {
      formattedData.experience = formattedData.experience.map(exp => ({
        ...exp,
        startDate: this.formatDate(exp.startDate, config.dateFormat),
        endDate: this.formatDate(exp.endDate, config.dateFormat)
      }));
    }

    // Format dates in education
    if (formattedData.education && Array.isArray(formattedData.education)) {
      formattedData.education = formattedData.education.map(edu => ({
        ...edu,
        startDate: this.formatDate(edu.startDate, config.dateFormat),
        endDate: this.formatDate(edu.endDate, config.dateFormat)
      }));
    }

    // Format phone number
    if (formattedData.personalInfo && formattedData.personalInfo.phone) {
      formattedData.personalInfo.phone = config.phoneFormat(formattedData.personalInfo.phone);
    }

    // Add language metadata
    formattedData._language = {
      code: languageCode,
      direction: config.direction,
      config: config
    };

    return formattedData;
  }

  /**
   * Format date according to language preferences
   */
  static formatDate(dateString, format) {
    if (!dateString) return dateString;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      switch (format) {
        case 'MM/YYYY':
          return `${month}/${year}`;
        case 'YYYY/MM':
          return `${year}/${month}`;
        default:
          return dateString;
      }
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Normalize extracted CV data for consistent formatting
   */
  static normalizeExtractedData(extractedData) {
    if (!extractedData) return null;

    const normalized = {
      personalInfo: {
        firstName: extractedData.personalInfo?.firstName || extractedData.firstName || '',
        lastName: extractedData.personalInfo?.lastName || extractedData.lastName || '',
        title: extractedData.personalInfo?.title || extractedData.title || '',
        email: extractedData.personalInfo?.email || extractedData.email || '',
        phone: extractedData.personalInfo?.phone || extractedData.phone || '',
        location: extractedData.personalInfo?.location || extractedData.location || '',
        linkedin: extractedData.personalInfo?.linkedin || extractedData.linkedin || '',
        website: extractedData.personalInfo?.website || extractedData.website || ''
      },
      summary: extractedData.summary || '',
      experience: Array.isArray(extractedData.experience) ? extractedData.experience : [],
      education: Array.isArray(extractedData.education) ? extractedData.education : [],
      skills: extractedData.skills || {}, // Preserve skills structure (object from AI or array from UI)
      languages: Array.isArray(extractedData.languages) ? extractedData.languages : [],
      certifications: Array.isArray(extractedData.certifications) ? extractedData.certifications : []
    };

    // Ensure all arrays have proper structure
    normalized.experience = normalized.experience.map(exp => ({
      company: exp.company || '',
      position: exp.position || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: exp.description || '',
      location: exp.location || ''
    }));

    normalized.education = normalized.education.map(edu => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      grade: edu.grade || ''
    }));

    // Handle skills normalization - skills can be object (from AI) or array (from UI)
    if (Array.isArray(normalized.skills)) {
      // If skills is array, normalize each skill
      normalized.skills = normalized.skills.map(skill => ({
        name: typeof skill === 'string' ? skill : (skill.name || '')
      }));
    } else if (typeof normalized.skills === 'object' && normalized.skills !== null) {
      // If skills is object (from AI extraction), keep it as-is
      console.log('✅ Preserving AI-extracted skills object structure:', Object.keys(normalized.skills));
    } else {
      // Default to empty object
      normalized.skills = {};
    }

    normalized.languages = normalized.languages.map(lang => ({
      name: typeof lang === 'string' ? lang : (lang.name || ''),
      level: lang.level || 'Intermediate'
    }));

    return normalized;
  }

  /**
   * Apply language transformation to extracted CV data with AI translation
   */
  static async applyLanguageToExtractedData(extractedData, languageCode) {
    // First normalize the data
    const normalizedData = this.normalizeExtractedData(extractedData);
    
    // Then translate and format using AI
    return await this.translateCVWithAI(normalizedData, languageCode);
  }

  /**
   * Test the AI translation service
   */
  static async testAITranslation() {
    try {
      const result = await api.testTranslation();
      return result;
    } catch (error) {
      console.error('AI translation test failed:', error);
      throw error;
    }
  }
}

export default LanguageTransformationService;
