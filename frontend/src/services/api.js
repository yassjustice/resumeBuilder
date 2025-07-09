import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 180000, // 3 minutes for AI requests with translation processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global flag to prevent multiple PDF requests
let _isGeneratingPDF = false;


// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // If response is a blob (like PDF downloads), return the blob directly
    if (response.config?.responseType === 'blob') {
      console.log('🔄 API Interceptor: Blob response detected, returning blob:', response.data);
      return response.data; // Return the blob directly
    }
    return response.data; // Extract data from response for JSON
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Extract error message from response
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.response = error.response;
    
    return Promise.reject(customError);
  }
);

// Auth API endpoints
export const authApi = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData) =>
    apiClient.post('/auth/register', userData),
  
  verifyToken: (token) =>
    apiClient.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  refreshToken: () =>
    apiClient.post('/auth/refresh'),
  
  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, password) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

// CV API endpoints
export const cvApi = {
  // Get user's full CV
  getFullCV: () =>
    apiClient.get('/cvs/full'),
    // Save/update full CV
  saveFullCV: (cvData) =>
    apiClient.post('/cvs/full', cvData),
  
  // Delete full CV
  deleteFullCV: () =>
    apiClient.delete('/cvs/full'),
  
  // Update specific CV section
  updateCVSection: (section, data) =>
    apiClient.patch(`/cvs/full/${section}`, data),  // Generate PDF from CV data
  generatePDF: async (cvData, options = {}) => {
    // Strong debouncing - only one PDF generation at a time globally
    if (_isGeneratingPDF) {
      console.log('⚠️ PDF generation already in progress, rejecting duplicate request');
      throw new Error('PDF generation already in progress - please wait');
    }
    
    _isGeneratingPDF = true;
    
    try {
      console.log('🌐 API: Making PDF generation request...');
      console.log('📤 API: CV Data structure:', {
        personalInfo: !!cvData.personalInfo,
        summary: !!cvData.summary,
        experience: Array.isArray(cvData.experience) ? cvData.experience.length : 'not array',
        education: Array.isArray(cvData.education) ? cvData.education.length : 'not array'
      });
      
      const response = await apiClient.post('/cvs/generate-pdf', 
        { cvData, ...options }, 
        {
          responseType: 'blob',
          timeout: 120000, // 2 minute timeout for PDF generation
          headers: {
            'Accept': 'application/pdf',
            'Content-Type': 'application/json'
          },
          // Disable any automatic retries
          retry: 0,
          // Force single request
          transformResponse: [function (data) {
            return data;
          }]
        }
      );
      
      console.log('✅ API: PDF request successful');
      
      // Return the blob data directly
      const blob = response.data;
      
      // Validate the response is a proper blob
      if (!(blob instanceof Blob)) {
        console.error('❌ API: Response is not a blob:', blob);
        throw new Error('Invalid PDF response - not a blob');
      }
      
      if (blob.size === 0) {
        console.error('❌ API: Blob is empty');
        throw new Error('Invalid PDF response - empty blob');
      }
      
      console.log('✅ API: Valid PDF blob received, size:', blob.size);
      return blob;
      
    } catch (error) {
      // Only log significant errors, not duplicate request rejections
      if (!error.message.includes('already in progress')) {
        console.error('❌ API: PDF request failed:', error);
        
        // Only log response details if they exist (avoid undefined logs)
        if (error.response) {
          console.error('❌ API: Error status:', error.response.status);
          
          // If error data is a blob (JSON error), read it
          if (error.response.data instanceof Blob) {
            try {
              const errorText = await error.response.data.text();
              console.error('❌ API: Error content:', errorText);
              const errorJson = JSON.parse(errorText);
              console.error('❌ API: Parsed error:', errorJson);
            } catch (parseError) {
              console.error('❌ API: Could not parse error blob:', parseError);
            }
          } else {
            console.error('❌ API: Error data:', error.response.data);
          }
        }
      }
      
      throw error;
    } finally {
      // Reset the flag after a delay to prevent immediate re-requests
      setTimeout(() => {
        _isGeneratingPDF = false;
      }, 1000);
    }
  },
  
  // Get CV themes
  getThemes: () =>
    apiClient.get('/themes'),
  
  // Get CV by ID (for existing backend compatibility)
  getCVById: (id) =>
    apiClient.get(`/cvs/${id}`),
  
  // Create CV (for existing backend compatibility)
  createCV: (cvData) =>
    apiClient.post('/cvs', cvData),
  
  // Update CV (for existing backend compatibility)
  updateCV: (id, cvData) =>
    apiClient.put(`/cvs/${id}`, cvData),
};

