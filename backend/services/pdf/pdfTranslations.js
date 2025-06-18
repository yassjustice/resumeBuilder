/**
 * PDF Translations
 * Provides translations for PDF generation based on language
 */

// English translations
const en = {
  // PDF Section Headers
  professional_summary: 'Professional Summary',
  technical_skills: 'Technical Skills',
  professional_experience: 'Professional Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
  languages: 'Languages',
  interests: 'Interests',
  
  // Contact Info Labels
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  portfolio: 'Portfolio',
  
  // Skills & Technologies
  technologies: 'Technologies',
  
  // Certificates
  issuer: 'Issuer',
  date: 'Date',
  skills: 'Skills'
};

// French translations
const fr = {
  // PDF Section Headers
  professional_summary: 'Résumé Professionnel',
  technical_skills: 'Compétences Techniques',
  professional_experience: 'Expérience Professionnelle',
  projects: 'Projets',
  education: 'Formation',
  certifications: 'Certifications',
  languages: 'Langues',
  interests: 'Centres d\'intérêt',
  
  // Contact Info Labels
  email: 'Email',
  phone: 'Téléphone',
  location: 'Localisation',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  portfolio: 'Portfolio',
  
  // Skills & Technologies
  technologies: 'Technologies',
  
  // Certificates
  issuer: 'Organisme',
  date: 'Date',
  skills: 'Compétences'
};

// All translations
const translations = { en, fr };

/**
 * Get translated text based on language code
 * @param {string} key - Translation key
 * @param {string} lang - Language code (en, fr)
 * @returns {string} - Translated text
 */
const getTranslation = (key, lang = 'en') => {
  if (!translations[lang]) {
    // Fallback to English if language not supported
    return translations.en[key] || key;
  }
  
  return translations[lang][key] || translations.en[key] || key;
};

module.exports = {
  getTranslation
};
