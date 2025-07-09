/**
 * Puter Job Analysis Engine
 * Specialized engine for job analysis using Puter AI responses
 * Follows the tailoring system pattern with Puter-specific adaptations
 */

const PuterAuthEngine = require('../engines/PuterAuthEngine');
const PuterRequestEngine = require('../engines/PuterRequestEngine');

class PuterJobAnalysisEngine {
  constructor() {
    this.name = 'Puter Job Analysis Engine';
    this.version = '1.0.0';
    this.authEngine = new PuterAuthEngine();
    this.requestEngine = new PuterRequestEngine();
    this.analysisCache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    
    console.log('🎯 Puter Job Analysis Engine initialized');
  }

  /**
   * Extract job analysis from Puter data
   * @param {Object} puterData - Puter response data
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Job analysis result
   */
  async extractJobAnalysis(puterData, options = {}) {
    try {
      console.log('🎯 Extracting job analysis from Puter data...');
      
      // 1. Authenticate Puter data
      const authResult = await this.authEngine.brutalAuth(puterData);
      
      // 2. Process request for job analysis
      const requestResult = await this.requestEngine.processRequest(
        puterData, 
        'analyze-job',
        {
          ...options,
          analysisDepth: options.analysisDepth || 'comprehensive'
        }
      );
      
      // 3. Extract structured job analysis
      const jobAnalysis = await this.extractStructuredAnalysis(requestResult.data, options);
      
      // 4. Enhance with Puter-specific features
      const enhancedAnalysis = await this.enhanceJobAnalysis(jobAnalysis, puterData);
      
      // 5. Cache result
      this.cacheAnalysis(enhancedAnalysis);
      
      console.log('✅ Job analysis extraction completed');
      return enhancedAnalysis;
      
    } catch (error) {
      console.error('❌ Job analysis extraction failed:', error.message);
      throw new Error(`Job analysis extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract structured analysis from processed data
   */
  async extractStructuredAnalysis(processedData, options) {
    const analysis = {
      jobTitle: this.extractJobTitle(processedData),
      company: this.extractCompany(processedData),
      location: this.extractLocation(processedData),
      jobType: this.extractJobType(processedData),
      experienceLevel: this.extractExperienceLevel(processedData),
      requirements: this.extractRequirements(processedData),
      responsibilities: this.extractResponsibilities(processedData),
      qualifications: this.extractQualifications(processedData),
      skills: this.extractSkills(processedData),
      benefits: this.extractBenefits(processedData),
      salaryRange: this.extractSalaryRange(processedData),
      keywords: this.extractKeywords(processedData),
      industry: this.extractIndustry(processedData),
      department: this.extractDepartment(processedData),
      remote: this.extractRemoteInfo(processedData),
      applicationDeadline: this.extractDeadline(processedData),
      contactInfo: this.extractContactInfo(processedData),
      
      // Analysis metadata
      analysisMetadata: {
        engine: this.name,
        version: this.version,
        model: processedData._analysisMetadata?.model || 'unknown',
        analyzedAt: new Date().toISOString(),
        analysisDepth: options.analysisDepth || 'comprehensive',
        confidence: this.calculateAnalysisConfidence(processedData),
        quality: this.calculateAnalysisQuality(processedData)
      }
    };
    
    return analysis;
  }

  /**
   * Extract job title
   */
  extractJobTitle(data) {
    // Try different methods to extract job title
    if (data.jobTitle) return data.jobTitle;
    if (data.title) return data.title;
    if (data.position) return data.position;
    if (data.role) return data.role;
    
    // Try to extract from content
    if (data.analysis) {
      const titleMatch = data.analysis.match(/(?:job title|position|role):\s*([^\n,]+)/i);
      if (titleMatch) return titleMatch[1].trim();
    }
    
    return 'Unknown Position';
  }

  /**
   * Extract company name
   */
  extractCompany(data) {
    if (data.company) return data.company;
    if (data.companyName) return data.companyName;
    if (data.employer) return data.employer;
    if (data.organization) return data.organization;
    
    // Try to extract from content
    if (data.analysis) {
      const companyMatch = data.analysis.match(/(?:company|employer|organization):\s*([^\n,]+)/i);
      if (companyMatch) return companyMatch[1].trim();
    }
    
    return 'Unknown Company';
  }

  /**
   * Extract location
   */
  extractLocation(data) {
    if (data.location) return data.location;
    if (data.city) return data.city;
    if (data.address) return data.address;
    
    // Try to extract from content
    if (data.analysis) {
      const locationMatch = data.analysis.match(/(?:location|city|address):\s*([^\n,]+)/i);
      if (locationMatch) return locationMatch[1].trim();
    }
    
    return 'Not specified';
  }

  /**
   * Extract job type
   */
  extractJobType(data) {
    if (data.jobType) return data.jobType;
    if (data.employmentType) return data.employmentType;
    if (data.type) return data.type;
    
    // Try to extract from content
    if (data.analysis) {
      const typeMatch = data.analysis.match(/(?:job type|employment type|type):\s*([^\n,]+)/i);
      if (typeMatch) return typeMatch[1].trim();
    }
    
    return 'Full-time';
  }

  /**
   * Extract experience level
   */
  extractExperienceLevel(data) {
    if (data.experienceLevel) return data.experienceLevel;
    if (data.experience) return data.experience;
    if (data.level) return data.level;
    
    // Try to extract from content
    if (data.analysis) {
      const levelMatch = data.analysis.match(/(?:experience level|experience|level):\s*([^\n,]+)/i);
      if (levelMatch) return levelMatch[1].trim();
    }
    
    return 'Mid-level';
  }

  /**
   * Extract requirements
   */
  extractRequirements(data) {
    if (Array.isArray(data.requirements)) return data.requirements;
    
    const requirements = [];
    
    if (data.analysis) {
      // Look for requirements section
      const reqMatch = data.analysis.match(/(?:requirements|required|must have):\s*([^\.]+)/i);
      if (reqMatch) {
        const reqText = reqMatch[1];
        const reqItems = reqText.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);
        requirements.push(...reqItems);
      }
    }
    
    return requirements;
  }

  /**
   * Extract responsibilities
   */
  extractResponsibilities(data) {
    if (Array.isArray(data.responsibilities)) return data.responsibilities;
    
    const responsibilities = [];
    
    if (data.analysis) {
      // Look for responsibilities section
      const respMatch = data.analysis.match(/(?:responsibilities|duties|tasks):\s*([^\.]+)/i);
      if (respMatch) {
        const respText = respMatch[1];
        const respItems = respText.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);
        responsibilities.push(...respItems);
      }
    }
    
    return responsibilities;
  }

  /**
   * Extract qualifications
   */
  extractQualifications(data) {
    if (Array.isArray(data.qualifications)) return data.qualifications;
    
    const qualifications = [];
    
    if (data.analysis) {
      // Look for qualifications section
      const qualMatch = data.analysis.match(/(?:qualifications|preferred|nice to have):\s*([^\.]+)/i);
      if (qualMatch) {
        const qualText = qualMatch[1];
        const qualItems = qualText.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);
        qualifications.push(...qualItems);
      }
    }
    
    return qualifications;
  }

  /**
   * Extract skills
   */
  extractSkills(data) {
    if (Array.isArray(data.skills)) return data.skills;
    if (typeof data.skills === 'object') return Object.keys(data.skills);
    
    const skills = [];
    
    if (data.analysis) {
      // Look for skills section
      const skillMatch = data.analysis.match(/(?:skills|technologies|tools):\s*([^\.]+)/i);
      if (skillMatch) {
        const skillText = skillMatch[1];
        const skillItems = skillText.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);
        skills.push(...skillItems);
      }
    }
    
    return skills;
  }

  /**
   * Extract benefits
   */
  extractBenefits(data) {
    if (Array.isArray(data.benefits)) return data.benefits;
    
    const benefits = [];
    
    if (data.analysis) {
      // Look for benefits section
      const benefitMatch = data.analysis.match(/(?:benefits|perks|compensation):\s*([^\.]+)/i);
      if (benefitMatch) {
        const benefitText = benefitMatch[1];
        const benefitItems = benefitText.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);
        benefits.push(...benefitItems);
      }
    }
    
    return benefits;
  }

  /**
   * Extract salary range
   */
  extractSalaryRange(data) {
    if (data.salaryRange) return data.salaryRange;
    if (data.salary) return data.salary;
    if (data.compensation) return data.compensation;
    
    // Try to extract from content
    if (data.analysis) {
      const salaryMatch = data.analysis.match(/(?:salary|compensation|pay):\s*([^\n,]+)/i);
      if (salaryMatch) return salaryMatch[1].trim();
    }
    
    return 'Not specified';
  }

  /**
   * Extract keywords
   */
  extractKeywords(data) {
    if (Array.isArray(data.keywords)) return data.keywords;
    
    const keywords = [];
    
    // Extract keywords from all text content
    const allText = [
      data.analysis || '',
      JSON.stringify(data.requirements || []),
      JSON.stringify(data.responsibilities || []),
      JSON.stringify(data.qualifications || []),
      JSON.stringify(data.skills || [])
    ].join(' ').toLowerCase();
    
    // Common job keywords
    const commonKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'azure', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'ci/cd', 'testing', 'api',
      'microservices', 'cloud', 'devops', 'machine learning', 'ai', 'data',
      'management', 'leadership', 'communication', 'problem solving'
    ];
    
    commonKeywords.forEach(keyword => {
      if (allText.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Extract industry
   */
  extractIndustry(data) {
    if (data.industry) return data.industry;
    if (data.sector) return data.sector;
    
    // Try to extract from content
    if (data.analysis) {
      const industryMatch = data.analysis.match(/(?:industry|sector|domain):\s*([^\n,]+)/i);
      if (industryMatch) return industryMatch[1].trim();
    }
    
    return 'Technology';
  }

  /**
   * Extract department
   */
  extractDepartment(data) {
    if (data.department) return data.department;
    if (data.team) return data.team;
    if (data.division) return data.division;
    
    // Try to extract from content
    if (data.analysis) {
      const deptMatch = data.analysis.match(/(?:department|team|division):\s*([^\n,]+)/i);
      if (deptMatch) return deptMatch[1].trim();
    }
    
    return 'Engineering';
  }

  /**
   * Extract remote work info
   */
  extractRemoteInfo(data) {
    if (data.remote !== undefined) return data.remote;
    if (data.remoteWork !== undefined) return data.remoteWork;
    
    // Try to extract from content
    if (data.analysis) {
      const remoteMatch = data.analysis.match(/(?:remote|work from home|telecommute)/i);
      return !!remoteMatch;
    }
    
    return false;
  }

  /**
   * Extract application deadline
   */
  extractDeadline(data) {
    if (data.applicationDeadline) return data.applicationDeadline;
    if (data.deadline) return data.deadline;
    if (data.dueDate) return data.dueDate;
    
    // Try to extract from content
    if (data.analysis) {
      const deadlineMatch = data.analysis.match(/(?:deadline|due date|apply by):\s*([^\n,]+)/i);
      if (deadlineMatch) return deadlineMatch[1].trim();
    }
    
    return null;
  }

  /**
   * Extract contact information
   */
  extractContactInfo(data) {
    if (data.contactInfo) return data.contactInfo;
    if (data.contact) return data.contact;
    
    const contactInfo = {};
    
    if (data.analysis) {
      // Extract email
      const emailMatch = data.analysis.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) contactInfo.email = emailMatch[1];
      
      // Extract phone
      const phoneMatch = data.analysis.match(/(\+?[\d\s()-]{10,})/);
      if (phoneMatch) contactInfo.phone = phoneMatch[1];
    }
    
    return contactInfo;
  }

  /**
   * Enhance job analysis with Puter-specific features
   */
  async enhanceJobAnalysis(jobAnalysis, puterData) {
    return {
      ...jobAnalysis,
      
      // Add Puter-specific metadata
      puterMetadata: {
        model: puterData.model,
        originalResponseLength: puterData.originalResponse.length,
        processingEngine: this.name,
        enhancedAt: new Date().toISOString()
      },
      
      // Add analysis scores
      analysisScores: {
        completeness: this.calculateCompletenessScore(jobAnalysis),
        clarity: this.calculateClarityScore(jobAnalysis),
        specificity: this.calculateSpecificityScore(jobAnalysis),
        overall: this.calculateOverallScore(jobAnalysis)
      },
      
      // Add keyword analysis
      keywordAnalysis: {
        totalKeywords: jobAnalysis.keywords.length,
        technicalKeywords: this.filterTechnicalKeywords(jobAnalysis.keywords),
        softSkillKeywords: this.filterSoftSkillKeywords(jobAnalysis.keywords),
        industryKeywords: this.filterIndustryKeywords(jobAnalysis.keywords)
      },
      
      // Add matching recommendations
      matchingRecommendations: this.generateMatchingRecommendations(jobAnalysis)
    };
  }

  /**
   * Calculate analysis confidence
   */
  calculateAnalysisConfidence(data) {
    let confidence = 0;
    
    // Base confidence from data presence
    if (data.analysis) confidence += 30;
    if (data.requirements && Array.isArray(data.requirements)) confidence += 20;
    if (data.skills && Array.isArray(data.skills)) confidence += 20;
    if (data.responsibilities && Array.isArray(data.responsibilities)) confidence += 15;
    if (data.qualifications && Array.isArray(data.qualifications)) confidence += 15;
    
    return Math.min(confidence, 100);
  }

  /**
   * Calculate analysis quality
   */
  calculateAnalysisQuality(data) {
    let quality = 0;
    
    // Check for structured data
    if (data.analysis && data.analysis.length > 100) quality += 25;
    if (data.requirements && Array.isArray(data.requirements) && data.requirements.length > 0) quality += 25;
    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) quality += 25;
    if (data.responsibilities && Array.isArray(data.responsibilities) && data.responsibilities.length > 0) quality += 25;
    
    return Math.min(quality, 100);
  }

  /**
   * Calculate completeness score
   */
  calculateCompletenessScore(analysis) {
    const requiredFields = ['jobTitle', 'requirements', 'responsibilities', 'skills'];
    let score = 0;
    
    requiredFields.forEach(field => {
      if (analysis[field] && 
          ((Array.isArray(analysis[field]) && analysis[field].length > 0) ||
           (typeof analysis[field] === 'string' && analysis[field].length > 0))) {
        score += 25;
      }
    });
    
    return score;
  }

  /**
   * Calculate clarity score
   */
  calculateClarityScore(analysis) {
    let score = 0;
    
    // Check for clear job title
    if (analysis.jobTitle && analysis.jobTitle !== 'Unknown Position') score += 30;
    
    // Check for clear requirements
    if (analysis.requirements && analysis.requirements.length > 0) score += 35;
    
    // Check for clear responsibilities
    if (analysis.responsibilities && analysis.responsibilities.length > 0) score += 35;
    
    return score;
  }

  /**
   * Calculate specificity score
   */
  calculateSpecificityScore(analysis) {
    let score = 0;
    
    // Check for specific skills
    if (analysis.skills && analysis.skills.length > 3) score += 30;
    
    // Check for specific requirements
    if (analysis.requirements && analysis.requirements.length > 3) score += 30;
    
    // Check for specific qualifications
    if (analysis.qualifications && analysis.qualifications.length > 0) score += 20;
    
    // Check for specific benefits
    if (analysis.benefits && analysis.benefits.length > 0) score += 20;
    
    return score;
  }

  /**
   * Calculate overall score
   */
  calculateOverallScore(analysis) {
    const completeness = this.calculateCompletenessScore(analysis);
    const clarity = this.calculateClarityScore(analysis);
    const specificity = this.calculateSpecificityScore(analysis);
    
    return Math.round((completeness + clarity + specificity) / 3);
  }

  /**
   * Filter technical keywords
   */
  filterTechnicalKeywords(keywords) {
    const technicalKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'azure', 'docker',
      'kubernetes', 'git', 'api', 'microservices', 'cloud', 'devops'
    ];
    
    return keywords.filter(keyword => 
      technicalKeywords.includes(keyword.toLowerCase())
    );
  }

  /**
   * Filter soft skill keywords
   */
  filterSoftSkillKeywords(keywords) {
    const softSkillKeywords = [
      'communication', 'leadership', 'problem solving', 'teamwork', 'management',
      'analytical', 'creative', 'organized', 'detail-oriented', 'collaborative'
    ];
    
    return keywords.filter(keyword => 
      softSkillKeywords.includes(keyword.toLowerCase())
    );
  }

  /**
   * Filter industry keywords
   */
  filterIndustryKeywords(keywords) {
    const industryKeywords = [
      'fintech', 'healthcare', 'e-commerce', 'saas', 'startup', 'enterprise',
      'retail', 'banking', 'insurance', 'consulting', 'agency', 'product'
    ];
    
    return keywords.filter(keyword => 
      industryKeywords.includes(keyword.toLowerCase())
    );
  }

  /**
   * Generate matching recommendations
   */
  generateMatchingRecommendations(analysis) {
    const recommendations = [];
    
    // Skills-based recommendations
    if (analysis.skills && analysis.skills.length > 0) {
      recommendations.push(`Highlight experience with: ${analysis.skills.slice(0, 3).join(', ')}`);
    }
    
    // Requirements-based recommendations
    if (analysis.requirements && analysis.requirements.length > 0) {
      recommendations.push(`Emphasize: ${analysis.requirements.slice(0, 2).join(', ')}`);
    }
    
    // Industry-specific recommendations
    if (analysis.industry && analysis.industry !== 'Technology') {
      recommendations.push(`Tailor content for ${analysis.industry} industry`);
    }
    
    return recommendations;
  }

  /**
   * Cache analysis result
   */
  cacheAnalysis(analysis) {
    const cacheKey = `${analysis.jobTitle}_${analysis.company}_${Date.now()}`;
    
    this.analysisCache.set(cacheKey, {
      analysis,
      timestamp: Date.now()
    });
    
    // Clean expired cache
    this.cleanExpiredCache();
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache() {
    const now = Date.now();
    
    for (const [key, value] of this.analysisCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.analysisCache.delete(key);
      }
    }
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      engine: this.name,
      version: this.version,
      status: 'active',
      metrics: {
        cacheSize: this.analysisCache.size,
        analysisTimeout: this.cacheTimeout
      },
      capabilities: [
        'Job analysis extraction',
        'Structured data parsing',
        'Keyword analysis',
        'Completeness scoring',
        'Matching recommendations',
        'Puter integration'
      ],
      dependencies: {
        authEngine: this.authEngine.getStatus(),
        requestEngine: this.requestEngine.getStatus()
      }
    };
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
    console.log('🧹 Puter job analysis cache cleared');
  }
}

module.exports = PuterJobAnalysisEngine;