// AI API endpoints
export const aiApi = {
  // Extract CV data from text
  extractCVFromText: async (text) => {
    const response = await apiClient.post('/ai/extract-cv', { text });
    return response.data || response;
  },
  // Extract job offer data from text
  extractJobOfferFromText: async (text) => {
    console.log('🔍 API: Sending job offer extraction request for text:', text);
    const response = await apiClient.post('/ai/extract-job-offer', { text });
    console.log('📦 API: Job offer extraction response:', response);
    return response; // Return the full response from interceptor
  },
  
  // Generate tailored CV
  generateTailoredCV: async ({ cv, jobOffer, additionalRequirements, language = 'en' }) => {
    console.log('🎯 API: Sending tailored CV generation request');
    const response = await apiClient.post('/ai/tailor-cv', {
      cv,
      jobOffer,
      additionalRequirements,
      language
    });
    console.log('📦 API: Tailored CV response:', response);
    return response; // Return the full response from interceptor
  },
    // Generate cover letter
  generateCoverLetter: async ({ cv, jobOffer, additionalRequirements, language = 'en' }) => {
    console.log('📝 API: Sending cover letter generation request');
    const response = await apiClient.post('/ai/generate-cover-letter', {
      cv,
      jobOffer,
      additionalRequirements,
      language
    });
    console.log('📦 API: Cover letter response:', response);
    return response; // Return the full response from interceptor
  }
};

// File upload utilities
export const fileApi = {
  // Upload file (PDF/DOCX/TXT) - this calls the backend file upload endpoint
  uploadFile: async (formDataOrFile) => {
    let formData;
    
    // Check if it's already FormData or just a file
    if (formDataOrFile instanceof FormData) {
      formData = formDataOrFile;
    } else {
      formData = new FormData();
      formData.append('file', formDataOrFile);
    }
    
    const response = await apiClient.post('/ai/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};

// User API endpoints
export const userApi = {
  // Get user profile
  getProfile: () =>
    apiClient.get('/users/profile'),
  
  // Update user profile
  updateProfile: (userData) =>
    apiClient.patch('/users/profile', userData),
  
  // Delete user account
  deleteAccount: () =>
    apiClient.delete('/users/account'),
  
  // Change password
  changePassword: (currentPassword, newPassword) =>
    apiClient.patch('/users/password', { currentPassword, newPassword }),
};

export default apiClient;

// Unified API object for easier imports
export const api = {
  // Auth methods
  login: authApi.login,
  register: authApi.register,
  verifyToken: authApi.verifyToken,
  refreshToken: authApi.refreshToken,
  forgotPassword: authApi.forgotPassword,
  resetPassword: authApi.resetPassword,  // CV methods
  getCV: cvApi.getFullCV,
  saveCV: cvApi.saveFullCV,
  deleteCV: cvApi.deleteFullCV,
  updateCVSection: cvApi.updateCVSection,
  generatePDF: cvApi.generatePDF,
  getThemes: cvApi.getThemes,  // File upload methods
  uploadFile: fileApi.uploadFile,

  // AI methods
  extractCVFromText: aiApi.extractCVFromText,
  extractJobOfferFromText: aiApi.extractJobOfferFromText,
  generateTailoredCV: aiApi.generateTailoredCV,
  generateCoverLetter: aiApi.generateCoverLetter,

  // User methods
  getProfile: userApi.getProfile,
  updateProfile: userApi.updateProfile,
  deleteAccount: userApi.deleteAccount,
  changePassword: userApi.changePassword,
  
  // Download methods
  downloadCV: async (cvData, fileName) => {
    const response = await cvApi.generatePDF(cvData);
    return response;
  },
  downloadCoverLetter: async (letterContent, fileName) => {
    // Follow the exact same pattern as successful CV download
    console.log('📤 API: Starting cover letter PDF download...');
    console.log('📄 Content length:', letterContent?.length || 0);
    
    try {
      const response = await apiClient.post('/ai/download/cover-letter', { 
        content: letterContent, 
        fileName 
      }, {
        responseType: 'blob',
        timeout: 180000, // 3 minute timeout for AI processing with translation
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ API: Cover letter PDF request successful');
      
      // The axios interceptor returns blob data directly for blob responses
      const blob = response;
      
      // Validate the response is a proper blob (same as CV download)
      if (!(blob instanceof Blob)) {
        console.error('❌ API: Response is not a blob:', blob);
        throw new Error('Invalid PDF response - not a blob');
      }
      
      if (blob.size === 0) {
        console.error('❌ API: Blob is empty');
        throw new Error('Invalid PDF response - empty blob');
      }
      
      console.log('✅ API: Valid cover letter PDF blob received, size:', blob.size);
      
      // Create download using the same method as CV download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName || 'cover-letter'}.pdf`;
      link.style.display = 'none';
      
      // Add to DOM, click, and clean up (same as CV download)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ API: Cover letter download completed');
      return { success: true };
      
    } catch (error) {
      console.error('❌ API: Cover letter download failed:', error);
      throw error;
    }
  },

  // Translation methods
  translateCV: async (cvData, targetLanguage, sourceLanguage) => {
    return await apiClient.post('/translation/translate-cv', {
      cvData,
      targetLanguage,
      sourceLanguage
    });
  },
  
  detectLanguage: async (cvData) => {
    return await apiClient.post('/translation/detect-language', {
      cvData
    });
  },
  
  getSupportedLanguages: async () => {
    return await apiClient.get('/translation/supported-languages');
  },
  
  testTranslation: async () => {
    return await apiClient.post('/translation/test');
  }
};
