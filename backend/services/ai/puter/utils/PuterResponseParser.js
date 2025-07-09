/**
 * Puter Response Parser
 * Advanced parsing utility for Puter AI responses
 * Handles complex data extraction and structure normalization
 */

class PuterResponseParser {
  constructor() {
    this.name = 'Puter Response Parser';
    this.version = '1.0.0';
    this.parsers = this.initializeParsers();
    this.patterns = this.initializePatterns();
    this.parseCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    
    console.log('🔧 Puter Response Parser initialized');
  }

  /**
   * Initialize specialized parsers
   */
  initializeParsers() {
    return {
      'extract-cv': this.parseCVExtraction.bind(this),
      'enhance-cv': this.parseCVEnhancement.bind(this),
      'tailor-cv': this.parseCVTailoring.bind(this),
      'generate-cover-letter': this.parseCoverLetter.bind(this),
      'process-file': this.parseFileProcessing.bind(this),
      'analyze-job': this.parseJobAnalysis.bind(this)
    };
  }

  /**
   * Initialize parsing patterns
   */
  initializePatterns() {
    return {
      json: {
        codeBlock: /^```(?:json)?\s*([\s\S]*?)\s*```$/,
        inline: /^\s*\{[\s\S]*\}\s*$/,
        array: /^\s*\[[\s\S]*\]\s*$/
      },
      structure: {
        section: /^([A-Z][A-Z\s]*):?\s*\n([\s\S]*?)(?=\n[A-Z][A-Z\s]*:|$)/gm,
        keyValue: /^([^:]+):\s*(.+)$/gm,
        listItem: /^[-*•]\s*(.+)$/gm,
        numberedList: /^\d+\.\s*(.+)$/gm
      },
      contact: {
        email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        phone: /(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}/g,
        linkedin: /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([\w-]+)/g,
        github: /(?:github\.com\/)([\w-]+)/g,
        website: /(https?:\/\/[^\s]+)/g
      },
      skills: {
        technical: /(JavaScript|Python|Java|React|Node\.js|Angular|Vue|HTML|CSS|SQL|MongoDB|PostgreSQL|AWS|Azure|Docker|Kubernetes|Git)/gi,
        soft: /(Leadership|Communication|Problem Solving|Teamwork|Management|Analytical|Creative|Organized)/gi
      },
      dates: {
        range: /(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/g,
        single: /(\d{1,2}\/\d{4}|\d{4})/g,
        monthYear: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi
      }
    };
  }

  /**
   * Parse Puter response based on operation
   * @param {string} response - Raw Puter response
   * @param {string} operation - Operation type
   * @param {Object} options - Parsing options
   * @returns {Promise<Object>} - Parsed data
   */
  async parseResponse(response, operation, options = {}) {
    try {
      console.log(`🔧 Parsing Puter response for operation: ${operation}`);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(response, operation);
      const cached = this.parseCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        console.log('📋 Returning cached parse result');
        return cached.data;
      }
      
      // Clean response
      const cleanedResponse = this.cleanResponse(response);
      
      // Try JSON parsing first
      let parsedData = null;
      try {
        parsedData = JSON.parse(cleanedResponse);
      } catch (error) {
        // Fall back to structured parsing
        parsedData = this.parseStructuredResponse(cleanedResponse, operation);
      }
      
      // Apply operation-specific parsing
      const parser = this.parsers[operation];
      if (parser) {
        parsedData = await parser(parsedData, cleanedResponse, options);
      }
      
      // Enhance with common elements
      const enhancedData = this.enhanceWithCommonElements(parsedData, cleanedResponse);
      
      // Add parsing metadata
      const result = {
        ...enhancedData,
        _parseMetadata: {
          parser: this.name,
          version: this.version,
          operation,
          parsedAt: new Date().toISOString(),
          originalLength: response.length,
          cleanedLength: cleanedResponse.length,
          parsingMethod: parsedData ? 'json' : 'structured'
        }
      };
      
      // Cache result
      this.parseCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      console.log('✅ Response parsing completed');
      return result;
      
    } catch (error) {
      console.error('❌ Response parsing failed:', error.message);
      throw new Error(`Response parsing failed: ${error.message}`);
    }
  }

