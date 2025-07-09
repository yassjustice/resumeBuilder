/**
 * Puter CV Tailoring Engine
 * Specialized engine for CV tailoring using Puter AI responses
 * Mirrors the CVAssemblyEngine pattern with Puter-specific adaptations
 */

const PuterAuthEngine = require('../engines/PuterAuthEngine');
const PuterRequestEngine = require('../engines/PuterRequestEngine');
const PuterJobAnalysisEngine = require('./PuterJobAnalysisEngine');

class PuterCVTailoringEngine {
  constructor() {
    this.name = 'Puter CV Tailoring Engine';
    this.version = '1.0.0';
    this.authEngine = new PuterAuthEngine();
    this.requestEngine = new PuterRequestEngine();
    this.jobAnalysisEngine = new PuterJobAnalysisEngine();
    this.tailoringCache = new Map();
    this.cacheTimeout = 20 * 60 * 1000; // 20 minutes
    
    console.log('🎯 Puter CV Tailoring Engine initialized');
  }

  /**
   * Tailor CV using Puter AI response
   * @param {Object} puterData - Puter response data
   * @param {Object} originalCV - Original CV data
   * @param {Object} jobData - Job description data
   * @param {Object} options - Tailoring options
   * @returns {Promise<Object>} - Tailored CV result
   */
  async tailorCVFromPuter(puterData, originalCV, jobData, options = {}) {
    try {
      console.log('🎯 Starting CV tailoring from Puter data...');
      
      // 1. Authenticate Puter data
      const authResult = await this.authEngine.brutalAuth(puterData);
      
      // 2. Extract job analysis if job data provided
      let jobAnalysis = null;
      if (jobData) {
        jobAnalysis = await this.jobAnalysisEngine.extractJobAnalysis(jobData, options);
      }
      
      // 3. Process tailoring request
      const requestResult = await this.requestEngine.processRequest(
        puterData,
        'tailor-cv',
        {
          ...options,
          jobDescription: jobData?.description || jobData?.content || '',
          originalCV: originalCV,
          tailoringLevel: options.tailoringLevel || 'comprehensive'
        }
      );
      
      // 4. Extract tailored CV structure
      const tailoredCV = await this.extractTailoredCV(requestResult.data, originalCV, jobAnalysis, options);
      
      // 5. Enhance with Puter-specific features
      const enhancedCV = await this.enhanceTailoredCV(tailoredCV, puterData, jobAnalysis);
      
      // 6. Validate tailoring authenticity
      const validatedCV = await this.validateTailoringAuthenticity(originalCV, enhancedCV);
      
      // 7. Cache result
      this.cacheTailoredCV(validatedCV);
      
      console.log('✅ CV tailoring completed successfully');
      return validatedCV;
      
    } catch (error) {
      console.error('❌ CV tailoring failed:', error.message);
      throw new Error(`CV tailoring failed: ${error.message}`);
    }
  }

  /**
   * Extract tailored CV structure from processed data
   */
  async extractTailoredCV(processedData, originalCV, jobAnalysis, options) {
    const tailoredCV = {
      // Personal info - preserve original but enhance title
      personalInfo: {
        ...originalCV.personalInfo,
        title: this.extractTailoredTitle(processedData, originalCV, jobAnalysis)
      },
      
      // Enhanced sections
      summary: this.extractTailoredSummary(processedData, originalCV, jobAnalysis),
      experience: this.extractTailoredExperience(processedData, originalCV, jobAnalysis),
      skills: this.extractTailoredSkills(processedData, originalCV, jobAnalysis),
      projects: this.extractTailoredProjects(processedData, originalCV, jobAnalysis),
      education: this.extractTailoredEducation(processedData, originalCV, jobAnalysis),
      certifications: this.extractTailoredCertifications(processedData, originalCV, jobAnalysis),
      languages: this.extractTailoredLanguages(processedData, originalCV, jobAnalysis),
      
      // Additional sections
      awards: originalCV.awards || [],
      volunteering: originalCV.volunteering || [],
      interests: originalCV.interests || [],
      
      // Tailoring metadata
      tailoringMetadata: {
        engine: this.name,
        version: this.version,
        model: processedData._tailoringMetadata?.model || 'unknown',
        tailoredAt: new Date().toISOString(),
        tailoringLevel: options.tailoringLevel || 'comprehensive',
        jobTitle: jobAnalysis?.jobTitle || 'Unknown Position',
        company: jobAnalysis?.company || 'Unknown Company',
        matchScore: 0, // Will be calculated later
        optimizations: []
      }
    };
    
    return tailoredCV;
  }

