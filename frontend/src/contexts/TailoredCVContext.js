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
  
  // Validate job offer data structure
  const validateJobOfferData = useCallback((data) => {
    const requiredFields = ['title', 'company', 'location', 'description'];
    const hasRequiredFields = requiredFields.some(field => data[field] && data[field].trim());
    
    if (!hasRequiredFields) {
      throw new Error('Missing required job offer fields');
    }
    
    // Ensure arrays exist
    const arrayFields = ['requirements', 'keySkills', 'preferredQualifications', 'benefits'];
    arrayFields.forEach(field => {
      if (!Array.isArray(data[field])) {
        data[field] = [];
      }
    });
    
    return data;
  }, []);

  // Enhanced utility function to extract JSON from AI responses (handles malformed JSON)
  const extractJsonFromResponse = useCallback((response) => {
    // Convert response to string if it's not already
    let content = typeof response === 'string' ? response : String(response || '');
    content = content.trim();
    
    console.log('🔍 Raw response length:', content.length);
    console.log('🔍 Raw response preview:', content.substring(0, 200));
    
    // Remove markdown code blocks
    const codeBlockPatterns = [
      /```json\s*([\s\S]*?)\s*```/,  // ```json ... ```
      /```\s*([\s\S]*?)\s*```/,      // ``` ... ```
      /`([\s\S]*?)`/                 // `...`
    ];
    
    for (const pattern of codeBlockPatterns) {
      const match = content.match(pattern);
      if (match) {
        content = match[1];
        console.log('📋 Extracted from code block');
        break;
      }
    }
    
    // Clean up remaining artifacts
    content = content
      .trim()
      .replace(/^`+|`+$/g, '')      // Remove leading/trailing backticks
      .replace(/^\s*json\s*/i, '')  // Remove 'json' label
      .trim();
    
    // Try to find JSON object boundaries
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      content = content.substring(jsonStart, jsonEnd + 1);
      console.log('🎯 Extracted JSON boundaries');
    }
    
    // Fix common JSON formatting issues
    content = content
      .replace(/,\s*}/g, '}')        // Remove trailing commas before }
      .replace(/,\s*]/g, ']')        // Remove trailing commas before ]
      .replace(/([^\\])\\n/g, '$1\\\\n')  // Fix unescaped newlines
      .replace(/([^\\])\\t/g, '$1\\\\t')  // Fix unescaped tabs
      .replace(/([^\\])\\r/g, '$1\\\\r')  // Fix unescaped carriage returns
      .replace(/"/g, '"')            // Replace smart quotes
      .replace(/"/g, '"')            // Replace smart quotes
      .replace(/'/g, "'")            // Replace smart apostrophes
      .replace(/'/g, "'")            // Replace smart apostrophes
      .replace(/\u2013/g, '-')       // Replace en-dash
      .replace(/\u2014/g, '--')      // Replace em-dash
      .replace(/\u2026/g, '...')     // Replace ellipsis
      .replace(/[\u0000-\u001F\u007F]/g, '')  // Remove control characters
      .trim();
    
    // Try to validate and fix JSON
    try {
      JSON.parse(content);
      console.log('✅ JSON is valid');
      return content;
    } catch (error) {
      console.warn('⚠️ JSON validation failed, attempting repair:', error?.message || error?.toString() || 'Unknown validation error');
      
      // Try to fix unterminated strings
      content = fixUnterminatedStrings(content);
      
      try {
        JSON.parse(content);
        console.log('✅ JSON repaired successfully');
        return content;
      } catch (repairError) {
        console.error('❌ JSON repair failed:', repairError?.message || repairError?.toString() || 'Unknown repair error');
        
        // As last resort, try to extract a valid JSON portion
        const validJson = extractValidJsonPortion(content);
        if (validJson) {
          console.log('🔧 Extracted valid JSON portion');
          return validJson;
        }
        
        const repairErrorMessage = repairError?.message || repairError?.toString() || 'Unknown repair error';
        throw new Error(`Invalid JSON format: ${repairErrorMessage}. Content preview: ${content.substring(0, 200)}`);
      }
    }
  }, []);

  // Helper function to fix unterminated strings
  const fixUnterminatedStrings = (jsonStr) => {
    try {
      const lines = jsonStr.split('\n');
      const fixedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Count quotes to detect unterminated strings
        const quotes = (line.match(/"/g) || []).length;
        
        // If odd number of quotes and this is not the last character, try to fix
        if (quotes % 2 === 1 && !line.trim().endsWith('"') && !line.trim().endsWith('",') && !line.trim().endsWith('"')) {
          // Find the last quote and see if we need to add one
          const lastQuoteIndex = line.lastIndexOf('"');
          if (lastQuoteIndex !== -1) {
            // Add closing quote before any trailing comma or bracket
            if (line.includes(',')) {
              line = line.replace(/,$/, '",');
            } else if (line.includes('}') || line.includes(']')) {
              line = line.replace(/(\s*[}\]])/, '"$1');
            } else {
              line += '"';
            }
          }
        }
        
        fixedLines.push(line);
      }
      
      return fixedLines.join('\n');
    } catch (error) {
      console.warn('String repair failed:', error);
      return jsonStr;
    }
  };

  // Helper function to extract valid JSON portion
  const extractValidJsonPortion = (jsonStr) => {
    try {
      // Try to find a valid nested object
      let braceCount = 0;
      let start = -1;
      
      for (let i = 0; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') {
          if (start === -1) start = i;
          braceCount++;
        } else if (jsonStr[i] === '}') {
          braceCount--;
          if (braceCount === 0 && start !== -1) {
            const candidate = jsonStr.substring(start, i + 1);
            try {
              JSON.parse(candidate);
              return candidate;
            } catch (e) {
              // Continue searching
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Generate tailored CV based on original CV and job offer
  const generateTailoredCV = useCallback(async (originalCV, jobOffer, additionalRequirements = '', language = null) => {
    try {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true });
      setLoading(true);
      clearError();
      
      console.log('🎯 TailoredCV: Starting advanced CV tailoring...');
      console.log('📊 TailoredCV: Input data:', {
        hasOriginalCV: !!originalCV,
        hasJobOffer: !!jobOffer,
        hasAdditionalRequirements: !!additionalRequirements,
        language: language
      });

      // Call the new advanced tailoring API
      const response = await api.generateTailoredCV({
        cv: originalCV,
        jobOffer: jobOffer,
        additionalRequirements: additionalRequirements,
        language: language
      });

      console.log('📦 TailoredCV: API response:', response);
      console.log('📦 TailoredCV: Response structure:', {
        hasSuccess: !!response?.success,
        hasData: !!response?.data,
        responseKeys: Object.keys(response || {})
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
        console.log('❌ TailoredCV: Response does not indicate success:', response);
        throw new Error(response?.error || response?.message || 'Failed to generate tailored CV');
      }
    } catch (error) {
      console.error('❌ TailoredCV: Generation failed:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to generate tailored CV';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false });
      setLoading(false);
    }
  }, []);

  // Generate cover letter
  const generateCoverLetter = useCallback(async (originalCV, jobOffer, additionalRequirements = '', language = null) => {
    try {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true });
      setLoading(true);
      clearError();
      
      console.log('📝 TailoredCV: Generating cover letter...');
      const response = await api.generateCoverLetter({
        cv: originalCV,
        jobOffer: jobOffer,
        additionalRequirements: additionalRequirements,
        language: language
      });

      console.log('📦 TailoredCV: Cover letter API response:', response);

      if (response?.success) {
        const coverLetter = response.data || response;
        console.log('✅ TailoredCV: Cover letter generated successfully', coverLetter);
        
        dispatch({ type: 'SET_COVER_LETTER', payload: coverLetter });
        return { success: true, coverLetter };
      } else {
        throw new Error(response?.error || response?.message || 'Failed to generate cover letter');
      }
    } catch (error) {
      console.error('❌ TailoredCV: Cover letter generation failed:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to generate cover letter';
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
      const errorMessage = error?.message || error?.toString() || 'Failed to download tailored CV';
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
      const errorMessage = error?.message || error?.toString() || 'Failed to save tailored CV';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [state.tailoredCV, state.jobOffer]);

  // Add setJobOffer function
  const setJobOffer = useCallback((data) => {
    dispatch({ type: 'SET_JOB_OFFER', payload: data });
  }, []);

  const value = {
    // State
    ...state,
    isLoading: state.loading,
    
    // Actions
    generateTailoredCV,
    generateCoverLetter,
    updateTailoredCVSection,
    setJobOffer,
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
