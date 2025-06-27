import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { api } from '../services/api';
import { categorizeSkillsArray, normalizeSkillsForUI } from '../utils/skillsCategorization';

const CVContext = createContext();

// CV reducer
const cvReducer = (state, action) => {
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
      };    case 'SET_FULL_CV':
      return {
        ...state,
        fullCV: action.payload.fullCV,
        originalCV: action.payload.originalCV,
        loading: false,
        error: null,
      };
    case 'UPDATE_CV_SECTION':
      return {
        ...state,
        fullCV: {
          ...state.fullCV,
          [action.payload.section]: action.payload.data,
        },
      };
    case 'SET_JOB_OFFER':
      return {
        ...state,
        currentJobOffer: action.payload,
      };
    case 'SET_GENERATED_CV':
      return {
        ...state,
        generatedCV: action.payload,
        loading: false,
      };
    case 'SET_GENERATED_COVER_LETTER':
      return {
        ...state,
        generatedCoverLetter: action.payload,
        loading: false,
      };    case 'CLEAR_GENERATED_CONTENT':
      return {
        ...state,
        generatedCV: null,
        generatedCoverLetter: null,
        currentJobOffer: null,
      };    case 'CLEAR_ALL_CV_DATA':
      return {
        ...state,
        fullCV: null,
        originalCV: null,
        currentJobOffer: null,
        generatedCV: null,
        generatedCoverLetter: null,
        loading: false,
        aiProcessing: false,
        error: null,
      };
    case 'SET_AI_PROCESSING':
      return {
        ...state,
        aiProcessing: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  fullCV: null,
  originalCV: null, // Store original backend format for dashboard stats
  currentJobOffer: null,
  generatedCV: null,
  generatedCoverLetter: null,
  loading: false,
  aiProcessing: false,
  error: null,
};