  /**
   * Extract tailored title
   */
  extractTailoredTitle(processedData, originalCV, jobAnalysis) {
    // Try to get tailored title from processed data
    if (processedData.tailoredTitle) return processedData.tailoredTitle;
    if (processedData.title) return processedData.title;
    
    // Use job analysis if available
    if (jobAnalysis?.jobTitle) return jobAnalysis.jobTitle;
    
    // Fallback to original
    return originalCV.personalInfo?.title || 'Professional';
  }

  /**
   * Extract tailored summary
   */
  extractTailoredSummary(processedData, originalCV, jobAnalysis) {
    // Try to get tailored summary from processed data
    if (processedData.tailoredSummary) return processedData.tailoredSummary;
    if (processedData.summary) return processedData.summary;
    
    // Try to extract from tailored content
    if (processedData.tailoredContent) {
      const summaryMatch = processedData.tailoredContent.match(/(?:summary|profile|overview):\s*([^\.]+)/i);
      if (summaryMatch) return summaryMatch[1].trim();
    }
    
    // Enhance original summary with job keywords
    let summary = originalCV.summary || '';
    if (jobAnalysis?.keywords && jobAnalysis.keywords.length > 0) {
      const topKeywords = jobAnalysis.keywords.slice(0, 3);
      summary = this.enhanceSummaryWithKeywords(summary, topKeywords);
    }
    
    return summary;
  }

  /**
   * Extract tailored experience
   */
  extractTailoredExperience(processedData, originalCV, jobAnalysis) {
    // Try to get tailored experience from processed data
    if (Array.isArray(processedData.tailoredExperience)) {
      return processedData.tailoredExperience;
    }
    
    if (Array.isArray(processedData.experience)) {
      return processedData.experience;
    }
    
    // Enhance original experience with job alignment
    let experience = originalCV.experience || [];
    if (jobAnalysis) {
      experience = this.enhanceExperienceWithJobAlignment(experience, jobAnalysis);
    }
    
    return experience;
  }

  /**
   * Extract tailored skills
   */
  extractTailoredSkills(processedData, originalCV, jobAnalysis) {
    // Try to get tailored skills from processed data
    if (processedData.tailoredSkills) return processedData.tailoredSkills;
    if (processedData.skills) return processedData.skills;
    
    // Enhance original skills with job requirements
    let skills = originalCV.skills || {};
    if (jobAnalysis?.skills && jobAnalysis.skills.length > 0) {
      skills = this.enhanceSkillsWithJobRequirements(skills, jobAnalysis.skills);
    }
    
    return skills;
  }

  /**
   * Extract tailored projects
   */
  extractTailoredProjects(processedData, originalCV, jobAnalysis) {
    // Try to get tailored projects from processed data
    if (Array.isArray(processedData.tailoredProjects)) {
      return processedData.tailoredProjects;
    }
    
    if (Array.isArray(processedData.projects)) {
      return processedData.projects;
    }
    
    // Enhance original projects with job relevance
    let projects = originalCV.projects || [];
    if (jobAnalysis) {
      projects = this.enhanceProjectsWithJobRelevance(projects, jobAnalysis);
    }
    
    return projects;
  }

