/**
 * 🆓 Streamlined Puter AI Integration Hook
 * React hook for managing the streamlined Puter service
 */

import { useState, useEffect, useCallback } from 'react';
import streamlinedPuterAIService from '../services/puterAIService';

const usePuterAI = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({});
  const [authenticationRequired, setAuthenticationRequired] = useState(false);

  // Initialize Puter service
  useEffect(() => {
    const initializePuterService = async () => {
      try {
        console.log('🚀 Initializing streamlined Puter service in hook...');
        
        // Initialize the streamlined service
        await streamlinedPuterAIService.init();
        
        // Get status
        const status = streamlinedPuterAIService.getStatus();
        setIsReady(status.isInitialized);
        setIsAuthenticated(status.isAuthenticated);
        
        // Set authentication requirement based on service capabilities
        if (!status.isAuthenticated) {
          setAuthenticationRequired(true);
          console.log('🔓 Streamlined Puter service ready in guest mode - authentication on demand');
        } else {
          setAuthenticationRequired(false);
          console.log('🔐 Streamlined Puter service ready with authentication');
        }
        
        console.log('✅ Streamlined Puter service initialization completed successfully');
        
      } catch (err) {
        console.error('❌ Streamlined Puter service initialization failed:', err);
        setError(`Puter service initialization failed: ${err.message}`);
        setAuthenticationRequired(true);
      }
    };

    initializePuterService();
  }, []);

  // Clear initialization errors when service becomes ready
  useEffect(() => {
    if (isReady && error && error.includes('initialization timeout')) {
      setError(null);
      console.log('✅ Puter.js initialization completed successfully');
    }
  }, [isReady, error]);

  // Generic processing function
  const processWithPuter = useCallback(async (operation, data) => {
    if (!isReady) {
      throw new Error('Puter.js not ready yet');
    }

    // Warn if not authenticated but allow operation
    if (!isAuthenticated) {
      console.warn('⚠️ Operating in guest mode - some features may be limited');
    }

    setProcessing(true);
    setCurrentOperation(operation);
    setError(null);

    try {
      let result;

      switch (operation) {
        case 'tailor_cv':
          result = await streamlinedPuterAIService.generateTailoredCV(
            data.cvData, 
            data.jobOffer, 
            data.additionalRequirements, 
            data.language
          );
          break;
        
        case 'generate_cover_letter':
          result = await streamlinedPuterAIService.generateCoverLetter(
            data.cvData, 
            data.jobOffer, 
            data.additionalInfo,
            data.language
          );
          break;
        
        case 'enhance_cv':
          result = await streamlinedPuterAIService.enhanceCV(data.cvData, data.jobDescription);
          break;
        
        case 'analyze_job_match':
          result = await streamlinedPuterAIService.analyzeJobMatch(data.cvData, data.jobDescription);
          break;
        
        case 'optimize_skills':
          const prompt = `Optimize skills for: ${JSON.stringify(data)}`;
          result = await streamlinedPuterAIService.processWithBackend(prompt, 'skill_optimization', data);
          break;
          break;
        
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      setResults(prev => ({ ...prev, [operation]: result }));
      return result;

    } catch (err) {
      const errorMessage = err.message || 'Unknown error';
      
      // Check if it's an authentication error
      if (errorMessage.includes('Authentication required') || 
          errorMessage.includes('401') || 
          errorMessage.includes('unauthorized')) {
        setAuthenticationRequired(true);
        setError(`Authentication required for ${operation}`);
      } else {
        setError(`${operation} failed: ${errorMessage}`);
      }
      
      throw err;
    } finally {
      setProcessing(false);
      setCurrentOperation(null);
    }
  }, [isReady]);

  // Enhanced CV processing
  const enhanceCV = useCallback(async (cvData, jobDescription = '') => {
    return processWithPuter('enhance_cv', { cvData, jobDescription });
  }, [processWithPuter]);

  // Tailor CV to job offer (NEW - matches Gemini functionality)
  const tailorCV = useCallback(async (cvData, jobOffer, additionalRequirements = '', language = 'en') => {
    return processWithPuter('tailor_cv', { cvData, jobOffer, additionalRequirements, language });
  }, [processWithPuter]);

  // Cover letter generation
  const generateCoverLetter = useCallback(async (cvData, jobOffer, additionalInfo = '', language = 'en') => {
    return processWithPuter('generate_cover_letter', { cvData, jobOffer, additionalInfo, language });
  }, [processWithPuter]);

  // Job matching analysis
  const analyzeJobMatch = useCallback(async (cvData, jobDescription) => {
    return processWithPuter('analyze_job_match', { cvData, jobDescription });
  }, [processWithPuter]);

  // Skills optimization
  const optimizeSkills = useCallback(async (cvData, jobDescription = '') => {
    return processWithPuter('optimize_skills', { cvData, jobDescription });
  }, [processWithPuter]);

  // Authentication
  const signIn = useCallback(async () => {
    try {
      setError(null);
      const result = await streamlinedPuterAIService.signIn();
      
      if (result.success) {
        setIsAuthenticated(true);
        setAuthenticationRequired(false);
        console.log('✅ Hook: Sign-in successful -', result.message);
      } else {
        setError(result.message || 'Authentication failed');
        console.warn('⚠️ Hook: Sign-in failed -', result.message);
      }
      
      return result.success;
    } catch (err) {
      const errorMessage = `Authentication failed: ${err.message}`;
      setError(errorMessage);
      console.error('❌ Hook: Sign-in error:', err);
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset results
  const clearResults = useCallback(() => {
    setResults({});
  }, []);

  // Get specific result
  const getResult = useCallback((operation) => {
    return results[operation];
  }, [results]);

  return {
    // State
    isReady,
    isAuthenticated,
    authenticationRequired,
    processing,
    currentOperation,
    error,
    results,
    
    // Actions
    enhanceCV,
    tailorCV,
    generateCoverLetter,
    analyzeJobMatch,
    optimizeSkills,
    signIn,
    clearError,
    clearResults,
    getResult,
    
    // Utilities
    modelInfo: streamlinedPuterAIService ? streamlinedPuterAIService.getStatus().currentModel : 'loading',
    resetModels: () => streamlinedPuterAIService && streamlinedPuterAIService.reset()
  };
};

export default usePuterAI;
