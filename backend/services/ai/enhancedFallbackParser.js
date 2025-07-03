/**
 * Enhanced Fallback Parser - Intelligent extraction without AI
 * Uses NLP libraries and advanced text processing for robust extraction
 */
const natural = require('natural'); // For NLP processing

class EnhancedFallbackParser {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Initialize sentiment analyzer correctly
    try {
      this.sentiment = new natural.SentimentAnalyzer('English', 
        natural.PorterStemmer, ['negation']);
    } catch (error) {
      console.log('⚠️ Sentiment analyzer initialization failed, using basic tokenizer only');
      this.sentiment = null;
    }
    
    // Common job titles and skills for better extraction
    this.initializeKnowledgeBase();
  }

  /**
   * Initialize knowledge base for better extraction
   */
  initializeKnowledgeBase() {
    this.jobTitles = [
      'software engineer', 'developer', 'programmer', 'analyst', 'manager',
      'designer', 'architect', 'consultant', 'specialist', 'coordinator',
      'administrator', 'technician', 'supervisor', 'director', 'lead',
      'senior', 'junior', 'principal', 'staff', 'associate', 'intern'
    ];

    this.techSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js',
      'express', 'django', 'flask', 'spring', 'sql', 'mysql', 'postgresql',
      'mongodb', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
      'git', 'jenkins', 'ci/cd', 'devops', 'agile', 'scrum', 'html', 'css',
      'typescript', 'php', 'ruby', 'go', 'rust', 'c++', 'c#', '.net',
      'elasticsearch', 'graphql', 'rest', 'api', 'microservices'
    ];

    this.softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'analytical', 'creative', 'adaptable', 'organized', 'detail oriented',
      'time management', 'project management', 'collaboration'
    ];

    this.educationKeywords = [
      'university', 'college', 'bachelor', 'master', 'phd', 'degree',
      'diploma', 'certificate', 'education', 'graduated', 'gpa'
    ];

    this.experienceKeywords = [
      'experience', 'worked', 'employed', 'position', 'role', 'job',
      'company', 'organization', 'responsibilities', 'achievements'
    ];
  }

  /**
   * Enhanced job offer extraction with NLP
   * @param {string} text - Job offer text
   * @returns {Object} - Structured job offer data
   */
  extractJobOffer(text) {
    console.log('🔧 Using Enhanced Fallback Parser for job offer extraction');
    
    const sentences = this.splitIntoSentences(text);
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    return {
      title: this.extractJobTitleAdvanced(text, sentences, tokens),
      company: this.extractCompanyAdvanced(text, sentences),
      location: this.extractLocationAdvanced(text, sentences),
      salary: this.extractSalaryAdvanced(text),
      employmentType: this.extractEmploymentTypeAdvanced(text, tokens),
      description: this.extractDescriptionAdvanced(text, sentences),
      requirements: this.extractRequirementsAdvanced(text, sentences),
      keySkills: this.extractSkillsAdvanced(text, tokens),
      preferredQualifications: this.extractQualificationsAdvanced(text, sentences),
      benefits: this.extractBenefitsAdvanced(text, sentences)
    };
  }

  /**
   * Enhanced CV extraction with NLP
   * @param {string} text - CV text
   * @returns {Object} - Structured CV data
   */
  extractCVData(text) {
    console.log('🔧 Using Enhanced Fallback Parser for CV extraction');
    
    const sentences = this.splitIntoSentences(text);
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      personalInfo: this.extractPersonalInfoAdvanced(text, lines),
      summary: this.extractSummaryAdvanced(text, sentences),
      experience: this.extractExperienceAdvanced(text, lines, sentences),
      education: this.extractEducationAdvanced(text, lines, sentences),
      skills: this.extractSkillsStructuredAdvanced(text, tokens),
      languages: this.extractLanguagesAdvanced(text, lines),
      certifications: this.extractCertificationsAdvanced(text, lines)
    };
  }

  splitIntoSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  }

  extractJobTitleAdvanced(text, sentences, tokens) {
    // Look for job title patterns with context
    const patterns = [
      /(?:position|role|job|opening|opportunity)[:\s]+([^\n]+)/i,
      /(?:looking for|seeking)[:\s]+(?:a\s+)?([^\n]+?)(?:\s+to\s+|\s+for\s+|\.)/i,
      /title[:\s]+([^\n]+)/i,
      /we are hiring[:\s]+(?:a\s+)?([^\n]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const title = match[1].trim();
        // Validate if it looks like a job title
        if (this.isValidJobTitle(title)) {
          return title;
        }
      }
    }
    
    // Fallback: Look for common job title words
    for (const sentence of sentences) {
      for (const jobTitle of this.jobTitles) {
        if (sentence.toLowerCase().includes(jobTitle)) {
          // Extract the full title context
          const words = sentence.split(' ');
          const jobIndex = words.findIndex(word => 
            word.toLowerCase().includes(jobTitle.split(' ')[0]));
          if (jobIndex >= 0) {
            const titleWords = words.slice(Math.max(0, jobIndex - 2), jobIndex + 3);
            return titleWords.join(' ').replace(/[^\w\s]/g, '').trim();
          }
        }
      }
    }
    
    return 'Position Not Specified';
  }

  isValidJobTitle(title) {
    // Check if the extracted text looks like a job title
    if (title.length > 100) return false; // Too long
    if (title.split(' ').length > 8) return false; // Too many words
    if (/[.!?]/.test(title)) return false; // Contains sentence endings
    
    // Should contain job-related words
    const titleLower = title.toLowerCase();
    return this.jobTitles.some(jobWord => titleLower.includes(jobWord));
  }

  extractCompanyAdvanced(text, sentences) {
    // Look for company patterns with better context
    const patterns = [
      /(?:company|organization|firm)[:\s]+([^\n]+)/i,
      /(?:at|with|for)\s+([A-Z][A-Za-z\s&.-]{2,30})(?:\s+(?:is|seeks|looking|we|our))/,
      /([A-Z][A-Za-z\s&.-]{2,30})\s+(?:is\s+(?:looking|seeking)|careers|jobs|hiring)/,
      /join\s+([A-Z][A-Za-z\s&.-]{2,30})/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const company = match[1].trim();
        if (this.isValidCompanyName(company)) {
          return company;
        }
      }
    }
    
    return 'Company Not Specified';
  }

  isValidCompanyName(name) {
    if (name.length < 2 || name.length > 50) return false;
    if (name.split(' ').length > 6) return false;
    // Should start with capital letter
    return /^[A-Z]/.test(name);
  }

  extractLocationAdvanced(text, sentences) {
    // Enhanced location extraction
    const patterns = [
      /location[:\s]+([^\n]+)/gi,
      /(?:based in|located in)[:\s]+([^\n]+)/gi,
      /(?:remote|onsite|hybrid|office)[:\s]*(?:in\s+)?([^\n]+)/gi,
      /([A-Z][a-z]+,\s*[A-Z]{2,3})/g, // City, State format
      /([A-Z][a-z\s]+,\s*[A-Z][a-z\s]+)/g // City, Country format
    ];
    
    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)]; // Convert to array
      for (const match of matches) {
        if (match[1]) {
          const location = match[1].trim();
          if (this.isValidLocation(location)) {
            return location;
          }
        }
      }
    }
    
    return 'Location Not Specified';
  }

  isValidLocation(location) {
    if (location.length < 2 || location.length > 100) return false;
    // Should not contain too many special characters
    const specialCharCount = (location.match(/[^a-zA-Z0-9\s,.-]/g) || []).length;
    return specialCharCount <= 2;
  }

  extractSalaryAdvanced(text) {
    const patterns = [
      /salary[:\s]+([^\n]+)/gi,
      /compensation[:\s]+([^\n]+)/gi,
      /\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:per|\/)\s*(?:year|hour|month))?/g,
      /€[\d,]+(?:\s*-\s*€[\d,]+)?(?:\s*(?:per|\/)\s*(?:year|hour|month))?/g,
      /£[\d,]+(?:\s*-\s*£[\d,]+)?(?:\s*(?:per|\/)\s*(?:year|hour|month))?/g,
      /\b\d{2,3}[,.]?\d{3}\s*(?:-|to)\s*\d{2,3}[,.]?\d{3}\b/g
    ];
    
    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)]; // Convert to array
      for (const match of matches) {
        if (match[0]) {
          return match[0].trim();
        }
      }
    }
    
    return 'Salary Not Specified';
  }

  extractEmploymentTypeAdvanced(text, tokens) {
    const typeMapping = {
      'full-time': ['full', 'time', 'fulltime', 'ft'],
      'part-time': ['part', 'time', 'parttime', 'pt'],
      'contract': ['contract', 'contractor', 'temporary', 'temp'],
      'freelance': ['freelance', 'freelancer', 'independent'],
      'remote': ['remote', 'work from home', 'wfh'],
      'hybrid': ['hybrid', 'flexible'],
      'internship': ['intern', 'internship', 'trainee']
    };
    
    const textLower = text.toLowerCase();
    for (const [type, keywords] of Object.entries(typeMapping)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    
    return 'Not Specified';
  }

  extractSkillsAdvanced(text, tokens) {
    const foundSkills = new Set();
    const textLower = text.toLowerCase();
    
    // Extract technical skills
    for (const skill of this.techSkills) {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    }
    
    // Extract from common skill patterns
    const skillPatterns = [
      /(?:skills?|technologies?|tools?)[:\s]*([^.!?]+)/gi,
      /(?:experience with|knowledge of|proficient in)[:\s]*([^.!?]+)/gi
    ];
    
    for (const pattern of skillPatterns) {
      const matches = [...text.matchAll(pattern)]; // Convert to array
      for (const match of matches) {
        if (match[1]) {
          const skillText = match[1];
          const extractedSkills = this.parseSkillsFromText(skillText);
          extractedSkills.forEach(skill => foundSkills.add(skill));
        }
      }
    }
    
    return Array.from(foundSkills);
  }

  parseSkillsFromText(skillText) {
    const skills = [];
    const cleanText = skillText.replace(/[()]/g, '').toLowerCase();
    
    // Split by common delimiters
    const skillCandidates = cleanText.split(/[,;|&+\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 30);
    
    for (const candidate of skillCandidates) {
      // Check if it matches known skills
      for (const knownSkill of this.techSkills) {
        if (candidate.includes(knownSkill) || knownSkill.includes(candidate)) {
          skills.push(knownSkill);
          break;
        }
      }
    }
    
    return skills;
  }

  // Additional methods for other extraction functions would continue here...
  // For brevity, I'll implement the core ones and the rest follow similar patterns

  extractPersonalInfoAdvanced(text, lines) {
    return {
      firstName: this.extractFirstName(text, lines),
      lastName: this.extractLastName(text, lines),
      email: this.extractEmail(text),
      phone: this.extractPhone(text),
      location: this.extractLocationAdvanced(text, this.splitIntoSentences(text)),
      linkedin: this.extractLinkedIn(text),
      website: this.extractWebsite(text)
    };
  }

  extractFirstName(text, lines) {
    // Look for name in first few lines
    const namePatterns = [
      /^([A-Z][a-z]+)\s+[A-Z][a-z]+/m,
      /name[:\s]+([A-Z][a-z]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return '';
  }

  extractLastName(text, lines) {
    const namePatterns = [
      /^[A-Z][a-z]+\s+([A-Z][a-z]+)/m,
      /name[:\s]+[A-Z][a-z]+\s+([A-Z][a-z]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return '';
  }

  extractEmail(text) {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailPattern);
    return match ? match[0] : '';
  }

  extractPhone(text) {
    const phonePatterns = [
      /\+?[\d\s\-\(\)]{10,}/g,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
    ];
    
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return '';
  }

  extractLinkedIn(text) {
    const linkedinPattern = /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([A-Za-z0-9\-]+)/i;
    const match = text.match(linkedinPattern);
    return match ? match[0] : '';
  }

  extractWebsite(text) {
    const websitePattern = /https?:\/\/[^\s]+/g;
    const matches = text.match(websitePattern);
    if (matches) {
      // Filter out LinkedIn and email links
      const websites = matches.filter(url => 
        !url.includes('linkedin.com') && !url.includes('mailto:'));
      return websites[0] || '';
    }
    return '';
  }

  // Placeholder methods for other advanced extractions
  extractDescriptionAdvanced(text, sentences) {
    return text.substring(0, 1000);
  }

  extractRequirementsAdvanced(text, sentences) {
    return this.extractListItems(text, ['requirement', 'must have', 'essential']);
  }

  extractQualificationsAdvanced(text, sentences) {
    return this.extractListItems(text, ['preferred', 'nice to have', 'bonus']);
  }

  extractBenefitsAdvanced(text, sentences) {
    return this.extractListItems(text, ['benefit', 'offer', 'perk']);
  }

  extractSummaryAdvanced(text, sentences) {
    // Find summary section
    const summaryKeywords = ['summary', 'profile', 'objective', 'about'];
    for (const sentence of sentences) {
      for (const keyword of summaryKeywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          return sentence.substring(0, 500);
        }
      }
    }
    return text.substring(0, 200);
  }

  extractExperienceAdvanced(text, lines, sentences) {
    // This would be a complex implementation
    // For now, return a basic structure
    return [];
  }

  extractEducationAdvanced(text, lines, sentences) {
    // This would be a complex implementation
    // For now, return a basic structure
    return [];
  }

  extractSkillsStructuredAdvanced(text, tokens) {
    const skills = this.extractSkillsAdvanced(text, tokens);
    return {
      'Technical Skills': skills.filter(skill => this.techSkills.includes(skill.toLowerCase())),
      'Soft Skills': skills.filter(skill => this.softSkills.includes(skill.toLowerCase()))
    };
  }

  extractLanguagesAdvanced(text, lines) {
    const languagePatterns = [
      /(?:languages?|speak|fluent)[:\s]*([^.!?]+)/gi
    ];
    
    const languages = [];
    for (const pattern of languagePatterns) {
      const matches = [...text.matchAll(pattern)]; // Convert to array
      for (const match of matches) {
        if (match[1]) {
          // Extract individual languages
          const langText = match[1].toLowerCase();
          const commonLanguages = ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'korean', 'arabic'];
          
          for (const lang of commonLanguages) {
            if (langText.includes(lang)) {
              languages.push({
                name: lang.charAt(0).toUpperCase() + lang.slice(1),
                level: this.extractLanguageLevel(langText, lang)
              });
            }
          }
        }
      }
    }
    
    return languages;
  }

  extractLanguageLevel(text, language) {
    const levelKeywords = {
      'Native': ['native', 'mother tongue', 'first language'],
      'Advanced': ['advanced', 'fluent', 'proficient'],
      'Intermediate': ['intermediate', 'conversational'],
      'Basic': ['basic', 'beginner', 'elementary']
    };
    
    const langContext = text.substring(
      Math.max(0, text.indexOf(language) - 20),
      text.indexOf(language) + language.length + 20
    );
    
    for (const [level, keywords] of Object.entries(levelKeywords)) {
      if (keywords.some(keyword => langContext.includes(keyword))) {
        return level;
      }
    }
    
    return 'Intermediate';
  }

  extractCertificationsAdvanced(text, lines) {
    const certPatterns = [
      /(?:certification|certificate|certified)[:\s]*([^.!?]+)/gi,
      /([A-Z]{2,6})\s*(?:certification|certified)/gi
    ];
    
    const certifications = [];
    for (const pattern of certPatterns) {
      const matches = [...text.matchAll(pattern)]; // Convert to array
      for (const match of matches) {
        if (match[1]) {
          certifications.push({
            name: match[1].trim(),
            issuer: '',
            date: '',
            url: ''
          });
        }
      }
    }
    
    return certifications;
  }

  extractListItems(text, sectionKeywords) {
    const items = [];
    const lines = text.split('\n');
    
    let inSection = false;
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      
      // Check if we're entering a relevant section
      if (sectionKeywords.some(keyword => lineLower.includes(keyword))) {
        inSection = true;
        continue;
      }
      
      // Check if we're leaving the section
      if (inSection && (lineLower.includes('experience') || lineLower.includes('education') || lineLower.includes('skill'))) {
        break;
      }
      
      // Extract items from current section
      if (inSection && line.trim()) {
        const cleaned = line.trim().replace(/^[-•*]\s*/, '');
        if (cleaned.length > 5) {
          items.push(cleaned);
        }
      }
    }
    
    return items.slice(0, 10); // Limit results
  }
}

module.exports = EnhancedFallbackParser;