  /**
   * Extract tailored education
   */
  extractTailoredEducation(processedData, originalCV, jobAnalysis) {
    // Try to get tailored education from processed data
    if (Array.isArray(processedData.tailoredEducation)) {
      return processedData.tailoredEducation;
    }
    
    if (Array.isArray(processedData.education)) {
      return processedData.education;
    }
    
    // Use original education (usually doesn't need tailoring)
    return originalCV.education || [];
  }

  /**
   * Extract tailored certifications
   */
  extractTailoredCertifications(processedData, originalCV, jobAnalysis) {
    // Try to get tailored certifications from processed data
    if (Array.isArray(processedData.tailoredCertifications)) {
      return processedData.tailoredCertifications;
    }
    
    if (Array.isArray(processedData.certifications)) {
      return processedData.certifications;
    }
    
    // Prioritize relevant certifications
    let certifications = originalCV.certifications || [];
    if (jobAnalysis?.skills && jobAnalysis.skills.length > 0) {
      certifications = this.prioritizeCertifications(certifications, jobAnalysis.skills);
    }
    
    return certifications;
  }

  /**
   * Extract tailored languages
   */
  extractTailoredLanguages(processedData, originalCV, jobAnalysis) {
    // Try to get tailored languages from processed data
    if (Array.isArray(processedData.tailoredLanguages)) {
      return processedData.tailoredLanguages;
    }
    
    if (Array.isArray(processedData.languages)) {
      return processedData.languages;
    }
    
    // Use original languages
    return originalCV.languages || [];
  }

  /**
   * Enhance summary with job keywords
   */
  enhanceSummaryWithKeywords(summary, keywords) {
    if (!summary || keywords.length === 0) return summary;
    
    // Add relevant keywords naturally to summary
    const keywordPhrase = keywords.join(', ');
    if (!summary.toLowerCase().includes(keywords[0].toLowerCase())) {
      summary += ` Experienced in ${keywordPhrase}.`;
    }
    
    return summary;
  }

