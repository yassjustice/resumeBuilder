/**
 * Frontend Language Service
 * Handles API calls for language detection and content generation
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class LanguageService {
  /**
   * Get available languages from backend
   */
  static async getAvailableLanguages() {
    try {
      const response = await fetch(`${API_BASE_URL}/language/available`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get available languages');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting available languages:', error);
      throw error;
    }
  }

  /**
   * Detect language from text and get language choice options
   */
  static async detectLanguage(text, extractedData = null, dataType = 'cv') {
    try {
      const response = await fetch(`${API_BASE_URL}/language/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          extractedData,
          dataType
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to detect language');
      }
      
      return data;
    } catch (error) {
      console.error('Error detecting language:', error);
      throw error;
    }
  }

  /**
   * Apply selected language to CV data and generate language-specific content
   */
  static async applyCVLanguage(cvData, selectedLanguage, contentTypes = ['all']) {
    try {
      const response = await fetch(`${API_BASE_URL}/language/apply-cv-language`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData,
          selectedLanguage,
          contentTypes
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply language to CV');
      }
      
      return data;
    } catch (error) {
      console.error('Error applying CV language:', error);
      throw error;
    }
  }

  /**
   * Generate tailored CV in selected language
   */
  static async generateTailoredCV(cvData, jobData, selectedLanguage, additionalRequirements = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/language/generate-tailored-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData,
          jobData,
          selectedLanguage,
          additionalRequirements
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tailored CV');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating tailored CV:', error);
      throw error;
    }
  }

  /**
   * Generate cover letter in selected language
   */
  static async generateCoverLetter(cvData, jobData, selectedLanguage, additionalRequirements = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/language/generate-cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData,
          jobData,
          selectedLanguage,
          additionalRequirements
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  }

  /**
   * Optimize specific content for selected language
   */
  static async optimizeContent(content, contentType, selectedLanguage, context = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/language/optimize-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          contentType,
          selectedLanguage,
          context
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to optimize content');
      }
      
      return data;
    } catch (error) {
      console.error('Error optimizing content:', error);
      throw error;
    }
  }

  /**
   * Get field labels for specified language
   */
  static async getFieldLabels(languageCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/language/field-labels/${languageCode}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get field labels');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting field labels:', error);
      throw error;
    }
  }

  /**
   * Enhanced CV extraction with language detection (integrates with existing AI routes)
   */
  static async extractCVWithLanguageDetection(text) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/extract-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract CV');
      }
      
      return data;
    } catch (error) {
      console.error('Error extracting CV with language detection:', error);
      throw error;
    }
  }

  /**
   * Enhanced job offer extraction with language detection
   */
  static async extractJobOfferWithLanguageDetection(text) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/extract-job-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract job offer');
      }
      
      return data;
    } catch (error) {
      console.error('Error extracting job offer with language detection:', error);
      throw error;
    }
  }

  /**
   * Enhanced tailored CV generation with language support
   */
  static async generateTailoredCVWithLanguage(cv, jobOffer, selectedLanguage, additionalRequirements = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/tailor-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv,
          jobOffer,
          selectedLanguage,
          additionalRequirements
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tailored CV');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating tailored CV with language:', error);
      throw error;
    }
  }

  /**
   * Enhanced cover letter generation with language support
   */
  static async generateCoverLetterWithLanguage(cv, jobOffer, selectedLanguage, additionalRequirements = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv,
          jobOffer,
          selectedLanguage,
          additionalRequirements
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating cover letter with language:', error);
      throw error;
    }
  }

  /**
   * Process uploaded file with language detection
   */
  static async processFileWithLanguageDetection(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/ai/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }
      
      return data;
    } catch (error) {
      console.error('Error processing file with language detection:', error);
      throw error;
    }
  }

  /**
   * Utility: Check if response requires language selection
   */
  static requiresLanguageChoice(response) {
    return response && response.requiresLanguageChoice === true;
  }

  /**
   * Utility: Get language direction for CSS
   */
  static getLanguageDirection(languageCode) {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
  }

  /**
   * Utility: Apply language direction to document (only for RTL languages)
   */
  static applyLanguageDirection(languageCode) {
    const direction = this.getLanguageDirection(languageCode);
    // Only apply RTL if the language is actually RTL, otherwise keep LTR
    if (direction === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    document.documentElement.setAttribute('lang', languageCode);
  }
}

export default LanguageService;
