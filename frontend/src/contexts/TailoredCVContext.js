import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { api } from '../services/api';

const TailoredCVContext = createContext();

// Tailored CV reducer
const tailoredCVReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_JOB_OFFER':
      return {
        ...state,
        jobOffer: action.payload,
        error: null,
      };
    case 'SET_TAILORED_CV':
      return {
        ...state,
        tailoredCV: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_COVER_LETTER':
      return {
        ...state,
        coverLetter: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_AI_PROCESSING':
      return {
        ...state,
        aiProcessing: action.payload,
      };
    case 'UPDATE_TAILORED_CV_SECTION':
      return {
        ...state,
        tailoredCV: {
          ...state.tailoredCV,
          [action.payload.section]: action.payload.data,
        },
      };
    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        jobOffer: null,
        tailoredCV: null,
        coverLetter: null,
        loading: false,
        aiProcessing: false,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  jobOffer: null,
  tailoredCV: null,
  coverLetter: null,
  loading: false,
  aiProcessing: false,
  error: null,
};

export const TailoredCVProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tailoredCVReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearAllData = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
  }, []);

  // Extract job offer from text or file
  const extractJobOffer = useCallback(async (text) => {
    try {
      setLoading(true);
      clearError();
      
      console.log('🔍 TailoredCV: Extracting job offer from text...');
      const response = await api.extractJobOfferFromText(text);
      
      if (response?.success) {
        const jobOffer = response.jobOffer || response;
        console.log('✅ TailoredCV: Job offer extracted successfully');
        dispatch({ type: 'SET_JOB_OFFER', payload: jobOffer });
        return { success: true, jobOffer };
      } else {
        throw new Error(response?.error || 'Failed to extract job offer');
      }
    } catch (error) {
      console.error('❌ TailoredCV: Job offer extraction failed:', error);
      const errorMessage = error.message || 'Failed to extract job offer';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate tailored CV based on original CV and job offer
  const generateTailoredCV = useCallback(async (originalCV, jobOffer, additionalRequirements = '') => {
    try {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true });
      setLoading(true);
      clearError();
      
      console.log('🎯 TailoredCV: Starting advanced CV tailoring...');
      console.log('📊 TailoredCV: Input data:', {
        hasOriginalCV: !!originalCV,
        hasJobOffer: !!jobOffer,
        hasAdditionalRequirements: !!additionalRequirements
      });

      // Call the new advanced tailoring API
      const response = await api.generateTailoredCV({
        cv: originalCV,
        jobOffer: jobOffer,
        additionalRequirements: additionalRequirements
      });

      if (response?.success || response?.data) {
        const tailoredCV = response.data || response;
        console.log('✅ TailoredCV: CV tailored successfully');
        console.log('📝 TailoredCV: Tailored CV structure:', {
          hasPersonalInfo: !!tailoredCV.personalInfo,
          hasSummary: !!tailoredCV.summary,
          experienceCount: tailoredCV.experience?.length || 0,
          educationCount: tailoredCV.education?.length || 0,
          skillsCount: Object.keys(tailoredCV.skills || {}).length,
          hasMetadata: !!tailoredCV.metadata
        });
        
        dispatch({ type: 'SET_TAILORED_CV', payload: tailoredCV });
        return { success: true, tailoredCV };
      } else {
        throw new Error(response?.error || 'Failed to generate tailored CV');
      }
    } catch (error) {
      console.error('❌ TailoredCV: Generation failed:', error);
      const errorMessage = error.message || 'Failed to generate tailored CV';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false });
      setLoading(false);
    }
  }, []);

  // Generate cover letter
  const generateCoverLetter = useCallback(async (originalCV, jobOffer, additionalRequirements = '') => {
    try {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true });
      setLoading(true);
      clearError();
      
      console.log('📝 TailoredCV: Generating cover letter...');

      const response = await api.generateCoverLetter({
        cv: originalCV,
        jobOffer: jobOffer,
        additionalRequirements: additionalRequirements
      });

      if (response?.success || response?.coverLetter) {
        const coverLetter = response.coverLetter || response;
        console.log('✅ TailoredCV: Cover letter generated successfully');
        
        dispatch({ type: 'SET_COVER_LETTER', payload: coverLetter });
        return { success: true, coverLetter };
      } else {
        throw new Error(response?.error || 'Failed to generate cover letter');
      }
    } catch (error) {
      console.error('❌ TailoredCV: Cover letter generation failed:', error);
      const errorMessage = error.message || 'Failed to generate cover letter';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false });
      setLoading(false);
    }
  }, []);

  // Update specific section of tailored CV
  const updateTailoredCVSection = useCallback((section, data) => {
    dispatch({ 
      type: 'UPDATE_TAILORED_CV_SECTION', 
      payload: { section, data } 
    });
  }, []);

  // Download tailored CV as PDF
  const downloadTailoredCV = useCallback(async (filename = 'tailored-cv') => {
    try {
      setLoading(true);
      clearError();
      
      if (!state.tailoredCV) {
        throw new Error('No tailored CV available for download');
      }

      console.log('📥 TailoredCV: Starting PDF download...');
      
      const response = await api.generatePDF(state.tailoredCV, {
        filename: filename,
        theme: 'professional' // Default theme for tailored CVs
      });

      if (response?.success) {
        console.log('✅ TailoredCV: PDF downloaded successfully');
        return { success: true };
      } else {
        throw new Error(response?.error || 'Failed to download tailored CV');
      }
    } catch (error) {
      console.error('❌ TailoredCV: Download failed:', error);
      const errorMessage = error.message || 'Failed to download tailored CV';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [state.tailoredCV]);

  // Save tailored CV to user's account (optional)
  const saveTailoredCV = useCallback(async (name = 'Tailored CV') => {
    try {
      setLoading(true);
      clearError();
      
      if (!state.tailoredCV) {
        throw new Error('No tailored CV available to save');
      }

      console.log('💾 TailoredCV: Saving to account...');
      
      // Create a copy with a specific name/identifier
      const cvToSave = {
        ...state.tailoredCV,
        name: name,
        type: 'tailored',
        originalJobOffer: state.jobOffer,
        savedAt: new Date().toISOString()
      };

      const response = await api.saveCV(cvToSave);

      if (response?.success) {
        console.log('✅ TailoredCV: Saved to account successfully');
        return { success: true };
      } else {
        throw new Error(response?.error || 'Failed to save tailored CV');
      }
    } catch (error) {
      console.error('❌ TailoredCV: Save failed:', error);
      const errorMessage = error.message || 'Failed to save tailored CV';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [state.tailoredCV, state.jobOffer]);

  const value = {
    // State
    ...state,
    isLoading: state.loading,
    
    // Actions
    extractJobOffer,
    generateTailoredCV,
    generateCoverLetter,
    updateTailoredCVSection,
    downloadTailoredCV,
    saveTailoredCV,
    clearAllData,
    clearError,
  };

  return (
    <TailoredCVContext.Provider value={value}>
      {children}
    </TailoredCVContext.Provider>
  );
};

export const useTailoredCV = () => {
  const context = useContext(TailoredCVContext);
  if (context === undefined) {
    throw new Error('useTailoredCV must be used within a TailoredCVProvider');
  }
  return context;
};
