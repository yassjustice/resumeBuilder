/**
 * Streamlined Puter AI Service - Frontend Delegator
 * This service handles Puter.js authentication on the frontend,
 * then delegates all processing to the robust backend modular system
 * 
 * Architecture:
 * Frontend: Authentication + Raw AI calls + Delegation to backend
 * Backend: All processing, parsing, validation, error handling, etc.
 */

class StreamlinedPuterAIService {
  constructor() {
    this.isInitialized = false;
    this.isAuthenticated = false;
    this.authenticatedUser = null;
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    this.sessionId = this.generateSessionId();
    this.currentModel = 'gpt-4o-mini'; // Default to free-tier friendly model as per technical report
    this.testMode = process.env.NODE_ENV === 'development'; // Auto-enable test mode in development
    
    // Free-tier friendly models (updated with actual valid Puter models as of 2025)
    this.freeTierModels = [
      'gpt-4o-mini',           // Light version with less usage weight
      'gpt-4.1-mini',          // Updated mini model
      'gpt-4.1-nano',          // Lightest model available
      'o1-mini',               // Reasoning model mini version
      'o3-mini',               // Latest mini reasoning model
      'claude-3-haiku-20240307' // Claude lightweight model
    ];
    
    // Minimal frontend state - backend handles everything else
    this.frontendState = {
      authStatus: 'not_checked',
      lastAuthTime: null,
      authToken: null
    };

    // Test mode flag
    this.testMode = false;

    console.log('🚀 Streamlined Puter AI Service initialized');
    console.log('📡 Delegating to backend:', this.backendUrl);
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `puter_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Initialize the service - minimal frontend setup
   */
  async init() {
    if (this.isInitialized) {
      console.log('🔄 Service already initialized');
      return;
    }

    try {
      console.log('🔄 Initializing Streamlined Puter Service...');
      
      // Wait for Puter.js to be available
      await this.waitForPuter();
      
      // Check authentication but don't force it
      await this.checkAuthentication();
      
      // Try to update valid models (non-blocking)
      try {
        await this.updateValidModels();
      } catch (modelError) {
        console.warn('⚠️ Model update failed, continuing with default models:', modelError.message);
      }
      
      this.isInitialized = true;
      
      console.log('✅ Streamlined Puter Service initialized');
      console.log('🎯 Authentication:', this.isAuthenticated ? 'Ready' : 'Will auth on demand');
      console.log('🤖 Valid models loaded:', this.freeTierModels.length);
      
    } catch (error) {
      console.error('❌ Failed to initialize Puter Service:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Wait for Puter.js to be loaded
   */
  waitForPuter() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      
      const checkPuter = () => {
        attempts++;
        
        if (typeof window.puter !== 'undefined' && window.puter.ai) {
          console.log('✅ Puter.js loaded and ready');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Puter.js failed to load within timeout'));
        } else {
          setTimeout(checkPuter, 100);
        }
      };
      
      checkPuter();
    });
  }

  /**
   * Check current authentication status
   */
  async checkAuthentication() {
    try {
      if (window.puter && window.puter.auth) {
        // Use the proper Puter.js authentication check as per technical report
        const isSignedIn = await window.puter.auth.isSignedIn();
        
        if (isSignedIn) {
          const user = await window.puter.auth.getUser();
          this.isAuthenticated = true;
          this.authenticatedUser = user;
          this.frontendState.authStatus = 'authenticated';
          this.frontendState.lastAuthTime = Date.now();
          
          console.log('🔍 Auth status: authenticated', {
            username: user?.username || 'Anonymous',
            isTemp: user?.is_temp || false
          });
          return true;
        } else {
          this.isAuthenticated = false;
          this.authenticatedUser = null;
          this.frontendState.authStatus = 'guest';
          console.log('🔍 Auth status: guest - authentication required for AI calls');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      this.frontendState.authStatus = 'error';
      return false;
    }
  }

  /**
   * Force authentication - must be called from user action
   */
  async authenticate() {
    try {
      console.log('🔐 Starting authentication...');
      
      if (!window.puter || !window.puter.auth) {
        throw new Error('Puter.js not available');
      }

      // Force sign-in popup
      await window.puter.auth.signIn();
      
      // Update auth status
      await this.checkAuthentication();
      
      if (this.isAuthenticated) {
        console.log('✅ Authentication successful');
        return true;
      } else {
        throw new Error('Authentication failed');
      }
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      this.frontendState.authStatus = 'failed';
      throw error;
    }
  }

  /**
   * Make raw AI call - Enhanced with proper Puter.js authentication patterns
   */
  async makeRawAICall(prompt, options = {}) {
    try {
      console.log('🤖 Making AI call with enhanced authentication strategy...');
      console.log('🔍 Call options:', options);
      
      // Ensure we have Puter.js
      if (!window.puter || !window.puter.ai) {
        throw new Error('Puter.js not available');
      }

      // STEP 1: Ensure user is authenticated (as per technical report)
      const isSignedIn = await window.puter.auth.isSignedIn();
      if (!isSignedIn) {
        console.log('🔐 User not signed in - forcing authentication...');
        await window.puter.auth.signIn();
        
        // Wait for authentication to settle
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify authentication succeeded
        const authCheck = await window.puter.auth.isSignedIn();
        if (!authCheck) {
          throw new Error('Authentication required - AI calls need user sign-in');
        }
        
        console.log('✅ User authentication successful');
      } else {
        console.log('✅ User already authenticated');
      }

      // STEP 2: Use free-tier friendly models as per technical report
      const freeTierModels = this.freeTierModels;
      
      // Add user's preferred model at the start if it's not already included
      const preferredModel = options.model || this.currentModel;
      const modelQueue = [preferredModel, ...freeTierModels.filter(m => m !== preferredModel)];
      
      console.log('🎯 Model testing queue:', modelQueue);
      
      let lastError = null;
      
      // STEP 3: Try models in order until one works
      for (const model of modelQueue) {
        try {
          console.log(`🤖 Attempting AI call with model: ${model}`);
          
          const callOptions = {
            model: model,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 2000,
            stream: false,
            timeout: 30000,
            // Use testMode in development or when explicitly enabled (per technical report)
            testMode: this.testMode && !options.forceProduction,
            ...options
          };
          
          console.log('🔍 API call options:', callOptions);
          
          const response = await window.puter.ai.chat(prompt, callOptions);
          
          console.log(`✅ AI call successful with model: ${model}`);
          console.log('🔍 Response type:', typeof response);
          
          // Update successful model as current default
          this.currentModel = model;
          
          return {
            content: this.extractContent(response),
            model: model,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
          };
          
        } catch (modelError) {
          console.warn(`❌ Model ${model} failed:`, modelError.message || modelError);
          lastError = modelError;
          
          // Enhanced error analysis with more details
          const errorMsg = modelError?.message || modelError?.toString() || '';
          const isUsageLimit = this.isUsageLimitError(modelError);
          const isPermissionDenied = errorMsg.toLowerCase().includes('permission denied');
          const isInvalidModel = errorMsg.toLowerCase().includes('invalid') && errorMsg.toLowerCase().includes('model');
          const hasUsageLimitedDelegate = modelError?.error?.delegate === 'usage-limited-chat' || 
                                         modelError?.delegate === 'usage-limited-chat';
          
          console.error('🔍 Model error analysis:', {
            model: model,
            isUsageLimit,
            isPermissionDenied,
            isInvalidModel,
            hasUsageLimitedDelegate,
            errorMessage: errorMsg,
            delegate: modelError?.error?.delegate || modelError?.delegate,
            fullError: modelError
          });
          
          // Special handling for usage-limited-chat delegate (based on technical report)
          if (hasUsageLimitedDelegate) {
            console.log('🚫 Detected usage-limited-chat delegate - trying test mode...');
            
            try {
              console.log(`🧪 Retrying ${model} with testMode enabled...`);
              const testModeOptions = {
                model: model,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 2000,
                stream: false,
                timeout: 30000,
                testMode: true, // Force test mode to avoid quota consumption
                ...options
              };
              
              const testResponse = await window.puter.ai.chat(prompt, testModeOptions);
              console.log(`✅ Test mode successful with model: ${model}`);
              
              // Update current model and return
              this.currentModel = model;
              return {
                content: this.extractContent(testResponse),
                model: model,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId,
                testMode: true
              };
              
            } catch (testError) {
              console.warn(`❌ Test mode also failed for ${model}:`, testError.message);
            }
          }
          
          // If model is invalid, remove it from future attempts
          if (isInvalidModel) {
            console.log(`🚫 Model ${model} is invalid, removing from free tier list`);
            this.freeTierModels = this.freeTierModels.filter(m => m !== model);
          }
          
          // If permission denied and not signed in, re-authenticate
          if (isPermissionDenied) {
            console.log('� Permission denied - checking authentication...');
            const stillSignedIn = await window.puter.auth.isSignedIn();
            if (!stillSignedIn) {
              console.log('🔐 Authentication lost - re-authenticating...');
              try {
                await window.puter.auth.signIn();
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Retry the same model once with fresh auth
                console.log(`🔄 Retrying ${model} with fresh authentication...`);
                
                // Recreate call options for retry
                const retryCallOptions = {
                  model: model,
                  temperature: options.temperature || 0.7,
                  max_tokens: options.max_tokens || 2000,
                  stream: false,
                  timeout: 30000,
                  testMode: this.testMode && !options.forceProduction,
                  ...options
                };
                
                const retryResponse = await window.puter.ai.chat(prompt, retryCallOptions);
                console.log(`✅ Retry successful with model: ${model}`);
                this.currentModel = model;
                return {
                  content: this.extractContent(retryResponse),
                  model: model,
                  timestamp: new Date().toISOString(),
                  sessionId: this.sessionId
                };
              } catch (retryError) {
                console.warn(`❌ Retry with fresh auth failed for ${model}:`, retryError.message);
              }
            }
          }
          
          // For usage limits, continue to next model immediately
          if (isUsageLimit) {
            console.log(`🔄 Usage limit for ${model}, trying next model...`);
            continue;
          }
          
          // For other errors, wait briefly before trying next model
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // If all models failed, throw the last error
      console.error('❌ All models exhausted, throwing last error');
      throw lastError || new Error('All AI models failed');

    } catch (error) {
      console.error('❌ Raw AI call completely failed:', error);
      
      // Enhanced error reporting with usage limit guidance
      const errorDetails = {
        message: error?.message,
        type: typeof error,
        isUsageLimit: this.isUsageLimitError(error),
        timestamp: new Date().toISOString()
      };
      
      console.error('🔍 Complete error analysis:', errorDetails);
      
      // Try to extract Puter-specific error details
      if (error && typeof error === 'object') {
        if (error.error) {
          console.error('🔍 Puter inner error:', error.error);
        }
        if (error.delegate) {
          console.error('🔍 Puter delegate info:', error.delegate);
        }
      }
      
      // Provide guidance for usage limit errors
      if (errorDetails.isUsageLimit) {
        const guidance = await this.handleUsageLimitError(error, false);
        console.log('💡 Usage limit guidance provided');
        
        // Attach guidance to error for UI display
        error.userGuidance = this.getQuotaGuidance();
      }
      
      throw error;
    }
  }

  /**
   * Extract content from raw Puter response
   */
  extractContent(response) {
    if (typeof response === 'string') {
      return response;
    }
    
    if (response && typeof response === 'object') {
      if (response.message?.content) {
        return response.message.content;
      }
      if (response.content) {
        return response.content;
      }
      if (response.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      if (response.text) {
        return response.text;
      }
    }
    
    return String(response || '');
  }

  /**
   * Check if error is authentication related
   */
  isAuthError(error) {
    const errorMsg = error?.message || error?.toString() || '';
    return errorMsg.toLowerCase().includes('authentication') ||
           errorMsg.toLowerCase().includes('401') ||
           errorMsg.toLowerCase().includes('unauthorized') ||
           errorMsg.toLowerCase().includes('usage-limited');
  }

  /**
   * Check if error is usage limit related
   */
  isUsageLimitError(error) {
    const errorMsg = error?.message || error?.toString() || '';
    const errorLower = errorMsg.toLowerCase();
    
    // Check for Puter-specific usage limit patterns
    const usageLimitPatterns = [
      'usage-limited',
      'usage limited',
      'usage-limited-chat',
      'permission denied',
      'rate limit',
      'quota exceeded',
      'too many requests',
      '429',
      'limit exceeded',
      'access denied',
      'insufficient permissions',
      'not authorized',
      'authentication failed',
      'invalid session',
      'session expired'
    ];
    
    // Also check the error structure for Puter delegate info
    const hasUsageLimitedDelegate = error?.error?.delegate === 'usage-limited-chat' || 
                                   error?.delegate === 'usage-limited-chat';
    
    const isUsageLimit = usageLimitPatterns.some(pattern => errorLower.includes(pattern)) || 
                        hasUsageLimitedDelegate;
    
    if (isUsageLimit) {
      console.log('🚫 Usage limit error detected:', {
        originalError: errorMsg,
        delegate: error?.error?.delegate || error?.delegate,
        matchedPattern: usageLimitPatterns.find(pattern => errorLower.includes(pattern)),
        hasUsageLimitedDelegate
      });
    }
    
    return isUsageLimit;
  }

  /**
   * Handle usage limit errors with user guidance (based on technical report)
   */
  async handleUsageLimitError(error, retryWithTestMode = true) {
    console.log('🚫 === USAGE LIMIT DETECTED ===');
    
    const guidance = {
      issue: 'Usage Limit Reached',
      explanation: 'Your Puter.com account has hit its AI usage quota.',
      solutions: [
        'Wait for your quota to reset (usually daily/hourly)',
        'Upgrade to Puter Pro for unlimited access',
        'Try using test mode for development/previewing',
        'Switch to a different account'
      ],
      upgradeUrl: 'https://puter.com/pricing',
      timestamp: new Date().toISOString()
    };
    
    // Check if we can try test mode
    if (retryWithTestMode && !this.isTestMode()) {
      console.log('🧪 Attempting to use test mode...');
      
      try {
        // Enable test mode temporarily
        const originalTestMode = this.testMode;
        this.testMode = true;
        
        // Try a simple test call
        const testResponse = await window.puter.ai.chat('Test', {
          model: 'gpt-4o-mini',
          max_tokens: 5,
          testMode: true
        });
        
        guidance.testModeAvailable = true;
        guidance.solutions.unshift('✅ Test mode is available - enable it for development');
        
        // Restore original test mode
        this.testMode = originalTestMode;
        
      } catch (testError) {
        console.warn('❌ Test mode also failed:', testError);
        guidance.testModeAvailable = false;
      }
    }
    
    console.log('💡 User guidance:', guidance);
    return guidance;
  }

  /**
   * Enable test mode automatically when usage limits are detected
   */
  async handleUsageLimitWithTestMode(error) {
    console.log('🧪 Usage limit detected - attempting test mode...');
    
    const originalTestMode = this.testMode;
    
    try {
      // Enable test mode temporarily
      this.setTestMode(true);
      
      console.log('🧪 Retrying with test mode enabled...');
      return { testModeEnabled: true, originalMode: originalTestMode };
      
    } catch (testError) {
      console.error('❌ Test mode retry failed:', testError);
      // Restore original test mode
      this.setTestMode(originalTestMode);
      return { testModeEnabled: false, error: testError };
    }
  }

  /**
   * Provide user guidance for quota management
   */
  getQuotaGuidance() {
    return {
      message: '⚠️ AI usage quota exceeded',
      solutions: [
        '🧪 Enable test mode for development: window.puterAIService.setTestMode(true)',
        '⏳ Wait for quota reset (usually hourly/daily)',
        '🔄 Try different account or sign in with different user',
        '💰 Consider upgrading to Puter Pro for unlimited access',
        '🔀 Use backend extraction service as fallback'
      ],
      testModeCommand: 'window.puterAIService.setTestMode(true)',
      upgradeUrl: 'https://puter.com/pricing'
    };
  }

  // ===== MAIN SERVICE METHODS - ALL DELEGATE TO BACKEND =====

  /**
   * Extract CV - delegates to backend modular system
   */
  async extractCV(prompt, options = {}) {
    try {
      console.log('📄 Extracting CV via backend...');
      
      // Step 1: Get raw AI response from Puter
      const rawResponse = await this.makeRawAICall(prompt, {
        max_tokens: 3000,
        temperature: 0.3
      });
      
      // Step 2: Package for backend
      const puterData = {
        originalResponse: rawResponse.content,
        model: rawResponse.model,
        timestamp: rawResponse.timestamp,
        sessionId: this.sessionId,
        operationType: 'extract-cv'
      };
      
      // Step 3: Send to robust backend system
      const backendResponse = await this.sendToBackend('/api/puter/v2/extract-cv', {
        puterData,
        options
      });
      
      console.log('✅ CV extraction completed via backend');
      return backendResponse;
      
    } catch (error) {
      console.error('❌ CV extraction failed:', error);
      throw error;
    }
  }

  /**
   * Tailor CV - delegates to backend modular system
   */
  async tailorCV(originalCV, jobData, additionalRequirements = '', language = 'en') {
    try {
      console.log('🎯 Tailoring CV via backend...');
      
      // Step 1: Create tailoring prompt
      const prompt = this.createTailoringPrompt(originalCV, jobData, additionalRequirements, language);
      
      // Step 2: Get raw AI response
      const rawResponse = await this.makeRawAICall(prompt, {
        max_tokens: 4000,
        temperature: 0.4
      });
      
      // Step 3: Package for backend
      const puterData = {
        originalResponse: rawResponse.content,
        model: rawResponse.model,
        timestamp: rawResponse.timestamp,
        sessionId: this.sessionId,
        operationType: 'tailor-cv'
      };
      
      // Step 4: Send to robust backend system
      const backendResponse = await this.sendToBackend('/api/puter/v2/tailor-cv', {
        puterData,
        originalCV,
        jobData,
        options: {
          additionalRequirements,
          language
        }
      });
      
      console.log('✅ CV tailoring completed via backend');
      return backendResponse;
      
    } catch (error) {
      console.error('❌ CV tailoring failed:', error);
      throw error;
    }
  }

  /**
   * Generate cover letter - delegates to backend modular system
   */
  async generateCoverLetter(cvData, jobDescription, companyInfo = '') {
    try {
      console.log('📝 Generating cover letter via backend...');
      
      // Step 1: Create cover letter prompt
      const prompt = this.createCoverLetterPrompt(cvData, jobDescription, companyInfo);
      
      // Step 2: Get raw AI response
      const rawResponse = await this.makeRawAICall(prompt, {
        max_tokens: 3000,
        temperature: 0.6
      });
      
      // Step 3: Package for backend
      const puterData = {
        originalResponse: rawResponse.content,
        model: rawResponse.model,
        timestamp: rawResponse.timestamp,
        sessionId: this.sessionId,
        operationType: 'generate-cover-letter'
      };
      
      // Step 4: Send to robust backend system
      const backendResponse = await this.sendToBackend('/api/puter/v2/generate-cover-letter', {
        puterData,
        cvData,
        jobDescription,
        companyInfo
      });
      
      console.log('✅ Cover letter generation completed via backend');
      return backendResponse;
      
    } catch (error) {
      console.error('❌ Cover letter generation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze job - delegates to backend modular system
   */
  async analyzeJob(jobText) {
    try {
      console.log('🎯 Analyzing job via backend...');
      
      // Step 1: Create job analysis prompt
      const prompt = this.createJobAnalysisPrompt(jobText);
      
      // Step 2: Get raw AI response
      const rawResponse = await this.makeRawAICall(prompt, {
        max_tokens: 4000,
        temperature: 0.3
      });
      
      // Step 3: Package for backend
      const puterData = {
        originalResponse: rawResponse.content,
        model: rawResponse.model,
        timestamp: rawResponse.timestamp,
        sessionId: this.sessionId,
        operationType: 'analyze-job'
      };
      
      // Step 4: Send to robust backend system
      const backendResponse = await this.sendToBackend('/api/puter/v2/analyze-job', {
        puterData,
        jobText
      });
      
      console.log('✅ Job analysis completed via backend');
      return backendResponse;
      
    } catch (error) {
      console.error('❌ Job analysis failed:', error);
      throw error;
    }
  }

  // ===== PROMPT CREATION HELPERS =====

  createTailoringPrompt(originalCV, jobData, additionalRequirements, language) {
    return `Please tailor this CV for the job offer.

CV Data: ${JSON.stringify(originalCV)}

Job Offer: ${typeof jobData === 'object' ? JSON.stringify(jobData) : jobData}

Additional Requirements: ${additionalRequirements}

Language: ${language}

Please provide a tailored CV that matches the job requirements while maintaining the original structure and format.`;
  }

  createCoverLetterPrompt(cvData, jobDescription, companyInfo) {
    return `Generate a professional cover letter based on this CV and job description.

CV Data: ${JSON.stringify(cvData)}

Job Description: ${jobDescription}

Company Info: ${companyInfo}

Please create a compelling cover letter that highlights relevant experience and skills.`;
  }

  createJobAnalysisPrompt(jobText) {
    return `Extract the following job offer information and return it as a JSON object:

Job Text: "${jobText}"

Please extract and return ONLY a valid JSON object with this structure:
{
  "title": "job title",
  "company": "company name", 
  "location": "location",
  "salary": "salary if mentioned",
  "employmentType": "type of employment",
  "description": "job description",
  "requirements": ["requirement1", "requirement2"],
  "skills": ["skill1", "skill2"],
  "benefits": ["benefit1", "benefit2"]
}

Return ONLY the JSON object, no additional text.`;
  }

  // ===== BACKEND COMMUNICATION =====

  /**
   * Send data to backend modular system
   */
  async sendToBackend(endpoint, data) {
    try {
      const response = await fetch(`${this.backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Check for fallback data in error responses
        if (responseData.preservedData || responseData.fallbackData) {
          console.warn('⚠️ Backend error but fallback data available');
          return {
            success: false,
            error: responseData.error,
            fallbackData: responseData.preservedData || responseData.fallbackData,
            hasFallback: true
          };
        }
        
        throw new Error(`Backend error: ${response.status} - ${responseData.error || 'Unknown error'}`);
      }

      return responseData;
      
    } catch (error) {
      console.error('❌ Backend communication failed:', error);
      throw error;
    }
  }

  /**
   * Fetch current valid models from Puter API and update our model list
   */
  async updateValidModels() {
    try {
      console.log('🔄 Fetching current valid models from Puter...');
      
      // Try to fetch with no-cors mode to avoid CORS issues
      const response = await fetch('https://puter.com/puterai/chat/models', {
        mode: 'no-cors',
        method: 'GET'
      });
      
      // Since no-cors mode returns opaque response, we can't read the JSON
      // Fall back to our curated list of known working models
      console.log('⚠️ CORS restriction detected, using curated model list');
      
      // Use a curated list of known working models (as of 2025)
      const knownWorkingModels = [
        'gpt-4o-mini',
        'gpt-4o', 
        'o1-mini',
        'claude-3-5-sonnet-latest',
        'claude-3-haiku-20240307'
      ];
      
      // Filter for free-tier friendly models
      const freeTierModels = knownWorkingModels.filter(model => 
        model.includes('mini') || 
        model.includes('haiku') ||
        model === 'gpt-4o-mini' ||
        model === 'o1-mini'
      );
      
      if (freeTierModels.length > 0) {
        this.freeTierModels = freeTierModels;
        console.log('✅ Updated free-tier models:', this.freeTierModels);
        
        // Update current model if it's not in the valid list
        if (!freeTierModels.includes(this.currentModel)) {
          this.currentModel = freeTierModels[0];
          console.log(`🔄 Updated current model to: ${this.currentModel}`);
        }
      }
      
      return { 
        success: true, 
        source: 'curated', 
        totalModels: knownWorkingModels.length, 
        freeTierModels 
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch valid models:', error);
      console.log('🔄 Using fallback model list...');
      
      // Fallback to our default free-tier models
      return { success: false, error: error.message, source: 'fallback' };
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isAuthenticated: this.isAuthenticated,
      user: this.authenticatedUser,
      sessionId: this.sessionId,
      currentModel: this.currentModel,
      backendUrl: this.backendUrl,
      frontendState: this.frontendState
    };
  }

  /**
   * Reset service
   */
  reset() {
    this.isInitialized = false;
    this.isAuthenticated = false;
    this.authenticatedUser = null;
    this.sessionId = this.generateSessionId();
    this.frontendState = {
      authStatus: 'not_checked',
      lastAuthTime: null,
      authToken: null
    };
    console.log('🔄 Streamlined Puter Service reset');
  }

  /**
   * Enable development/test mode (based on technical report)
   */
  setTestMode(enabled = true) {
    this.testMode = enabled;
    console.log(`🧪 Test mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
    if (enabled) {
      console.log('⚠️ Test mode: AI calls will be simulated and not count against quota');
    } else {
      console.log('🎯 Production mode: AI calls will be real and count against quota');
    }
  }

  /**
   * Check if we're in test mode
   */
  isTestMode() {
    return this.testMode || false;
  }

  /**
   * Get current valid models
   */
  getValidModels() {
    return {
      current: this.currentModel,
      freeTier: this.freeTierModels,
      total: this.freeTierModels.length
    };
  }

  // ===== LEGACY COMPATIBILITY METHODS =====

  /**
   * Legacy method for frontend compatibility
   */
  async generateTailoredCV(originalCV, jobOffer, additionalRequirements = '', language = 'en') {
    return await this.tailorCV(originalCV, jobOffer, additionalRequirements, language);
  }

  /**
   * Legacy method for frontend compatibility  
   */
  async processWithBackend(prompt, operation, additionalData = {}) {
    switch(operation) {
      case 'extract-cv':
        return await this.extractCV(prompt, additionalData);
      case 'tailor-cv':
        return await this.tailorCV(additionalData.originalCV, additionalData.jobOffer, additionalData.additionalRequirements, additionalData.language);
      case 'generate-cover-letter':
        return await this.generateCoverLetter(additionalData.cvData, additionalData.jobDescription, additionalData.companyInfo);
      case 'analyze-job':
        return await this.analyzeJob(prompt);
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  /**
   * Manual sign-in method - MUST be called from user action (button click, etc.)
   */
  async signIn() {
    try {
      console.log('🔐 Manual sign-in requested from user action...');
      await this.authenticate();
      
      if (this.isAuthenticated) {
        console.log('✅ Manual sign-in successful - AI access should now work');
        return true;
      } else {
        console.warn('⚠️ Manual sign-in failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Manual sign-in error:', error);
      return false;
    }
  }

  /**
   * Force re-authentication - useful for debugging
   */
  async forceReAuth() {
    console.log('🔄 Forcing re-authentication...');
    
    try {
      // Reset auth state
      this.isAuthenticated = false;
      this.authenticatedUser = null;
      this.frontendState.authStatus = 'not_checked';
      
      // Attempt fresh authentication
      await this.authenticate();
      
      console.log('✅ Re-authentication completed');
      console.log('📋 New auth status:', this.frontendState.authStatus);
      console.log('👤 New user:', this.authenticatedUser?.username || 'Unknown');
      
      return this.isAuthenticated;
    } catch (error) {
      console.error('❌ Re-authentication failed:', error);
      return false;
    }
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Legacy method: Direct AI call (for backward compatibility)
   * This method provides the same interface as the old massive service
   */
  async callPuterAI(prompt, options = {}) {
    console.log('🔧 Legacy callPuterAI method called - delegating to makeRawAICall');
    return await this.makeRawAICall(prompt, options);
  }

  /**
   * Test service connectivity (for debugging and frontend compatibility)
   */
  async testConnection() {
    try {
      console.log('🧪 Testing streamlined Puter service connection...');
      
      // Test raw AI call
      const testResponse = await this.makeRawAICall('Hello! Please respond with "Streamlined Puter AI is working" to confirm connection.');
      
      console.log('✅ Streamlined Puter test successful');
      return {
        success: true,
        response: testResponse.content,
        model: testResponse.model,
        sessionId: this.sessionId
      };
    } catch (error) {
      console.error('❌ Streamlined Puter test failed:', error);
      return {
        success: false,
        error: error?.message || error?.toString() || 'Unknown error',
        sessionId: this.sessionId
      };
    }
  }

  // ===== DEBUGGING AND TROUBLESHOOTING METHODS =====

  /**
   * Quick authentication debug
   */
  async debugAuth() {
    console.log('🔍 === AUTHENTICATION DEBUG ===');
    
    try {
      console.log('1. Checking Puter.js availability...');
      if (!window.puter) {
        console.error('❌ Puter.js not loaded');
        return { error: 'Puter.js not available' };
      }
      console.log('✅ Puter.js loaded');
      
      console.log('2. Checking authentication status...');
      const isSignedIn = await window.puter.auth.isSignedIn();
      console.log(`Auth status: ${isSignedIn ? '✅ Signed in' : '❌ Not signed in'}`);
      
      if (isSignedIn) {
        const user = await window.puter.auth.getUser();
        console.log('👤 User info:', {
          username: user?.username || 'Unknown',
          email: user?.email || 'No email',
          isTemp: user?.is_temp || false
        });
      }
      
      console.log('3. Testing AI access...');
      const accountStatus = await this.checkAccountStatus();
      console.log('📊 Account status:', accountStatus);
      
      return { success: true, isSignedIn, accountStatus };
      
    } catch (error) {
      console.error('❌ Debug failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Force re-authentication
   */
  async forceReAuth() {
    console.log('🔄 === FORCING RE-AUTHENTICATION ===');
    
    try {
      console.log('🔐 Forcing sign-in...');
      await window.puter.auth.signIn();
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isSignedIn = await window.puter.auth.isSignedIn();
      if (isSignedIn) {
        console.log('✅ Re-authentication successful');
        await this.checkAuthentication();
        return { success: true };
      } else {
        console.log('❌ Re-authentication failed');
        return { success: false, error: 'Sign-in verification failed' };
      }
      
    } catch (error) {
      console.error('❌ Re-authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test connection with minimal AI call
   */
  async testConnection() {
    console.log('🧪 === TESTING CONNECTION ===');
    
    try {
      console.log('🔍 Checking authentication...');
      const authStatus = await this.debugAuth();
      if (!authStatus.isSignedIn) {
        console.log('⚠️ Not authenticated - attempting authentication...');
        await this.forceReAuth();
      }
      
      console.log('🤖 Testing AI call...');
      const response = await this.makeRawAICall('Hello', {
        max_tokens: 10,
        forceProduction: false  // Use test mode if available
      });
      
      console.log('✅ Connection test successful:', response);
      return { success: true, response };
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual sign-in helper
   */
  async signIn() {
    console.log('🔐 === MANUAL SIGN-IN ===');
    
    try {
      await window.puter.auth.signIn();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await this.debugAuth();
      if (result.isSignedIn) {
        console.log('✅ Manual sign-in successful');
        return { success: true };
      } else {
        console.log('❌ Sign-in verification failed');
        return { success: false, error: 'Verification failed' };
      }
      
    } catch (error) {
      console.error('❌ Manual sign-in failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test all available models
   */
  async testModels() {
    console.log('🧪 === TESTING ALL MODELS ===');
    
    // Test the free-tier models plus some premium ones
    const models = [
      ...this.freeTierModels, 
      'gpt-4o', 
      'claude-3-5-sonnet-latest',
      'claude-3-5-sonnet-20241022'
    ];
    const results = {};
    
    for (const model of models) {
      try {
        console.log(`🔄 Testing ${model}...`);
        const response = await window.puter.ai.chat('Test', {
          model: model,
          max_tokens: 5,
          timeout: 10000
        });
        results[model] = { success: true, response: typeof response };
        console.log(`✅ ${model}: SUCCESS`);
      } catch (error) {
        results[model] = { success: false, error: error.message };
        console.log(`❌ ${model}: FAILED - ${error.message}`);
      }
      
      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('📊 Model test results:', results);
    
    // Update free tier models with working ones
    const workingModels = Object.entries(results)
      .filter(([_, result]) => result.success)
      .map(([model, _]) => model);
    
    if (workingModels.length > 0) {
      console.log('✅ Working models found:', workingModels);
      // Update current model to first working one if current isn't working
      if (!results[this.currentModel]?.success && workingModels.length > 0) {
        this.currentModel = workingModels[0];
        console.log(`🔄 Updated current model to: ${this.currentModel}`);
      }
    }
    
    return results;
  }

  /**
   * Get current service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      authenticated: this.isAuthenticated,
      user: this.authenticatedUser?.username || null,
      currentModel: this.currentModel,
      testMode: this.testMode,
      freeTierModels: this.freeTierModels,
      frontendState: this.frontendState,
      sessionId: this.sessionId
    };
  }
}

// Create singleton instance
const streamlinedPuterAIService = new StreamlinedPuterAIService();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.puterAIService = streamlinedPuterAIService;
  window.streamlinedPuterAIService = streamlinedPuterAIService; // Keep both for compatibility
  console.log('🔧 === PUTER AI SERVICE READY ===');
  console.log('🎯 Enhanced with Technical Report optimizations');
  console.log('🛠️ DEBUGGING COMMANDS:');
  console.log('  🔐 Authentication:');
  console.log('    - window.puterAIService.debugAuth() - Debug authentication status');
  console.log('    - window.puterAIService.signIn() - Manual sign-in');
  console.log('    - window.puterAIService.forceReAuth() - Force re-authentication');
  console.log('    - window.puterAIService.checkAccountStatus() - Check account access');
  console.log('    - window.puterAIService.getUserGuidance() - Get personalized guidance');
  console.log('  🧪 Testing & Quota Management:');
  console.log('    - window.puterAIService.testConnection() - Test AI connection');
  console.log('    - window.puterAIService.testModels() - Test all models');
  console.log('    - window.puterAIService.setTestMode(true) - Enable test mode (no quota)');
  console.log('    - window.puterAIService.getQuotaGuidance() - Get quota solutions');
  console.log('  ⚙️ Configuration:');
  console.log('    - window.puterAIService.updateValidModels() - Refresh model list');
  console.log('    - window.puterAIService.getValidModels() - List valid models');
  console.log('    - window.puterAIService.getStatus() - Get service status');
  console.log('🚀 Ready for enhanced AI operations with quota management!');
  console.log('💡 QUICK FIX: If you see usage limit errors, try:');
  console.log('   window.puterAIService.setTestMode(true)');
}

export { streamlinedPuterAIService, StreamlinedPuterAIService };
export default streamlinedPuterAIService;