export const CVProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cvReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Clear all CV data (useful for starting fresh)
  const clearAllCVData = useCallback(async () => {
    try {
      console.log('🗑️ CVContext: Clearing all CV data');
      
      // Try to delete from backend first
      try {
        const result = await api.deleteCV();
        console.log('✅ CVContext: Backend CV data cleared:', result);
      } catch (error) {
        console.warn('⚠️ CVContext: Could not clear backend data (may not exist):', error.message);
      }
      
      // Clear local state
      dispatch({ 
        type: 'CLEAR_ALL_CV_DATA'
      });
      
      // Clear any local storage cache
      localStorage.removeItem('cvData');
      
      console.log('✅ CVContext: All CV data cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ CVContext: Error clearing CV data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Load user's CV data
  const loadUserCV = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('🔍 CVContext: Loading user CV...', forceRefresh ? '(forced refresh)' : '');
      
      // Clear any cached data if force refresh
      if (forceRefresh) {
        localStorage.removeItem('cvData');
      }
      
      // Try to get user's CV from backend
      const response = await api.getCV();
      console.log('📥 CVContext: API response:', response);
      
      // The response structure is {success: true, data: {cv: {...}}}
      const cv = response?.data?.cv || response?.cv;
        if (cv) {
        // Transform backend CV structure to frontend structure
        const transformedCV = transformCVFromBackend(cv);
        console.log('🔄 CVContext: Transformed CV:', transformedCV);
        dispatch({ 
          type: 'SET_FULL_CV', 
          payload: { 
            fullCV: transformedCV, 
            originalCV: cv 
          } 
        });
        return { success: true, cv: transformedCV };
      } else {
        console.log('⚠️ CVContext: No CV found in response - starting fresh');
        dispatch({ 
          type: 'SET_FULL_CV', 
          payload: { 
            fullCV: null, 
            originalCV: null 
          } 
        });
        return { success: true, cv: null };
      }
    } catch (error) {
      console.error('❌ CVContext: Error loading CV:', error);      // If no CV exists or error occurred, clear everything and start fresh
      console.log('🗑️ CVContext: Clearing CV data due to error');
      dispatch({ 
        type: 'SET_FULL_CV', 
        payload: { 
          fullCV: null, 
          originalCV: null 
        } 
      });
      return { success: true, cv: null };
    } finally {
      setLoading(false);
    }
  }, []);
  // Transform backend CV structure to frontend structure
  const transformCVFromBackend = (backendCV) => {
    console.log('🔄 CVContext: Original backend CV:', backendCV);
    console.log('🔄 CVContext: Backend skills format:', backendCV.skills);
    
    const {
      personalInfo = {},
      summary = '',
      experience = [],
      education = [],
      skills = {},
      languages = [],
      certifications = []
    } = backendCV;

    // Parse name into firstName and lastName
    const nameParts = (personalInfo.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';    const result = {
      personalInfo: {
        firstName,
        lastName,
        title: personalInfo.title || '', // Add missing professional title
        email: personalInfo.contact?.email || '',
        phone: personalInfo.contact?.phone || '',
        location: personalInfo.contact?.location || '',
        linkedin: personalInfo.contact?.linkedin || '',
        website: personalInfo.contact?.portfolio || ''
      },
      summary,      experience: experience.map(exp => {
        // Parse period more robustly
        let startDate = '', endDate = '';
        if (exp.period) {
          const parts = exp.period.split(' - ');
          startDate = parts[0]?.trim() || '';
          endDate = parts[1]?.trim() || '';
          // Handle "Present" case
          if (endDate.toLowerCase() === 'present') {
            endDate = 'Present';
          }
        }
        
        return {
          company: exp.company || '',
          position: exp.title || '',
          startDate,
          endDate,
          description: exp.responsibilities?.join('. ') || '',
          location: exp.location || ''
        };
      }),
      education: education.map(edu => {
        // Parse period more robustly
        let startDate = '', endDate = '';
        if (edu.period) {
          const parts = edu.period.split(' - ');
          startDate = parts[0]?.trim() || '';
          endDate = parts[1]?.trim() || '';
          // Handle "Present" case
          if (endDate.toLowerCase() === 'present') {
            endDate = 'Present';
          }
        }
        
        return {
          institution: edu.institution || '',
          degree: edu.degree || '',
          field: edu.field || '',
          startDate,
          endDate,
          grade: edu.grade || ''
        };      }),      skills: skills || {}, // Keep original format - normalize in CV Builder
      languages: languages.map(lang => ({
        name: lang.language || lang.name || '',
        level: lang.level || 'Intermediate'
      })),
      certifications: certifications.map(cert => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        url: cert.url || ''
      }))
    };
    
    console.log('🔄 CVContext: Transformed CV skills:', result.skills);
    console.log('🔄 CVContext: Transformed CV skills type:', typeof result.skills);
    console.log('🔄 CVContext: Skills categories:', Object.keys(result.skills || {}));
    console.log('🔄 CVContext: Total skills count:', Object.values(result.skills || {}).flat().length);
    
    return result;
  };

  // Extract CV from uploaded file
  const extractCVFromFile = useCallback(async (file) => {
    try {
      setLoading(true);
      clearError();
      
      // Upload file and get extracted text
      const uploadResponse = await api.uploadFile(file);
      
      if (!uploadResponse.extractedText) {
        throw new Error('No text could be extracted from the file');
      }
        // Extract structured CV data from text using AI
      const extractedData = await api.extractCVFromText(uploadResponse.extractedText);
      console.log('🤖 CVContext: AI extraction response (file):', extractedData);
      console.log('🤖 CVContext: AI extracted skills (file):', extractedData?.skills);
      
      // Update context with extracted data
      dispatch({ 
        type: 'SET_FULL_CV', 
        payload: { 
          fullCV: extractedData, 
          originalCV: extractedData 
        } 
      });
      
      return { success: true, cv: extractedData };
    } catch (error) {
      const errorMessage = error.message || 'Failed to extract CV from file';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Extract CV from pasted text
  const extractCVFromText = useCallback(async (text) => {
    try {
      setLoading(true);
      clearError();
        // Extract structured CV data from text using AI
      const extractedData = await api.extractCVFromText(text);
      console.log('🤖 CVContext: AI extraction response (text):', extractedData);
      console.log('🤖 CVContext: AI extracted skills (text):', extractedData?.skills);
      
      // Update context with extracted data
      dispatch({ 
        type: 'SET_FULL_CV', 
        payload: { 
          fullCV: extractedData, 
          originalCV: extractedData 
        } 
      });
      
      return { success: true, cv: extractedData };
    } catch (error) {
      const errorMessage = error.message || 'Failed to extract CV from text';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);  // Update CV data in context
  const updateCV = useCallback((cvData) => {
    dispatch({ 
      type: 'SET_FULL_CV', 
      payload: { 
        fullCV: cvData, 
        originalCV: cvData 
      } 
    });
  }, []);// Save CV data to backend
  const saveCV = useCallback(async (cvData) => {
    try {
      setLoading(true);
        // Transform frontend CV structure to backend structure
      const transformedCV = transformCVForBackend(cvData);
      console.log('💾 CVContext: Saving CV with skills:', transformedCV.skills);
      console.log('💾 CVContext: Skills categories:', Object.keys(transformedCV.skills || {}));
      
      console.log('💾 CVContext: Saving CV to backend');
      
      // Save CV to backend
      const response = await api.saveCV(transformedCV);
      
      console.log('📤 CVContext: Backend response:', response);
      
      // Backend returns { success: true, data: { cv: ... } }
      const savedCV = response.data?.cv || response.cv || transformedCV;
      console.log('💾 CVContext: Saved CV skills format:', savedCV.skills);
      
      // Update the context with both the UI format and the backend format
      dispatch({ 
        type: 'SET_FULL_CV', 
        payload: { 
          fullCV: cvData,  // Keep UI format for the builder
          originalCV: savedCV  // Store backend format for dashboard stats
        } 
      });
      
      console.log('✅ CVContext: CV saved and context updated');
      
      return { success: true, cv: savedCV };
    } catch (error) {
      const errorMessage = error.message || 'Failed to save CV';
      console.error('❌ CVContext: Save error:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);
  // Helper function to extract job title from summary
  const extractJobTitleFromSummary = (summary) => {
    if (!summary) return null;
    
    // Look for common job title patterns in the summary
    const titlePatterns = [
      /(?:I am|I'm) (?:a|an) ([^.]+)(?:developer|engineer|designer|manager|analyst|specialist|consultant)/i,
      /(?:experienced|senior|junior) ([^.]+)(?:developer|engineer|designer|manager|analyst|specialist|consultant)/i,
      /([^.]+)(?:developer|engineer|designer|manager|analyst|specialist|consultant)/i,
      /(?:working as|work as) (?:a|an) ([^.]+)/i,
      /(?:passionate|dedicated) ([^.]+)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = summary.match(pattern);
      if (match && match[1]) {
        const title = match[1].trim();
        // Clean up the title
        const cleanTitle = title
          .replace(/^(a|an|the)\s+/i, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanTitle.length > 3 && cleanTitle.length < 50) {
          return cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        }
      }
    }
    
    return null;
  };
  // Transform frontend CV structure to backend structure
  const transformCVForBackend = (frontendCV) => {
    console.log('🔄 CVContext: Frontend CV to save:', frontendCV);
    console.log('🔄 CVContext: Frontend CV skills:', frontendCV.skills);
    
    const {
      personalInfo: {
        firstName = '',
        lastName = '',
        title = '', // Add missing title field
        email = '',
        phone = '',
        location = '',
        linkedin = '',
        website = ''
      },
      summary = '',
      experience = [],
      education = [],
      skills = [],
      languages = [],
      certifications = []
    } = frontendCV;    // Extract job title from user input or from summary or use the first job position
    const userProvidedTitle = title || extractJobTitleFromSummary(summary);
    const firstJobTitle = experience.length > 0 ? experience[0].position : null;
    const jobTitle = userProvidedTitle || firstJobTitle || 'Professional';
    
    console.log('🔄 CVContext: Job title determination:', {
      userProvided: title,
      extracted: extractJobTitleFromSummary(summary),
      firstJob: firstJobTitle,
      final: jobTitle
    });    // Handle skills - use utility function for smart categorization
    let categorizedSkills;
    console.log('🔄 CVContext: Processing skills for backend:', skills);
    console.log('🔄 CVContext: Skills type:', typeof skills, 'isArray:', Array.isArray(skills));
    
    if (typeof skills === 'object' && skills !== null && !Array.isArray(skills)) {
      // Skills is already categorized from AI - use it as is
      categorizedSkills = skills;
      console.log('🔄 CVContext: Using already categorized skills');
    } else {
      // Use utility function to categorize skills from array format
      categorizedSkills = categorizeSkillsArray(Array.isArray(skills) ? skills : []);
      console.log('🔄 CVContext: Categorized skills from array:', categorizedSkills);
    }

    // Remove empty categories
    Object.keys(categorizedSkills).forEach(key => {
      if (categorizedSkills[key].length === 0) {
        delete categorizedSkills[key];
      }
    });
    
    console.log('🔄 CVContext: Final skills for backend:', categorizedSkills);

    return {
      language: 'en', // Default language
      theme: 'professional', // Default theme
      personalInfo: {
        name: `${firstName} ${lastName}`.trim(),
        title: jobTitle,
        contact: {
          email,
          phone,
          location,
          linkedin,
          portfolio: website
        }
      },
      summary,
      skills: categorizedSkills,experience: experience
        .filter(exp => exp.position && exp.company) // Only include if has required fields
        .map(exp => ({
          title: exp.position || '',
          company: exp.company || '',
          period: exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : 
                  exp.startDate ? `${exp.startDate} - Present` : 
                  'Not specified', // Always provide a non-empty period
          responsibilities: exp.description ? [exp.description] : []
        })),
      education: education
        .filter(edu => edu.institution && edu.degree) // Only include if has required fields
        .map(edu => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          field: edu.field || '',
          period: edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : 
                  edu.startDate ? `${edu.startDate} - Present` : 
                  edu.degree ? 'Completed' : '', // Provide default if we have a degree
          grade: edu.grade || ''        })),
      projects: [], // Could be enhanced
      certifications: certifications
        .filter(cert => cert.name && cert.issuer) // Only include if has required fields
        .map(cert => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          type: 'Certificate', // Default type
          skills: cert.url || '' // Use URL field for skills since it's available
        })),
      additionalExperience: [],
      languages: languages.map(lang => ({
        language: lang.name || '',
        level: lang.level || 'Intermediate'
      })),
      interests: []
    };
  };
  // Update specific CV section
  const updateCVSection = useCallback((section, data) => {
    dispatch({
      type: 'UPDATE_CV_SECTION',
      payload: { section, data },
    });
  }, []);

  // Set job offer for tailoring
  const setJobOffer = useCallback((jobOffer) => {
    dispatch({ type: 'SET_JOB_OFFER', payload: jobOffer });
  }, []);  // Generate job-specific CV
  const generateJobSpecificCV = useCallback(async (jobOfferText) => {
    try {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true });
      setLoading(true);
      
      // Get current CV from state
      const currentCV = state.fullCV;
      if (!currentCV) {
        throw new Error('No full CV available for tailoring');
      }

      // Extract job offer data first
      const jobOffer = await api.extractJobOfferFromText(jobOfferText);
      dispatch({ type: 'SET_JOB_OFFER', payload: jobOffer });

      // Generate tailored CV
      const response = await api.generateTailoredCV({ 
        cv: currentCV, 
        jobOffer: jobOffer 
      });
      
      dispatch({ type: 'SET_GENERATED_CV', payload: response.cv || response });
      return { success: true, cv: response.cv || response };
    } catch (error) {
      const errorMessage = error.message || 'Failed to generate job-specific CV';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false });
      setLoading(false);
    }
  }, [state.fullCV]);  // Generate cover letter
  const generateCoverLetter = useCallback(async (jobOfferText) => {
    try {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true });
      setLoading(true);
      
      // Get current CV from state
      const currentCV = state.fullCV;
      if (!currentCV) {
        throw new Error('No full CV available for cover letter generation');
      }

      // Extract job offer data first (if not already done)
      let jobOffer = state.currentJobOffer;
      if (!jobOffer) {
        jobOffer = await api.extractJobOfferFromText(jobOfferText);
        dispatch({ type: 'SET_JOB_OFFER', payload: jobOffer });
      }

      // Generate cover letter
      const response = await api.generateCoverLetter({ 
        cv: currentCV, 
        jobOffer: jobOffer 
      });
      
      dispatch({ type: 'SET_GENERATED_COVER_LETTER', payload: response.coverLetter || response });
      return { success: true, coverLetter: response.coverLetter || response };
    } catch (error) {
      const errorMessage = error.message || 'Failed to generate cover letter';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false });
      setLoading(false);
    }
  }, [state.fullCV, state.currentJobOffer]);  // Clear generated content
  const clearGeneratedContent = useCallback(() => {
    dispatch({ type: 'CLEAR_GENERATED_CONTENT' });
  }, []);  // Download CV using proper API call (no form submission to avoid corruption)
  const downloadCV = async (cvData, filename = 'cv') => {
    try {
      console.log('📤 CVContext: Starting PDF download...', cvData);      // Transform frontend CV format to backend format
      const backendFormatCV = transformCVForBackend(cvData);
      console.log('🔄 CVContext: Backend format CV ready');
      console.log('📋 CVContext: Sending CV data:', JSON.stringify(backendFormatCV, null, 2));
      
      // Validate required fields
      if (!backendFormatCV.personalInfo?.name || backendFormatCV.personalInfo.name.trim() === '') {
        throw new Error('Missing required field: personalInfo.name');
      }
      
      console.log('✅ CVContext: Data validation passed');
      
      console.log('🌐 CVContext: Making single API request...');
      const blob = await api.generatePDF(backendFormatCV);
      
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error('Invalid PDF data received');
      }
      
      console.log('✅ CVContext: Valid PDF blob received, size:', blob.size);
      
      // Create download using URL.createObjectURL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      link.style.display = 'none';
      
      // Add to DOM, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('✅ CVContext: PDF download initiated successfully');
      return { success: true };
        } catch (error) {
      console.error('❌ CVContext: PDF download error:', error);
      
      // Don't show user errors for duplicate requests or ad blocker issues
      let errorMessage;
      if (error.message.includes('already in progress')) {
        // Silent failure for duplicate requests - they're expected
        return { success: false, error: null };
      } else if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        errorMessage = 'Download blocked by browser extension (ad blocker). Please disable ad blocker and try again.';
      } else {
        errorMessage = error.message || 'Failed to download CV';
      }
        setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {...state,
    cvData: state.fullCV,
    originalCVData: state.originalCV, // Add original CV data for dashboard
    isLoading: state.loading,
    loadUserCV,
    clearAllCVData,
    extractCVFromFile,
    extractCVFromText,
    updateCV,
    saveCV,
    updateCVSection,
    setJobOffer,
    generateJobSpecificCV,
    generateCoverLetter,
    clearGeneratedContent,
    downloadCV,
    clearError,
  };

  return (
    <CVContext.Provider value={value}>
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};
