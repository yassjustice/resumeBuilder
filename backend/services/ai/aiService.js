/**
 * AI Service - Core Gemini AI functionality
 * Handles all AI model interactions and prompts
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    // Rate limiting variables
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    this.maxRequestsPerMinute = 12; // Conservative limit to avoid 429 errors
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Test AI service connectivity
   */
  async testConnection() {
    try {
      const result = await this.model.generateContent("Hello, are you working?");
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`AI service test failed: ${error.message}`);
    }
  }

  /**
   * Extract text from image-based PDF using Gemini Vision OCR
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromImagePDF(pdfBuffer) {
    try {
      // Convert PDF to base64 for Gemini Vision
      const base64Data = pdfBuffer.toString('base64');
      
      const prompt = `
Extract all text content from this CV/resume document. 
Focus on capturing:
- Personal information (name, contact details)
- Professional summary or objective
- Work experience (job titles, companies, dates, responsibilities)
- Education details
- Skills and competencies
- Certifications and achievements
- Any other relevant career information

Return the extracted text in a clean, readable format while preserving the structure and hierarchy of information.
`;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const extractedText = response.text();
      
      console.log('✅ Gemini Vision OCR completed');
      console.log('📝 Extracted text length:', extractedText.length);
      
      return extractedText;
      
    } catch (error) {
      console.error('❌ Gemini Vision OCR failed:', error);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from image files using Gemini Vision OCR
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} mimeType - Image MIME type
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromImage(imageBuffer, mimeType) {
    try {
      // Convert image to base64 for Gemini Vision
      const base64Data = imageBuffer.toString('base64');
      
      const prompt = `
Extract all text content from this CV/resume image. 
Focus on capturing:
- Personal information (name, contact details)
- Professional summary or objective  
- Work experience (job titles, companies, dates, responsibilities)
- Education details
- Skills and competencies
- Certifications and achievements
- Any other relevant career information

Return the extracted text in a clean, readable format while preserving the structure and hierarchy of information.
`;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const extractedText = response.text();
      
      console.log('✅ Gemini Vision image OCR completed');
      console.log('📝 Extracted text length:', extractedText.length);
      
      return extractedText;
      
    } catch (error) {
      console.error('❌ Gemini Vision image OCR failed:', error);
      throw new Error(`Image OCR extraction failed: ${error.message}`);
    }
  }  /**
   * Rate limiting helper
   */
  async checkRateLimit() {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;
    
    // Reset counter every minute OR if this is the first request
    if (timeSinceReset >= 60000 || this.lastResetTime === 0) {
      this.requestCount = 0;
      this.lastResetTime = now;
      console.log(`🔄 Rate limit reset. Time since last reset: ${Math.ceil(timeSinceReset/1000)}s`);
    }
    
    // Increment first, then check
    this.requestCount++;
    
    // Check if we're over the limit AFTER incrementing
    if (this.requestCount > this.maxRequestsPerMinute) {
      const waitTime = 60000 - timeSinceReset + 1000; // Wait until next minute + buffer
      console.log(`⏳ Rate limit reached (${this.requestCount}/${this.maxRequestsPerMinute}), waiting ${Math.ceil(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 1; // Reset to 1 since this request will be the first of the new window
      this.lastResetTime = Date.now();
    }
    
    console.log(`📊 Rate limit status: ${this.requestCount}/${this.maxRequestsPerMinute} requests used`);
  }

  /**
   * Generate content with AI model with rate limiting and retry
   * @param {string} prompt - The prompt to send to AI
   * @returns {Promise<string>} - AI response text
   */
  async generateContent(prompt) {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.checkRateLimit();
        
        console.log(`🤖 AI Request ${attempt}/${maxRetries} (${this.requestCount}/${this.maxRequestsPerMinute})`);
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
        
      } catch (error) {
        lastError = error;
        
        // Check if it's a rate limit error
        if (error.message.includes('429') || error.message.includes('quota')) {
          console.log(`⚠️ Rate limit hit on attempt ${attempt}, waiting 40s...`);
          await new Promise(resolve => setTimeout(resolve, 40000));
          // Reset our internal counter
          this.requestCount = 0;
          this.lastResetTime = Date.now();
        } else if (attempt < maxRetries) {
          console.log(`⚠️ AI request failed (attempt ${attempt}), retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw new Error(`AI content generation failed after ${maxRetries} attempts: ${lastError.message}`);
  }
  /**
   * Parse JSON response from AI with robust fallback handling
   * @param {string} jsonText - Raw AI response
   * @returns {Object} - Parsed JSON object
   */
  parseAIResponse(jsonText) {
    // Clean the response text
    let cleanedText = jsonText.trim()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^\s*[\r\n]/gm, ''); // Remove empty lines

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.log('⚠️ Initial JSON parsing failed, attempting repairs...');
      
      // Try to extract JSON block
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonCandidate = jsonMatch[0];
        
        try {
          // Attempt to fix common JSON issues
          jsonCandidate = this.repairJSON(jsonCandidate);
          return JSON.parse(jsonCandidate);
        } catch (secondParseError) {
          console.error('❌ JSON repair failed:', secondParseError.message);
          console.log('🔍 Malformed JSON:', jsonCandidate.substring(0, 500) + '...');
          
          // Last resort: try to extract key-value pairs manually
          try {
            return this.extractDataFromMalformedJSON(jsonCandidate);
          } catch (extractError) {
            console.error('❌ Manual extraction failed:', extractError.message);
            throw new Error('Unable to parse AI response: Invalid JSON format');
          }
        }
      } else {
        console.error('❌ No JSON structure found in response');
        console.log('🔍 Full response:', jsonText.substring(0, 500) + '...');
        throw new Error('No valid JSON structure found in AI response');
      }
    }
  }

  /**
   * Attempt to repair common JSON formatting issues
   * @param {string} jsonStr - Malformed JSON string
   * @returns {string} - Repaired JSON string
   */
  repairJSON(jsonStr) {
    return jsonStr
      // Fix unquoted property names
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
      // Fix single quotes to double quotes
      .replace(/'/g, '"')
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix missing commas between array elements
      .replace(/"\s*\n\s*"/g, '",\n"')
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
  }

  /**
   * Extract data from malformed JSON as fallback
   * @param {string} malformedJson - Malformed JSON string
   * @returns {Object} - Extracted data object
   */
  extractDataFromMalformedJSON(malformedJson) {
    const result = {};
    
    // Try to extract simple key-value pairs
    const keyValueRegex = /["']?([a-zA-Z_$][a-zA-Z0-9_$]*)["']?\s*:\s*["']([^"']*)["']/g;
    let match;
    
    while ((match = keyValueRegex.exec(malformedJson)) !== null) {
      result[match[1]] = match[2];
    }
    
    // Try to extract arrays
    const arrayRegex = /["']?([a-zA-Z_$][a-zA-Z0-9_$]*)["']?\s*:\s*\[([\s\S]*?)\]/g;
    while ((match = arrayRegex.exec(malformedJson)) !== null) {
      const arrayContent = match[2];
      const items = arrayContent.split(',').map(item => 
        item.trim().replace(/^["']|["']$/g, '')
      ).filter(item => item.length > 0);
      result[match[1]] = items;
    }
    
    if (Object.keys(result).length === 0) {
      throw new Error('No extractable data found');
    }
    
    return result;
  }
  /**
   * Enhanced AI processing with improved error handling and recovery
   */
  async processWithRetryAndFallback(prompt, maxRetries = 3, fallbackStrategies = []) {
    const startTime = Date.now();
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 AI Service: Attempt ${attempt}/${maxRetries}`);
        
        // Wait for rate limit if needed
        await this.waitForRateLimit();
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const duration = Date.now() - startTime;
        console.log(`✅ AI Service: Success on attempt ${attempt} (${duration}ms)`);
        
        // Try to parse JSON
        const parsed = this.safeParseJSON(text);
        if (parsed) {
          return { success: true, data: parsed, rawText: text, attempt, duration };
        }

        throw new Error('Failed to parse JSON response');

      } catch (error) {
        lastError = error;
        console.log(`❌ AI Service: Attempt ${attempt} failed:`, error.message);
        
        // If rate limited, wait longer before next attempt
        if (error.message.includes('429') || error.message.includes('quota')) {
          const waitTime = Math.min(Math.pow(2, attempt) * 1000, 30000); // Exponential backoff, max 30s
          console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry...`);
          await this.sleep(waitTime);
        } else if (attempt < maxRetries) {
          // Regular backoff for other errors
          const waitTime = attempt * 1000;
          await this.sleep(waitTime);
        }
      }
    }

    // All retries failed, try fallback strategies
    console.log('🔄 AI Service: All retries failed, trying fallback strategies...');
    
    for (const strategy of fallbackStrategies) {
      try {
        console.log(`🔄 Trying fallback strategy: ${strategy.name}`);
        const fallbackResult = await strategy.execute(prompt, lastError);
        if (fallbackResult) {
          return { 
            success: true, 
            data: fallbackResult, 
            isFallback: true, 
            fallbackStrategy: strategy.name,
            duration: Date.now() - startTime 
          };
        }
      } catch (fallbackError) {
        console.log(`❌ Fallback strategy ${strategy.name} failed:`, fallbackError.message);
      }
    }

    // Everything failed
    const duration = Date.now() - startTime;
    return {
      success: false,
      error: lastError?.message || 'AI processing failed after all retries',
      attempts: maxRetries,
      duration
    };
  }

  /**
   * Sleep utility for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhanced JSON parsing with multiple strategies
   */
  safeParseJSON(text) {
    // Try standard parsing first
    try {
      return JSON.parse(text);
    } catch (e) {
      // Ignore parse errors, try fallback strategies
    }

    // Fallback strategy 1: Repair and parse
    const repaired = this.repairJSON(text);
    try {
      return JSON.parse(repaired);
    } catch (e) {
      // Ignore, proceed to next fallback
    }

    // Fallback strategy 2: Manual extraction
    try {
      return this.extractDataFromMalformedJSON(text);
    } catch (e) {
      // Ignore, return null
    }

    return null;
  }
}

module.exports = AIService;
