/**
 * Job Analysis Engine
 * Specialized engine for job offer parsing and analysis
 * Handles job requirements extraction and structuring
 */

class JobAnalysisEngine {
  constructor(aiService) {
    this.aiService = aiService;
    this.name = 'Job Analysis Engine';
    this.version = '1.0.0';
  }

  /**
   * Generate AI content with timeout
   */
  async generateContentWithTimeout(prompt, timeoutMs = 30000) {
    return Promise.race([
      this.aiService.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`AI request timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * Clean AI response and parse JSON
   * Removes markdown code blocks if present
   */
  parseAIResponse(response) {
    try {
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ JSON parsing failed for response:', response);
      console.error('❌ JSON parsing error:', error.message);
      throw error;
    }
  }

  /**
   * Extract and analyze job offer information
   * @param {string} jobOfferText - Raw job offer text
   * @returns {Promise<Object>} - Structured job offer data
   */
  async extractJobOffer(jobOfferText) {
    try {
      console.log('🔍 Analyzing job offer...');
      
      // Handle different input types
      const text = this.normalizeJobOfferInput(jobOfferText);
      
      if (!text || text.length === 0) {
        throw new Error('Job offer text is required and cannot be empty');
      }
      
      console.log('📝 Processing job offer text length:', text.length);

      const prompt = this.buildJobAnalysisPrompt(text);
      const response = await this.aiService.generateContent(prompt);
      const jobAnalysis = this.parseAIResponse(response);
      
      // Validate and enhance job analysis
      const enhancedAnalysis = this.enhanceJobAnalysis(jobAnalysis);
      
      console.log('✅ Job analysis completed:', enhancedAnalysis.jobTitle);
      return enhancedAnalysis;
      
    } catch (error) {
      console.error('❌ Job offer extraction failed:', error.message);
      throw new Error(`Job offer analysis failed: ${error.message}`);
    }
  }

  /**
   * Normalize job offer input to handle different formats
   */
  normalizeJobOfferInput(jobOfferText) {
    if (typeof jobOfferText === 'string') {
      return jobOfferText.trim();
    } else if (jobOfferText && typeof jobOfferText === 'object') {
      return jobOfferText.description || 
             jobOfferText.text || 
             jobOfferText.content || 
             JSON.stringify(jobOfferText);
    } else {
      return String(jobOfferText || '');
    }
  }

  /**
   * Build comprehensive job analysis prompt
   */
  buildJobAnalysisPrompt(text) {
    return `Analyze this job offer and extract key information. Return only JSON:

JOB OFFER TEXT:
${text}

Extract and return as JSON:
{
  "jobTitle": "exact job title",
  "experienceLevel": "junior/mid-level/senior/lead/manager",
  "industry": "industry sector",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "requirements": ["requirement1", "requirement2"],
  "keywords": ["keyword1", "keyword2"],
  "company": "company name if mentioned",
  "location": "job location if mentioned",
  "workType": "remote/hybrid/onsite",
  "salaryRange": "salary range if mentioned"
}`;
  }

  /**
   * Enhance job analysis with additional processing
   */
  enhanceJobAnalysis(rawAnalysis) {
    // Ensure all required fields exist with defaults
    const enhanced = {
      jobTitle: rawAnalysis.jobTitle || 'Position',
      experienceLevel: rawAnalysis.experienceLevel || 'mid-level',
      industry: rawAnalysis.industry || 'Technology',
      requiredSkills: Array.isArray(rawAnalysis.requiredSkills) ? rawAnalysis.requiredSkills : [],
      preferredSkills: Array.isArray(rawAnalysis.preferredSkills) ? rawAnalysis.preferredSkills : [],
      responsibilities: Array.isArray(rawAnalysis.responsibilities) ? rawAnalysis.responsibilities : [],
      requirements: Array.isArray(rawAnalysis.requirements) ? rawAnalysis.requirements : [],
      keywords: Array.isArray(rawAnalysis.keywords) ? rawAnalysis.keywords : [],
      company: rawAnalysis.company || '',
      location: rawAnalysis.location || '',
      workType: rawAnalysis.workType || 'onsite',
      salaryRange: rawAnalysis.salaryRange || ''
    };

    // Generate additional keywords from job title and requirements
    enhanced.keywords = this.generateAdditionalKeywords(enhanced);
    
    // Deduplicate skills and keywords
    enhanced.requiredSkills = [...new Set(enhanced.requiredSkills)];
    enhanced.preferredSkills = [...new Set(enhanced.preferredSkills)];
    enhanced.keywords = [...new Set(enhanced.keywords)];

    return enhanced;
  }

  /**
   * Generate additional keywords from job analysis
   */
  generateAdditionalKeywords(analysis) {
    const additionalKeywords = [...analysis.keywords];
    
    // Extract keywords from job title
    if (analysis.jobTitle) {
      const titleWords = analysis.jobTitle.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word));
      additionalKeywords.push(...titleWords);
    }
    
    // Extract keywords from industry
    if (analysis.industry) {
      additionalKeywords.push(analysis.industry.toLowerCase());
    }
    
    // Add skill variations
    const allSkills = [...analysis.requiredSkills, ...analysis.preferredSkills];
    for (const skill of allSkills) {
      additionalKeywords.push(skill.toLowerCase());
      // Add common variations
      if (skill.toLowerCase().includes('javascript')) {
        additionalKeywords.push('js', 'node.js', 'react', 'vue');
      }
      if (skill.toLowerCase().includes('python')) {
        additionalKeywords.push('django', 'flask', 'pandas');
      }
    }
    
    return [...new Set(additionalKeywords)];
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: 'active',
      capabilities: [
        'Job offer parsing',
        'Skills extraction',
        'Requirements analysis',
        'Keyword generation',
        'Multi-format input handling'
      ]
    };
  }
}

module.exports = JobAnalysisEngine;
