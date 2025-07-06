import React, { createContext, useContext, useState, useEffect } from 'react';
import LanguageService from '../services/languageService';
import LanguageTransformationService from '../services/languageTransformationService';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [fieldLabels, setFieldLabels] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available languages on mount
  useEffect(() => {
    loadAvailableLanguages();
  }, []);

  // Load field labels when language changes
  useEffect(() => {
    if (currentLanguage) {
      loadFieldLabels(currentLanguage);
      LanguageService.applyLanguageDirection(currentLanguage);
    }
  }, [currentLanguage]);

  const loadAvailableLanguages = async () => {
    try {
      // Use the local transformation service for available languages
      const languages = LanguageTransformationService.getAvailableLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      console.error('Failed to load available languages:', error);
      setError('Failed to load language options');
    }
  };

  const loadFieldLabels = async (languageCode) => {
    try {
      // Use the local transformation service for field labels
      const labels = LanguageTransformationService.getFieldLabels(languageCode);
      setFieldLabels(labels);
    } catch (error) {
      console.error('Failed to load field labels:', error);
      // Use fallback labels
      setFieldLabels({
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
      });
    }
  };

  const changeLanguage = async (languageCode) => {
    if (availableLanguages.some(lang => lang.code === languageCode)) {
      setCurrentLanguage(languageCode);
      // Store in localStorage for persistence
      localStorage.setItem('preferredLanguage', languageCode);
    }
  };

  const getLanguageDetails = (languageCode) => {
    return availableLanguages.find(lang => lang.code === languageCode);
  };

  const isRTL = () => {
    const currentLang = getLanguageDetails(currentLanguage);
    return currentLang?.direction === 'rtl';
  };

  const getLabel = (key, fallback = '') => {
    return fieldLabels[key] || fallback || key;
  };

  const getFieldLabels = () => {
    return {
      // Personal Info
      personalInfo: getLabel('personalInfo', 'Personal Information'),
      firstName: getLabel('firstName', 'First Name'),
      lastName: getLabel('lastName', 'Last Name'),
      title: getLabel('title', 'Professional Title'),
      email: getLabel('email', 'Email'),
      phone: getLabel('phone', 'Phone'),
      location: getLabel('location', 'Location'),
      summary: getLabel('summary', 'Professional Summary'),
      
      // Experience & Education
      experience: getLabel('experience', 'Work Experience'),
      education: getLabel('education', 'Education'),
      skills: getLabel('skills', 'Skills & Languages'),
      
      // Job Application
      jobAnalysis: getLabel('jobAnalysis', 'Job Analysis Results'),
      generateDocuments: getLabel('generateDocuments', 'Generate Tailored Documents'),
      reviewEdit: getLabel('reviewEdit', 'Review & Edit Your Tailored CV'),
      downloadDocuments: getLabel('downloadDocuments', 'Download Your Documents')
    };
  };

  // Enhanced processing functions with language support
  const processWithLanguageDetection = async (processingFunction, ...args) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await processingFunction(...args);
      
      // Check if language selection is required
      if (LanguageService.requiresLanguageChoice(result)) {
        return {
          requiresLanguageChoice: true,
          languageData: result
        };
      }
      
      return {
        requiresLanguageChoice: false,
        data: result
      };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const extractCVWithLanguageDetection = async (text) => {
    return processWithLanguageDetection(
      LanguageService.extractCVWithLanguageDetection,
      text
    );
  };

  const extractJobOfferWithLanguageDetection = async (text) => {
    return processWithLanguageDetection(
      LanguageService.extractJobOfferWithLanguageDetection,
      text
    );
  };

  const processFileWithLanguageDetection = async (file) => {
    return processWithLanguageDetection(
      LanguageService.processFileWithLanguageDetection,
      file
    );
  };

  const generateTailoredCVWithLanguage = async (cv, jobOffer, additionalRequirements = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await LanguageService.generateTailoredCVWithLanguage(
        cv,
        jobOffer,
        currentLanguage,
        additionalRequirements
      );
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateCoverLetterWithLanguage = async (cv, jobOffer, additionalRequirements = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await LanguageService.generateCoverLetterWithLanguage(
        cv,
        jobOffer,
        currentLanguage,
        additionalRequirements
      );
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const applyCVLanguage = async (cvData, contentTypes = ['all']) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await LanguageService.applyCVLanguage(
        cvData,
        currentLanguage,
        contentTypes
      );
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    // State
    currentLanguage,
    availableLanguages,
    fieldLabels,
    isLoading,
    error,

    // Language info functions
    getLanguageDetails,
    isRTL,
    getLabel,
    getFieldLabels,

    // Language management
    changeLanguage,
    loadFieldLabels,

    // Processing with language detection
    extractCVWithLanguageDetection,
    extractJobOfferWithLanguageDetection,
    processFileWithLanguageDetection,

    // Content generation with language
    generateTailoredCVWithLanguage,
    generateCoverLetterWithLanguage,
    applyCVLanguage,

    // Utility functions
    setIsLoading,
    setError,
    clearError: () => setError(null)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