  /**
   * Enhance experience with job alignment
   */
  enhanceExperienceWithJobAlignment(experience, jobAnalysis) {
    if (!experience || experience.length === 0) return experience;
    
    return experience.map(exp => {
      // Add job-relevant keywords to descriptions
      if (exp.description && jobAnalysis.keywords) {
        const relevantKeywords = jobAnalysis.keywords.filter(keyword => 
          exp.description.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (relevantKeywords.length > 0) {
          exp._jobAlignment = {
            relevantKeywords,
            alignmentScore: (relevantKeywords.length / jobAnalysis.keywords.length) * 100
          };
        }
      }
      
      return exp;
    });
  }

  /**
   * Enhance skills with job requirements
   */
  enhanceSkillsWithJobRequirements(skills, jobSkills) {
    if (!skills || jobSkills.length === 0) return skills;
    
    const enhancedSkills = { ...skills };
    
    // Boost relevant skills
    jobSkills.forEach(jobSkill => {
      const skillKey = jobSkill.toLowerCase();
      
      // Check if skill exists in any category
      Object.keys(enhancedSkills).forEach(category => {
        if (Array.isArray(enhancedSkills[category])) {
          const skillIndex = enhancedSkills[category].findIndex(skill => 
            skill.toLowerCase().includes(skillKey)
          );
          
          if (skillIndex >= 0) {
            // Move to front of array (prioritize)
            const skill = enhancedSkills[category].splice(skillIndex, 1)[0];
            enhancedSkills[category].unshift(skill);
          }
        }
      });
    });
    
    return enhancedSkills;
  }

  /**
   * Enhance projects with job relevance
   */
  enhanceProjectsWithJobRelevance(projects, jobAnalysis) {
    if (!projects || projects.length === 0) return projects;
    
    return projects.map(project => {
      // Calculate relevance score
      let relevanceScore = 0;
      
      if (project.description && jobAnalysis.keywords) {
        const projectText = project.description.toLowerCase();
        const matchingKeywords = jobAnalysis.keywords.filter(keyword => 
          projectText.includes(keyword.toLowerCase())
        );
        
        relevanceScore = (matchingKeywords.length / jobAnalysis.keywords.length) * 100;
        
        project._jobRelevance = {
          score: relevanceScore,
          matchingKeywords
        };
      }
      
      return project;
    }).sort((a, b) => (b._jobRelevance?.score || 0) - (a._jobRelevance?.score || 0));
  }

  /**
   * Prioritize certifications based on job skills
   */
  prioritizeCertifications(certifications, jobSkills) {
    if (!certifications || certifications.length === 0) return certifications;
    
    return certifications.map(cert => {
      // Calculate relevance score
      let relevanceScore = 0;
      
      if (cert.name && jobSkills) {
        const certText = cert.name.toLowerCase();
        const matchingSkills = jobSkills.filter(skill => 
          certText.includes(skill.toLowerCase())
        );
        
        relevanceScore = (matchingSkills.length / jobSkills.length) * 100;
        
        cert._jobRelevance = {
          score: relevanceScore,
          matchingSkills
        };
      }
      
      return cert;
    }).sort((a, b) => (b._jobRelevance?.score || 0) - (a._jobRelevance?.score || 0));
  }

  /**
   * Enhance tailored CV with Puter-specific features
   */
  async enhanceTailoredCV(tailoredCV, puterData, jobAnalysis) {
    const enhanced = {
      ...tailoredCV,
      
      // Add Puter-specific metadata
      puterMetadata: {
        model: puterData.model,
        originalResponseLength: puterData.originalResponse.length,
        tailoringEngine: this.name,
        enhancedAt: new Date().toISOString()
      },
      
      // Calculate match score
      matchScore: this.calculateMatchScore(tailoredCV, jobAnalysis),
      
      // Add job-specific optimizations
      jobSpecificOptimizations: this.generateJobOptimizations(tailoredCV, jobAnalysis),
      
      // Add ATS optimization
      atsOptimization: this.generateATSOptimization(tailoredCV, jobAnalysis),
      
      // Add keyword analysis
      keywordAnalysis: this.performKeywordAnalysis(tailoredCV, jobAnalysis)
    };
    
    // Update tailoring metadata
    enhanced.tailoringMetadata.matchScore = enhanced.matchScore;
    enhanced.tailoringMetadata.optimizations = enhanced.jobSpecificOptimizations;
    
    return enhanced;
  }

  /**
   * Calculate match score between CV and job
   */
  calculateMatchScore(tailoredCV, jobAnalysis) {
    if (!jobAnalysis) return 0;
    
    let totalScore = 0;
    let maxScore = 0;
    
    // Skills match (40% weight)
    if (jobAnalysis.skills && jobAnalysis.skills.length > 0) {
      const skillsMatch = this.calculateSkillsMatch(tailoredCV.skills, jobAnalysis.skills);
      totalScore += skillsMatch * 0.4;
      maxScore += 40;
    }
    
    // Experience relevance (30% weight)
    if (tailoredCV.experience && tailoredCV.experience.length > 0) {
      const experienceMatch = this.calculateExperienceMatch(tailoredCV.experience, jobAnalysis);
      totalScore += experienceMatch * 0.3;
      maxScore += 30;
    }
    
    // Keywords match (20% weight)
    if (jobAnalysis.keywords && jobAnalysis.keywords.length > 0) {
      const keywordMatch = this.calculateKeywordMatch(tailoredCV, jobAnalysis.keywords);
      totalScore += keywordMatch * 0.2;
      maxScore += 20;
    }
    
    // Education match (10% weight)
    if (tailoredCV.education && tailoredCV.education.length > 0) {
      const educationMatch = this.calculateEducationMatch(tailoredCV.education, jobAnalysis);
      totalScore += educationMatch * 0.1;
      maxScore += 10;
    }
    
    return maxScore > 0 ? Math.round(totalScore) : 0;
  }

  /**
   * Calculate skills match
   */
  calculateSkillsMatch(cvSkills, jobSkills) {
    if (!cvSkills || !jobSkills || jobSkills.length === 0) return 0;
    
    const allCvSkills = [];
    
    // Extract all skills from CV
    Object.values(cvSkills).forEach(skillCategory => {
      if (Array.isArray(skillCategory)) {
        allCvSkills.push(...skillCategory);
      }
    });
    
    // Count matches
    const matches = jobSkills.filter(jobSkill => 
      allCvSkills.some(cvSkill => 
        cvSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(cvSkill.toLowerCase())
      )
    ).length;
    
    return (matches / jobSkills.length) * 100;
  }

  /**
   * Calculate experience match
   */
  calculateExperienceMatch(cvExperience, jobAnalysis) {
    if (!cvExperience || cvExperience.length === 0) return 0;
    
    let totalRelevance = 0;
    
    cvExperience.forEach(exp => {
      if (exp._jobAlignment) {
        totalRelevance += exp._jobAlignment.alignmentScore;
      }
    });
    
    return totalRelevance / cvExperience.length;
  }

  /**
   * Calculate keyword match
   */
  calculateKeywordMatch(cv, jobKeywords) {
    if (!jobKeywords || jobKeywords.length === 0) return 0;
    
    const cvText = JSON.stringify(cv).toLowerCase();
    const matches = jobKeywords.filter(keyword => 
      cvText.includes(keyword.toLowerCase())
    ).length;
    
    return (matches / jobKeywords.length) * 100;
  }

  /**
   * Calculate education match
   */
  calculateEducationMatch(cvEducation, jobAnalysis) {
    if (!cvEducation || cvEducation.length === 0) return 0;
    
    // Simple education match - can be enhanced
    return 70; // Default moderate match
  }

  /**
   * Generate job-specific optimizations
   */
  generateJobOptimizations(tailoredCV, jobAnalysis) {
    const optimizations = [];
    
    if (!jobAnalysis) return optimizations;
    
    // Skills optimizations
    if (jobAnalysis.skills && jobAnalysis.skills.length > 0) {
      optimizations.push({
        type: 'skills',
        recommendation: `Highlight experience with ${jobAnalysis.skills.slice(0, 3).join(', ')}`,
        priority: 'high'
      });
    }
    
    // Experience optimizations
    if (jobAnalysis.responsibilities && jobAnalysis.responsibilities.length > 0) {
      optimizations.push({
        type: 'experience',
        recommendation: `Emphasize accomplishments related to ${jobAnalysis.responsibilities[0]}`,
        priority: 'medium'
      });
    }
    
    // Keywords optimizations
    if (jobAnalysis.keywords && jobAnalysis.keywords.length > 0) {
      optimizations.push({
        type: 'keywords',
        recommendation: `Incorporate key terms: ${jobAnalysis.keywords.slice(0, 5).join(', ')}`,
        priority: 'medium'
      });
    }
    
    return optimizations;
  }

  /**
   * Generate ATS optimization
   */
  generateATSOptimization(tailoredCV, jobAnalysis) {
    const optimization = {
      score: this.calculateATSScore(tailoredCV),
      recommendations: []
    };
    
    // Check structure
    if (!tailoredCV.personalInfo || !tailoredCV.personalInfo.name) {
      optimization.recommendations.push('Ensure complete contact information');
    }
    
    if (!tailoredCV.experience || tailoredCV.experience.length === 0) {
      optimization.recommendations.push('Add work experience section');
    }
    
    if (!tailoredCV.skills || Object.keys(tailoredCV.skills).length === 0) {
      optimization.recommendations.push('Add comprehensive skills section');
    }
    
    // Check keywords
    if (jobAnalysis && jobAnalysis.keywords) {
      const cvText = JSON.stringify(tailoredCV).toLowerCase();
      const missingKeywords = jobAnalysis.keywords.filter(keyword => 
        !cvText.includes(keyword.toLowerCase())
      );
      
      if (missingKeywords.length > 0) {
        optimization.recommendations.push(`Consider adding keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
      }
    }
    
    return optimization;
  }

  /**
   * Calculate ATS score
   */
  calculateATSScore(cv) {
    let score = 0;
    
    // Check structure
    if (cv.personalInfo && cv.personalInfo.name) score += 20;
    if (cv.experience && cv.experience.length > 0) score += 30;
    if (cv.skills && Object.keys(cv.skills).length > 0) score += 25;
    if (cv.education && cv.education.length > 0) score += 15;
    if (cv.summary) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Perform keyword analysis
   */
  performKeywordAnalysis(tailoredCV, jobAnalysis) {
    if (!jobAnalysis || !jobAnalysis.keywords) {
      return { totalKeywords: 0, matchedKeywords: 0, matchRate: 0 };
    }
    
    const cvText = JSON.stringify(tailoredCV).toLowerCase();
    const matchedKeywords = jobAnalysis.keywords.filter(keyword => 
      cvText.includes(keyword.toLowerCase())
    );
    
    return {
      totalKeywords: jobAnalysis.keywords.length,
      matchedKeywords: matchedKeywords.length,
      matchRate: (matchedKeywords.length / jobAnalysis.keywords.length) * 100,
      matchedKeywordsList: matchedKeywords,
      missingKeywords: jobAnalysis.keywords.filter(keyword => 
        !cvText.includes(keyword.toLowerCase())
      )
    };
  }

  /**
   * Validate tailoring authenticity
   */
  async validateTailoringAuthenticity(originalCV, tailoredCV) {
    // Basic authenticity checks
    const validation = {
      authentic: true,
      violations: [],
      warnings: []
    };
    
    // Check personal info preservation
    if (originalCV.personalInfo && tailoredCV.personalInfo) {
      if (originalCV.personalInfo.name !== tailoredCV.personalInfo.name) {
        validation.violations.push('Name should not be changed');
        validation.authentic = false;
      }
      
      if (originalCV.personalInfo.email !== tailoredCV.personalInfo.email) {
        validation.violations.push('Email should not be changed');
        validation.authentic = false;
      }
    }
    
    // Check experience integrity
    if (originalCV.experience && tailoredCV.experience) {
      if (tailoredCV.experience.length > originalCV.experience.length + 1) {
        validation.warnings.push('Experience entries significantly increased');
      }
    }
    
    // Add validation metadata
    tailoredCV._validationMetadata = {
      validated: true,
      authentic: validation.authentic,
      violations: validation.violations,
      warnings: validation.warnings,
      validatedAt: new Date().toISOString()
    };
    
    return tailoredCV;
  }

  /**
   * Cache tailored CV
   */
  cacheTailoredCV(tailoredCV) {
    const cacheKey = `${tailoredCV.personalInfo?.name || 'unknown'}_${tailoredCV.tailoringMetadata?.jobTitle || 'unknown'}_${Date.now()}`;
    
    this.tailoringCache.set(cacheKey, {
      tailoredCV,
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
    
    for (const [key, value] of this.tailoringCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.tailoringCache.delete(key);
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
        cacheSize: this.tailoringCache.size,
        cacheTimeout: this.cacheTimeout
      },
      capabilities: [
        'CV tailoring',
        'Job alignment',
        'Match score calculation',
        'ATS optimization',
        'Keyword analysis',
        'Authenticity validation',
        'Puter integration'
      ],
      dependencies: {
        authEngine: this.authEngine.getStatus(),
        requestEngine: this.requestEngine.getStatus(),
        jobAnalysisEngine: this.jobAnalysisEngine.getStatus()
      }
    };
  }

  /**
   * Clear tailoring cache
   */
  clearCache() {
    this.tailoringCache.clear();
    console.log('🧹 Puter CV tailoring cache cleared');
  }
}

module.exports = PuterCVTailoringEngine;
