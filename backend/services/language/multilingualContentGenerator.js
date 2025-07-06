/**
 * Multilingual Content Generator
 * Handles CV and cover letter content generation in multiple languages
 */

const LanguageService = require('./languageService');

class MultilingualContentGenerator {
  constructor(aiService) {
    this.aiService = aiService;
    this.languageService = new LanguageService();
  }

  /**
   * Generate CV content in specified language
   */
  async generateCVContent(cvData, languageCode, targetContent = 'all') {
    if (!this.languageService.isValidLanguage(languageCode)) {
      languageCode = this.languageService.getDefaultLanguage();
    }

    const prompts = this.languageService.getContentGenerationPrompts(languageCode);
    const results = {};

    try {
      // Generate professional summary if requested
      if (targetContent === 'all' || targetContent === 'summary') {
        results.summary = await this.generateProfessionalSummary(cvData, languageCode);
      }

      // Optimize skills section if requested
      if (targetContent === 'all' || targetContent === 'skills') {
        results.skills = await this.optimizeSkillsSection(cvData.skills, languageCode);
      }

      // Enhance experience descriptions if requested
      if (targetContent === 'all' || targetContent === 'experience') {
        results.experience = await this.enhanceExperienceDescriptions(cvData.experience, languageCode);
      }

      // Optimize projects section if requested
      if (targetContent === 'all' || targetContent === 'projects') {
        results.projects = await this.optimizeProjectsSection(cvData.projects, languageCode);
      }

      return {
        success: true,
        language: languageCode,
        generatedContent: results,
        appliedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating multilingual content:', error);
      return {
        success: false,
        error: error.message,
        language: languageCode
      };
    }
  }

  /**
   * Generate professional summary in specified language
   */
  async generateProfessionalSummary(cvData, languageCode) {
    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    const prompt = `
${languageInstructions.summaryInstruction}

CV Data: ${JSON.stringify({
  personalInfo: cvData.personalInfo,
  experience: cvData.experience?.slice(0, 3) || [],
  skills: cvData.skills,
  education: cvData.education?.slice(0, 2) || []
}, null, 2)}

Requirements:
- Write in ${languageInstructions.languageName} language
- 3-4 sentences maximum
- Professional and compelling tone
- Highlight key strengths and value proposition
- Include years of experience if available
- Focus on actual achievements from the CV data
- Use proper ${languageInstructions.languageName} grammar and terminology

Return only the professional summary text in ${languageInstructions.languageName}, nothing else.
`;

    const response = await this.aiService.generateContent(prompt);
    return response.trim();
  }

  /**
   * Generate cover letter in specified language
   */
  async generateCoverLetter(cvData, jobData, languageCode, additionalRequirements = '') {
    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    const prompt = `
${languageInstructions.coverLetterInstruction}

CV Data: ${JSON.stringify(cvData, null, 2)}

Job Information: ${JSON.stringify(jobData, null, 2)}

${additionalRequirements ? `Additional Requirements: ${additionalRequirements}` : ''}

Requirements:
- Write entirely in ${languageInstructions.languageName} language
- Professional business letter format
- 3-4 paragraphs maximum
- Address the specific job requirements
- Highlight relevant experience and skills from CV
- Show enthusiasm for the role and company
- Include proper ${languageInstructions.languageName} formal language conventions
- End with appropriate call to action

Structure:
1. Opening paragraph: Introduction and position of interest
2. Body paragraph(s): Relevant experience and achievements
3. Closing paragraph: Enthusiasm and next steps

Return the complete cover letter in ${languageInstructions.languageName}.
`;

    const response = await this.aiService.generateContent(prompt);
    return response.trim();
  }

  /**
   * Optimize skills section for specified language
   */
  async optimizeSkillsSection(skills, languageCode) {
    if (!skills || Object.keys(skills).length === 0) {
      return skills;
    }

    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    const prompt = `
Optimize this skills section for ${languageInstructions.languageName} language presentation:

Original Skills: ${JSON.stringify(skills, null, 2)}

Requirements:
- Maintain all existing skills (do not add new ones)
- Organize into professional categories using ${languageInstructions.languageName} terminology
- Use proper ${languageInstructions.languageName} technical terms where appropriate
- Keep skill names in their original technical language (e.g., JavaScript, React) when they are standard technical terms
- Categorize logically for the target language and culture

Return optimized skills object with ${languageInstructions.languageName} category names:
`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Enhance experience descriptions for specified language
   */
  async enhanceExperienceDescriptions(experiences, languageCode) {
    if (!experiences || experiences.length === 0) {
      return experiences;
    }

    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    const prompt = `
Enhance these work experience descriptions in ${languageInstructions.languageName}:

Original Experiences: ${JSON.stringify(experiences, null, 2)}

Requirements:
- Rewrite descriptions in professional ${languageInstructions.languageName}
- Keep all factual information accurate
- Use action verbs appropriate for ${languageInstructions.languageName}
- Maintain professional tone suitable for ${languageInstructions.languageName} business culture
- Focus on actual accomplishments without adding fake metrics
- Use proper ${languageInstructions.languageName} grammar and business terminology

Return the enhanced experiences array with improved ${languageInstructions.languageName} descriptions:
`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Optimize projects section for specified language
   */
  async optimizeProjectsSection(projects, languageCode) {
    if (!projects || projects.length === 0) {
      return projects;
    }

    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    const prompt = `
Optimize project descriptions for ${languageInstructions.languageName} presentation:

Original Projects: ${JSON.stringify(projects, null, 2)}

Requirements:
- Rewrite descriptions in professional ${languageInstructions.languageName}
- Keep all technical details accurate
- Use ${languageInstructions.languageName} terminology for business concepts
- Maintain technical terms in their standard language when appropriate
- Focus on actual project scope and achievements
- Use proper ${languageInstructions.languageName} project presentation format

Return optimized projects array with enhanced ${languageInstructions.languageName} descriptions:
`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Get language-specific instructions for content generation
   */
  getLanguageSpecificInstructions(languageCode) {
    const instructions = {
      en: {
        languageName: 'English',
        summaryInstruction: 'Generate a professional summary in English.',
        coverLetterInstruction: 'Write a professional cover letter in English.',
        cultureNotes: 'Use direct, confident language typical of English-speaking business environments.'
      },
      fr: {
        languageName: 'French',
        summaryInstruction: 'Générez un résumé professionnel en français.',
        coverLetterInstruction: 'Rédigez une lettre de motivation professionnelle en français.',
        cultureNotes: 'Utilisez un langage formel et poli typique de l\'environnement des affaires francophone.'
      },
      ar: {
        languageName: 'Arabic',
        summaryInstruction: 'أنشئ ملخصاً مهنياً باللغة العربية.',
        coverLetterInstruction: 'اكتب خطاب تغطية مهني باللغة العربية.',
        cultureNotes: 'استخدم لغة رسمية ومهنية مناسبة لبيئة الأعمال العربية.'
      }
    };

    return instructions[languageCode] || instructions['en'];
  }

  /**
   * Tailor CV content for specific job in specified language
   */
  async tailorCVForJob(cvData, jobData, languageCode, additionalRequirements = '') {
    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    try {
      // Generate tailored summary
      const tailoredSummary = await this.generateTailoredSummary(cvData, jobData, languageCode);
      
      // Optimize skills for job relevance
      const optimizedSkills = await this.optimizeSkillsForJob(cvData.skills, jobData, languageCode);
      
      // Enhance experience relevance
      const enhancedExperience = await this.enhanceExperienceForJob(cvData.experience, jobData, languageCode);

      return {
        success: true,
        language: languageCode,
        tailoredContent: {
          summary: tailoredSummary,
          skills: optimizedSkills,
          experience: enhancedExperience
        },
        metadata: {
          tailoredFor: jobData.title || 'Job Application',
          language: languageCode,
          tailoredAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error tailoring CV content:', error);
      return {
        success: false,
        error: error.message,
        language: languageCode
      };
    }
  }

  /**
   * Generate tailored summary for specific job in specified language
   */
  async generateTailoredSummary(cvData, jobData, languageCode) {
    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    const prompt = `
Create a tailored professional summary in ${languageInstructions.languageName} for this job application:

CV Data: ${JSON.stringify({
  personalInfo: cvData.personalInfo,
  experience: cvData.experience?.slice(0, 3) || [],
  skills: cvData.skills,
  summary: cvData.summary
}, null, 2)}

Target Job: ${JSON.stringify(jobData, null, 2)}

Requirements:
- Write in ${languageInstructions.languageName} language
- 3-4 sentences maximum
- Align with job requirements while staying truthful
- Highlight most relevant experience and skills
- Use keywords from job description naturally
- Professional tone appropriate for ${languageInstructions.languageName} business culture

Return only the tailored summary in ${languageInstructions.languageName}.
`;

    const response = await this.aiService.generateContent(prompt);
    return response.trim();
  }

  /**
   * Optimize skills for job relevance in specified language
   */
  async optimizeSkillsForJob(skills, jobData, languageCode) {
    if (!skills || Object.keys(skills).length === 0) {
      return skills;
    }

    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    const prompt = `
Optimize skills organization for job relevance in ${languageInstructions.languageName}:

Original Skills: ${JSON.stringify(skills, null, 2)}
Target Job: ${JSON.stringify(jobData, null, 2)}

Requirements:
- ONLY use skills that exist in the original CV
- Reorganize by relevance to the job
- Use ${languageInstructions.languageName} category names
- Prioritize skills mentioned in job requirements
- Do not add new skills not present in original
- Maintain technical skill names in standard format

Return reorganized skills object with ${languageInstructions.languageName} categories:
`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Enhance experience descriptions for job relevance in specified language
   */
  async enhanceExperienceForJob(experiences, jobData, languageCode) {
    if (!experiences || experiences.length === 0) {
      return experiences;
    }

    const languageInstructions = this.getLanguageSpecificInstructions(languageCode);
    
    const prompt = `
Enhance experience descriptions for job relevance in ${languageInstructions.languageName}:

Original Experiences: ${JSON.stringify(experiences, null, 2)}
Target Job: ${JSON.stringify(jobData, null, 2)}

Requirements:
- Rewrite in professional ${languageInstructions.languageName}
- Keep all factual information accurate
- Highlight aspects most relevant to target job
- Use job-relevant keywords naturally
- Focus on actual achievements without fake metrics
- Maintain chronological accuracy

Return enhanced experiences with improved ${languageInstructions.languageName} descriptions:
`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }
}

module.exports = MultilingualContentGenerator;