  /**
   * Clean response for parsing
   */
  cleanResponse(response) {
    let cleaned = response.trim();
    
    // Remove markdown code blocks
    const codeBlockMatch = cleaned.match(this.patterns.json.codeBlock);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1];
    }
    
    // Remove common AI response prefixes
    const prefixes = [
      'Here is the',
      'Here\'s the',
      'Based on',
      'According to',
      'The following is',
      'Here\'s a',
      'Here is a',
      'I\'ll help you',
      'Let me'
    ];
    
    prefixes.forEach(prefix => {
      if (cleaned.startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    });
    
    // Remove trailing explanations
    const trailingPatterns = [
      /\n\nThis .*$/,
      /\n\nNote:.*$/,
      /\n\nPlease.*$/,
      /\n\nLet me know.*$/
    ];
    
    trailingPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    return cleaned.trim();
  }

  /**
   * Parse structured response when JSON parsing fails
   */
  parseStructuredResponse(response, operation) {
    const structured = {};
    
    // Extract sections
    const sections = this.extractSections(response);
    Object.assign(structured, sections);
    
    // Extract key-value pairs
    const keyValuePairs = this.extractKeyValuePairs(response);
    Object.assign(structured, keyValuePairs);
    
    // Extract lists
    const lists = this.extractLists(response);
    Object.assign(structured, lists);
    
    // Extract contact information
    const contacts = this.extractContactInfo(response);
    if (Object.keys(contacts).length > 0) {
      structured.contactInfo = contacts;
    }
    
    // Extract skills
    const skills = this.extractSkills(response);
    if (Object.keys(skills).length > 0) {
      structured.skills = skills;
    }
    
    // Extract dates
    const dates = this.extractDates(response);
    if (dates.length > 0) {
      structured.dates = dates;
    }
    
    return structured;
  }

  /**
   * Extract sections from response
   */
  extractSections(response) {
    const sections = {};
    let match;
    
    // Reset regex
    this.patterns.structure.section.lastIndex = 0;
    
    while ((match = this.patterns.structure.section.exec(response)) !== null) {
      const sectionName = match[1].toLowerCase().replace(/\s+/g, '');
      const sectionContent = match[2].trim();
      
      sections[sectionName] = sectionContent;
    }
    
    return sections;
  }

  /**
   * Extract key-value pairs
   */
  extractKeyValuePairs(response) {
    const pairs = {};
    let match;
    
    // Reset regex
    this.patterns.structure.keyValue.lastIndex = 0;
    
    while ((match = this.patterns.structure.keyValue.exec(response)) !== null) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '');
      const value = match[2].trim();
      
      pairs[key] = value;
    }
    
    return pairs;
  }

  /**
   * Extract lists from response
   */
  extractLists(response) {
    const lists = {};
    
    // Extract bullet lists
    const bulletItems = [];
    let match;
    
    this.patterns.structure.listItem.lastIndex = 0;
    while ((match = this.patterns.structure.listItem.exec(response)) !== null) {
      bulletItems.push(match[1].trim());
    }
    
    if (bulletItems.length > 0) {
      lists.bulletList = bulletItems;
    }
    
    // Extract numbered lists
    const numberedItems = [];
    
    this.patterns.structure.numberedList.lastIndex = 0;
    while ((match = this.patterns.structure.numberedList.exec(response)) !== null) {
      numberedItems.push(match[1].trim());
    }
    
    if (numberedItems.length > 0) {
      lists.numberedList = numberedItems;
    }
    
    return lists;
  }

  /**
   * Extract contact information
   */
  extractContactInfo(response) {
    const contacts = {};
    
    // Extract emails
    const emails = response.match(this.patterns.contact.email);
    if (emails && emails.length > 0) {
      contacts.email = emails[0];
    }
    
    // Extract phone numbers
    const phones = response.match(this.patterns.contact.phone);
    if (phones && phones.length > 0) {
      contacts.phone = phones[0];
    }
    
    // Extract LinkedIn
    const linkedins = response.match(this.patterns.contact.linkedin);
    if (linkedins && linkedins.length > 0) {
      contacts.linkedin = `https://linkedin.com/in/${linkedins[0]}`;
    }
    
    // Extract GitHub
    const githubs = response.match(this.patterns.contact.github);
    if (githubs && githubs.length > 0) {
      contacts.github = `https://github.com/${githubs[0]}`;
    }
    
    // Extract websites
    const websites = response.match(this.patterns.contact.website);
    if (websites && websites.length > 0) {
      contacts.website = websites[0];
    }
    
    return contacts;
  }

  /**
   * Extract skills from response
   */
  extractSkills(response) {
    const skills = {};
    
    // Extract technical skills
    const technicalSkills = response.match(this.patterns.skills.technical);
    if (technicalSkills && technicalSkills.length > 0) {
      skills.technical = [...new Set(technicalSkills)]; // Remove duplicates
    }
    
    // Extract soft skills
    const softSkills = response.match(this.patterns.skills.soft);
    if (softSkills && softSkills.length > 0) {
      skills.soft = [...new Set(softSkills)]; // Remove duplicates
    }
    
    return skills;
  }

  /**
   * Extract dates from response
   */
  extractDates(response) {
    const dates = [];
    
    // Extract date ranges
    let match;
    this.patterns.dates.range.lastIndex = 0;
    while ((match = this.patterns.dates.range.exec(response)) !== null) {
      dates.push({
        type: 'range',
        start: match[1],
        end: match[2]
      });
    }
    
    // Extract single dates
    this.patterns.dates.single.lastIndex = 0;
    while ((match = this.patterns.dates.single.exec(response)) !== null) {
      dates.push({
        type: 'single',
        date: match[1]
      });
    }
    
    // Extract month-year dates
    this.patterns.dates.monthYear.lastIndex = 0;
    while ((match = this.patterns.dates.monthYear.exec(response)) !== null) {
      dates.push({
        type: 'monthYear',
        date: match[0]
      });
    }
    
    return dates;
  }

  /**
   * Parse CV extraction response
   */
  async parseCVExtraction(data, response, options) {
    const cvData = {
      personalInfo: {},
      experience: [],
      skills: {},
      education: [],
      projects: [],
      certifications: [],
      languages: [],
      summary: '',
      rawContent: response
    };
    
    // Extract personal info
    if (data.personalInfo) {
      cvData.personalInfo = data.personalInfo;
    } else {
      cvData.personalInfo = this.extractPersonalInfo(data, response);
    }
    
    // Extract experience
    if (Array.isArray(data.experience)) {
      cvData.experience = data.experience;
    } else if (data.workexperience || data.workExperience) {
      cvData.experience = Array.isArray(data.workexperience || data.workExperience) 
        ? (data.workexperience || data.workExperience) 
        : [data.workexperience || data.workExperience];
    }
    
    // Extract skills
    if (data.skills) {
      cvData.skills = typeof data.skills === 'object' ? data.skills : { general: data.skills };
    }
    
    // Extract education
    if (Array.isArray(data.education)) {
      cvData.education = data.education;
    } else if (data.education) {
      cvData.education = [data.education];
    }
    
    // Extract projects
    if (Array.isArray(data.projects)) {
      cvData.projects = data.projects;
    } else if (data.projects) {
      cvData.projects = [data.projects];
    }
    
    // Extract summary
    if (data.summary || data.profile || data.overview) {
      cvData.summary = data.summary || data.profile || data.overview;
    }
    
    return cvData;
  }

  /**
   * Extract personal info from data
   */
  extractPersonalInfo(data, response) {
    const personalInfo = {};
    
    // Extract name
    if (data.name) {
      personalInfo.name = data.name;
    } else if (data.fullName || data.fullname) {
      personalInfo.name = data.fullName || data.fullname;
    }
    
    // Extract email
    if (data.email) {
      personalInfo.email = data.email;
    } else if (data.contactInfo && data.contactInfo.email) {
      personalInfo.email = data.contactInfo.email;
    }
    
    // Extract phone
    if (data.phone) {
      personalInfo.phone = data.phone;
    } else if (data.contactInfo && data.contactInfo.phone) {
      personalInfo.phone = data.contactInfo.phone;
    }
    
    // Extract location
    if (data.location || data.address) {
      personalInfo.location = data.location || data.address;
    }
    
    // Extract social links
    if (data.linkedin) personalInfo.linkedin = data.linkedin;
    if (data.github) personalInfo.github = data.github;
    if (data.website) personalInfo.website = data.website;
    
    return personalInfo;
  }

  /**
   * Parse CV enhancement response
   */
  async parseCVEnhancement(data, response, options) {
    return {
      enhancedCV: data.enhancedCV || data.enhancedContent || data,
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      atsScore: data.atsScore || 0,
      keywordAnalysis: data.keywordAnalysis || {},
      enhancementType: options.enhancementType || 'general'
    };
  }

  /**
   * Parse CV tailoring response
   */
  async parseCVTailoring(data, response, options) {
    return {
      tailoredCV: data.tailoredCV || data.tailoredContent || data,
      jobMatch: data.jobMatch || {},
      optimizations: Array.isArray(data.optimizations) ? data.optimizations : [],
      matchScore: data.matchScore || 0,
      keywordAlignment: data.keywordAlignment || {},
      tailoringLevel: options.tailoringLevel || 'comprehensive'
    };
  }

  /**
   * Parse cover letter response
   */
  async parseCoverLetter(data, response, options) {
    return {
      content: data.content || data.coverLetter || response,
      structured: data.structured || false,
      formatted: data.formatted || false,
      wordCount: data.wordCount || this.countWords(data.content || response),
      tone: data.tone || 'professional',
      companyName: options.companyName || 'the company',
      jobTitle: options.jobTitle || 'the position'
    };
  }

  /**
   * Parse file processing response
   */
  async parseFileProcessing(data, response, options) {
    return {
      processedContent: data.processedContent || response,
      fileType: data.fileType || options.fileType || 'unknown',
      metadata: data.metadata || {},
      processingResult: data.processingResult || 'success',
      originalFileSize: options.originalFileSize || 0
    };
  }

  /**
   * Parse job analysis response
   */
  async parseJobAnalysis(data, response, options) {
    return {
      analysis: data.analysis || data.jobAnalysis || response,
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      skills: Array.isArray(data.skills) ? data.skills : [],
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      jobTitle: data.jobTitle || data.title || 'Unknown Position',
      company: data.company || data.companyName || 'Unknown Company',
      location: data.location || 'Not specified',
      keywordDensity: data.keywordDensity || {},
      difficulty: data.difficulty || 'medium'
    };
  }

  /**
   * Enhance with common elements
   */
  enhanceWithCommonElements(data, response) {
    const enhanced = { ...data };
    
    // Add text statistics
    enhanced._textStatistics = {
      characterCount: response.length,
      wordCount: this.countWords(response),
      lineCount: response.split('\n').length,
      paragraphCount: response.split('\n\n').length
    };
    
    // Add extracted elements if not already present
    if (!enhanced.contactInfo) {
      const contactInfo = this.extractContactInfo(response);
      if (Object.keys(contactInfo).length > 0) {
        enhanced.contactInfo = contactInfo;
      }
    }
    
    if (!enhanced.skills) {
      const skills = this.extractSkills(response);
      if (Object.keys(skills).length > 0) {
        enhanced.skills = skills;
      }
    }
    
    if (!enhanced.dates) {
      const dates = this.extractDates(response);
      if (dates.length > 0) {
        enhanced.dates = dates;
      }
    }
    
    return enhanced;
  }

  /**
   * Count words in text
   */
  countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Generate cache key
   */
  generateCacheKey(response, operation) {
    const hash = this.simpleHash(response);
    return `${operation}_${hash}`;
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get parser status
   */
  getStatus() {
    return {
      parser: this.name,
      version: this.version,
      status: 'active',
      metrics: {
        cacheSize: this.parseCache.size,
        cacheTimeout: this.cacheTimeout,
        supportedOperations: Object.keys(this.parsers).length
      },
      capabilities: [
        'JSON parsing',
        'Structured parsing',
        'Section extraction',
        'Key-value extraction',
        'List extraction',
        'Contact info extraction',
        'Skills extraction',
        'Date extraction',
        'Text statistics',
        'Response caching'
      ],
      supportedOperations: Object.keys(this.parsers),
      patterns: {
        jsonPatterns: Object.keys(this.patterns.json).length,
        structurePatterns: Object.keys(this.patterns.structure).length,
        contactPatterns: Object.keys(this.patterns.contact).length,
        skillPatterns: Object.keys(this.patterns.skills).length,
        datePatterns: Object.keys(this.patterns.dates).length
      }
    };
  }

  /**
   * Clear parse cache
   */
  clearCache() {
    this.parseCache.clear();
    console.log('🧹 Puter parser cache cleared');
  }
}

module.exports = PuterResponseParser;
