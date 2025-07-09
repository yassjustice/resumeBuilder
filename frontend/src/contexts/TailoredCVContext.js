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

  // Fallback function to create valid CV data when JSON parsing fails
  const createFallbackCVData = useCallback((rawResponse, originalCV) => {
    console.log('🔧 Creating fallback CV data from raw response');
    
    // Start with original CV structure
    const fallbackCV = {
      ...originalCV,
      metadata: {
        ...originalCV.metadata,
        tailoredBy: 'puter-fallback',
        tailoredAt: new Date().toISOString(),
        fallbackUsed: true
      }
    };

    // Try to extract any useful information from the raw response
    const responseText = typeof rawResponse === 'string' ? rawResponse : String(rawResponse);
    
    // Look for summary improvements
    const summaryMatch = responseText.match(/(?:summary|profile|objective)[\s\S]*?["']([^"']{50,}?)["']/i);
    if (summaryMatch) {
      fallbackCV.summary = summaryMatch[1].trim();
      console.log('🔧 Extracted summary from fallback');
    }

    // Add basic tailoring indicators
    fallbackCV.tailoringApplied = true;
    fallbackCV.tailoringNotes = 'Fallback parsing used due to JSON format issues';

    return fallbackCV;
  }, []);

  // Fallback function to create valid cover letter data when JSON parsing fails
  const createFallbackCoverLetterData = useCallback((rawResponse) => {
    console.log('🔧 Creating fallback cover letter data from raw response');
    
    const responseText = typeof rawResponse === 'string' ? rawResponse : String(rawResponse);
    
    return {
      content: responseText,
      metadata: {
        generatedBy: 'puter-fallback',
        generatedAt: new Date().toISOString(),
        fallbackUsed: true,
        wordCount: responseText.split(' ').length
      },
      structure: {
        opening: 'Dear Hiring Manager,',
        body: responseText,
        closing: 'Sincerely,'
      }
    };
  }, []);

  // Enhanced job offer extraction with Puter.js fallback
  const extractJobOfferWithFallback = useCallback(async (text, usePuterFirst = false) => {
    try {
      setLoading(true);
      clearError();
      
      console.log('🔍 TailoredCV: Starting enhanced job offer extraction...');
      
      if (usePuterFirst) {
        console.log('🆓 TailoredCV: Using Puter.js as primary extraction method');
        return await extractWithPuter(text);
      }

      // Try traditional backend first
      try {
        console.log('🤖 TailoredCV: Attempting traditional Gemini extraction...');
        const response = await api.extractJobOfferFromText(text);
        
        if (response?.success) {
          const jobOffer = response.data || response.jobOffer || response;
          console.log('✅ TailoredCV: Gemini extraction successful');
          dispatch({ type: 'SET_JOB_OFFER', payload: jobOffer });
          return { success: true, jobOffer, method: 'gemini' };
        } else {
          throw new Error(response?.error || 'Backend extraction failed');
        }
      } catch (backendError) {
        console.warn('⚠️ TailoredCV: Backend extraction failed, trying Puter.js fallback:', backendError?.message || backendError?.toString() || 'Unknown backend error');
        
        // Check if it's a 500 error (Gemini overloaded)
        const backendErrorMessage = backendError?.message || backendError?.toString() || 'Unknown backend error';
        if (backendError.status === 500 || backendErrorMessage.includes('500')) {
          console.log('🆓 TailoredCV: Falling back to Puter.js due to backend service issues');
          return await extractWithPuter(text);
        } else {
          throw backendError;
        }
      }
    } catch (error) {
      console.error('❌ TailoredCV: All extraction methods failed:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to extract job offer';
      
      // Provide specific user-friendly error messages
      let userFriendlyError = errorMessage;
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('usage limit reached') || 
          errorLower.includes('permission denied') || 
          errorLower.includes('usage-limited-chat')) {
        userFriendlyError = 'AI service usage limit reached. Please try again later or use the backend extraction service.';
      } else if (errorLower.includes('rate limit exceeded') || errorLower.includes('429')) {
        userFriendlyError = 'AI service rate limit exceeded. Please wait a moment and try again.';
      } else if (errorLower.includes('authentication required') || errorLower.includes('401')) {
        userFriendlyError = 'AI service authentication required. Please check your API access.';
      } else if (errorLower.includes('bad request') || errorLower.includes('400')) {
        userFriendlyError = 'Invalid request to AI service. Please check your input and try again.';
      } else if (errorLower.includes('server error') || errorLower.includes('500')) {
        userFriendlyError = 'AI service temporarily unavailable. Please try again later.';
      }
      
      setError(userFriendlyError);
      return { success: false, error: userFriendlyError };
    } finally {
      setLoading(false);
    }
  }, []);

  // Extract using Puter.js (frontend AI)
  const extractWithPuter = useCallback(async (text) => {
    // Import Puter service dynamically to avoid circular dependencies
    const puterService = await import('../services/puterAIService');
    const service = puterService.default;
    
    if (!service.isReady()) {
      await service.init();
    }
    
    const prompt = `Extract job offer information from the following text and return ONLY a JSON object with this exact structure:

{
  "title": "",
  "company": "",
  "location": "",
  "salary": "",
  "employmentType": "",
  "description": "",
  "requirements": [],
  "keySkills": [],
  "preferredQualifications": [],
  "benefits": []
}

Job Offer Text:
${text}

CRITICAL: Return ONLY the raw JSON object. Do NOT use markdown formatting, code blocks, backticks, or wrap in \`\`\`json. Start directly with { and end with }.`;

    let result;
    try {
      result = await service.callPuterAI(prompt);
      
      // Extract clean JSON using utility function
      const cleanJsonContent = extractJsonFromResponse(result.content);
      
      let parsedResult;
      try {
        parsedResult = JSON.parse(cleanJsonContent);
      } catch (parseError) {
        // Attempt to fix common JSON issues
        let fixedContent = cleanJsonContent
          .replace(/,\s*}/g, '}')        // Remove trailing commas
          .replace(/,\s*]/g, ']')        // Remove trailing commas in arrays
          .replace(/([a-zA-Z0-9_]+):/g, '"$1":')  // Add quotes to unquoted keys
          .replace(/:\s*([a-zA-Z][^",}\]]*)/g, ': "$1"'); // Quote unquoted string values
        
        try {
          parsedResult = JSON.parse(fixedContent);
          console.log('⚠️ TailoredCV: JSON fixed automatically');
        } catch (secondParseError) {
          console.error('❌ TailoredCV: Could not fix JSON:', secondParseError);
          console.log('🔍 Original content:', cleanJsonContent);
          console.log('🔍 Fixed attempt:', fixedContent);
          throw parseError; // Throw original error
        }
      }
      
      // Validate the parsed result
      const validatedResult = validateJobOfferData(parsedResult);
      
      console.log('✅ TailoredCV: Puter.js extraction successful');
      dispatch({ type: 'SET_JOB_OFFER', payload: validatedResult });
      return { success: true, jobOffer: validatedResult, method: 'puter' };
    } catch (error) {
      const logMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('❌ TailoredCV: Puter.js extraction failed:', logMessage);
      if (result?.content) {
        const contentStr = typeof result.content === 'string' ? result.content : String(result.content);
        console.log('🔍 Raw Puter response (first 300 chars):', contentStr.substring(0, 300) + '...');
        console.log('🔍 Content type:', typeof result.content);
        console.log('🔍 Full content structure:', result);
      }
      
      // Ensure we have a proper error message
      let errorMessage = 'Unknown error occurred';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        // If it's an object, try to extract meaningful information
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = String(error);
        }
      } else {
        errorMessage = String(error);
      }
      
      throw new Error(`Puter.js extraction failed: ${errorMessage}`);
    }
  }, []);

  // Complete Puter.js-based CV and cover letter generation (matches Gemini functionality)
  const generateWithPuterAI = useCallback(async (cvData, jobOffer, additionalRequirements = '', language = 'en') => {
    if (!cvData || !jobOffer) {
      throw new Error('Missing CV data or job offer');
    }

    dispatch({ type: 'SET_AI_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('🆓 TailoredCV: Starting complete Puter.js generation...');
      
      const service = (await import('../services/puterAIService')).default;
      
      // Generate tailored CV using Puter.js
      console.log('🎯 TailoredCV: Generating tailored CV with Puter.js...');
      const cvResult = await service.generateTailoredCV(cvData, jobOffer, additionalRequirements, language);
      
      if (!cvResult.success) {
        throw new Error('Failed to generate tailored CV');
      }

      // Parse the CV result with enhanced error handling
      let tailoredCVData;
      try {
        const cleanCVContent = extractJsonFromResponse(cvResult.tailoredCV);
        console.log('🔍 Cleaned CV content preview:', cleanCVContent.substring(0, 300));
        tailoredCVData = JSON.parse(cleanCVContent);
        console.log('✅ TailoredCV: CV parsing successful');
      } catch (parseError) {
        console.error('❌ TailoredCV: CV JSON parsing failed:', parseError);
        console.log('🔍 Raw CV result:', cvResult.tailoredCV);
        
        // Try fallback parsing
        try {
          // If direct parsing fails, try to extract just the essential data
          tailoredCVData = createFallbackCVData(cvResult.tailoredCV, cvData);
          console.log('🔧 TailoredCV: Using fallback CV data');
        } catch (fallbackError) {
          console.error('❌ TailoredCV: Fallback parsing also failed:', fallbackError);
          const parseErrorMessage = parseError?.message || parseError?.toString() || 'Unknown parse error';
          throw new Error(`CV parsing failed: ${parseErrorMessage}. Raw response preview: ${cvResult.tailoredCV?.substring(0, 200)}`);
        }
      }

      console.log('✅ TailoredCV: CV generation successful');
      dispatch({ type: 'SET_TAILORED_CV', payload: tailoredCVData });

      // Generate cover letter using Puter.js
      console.log('📝 TailoredCV: Generating cover letter with Puter.js...');
      const coverLetterResult = await service.generateCoverLetter(cvData, jobOffer, additionalRequirements, language);
      
      let coverLetterData = null;
      if (coverLetterResult.success) {
        try {
          const cleanCoverContent = extractJsonFromResponse(coverLetterResult.coverLetter);
          console.log('🔍 Cleaned cover letter content preview:', cleanCoverContent.substring(0, 300));
          coverLetterData = JSON.parse(cleanCoverContent);
          console.log('✅ TailoredCV: Cover letter parsing successful');
        } catch (parseError) {
          console.warn('⚠️ TailoredCV: Cover letter JSON parsing failed:', parseError);
          console.log('🔍 Raw cover letter result:', coverLetterResult.coverLetter);
          
          // Try fallback parsing for cover letter
          try {
            coverLetterData = createFallbackCoverLetterData(coverLetterResult.coverLetter);
            console.log('🔧 TailoredCV: Using fallback cover letter data');
          } catch (fallbackError) {
            console.warn('⚠️ TailoredCV: Cover letter fallback parsing failed, continuing without cover letter');
            coverLetterData = null;
          }
        }
        
        if (coverLetterData) {
          dispatch({ type: 'SET_COVER_LETTER', payload: coverLetterData });
        }
      } else {
        console.warn('⚠️ TailoredCV: Cover letter generation failed, continuing without it');
      }

      console.log('🎉 TailoredCV: Complete Puter.js generation finished');
      
      return {
        success: true,
        tailoredCV: tailoredCVData,
        coverLetter: coverLetterData,
        method: 'puter_complete'
      };

    } catch (error) {
      console.error('❌ TailoredCV: Puter.js generation failed:', error);
      const errorMessage = error?.message || error?.toString() || 'Puter.js generation failed: Unknown error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_AI_PROCESSING', payload: false });
    }
  }, [extractJsonFromResponse, validateJobOfferData, createFallbackCVData, createFallbackCoverLetterData]);

  // Original extraction method (for backward compatibility)
  const extractJobOffer = useCallback(async (text) => {
    return await extractJobOfferWithFallback(text, false);
  }, [extractJobOfferWithFallback]);

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

  const value = {
    // State
    ...state,
    isLoading: state.loading,
    
    // Actions
    extractJobOffer,
    extractJobOfferWithFallback, // Enhanced extraction with Puter fallback
    generateTailoredCV,
    generateCoverLetter,
    updateTailoredCVSection,
    // Enhanced methods
    extractJobOfferWithFallback,
    generateWithPuterAI,
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
