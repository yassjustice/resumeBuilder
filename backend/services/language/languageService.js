/**
 * Language Service - Handles all language-related operations
 * Supports French, Arabic, and English for CV and cover letter generation
 */

class LanguageService {
  constructor() {
    this.supportedLanguages = ['en', 'fr', 'ar'];
    this.defaultLanguage = 'en';
  }

  /**
   * Get available languages with their display names
   */
  getAvailableLanguages() {
    return [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        flag: '🇺🇸'
      },
      {
        code: 'fr', 
        name: 'French',
        nativeName: 'Français',
        direction: 'ltr',
        flag: '🇫🇷'
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        direction: 'rtl',
        flag: '🇸🇦'
      }
    ];
  }

  /**
   * Validate language code
   */
  isValidLanguage(languageCode) {
    return this.supportedLanguages.includes(languageCode);
  }

  /**
   * Get language details by code
   */
  getLanguageDetails(languageCode) {
    const languages = this.getAvailableLanguages();
    return languages.find(lang => lang.code === languageCode) || languages.find(lang => lang.code === this.defaultLanguage);
  }

  /**
   * Get default language for fallback
   */
  getDefaultLanguage() {
    return this.defaultLanguage;
  }

  /**
   * Detect potential language from CV text (basic heuristics)
   */
  detectLanguageFromText(text) {
    if (!text || typeof text !== 'string') {
      return this.defaultLanguage;
    }

    const normalizedText = text.toLowerCase();
    
    // Arabic detection - check for Arabic characters
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar';
    }

    // French detection - common French words and patterns
    const frenchPatterns = [
      /\b(expérience|compétences|formation|éducation|projet|développeur|ingénieur|responsable|stage|entreprise|université|diplôme|français|langues|contact|téléphone|adresse|email|professionnel)\b/gi,
      /\b(développement|programmation|gestion|administration|conception|réalisation|coordination|supervision|collaboration|optimisation)\b/gi,
      /\b(spécialisé|maîtrise|expertise|efficace|polyvalent|dynamique|autonome|rigoureux|créatif|innovant)\b/gi
    ];

    const frenchMatches = frenchPatterns.reduce((count, pattern) => {
      const matches = normalizedText.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    // English detection - common English words
    const englishPatterns = [
      /\b(experience|skills|education|project|developer|engineer|manager|internship|company|university|degree|english|languages|contact|phone|address|email|professional)\b/gi,
      /\b(development|programming|management|administration|design|implementation|coordination|supervision|collaboration|optimization)\b/gi,
      /\b(specialized|expertise|efficient|versatile|dynamic|autonomous|rigorous|creative|innovative)\b/gi
    ];

    const englishMatches = englishPatterns.reduce((count, pattern) => {
      const matches = normalizedText.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    // Determine language based on pattern matches
    if (frenchMatches > englishMatches && frenchMatches > 3) {
      return 'fr';
    } else if (englishMatches > frenchMatches && englishMatches > 3) {
      return 'en';
    }

    // Default to English if no clear pattern
    return this.defaultLanguage;
  }

  /**
   * Format language choice response for frontend
   */
  formatLanguageChoiceResponse(detectedLanguage, extractedData, type = 'cv') {
    const detected = this.getLanguageDetails(detectedLanguage);
    const available = this.getAvailableLanguages();

    return {
      success: true,
      requiresLanguageChoice: true,
      detectedLanguage: {
        code: detected.code,
        name: detected.name,
        nativeName: detected.nativeName,
        confidence: this.getDetectionConfidence(detectedLanguage, extractedData)
      },
      availableLanguages: available,
      extractedData: extractedData,
      dataType: type, // 'cv', 'jobOffer', 'coverLetter'
      message: `Data extracted successfully. Please select your preferred language for ${type === 'cv' ? 'CV generation' : type === 'jobOffer' ? 'job matching and tailoring' : 'cover letter generation'}.`
    };
  }

  /**
   * Get detection confidence score
   */
  getDetectionConfidence(detectedLanguage, extractedData) {
    // Simple confidence based on detection method
    if (!extractedData || !extractedData.personalInfo) {
      return 'low';
    }

    const textToAnalyze = [
      extractedData.summary || '',
      extractedData.personalInfo?.name || '',
      extractedData.experience?.[0]?.description || '',
      extractedData.education?.[0]?.institution || ''
    ].join(' ');

    if (textToAnalyze.length < 50) {
      return 'low';
    }

    if (detectedLanguage === 'ar' && /[\u0600-\u06FF]/.test(textToAnalyze)) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Apply language-specific formatting to CV data
   */
  formatCVDataForLanguage(cvData, languageCode) {
    const language = this.getLanguageDetails(languageCode);
    
    return {
      ...cvData,
      language: languageCode,
      direction: language.direction,
      metadata: {
        ...cvData.metadata,
        language: languageCode,
        direction: language.direction,
        appliedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Get language-specific field labels for CV sections
   */
  getFieldLabels(languageCode) {
    const labels = {
      en: {
        personalInfo: 'Personal Information',
        name: 'Full Name',
        title: 'Professional Title',
        email: 'Email',
        phone: 'Phone',
        location: 'Location',
        linkedin: 'LinkedIn',
        github: 'GitHub',
        portfolio: 'Portfolio',
        summary: 'Professional Summary',
        experience: 'Work Experience',
        company: 'Company',
        position: 'Position',
        period: 'Period',
        responsibilities: 'Responsibilities',
        education: 'Education',
        institution: 'Institution',
        degree: 'Degree',
        field: 'Field of Study',
        skills: 'Skills',
        projects: 'Projects',
        certifications: 'Certifications',
        languages: 'Languages',
        interests: 'Interests'
      },
      fr: {
        personalInfo: 'Informations Personnelles',
        name: 'Nom Complet',
        title: 'Titre Professionnel',
        email: 'Email',
        phone: 'Téléphone',
        location: 'Localisation',
        linkedin: 'LinkedIn',
        github: 'GitHub',
        portfolio: 'Portfolio',
        summary: 'Résumé Professionnel',
        experience: 'Expérience Professionnelle',
        company: 'Entreprise',
        position: 'Poste',
        period: 'Période',
        responsibilities: 'Responsabilités',
        education: 'Formation',
        institution: 'Institution',
        degree: 'Diplôme',
        field: 'Domaine d\'Études',
        skills: 'Compétences',
        projects: 'Projets',
        certifications: 'Certifications',
        languages: 'Langues',
        interests: 'Centres d\'Intérêt'
      },
      ar: {
        personalInfo: 'المعلومات الشخصية',
        name: 'الاسم الكامل',
        title: 'المسمى الوظيفي',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        location: 'الموقع',
        linkedin: 'لينكد إن',
        github: 'جيت هاب',
        portfolio: 'المعرض',
        summary: 'الملخص المهني',
        experience: 'الخبرة المهنية',
        company: 'الشركة',
        position: 'المنصب',
        period: 'الفترة',
        responsibilities: 'المسؤوليات',
        education: 'التعليم',
        institution: 'المؤسسة',
        degree: 'الدرجة العلمية',
        field: 'مجال الدراسة',
        skills: 'المهارات',
        projects: 'المشاريع',
        certifications: 'الشهادات',
        languages: 'اللغات',
        interests: 'الاهتمامات'
      }
    };

    return labels[languageCode] || labels[this.defaultLanguage];
  }

  /**
   * Get language-specific content generation prompts
   */
  getContentGenerationPrompts(languageCode) {
    const prompts = {
      en: {
        cvSummary: 'Generate a professional summary in English for this CV. Focus on key achievements and value proposition.',
        coverLetter: 'Write a compelling cover letter in English based on the CV and job requirements.',
        jobMatching: 'Analyze job requirements in English and provide matching insights.',
        skillsOptimization: 'Optimize skills section in English for better ATS compatibility.'
      },
      fr: {
        cvSummary: 'Générez un résumé professionnel en français pour ce CV. Concentrez-vous sur les principales réalisations et la proposition de valeur.',
        coverLetter: 'Rédigez une lettre de motivation convaincante en français basée sur le CV et les exigences du poste.',
        jobMatching: 'Analysez les exigences du poste en français et fournissez des informations de correspondance.',
        skillsOptimization: 'Optimisez la section des compétences en français pour une meilleure compatibilité ATS.'
      },
      ar: {
        cvSummary: 'أنشئ ملخصاً مهنياً باللغة العربية لهذه السيرة الذاتية. ركز على الإنجازات الرئيسية وقيمة المرشح.',
        coverLetter: 'اكتب خطاب تغطية مقنع باللغة العربية بناءً على السيرة الذاتية ومتطلبات الوظيفة.',
        jobMatching: 'حلل متطلبات الوظيفة باللغة العربية وقدم رؤى المطابقة.',
        skillsOptimization: 'حسّن قسم المهارات باللغة العربية لتوافق أفضل مع أنظمة ATS.'
      }
    };

    return prompts[languageCode] || prompts[this.defaultLanguage];
  }
}

module.exports = LanguageService;
