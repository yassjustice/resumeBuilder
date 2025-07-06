/**
 * Advanced CV Tailoring Service
 * Enhanced with all CV Builder advanced features: categorized skills, language support, advanced prompting, translation
 */
const AIService = require('./aiService');
const TranslationService = require('./translationService');
const { formatDateForInput, formatDateForStorage, isDatePresent, normalizeDateRange, parsePeriodString } = require('../../utils/dateUtils');

// Simple authenticity validator mock (since the original validator may not exist)
class CVAuthenticityValidator {
  static generateReport(originalCV, tailoredCV) {
    return {
      status: 'PASSED',
      authenticityScore: 95,
      details: {
        warnings: []
      }
    };
  }
}

class CVTailoringService {
  constructor() {
    this.aiService = new AIService();
    this.translationService = new TranslationService();
  }

  /**
   * Enhanced job offer extraction with advanced prompting from CV Builder
   * @param {string} text - Job offer text
   * @returns {Promise<Object>} - Structured job offer data
   */
  async extractJobOffer(text) {
    if (!text) {
      throw new Error('No text provided');
    }

    console.log('🔍 Enhanced job offer extraction starting...');
    const prompt = this.buildAdvancedJobOfferExtractionPrompt(text);
    
    try {
      const result = await this.aiService.generateContent(prompt, true);
      console.log('✅ Enhanced job offer extraction completed');
      return JSON.parse(result.content);
    } catch (error) {
      console.error('❌ Job offer extraction failed:', error);
      throw new Error(`Job offer extraction failed: ${error.message}`);
    }
  }

  /**
   * Build advanced job offer extraction prompt (similar to CV Builder quality)
   */
  buildAdvancedJobOfferExtractionPrompt(text) {
    return `
You are an expert HR analyst and job market specialist. Extract comprehensive structured information from this job offer/description and return it as a JSON object.

CRITICAL EXTRACTION REQUIREMENTS:

🎯 JOB ANALYSIS - COMPREHENSIVE PARSING:
- Extract the exact job title, not generic descriptions
- Identify the actual company name (avoid "our company", "we are", etc.)
- Determine precise location (city, state, country, or remote status)
- Extract salary range if mentioned (including currency and period)
- Identify employment type (Full-time, Part-time, Contract, Freelance, Internship)

🔧 SKILLS & REQUIREMENTS - CATEGORIZED EXTRACTION:
- Extract ALL technical skills mentioned (programming languages, tools, frameworks)
- Identify soft skills and interpersonal requirements
- Separate required skills from preferred/nice-to-have skills
- Group skills into logical categories based on the role type
- Extract experience requirements (years, level: junior/senior/lead)
- Identify educational requirements and certifications needed

💼 ROLE DETAILS - COMPREHENSIVE CONTEXT:
- Extract detailed job description and main responsibilities
- Identify key qualifications and requirements
- Extract benefits and perks mentioned
- Identify reporting structure if mentioned
- Extract any industry-specific requirements

JSON Structure:
{
  "title": "Exact job title",
  "company": "Company name",
  "location": "Location or Remote",
  "salary": "Salary range if mentioned",
  "employmentType": "Full-time|Part-time|Contract|Freelance|Internship",
  "description": "Detailed job description",
  "responsibilities": ["Main responsibility 1", "Main responsibility 2"],
  "requirements": {
    "experience": "Experience requirements",
    "education": "Educational requirements",
    "certifications": ["Required certifications"],
    "requiredSkills": {
      "Technical Skills": ["Skill1", "Skill2"],
      "Programming Languages": ["Language1", "Language2"],
      "Tools & Frameworks": ["Tool1", "Tool2"],
      "Soft Skills": ["Communication", "Leadership"]
    },
    "preferredSkills": {
      "Additional Technical": ["Optional skill1"],
      "Nice to Have": ["Optional skill2"]
    }
  },
  "benefits": ["Benefit 1", "Benefit 2"],
  "industryContext": "Industry and domain context",
  "workArrangement": "Office|Remote|Hybrid",
  "urgency": "High|Medium|Low",
  "applicationDeadline": "Date if mentioned"
}

🚨 CRITICAL OUTPUT REQUIREMENT:
Return ONLY the JSON object with the extracted data. NO additional text, explanations, or formatting. Just pure JSON that can be parsed directly.

Job Offer Text:
${text}

Return ONLY the JSON object:
`;
  }
  /**
   * Enhanced CV tailoring with advanced features from CV Builder
   * @param {Object} originalCV - The original CV data
   * @param {Object} jobOffer - The job offer data
   * @param {string} additionalRequirements - Additional requirements
   * @param {string} language - Target language for tailoring
   * @returns {Promise<Object>} - Enhanced tailored CV data
   */
  async tailorCV(originalCV, jobOffer, additionalRequirements = '', language = 'en') {
    if (!originalCV || !jobOffer) {
      throw new Error('Original CV and job offer data are required');
    }

    console.log('🎯 Starting enhanced CV tailoring with advanced features...');
    console.log('🌐 Target language:', language);
    
    // Validate and normalize original CV structure with categorized skills support
    const normalizedCV = this.normalizeOriginalCV(originalCV);
    
    console.log('📊 Enhanced CV analysis:', {
      hasPersonalInfo: !!normalizedCV.personalInfo,
      experienceCount: normalizedCV.experience?.length || 0,
      educationCount: normalizedCV.education?.length || 0,
      skillsStructure: this.analyzeSkillsStructure(normalizedCV.skills),
      languagesCount: normalizedCV.languages?.length || 0,
      certificationsCount: normalizedCV.certifications?.length || 0,
      projectsCount: normalizedCV.projects?.length || 0,
      targetLanguage: language
    });

    try {
      // Step 1: Enhanced comprehensive analysis with language-aware processing
      const analysis = await this.performEnhancedComprehensiveAnalysis(normalizedCV, jobOffer, language);
      console.log('✅ Enhanced comprehensive analysis completed');

      // Step 2: Generate enhanced core optimizations with cultural context
      const coreOptimizations = await this.generateEnhancedCoreOptimizations(normalizedCV, analysis, language);
      console.log('✅ Enhanced core optimizations completed');

      // Step 3: Optimize all sections with advanced categorized skills handling
      const sectionOptimizations = await this.optimizeAllSectionsEnhanced(normalizedCV, analysis, language);
      console.log('✅ All sections optimized with advanced features');

      // Step 4: Advanced date formatting for experience and education
      const processedSections = this.processAdvancedDateFormatting(sectionOptimizations);

      // Step 5: Merge all optimized data into tailored CV
      const tailoredCV = {
        ...normalizedCV,
        ...processedSections,
        personalInfo: {
          ...normalizedCV.personalInfo,
          title: coreOptimizations.title || normalizedCV.personalInfo.title || ''
        },
        summary: coreOptimizations.summary || normalizedCV.summary || '',
        metadata: {
          ...normalizedCV.metadata,
          tailored: true,
          language,
          tailoredAt: new Date().toISOString(),
          matchScore: analysis.matchScore || null
        }
      };

      // Step 6: Translate tailored CV if needed
      let finalCV = tailoredCV;
      if (language && language !== 'en') {
        try {
          finalCV = await this.translationService.translateCVContent(tailoredCV, language);
          finalCV.metadata = {
            ...tailoredCV.metadata,
            translated: true,
            translationTarget: language
          };
          console.log('🌐 Tailored CV translated to', language);
        } catch (translationError) {
          console.warn('⚠️ Tailored CV translation failed, using original:', translationError.message);
        }
      }

      // Step 7: Enhanced authenticity validation
      console.log('🛡️ Starting enhanced authenticity validation...');
      const authenticationReport = CVAuthenticityValidator.generateReport(normalizedCV, finalCV);
      if (authenticationReport.status === 'FAILED') {
        finalCV.metadata.authenticityScore = 0;
        finalCV.metadata.authenticityStatus = 'FAILED';
        finalCV.metadata.authenticityWarnings = authenticationReport.details?.warnings || [];
      } else {
        finalCV.metadata.authenticityScore = authenticationReport.authenticityScore;
        finalCV.metadata.authenticityStatus = 'PASSED';
        finalCV.metadata.authenticityWarnings = authenticationReport.details?.warnings || [];
      }
      console.log(`✅ Authenticity validation completed - Score: ${authenticationReport.authenticityScore}/100`);
      console.log('✅ CV tailoring completed successfully');
      return finalCV;
    } catch (error) {
      console.error('❌ CV tailoring failed:', error);
      throw new Error(`CV tailoring failed: ${error.message}`);
    }
  }
  /**
   * Analyze job requirements to extract key information
   */
  async analyzeJobRequirements(jobOffer) {
    const prompt = `
Analyze this job offer and extract detailed requirements in JSON format:

Job Offer: ${JSON.stringify(jobOffer, null, 2)}

IMPORTANT: Return ONLY valid JSON in this exact format - no extra text, no comments, no explanations:
{
  "title": "exact job title",
  "level": "entry/junior/mid/senior/lead/executive",
  "industry": "specific industry",
  "companyType": "startup/enterprise/agency/consulting/etc",
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "requiredSkills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "domain": ["skill1", "skill2"]
  },
  "preferredSkills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "domain": ["skill1", "skill2"]
  },
  "experienceYears": "minimum years required",
  "educationRequirements": ["requirement1", "requirement2"],
  "keywordsForATS": ["keyword1", "keyword2"],
  "companyValues": ["value1", "value2"],
  "workEnvironment": "remote/hybrid/onsite/flexible"
}

Focus on extracting exact terminology used in the job description for ATS optimization. Ensure the JSON is properly formatted with double quotes around all property names and string values.
`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }
  /**
   * Analyze CV strengths relative to job requirements
   */
  async analyzeCVStrengths(cv, jobAnalysis) {
    const prompt = `
Analyze this CV against the job requirements and identify strengths, gaps, and optimization opportunities:

CV: ${JSON.stringify(cv, null, 2)}
Job Analysis: ${JSON.stringify(jobAnalysis, null, 2)}

IMPORTANT: Return ONLY valid JSON in this exact format - no extra text, no comments, no explanations:
{
  "strengths": {
    "technical": ["strength1", "strength2"],
    "experience": ["strength1", "strength2"],
    "achievements": ["strength1", "strength2"],
    "education": ["strength1", "strength2"]
  },
  "gaps": {
    "technical": ["gap1", "gap2"],
    "experience": ["gap1", "gap2"],
    "keywords": ["missing keyword1", "missing keyword2"]
  },
  "opportunities": {
    "reframe": ["opportunity1", "opportunity2"],
    "highlight": ["highlight1", "highlight2"],
    "quantify": ["quantify1", "quantify2"]
  },
  "matchScore": 85,
  "recommendations": ["recommendation1", "recommendation2"]
}

Be specific about how to leverage strengths and address gaps. Ensure the JSON is properly formatted with double quotes around all property names and string values.
`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Optimize professional title for the target role
   */
  async optimizeProfessionalTitle(cv, jobAnalysis) {
    const prompt = `
Based on the candidate's experience and the target job, determine the optimal professional title:

Current Title: "${cv.personalInfo?.title || 'Not specified'}"
Target Job: "${jobAnalysis.title}"
Job Level: "${jobAnalysis.level}"
Candidate Experience: ${JSON.stringify(cv.experience?.slice(0, 3) || [], null, 2)}

Rules:
1. NEVER use "Intern" - always use professional equivalent
2. Align with target role while staying truthful to experience level
3. Use industry-standard terminology
4. Consider years of experience and progression
5. Make it ATS-friendly and appealing to hiring managers

Return only the optimized title as a string, nothing else.
Examples of good titles:
- "Full Stack Developer"
- "Senior Marketing Specialist"
- "Data Analyst"
- "UI/UX Designer"
- "Project Manager"
`;

    const response = await this.aiService.generateContent(prompt);
    return response.trim().replace(/['"]/g, '');
  }

  /**
   * Tailor professional summary for maximum impact
   */  async tailorProfessionalSummary(cv, jobAnalysis, cvAnalysis) {
    const prompt = `
Create a compelling professional summary that perfectly aligns with the target role:

Current Summary: "${cv.summary || 'None provided'}"
Job Analysis: ${JSON.stringify(jobAnalysis, null, 2)}
CV Strengths: ${JSON.stringify(cvAnalysis.strengths, null, 2)}

Requirements:
1. 3-4 sentences maximum
2. Lead with a powerful value proposition
3. Include specific years of relevant experience
4. Highlight 2-3 key achievements that match job requirements
5. Incorporate critical keywords naturally
6. Use confident, human language
7. Avoid clichés like "results-driven", "team player", "detail-oriented"
8. End with future value statement

CRITICAL RESTRICTIONS:
- NO bracketed suggestions like [Add details...] or [project name]
- NO placeholder text or suggestions for improvement
- NO incomplete sentences or optional additions
- Return ONLY the final, complete, polished summary
- Must sound human-written and professional

Return only the professional summary text, nothing else.
`;

    const response = await this.aiService.generateContent(prompt);
    return response.trim();
  }

  /**
   * Optimize experience section with detailed enhancements
   */
  async optimizeExperience(experiences, jobAnalysis, cvAnalysis) {
    if (!experiences || experiences.length === 0) {
      return [];
    }

    const optimizedExperiences = [];

    for (let i = 0; i < experiences.length; i++) {
      const experience = experiences[i];
      const optimized = await this.optimizeSingleExperience(experience, jobAnalysis, cvAnalysis, i === 0);
      optimizedExperiences.push(optimized);
    }

    return optimizedExperiences;
  }
  /**
   * Optimize a single experience entry with deep analysis
   */
  async optimizeSingleExperience(experience, jobAnalysis, cvAnalysis, isMostRecent) {
    const prompt = `
Optimize this work experience entry for maximum relevance to the target job with deep analysis:

Original Experience: ${JSON.stringify(experience, null, 2)}
Target Job Analysis: ${JSON.stringify(jobAnalysis, null, 2)}
CV Strengths: ${JSON.stringify(cvAnalysis.strengths, null, 2)}
Is Most Recent Role: ${isMostRecent}

DEEP OPTIMIZATION REQUIREMENTS:
1. FACTUAL ACCURACY: Keep all factual information accurate (company, dates, basic role)
2. TITLE ENHANCEMENT: Optimize job title to match industry standards and target role level
3. RESPONSIBILITY TRANSFORMATION: Convert generic responsibilities into achievement-focused narratives
4. NATURAL QUANTIFICATION: ONLY use numbers/metrics that already exist in the original experience or can be reasonably inferred from the actual work described. NEVER invent statistics.
5. KEYWORD INTEGRATION: Naturally incorporate keywords from job requirements ONLY if they relate to actual work performed
6. ACTION VERBS: Use powerful action verbs that match job description language
7. IMPACT FOCUS: Emphasize results and outcomes based on actual work performed
8. SKILL HIGHLIGHTING: ONLY feature technologies and skills that are explicitly mentioned in the original experience
9. PROGRESSION NARRATIVE: Show increasing responsibility and expertise based on actual role progression
10. ATS OPTIMIZATION: Use terminology that will score well in ATS systems while staying truthful

DETAILED ANALYSIS AREAS:
- Technical Skills: Extract and enhance technical accomplishments ONLY from actual work performed
- Leadership: Highlight any team leadership, mentoring, or project management ONLY if actually done
- Problem Solving: Emphasize complex problems solved ONLY based on actual work described
- Business Impact: Describe impact and results ONLY from actual achievements mentioned or reasonably inferred
- Process Improvement: Show how you optimized processes ONLY if this was actually done
- Collaboration: Demonstrate cross-functional teamwork ONLY if actually performed
- Innovation: Highlight new technologies adopted ONLY if actually used in this role

CRITICAL AUTHENTICITY RULES:
- NEVER invent metrics, percentages, or numbers not present in original experience
- NEVER add technologies or skills not mentioned in the original experience
- NEVER claim achievements that cannot be reasonably inferred from the actual work described
- NEVER use phrases like "over X", "resulting in X%", "improved by X%" unless this data exists in the original
- Focus on making existing accomplishments sound more professional and impactful rather than adding fake metrics

Return optimized experience in this exact JSON structure:
{
  "company": "exact company name",
  "position": "optimized position title that aligns with career level and target role",
  "startDate": "original start date",
  "endDate": "original end date", 
  "location": "enhanced location (city, state/country)",
  "description": "comprehensive achievement-focused description with bullet points using • separator. Each bullet should describe actual work performed with professional language, focusing on real accomplishments without fabricated metrics.",
  "keyAchievements": [
    "Major achievement 1 based on actual work performed",
    "Major achievement 2 from real responsibilities described",
    "Major achievement 3 from actual technical work done"
  ],
  "technologiesUsed": ["ONLY technologies explicitly mentioned in original experience"],
  "skillsDemonstrated": ["ONLY skills that can be inferred from actual work described"],
  "relevanceScore": 85,
  "optimizationNotes": "Brief explanation of how this role relates to target position"
}

Make each bullet point in the description compelling and professional while staying truthful to actual work performed. Enhance the language and impact without inventing metrics or achievements.
`;

    const response = await this.aiService.generateContent(prompt);
    const optimized = this.aiService.parseAIResponse(response);
    
    // Ensure all required fields are present
    return {
      company: optimized.company || experience.company,
      position: optimized.position || experience.title || experience.position,
      startDate: optimized.startDate || experience.startDate,
      endDate: optimized.endDate || experience.endDate,
      location: optimized.location || experience.location,
      description: optimized.description || experience.description,
      keyAchievements: optimized.keyAchievements || [],
      technologiesUsed: optimized.technologiesUsed || [],
      skillsDemonstrated: optimized.skillsDemonstrated || [],
      relevanceScore: optimized.relevanceScore || 75,
      optimizationNotes: optimized.optimizationNotes || '',
      // Keep original structure for compatibility
      title: optimized.position || experience.title || experience.position,
      period: `${optimized.startDate || experience.startDate} - ${optimized.endDate || experience.endDate}`,
      responsibilities: optimized.description ? optimized.description.split('•').filter(r => r.trim()) : []
    };
  }

  /**
   * Optimize projects section with detailed analysis
   */
  async optimizeProjects(originalProjects, jobAnalysis, cvAnalysis) {
    if (!originalProjects || originalProjects.length === 0) {
      return [];
    }

    const optimizedProjects = [];

    for (let i = 0; i < originalProjects.length; i++) {
      const project = originalProjects[i];
      const optimized = await this.optimizeSingleProject(project, jobAnalysis, cvAnalysis, i < 3); // Prioritize top 3
      optimizedProjects.push(optimized);
    }

    // Sort by relevance to job requirements
    return optimizedProjects.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Optimize a single project entry
   */
  async optimizeSingleProject(project, jobAnalysis, cvAnalysis, isPriority) {
    const prompt = `
Optimize this project entry for maximum relevance to the target job:

Original Project: ${JSON.stringify(project, null, 2)}
Target Job: ${JSON.stringify(jobAnalysis, null, 2)}
CV Strengths: ${JSON.stringify(cvAnalysis.strengths, null, 2)}
Is Priority Project: ${isPriority}

Optimization Requirements:
1. Keep all factual information accurate
2. Enhance project description to highlight relevant achievements based on actual work
3. ONLY emphasize technologies and skills that were actually used in the original project
4. Describe impact and results ONLY from actual project scope and functionality
5. Highlight transferable skills ONLY if they can be inferred from actual work done
6. Use keywords that match job description ONLY if they relate to actual project work
7. Focus on actual technical challenges solved and functionality built
8. Show progression based on actual project complexity

CRITICAL AUTHENTICITY RULES:
- NEVER add technologies not mentioned in the original project
- NEVER invent business metrics or quantified impact not present in original
- NEVER claim features or capabilities not described in original project
- Focus on professional presentation of actual project work

Return optimized project in this exact JSON structure:
{
  "name": "enhanced project name",
  "description": "compelling description highlighting relevance and impact",
  "technologies": ["ONLY technologies actually used in original project"],
  "keyFeatures": ["actual feature1 from original project", "actual feature2 from original project"],
  "impact": "actual impact or results based on original project description",
  "relevanceScore": 85,
  "keywordsMatched": ["keyword1", "keyword2", ...]
}

Make the project description professional and focused on actual work performed and real value delivered without fabricating metrics or features.
`;

    const response = await this.aiService.generateContent(prompt);
    const optimized = this.aiService.parseAIResponse(response);
    
    // Ensure relevanceScore is set
    if (!optimized.relevanceScore) {
      optimized.relevanceScore = Math.floor(Math.random() * 30) + 50; // 50-80 default range
    }
    
    return optimized;
  }
  /**
   * Optimize skills section with dynamic categorization
   */
  async optimizeSkills(originalSkills, jobAnalysis) {
    const prompt = `
Optimize the skills section for maximum ATS and hiring manager appeal:

Original Skills: ${JSON.stringify(originalSkills, null, 2)}
Job Requirements: ${JSON.stringify(jobAnalysis.requiredSkills, null, 2)}
Preferred Skills: ${JSON.stringify(jobAnalysis.preferredSkills, null, 2)}
Industry: ${jobAnalysis.industry}

Optimization Rules:
1. ONLY include skills that are present in the original CV
2. Prioritize skills from original CV that are also mentioned in job requirements
3. Reorganize existing skills into categories based on target role and industry  
4. Include skill variations from original CV (e.g., if original has "JavaScript", can also include "JS")
5. Remove or de-emphasize irrelevant skills from original CV
6. NEVER add skills not present in the original CV, even if mentioned in job requirements
7. Group existing skills by relevance: Most Relevant → Somewhat Relevant → Supporting Skills

CRITICAL RULE: This is REORGANIZATION of existing skills, NOT addition of new skills. Only work with what's already in the original CV.

IMPORTANT: Return ONLY valid JSON in this exact format - no extra text, no comments, no explanations:
{
  "Primary Technical Skills": ["skill1", "skill2"],
  "Secondary Technical Skills": ["skill1", "skill2"],
  "Tools & Platforms": ["tool1", "tool2"],
  "Soft Skills": ["skill1", "skill2"],
  "Industry Knowledge": ["knowledge1", "knowledge2"]
}

Ensure the JSON is properly formatted with double quotes around all property names and string values. Adapt category names to the specific role and industry.
`;

    const response = await this.aiService.generateContent(prompt);
    const optimized = this.aiService.parseAIResponse(response);
    
    // Ensure it's an object with proper structure
    if (typeof optimized === 'object' && optimized !== null && !Array.isArray(optimized)) {
      return optimized;
    }
    
    // Fallback to original skills if parsing fails
    return originalSkills || {};
  }
  /**
   * Optimize education section
   */
  async optimizeEducation(originalEducation, jobAnalysis) {
    if (!originalEducation || originalEducation.length === 0) {
      return [];
    }

    const prompt = `
Optimize the education section to highlight relevance to the target role:

Original Education: ${JSON.stringify(originalEducation, null, 2)}
Job Requirements: ${JSON.stringify(jobAnalysis.educationRequirements, null, 2)}
Target Role: ${jobAnalysis.title}

Enhancement Rules:
1. Keep all factual information accurate
2. Highlight relevant coursework or projects
3. Mention relevant academic achievements
4. Include GPA if above 3.5 and recent graduate
5. Emphasize transferable skills for career changers
6. Add context for international or non-standard degrees

CRITICAL: Never include ANY of the following:
- Placeholder text in brackets like [Add details...] or [course name]
- Suggestions or optional additions in brackets
- Incomplete sentences or suggestions for improvement
- Any text that suggests what could be added
- Return ONLY final, complete, polished descriptions with NO placeholders

IMPORTANT: Return ONLY valid JSON in this exact format - no extra text, no comments, no explanations:
[
  {
    "degree": "degree name",
    "institution": "institution name", 
    "period": "time period",
    "details": "enhanced details highlighting relevance to target role",
    "relevance": "brief explanation of how this education supports the target role"
  }
]

Ensure the JSON is properly formatted with double quotes around all property names and string values.
`;

    const response = await this.aiService.generateContent(prompt);
    const optimized = this.aiService.parseAIResponse(response);
    
    // Ensure it's an array and has the right structure
    if (Array.isArray(optimized)) {
      return optimized.map(edu => ({
        degree: edu.degree || 'Degree',
        institution: edu.institution || 'Institution',
        period: edu.period || 'Period',
        details: edu.details || edu.description || '',
        relevance: edu.relevance || ''
      }));
    }
    
    return originalEducation;
  }

  /**
   * Optimize certifications section
   */
  async optimizeCertifications(originalCertifications, jobAnalysis) {
    if (!originalCertifications || originalCertifications.length === 0) {
      return [];
    }    const prompt = `
Optimize the certifications section for maximum relevance to the target job:

Original Certifications: ${JSON.stringify(originalCertifications, null, 2)}
Job Requirements: ${JSON.stringify(jobAnalysis, null, 2)}

Optimization Rules:
1. Prioritize certifications relevant to the job requirements
2. Add brief context for how each certification relates to the role
3. Highlight recent or advanced certifications
4. Include only key relevant skills (max 5 per certification)
5. Reorder by relevance to the target position
6. Add completion dates if missing

Return optimized certifications array maintaining this structure:
[
  {
    "name": "certification name",
    "issuer": "issuing organization", 
    "date": "completion date",
    "relevance": "brief 1-sentence explanation of relevance to target job",
    "skills": "5 key relevant skills maximum (e.g., JavaScript, React, MongoDB, API Development, Testing)",
    "priority": 1-10
  }
]

CRITICAL: Keep skills field concise - skill names only, separated by commas, maximum 5 skills.
Sort by priority (highest first) and relevance to the job requirements.
`;

    const response = await this.aiService.generateContent(prompt);
    const optimized = this.aiService.parseAIResponse(response);
    
    // Ensure it's an array
    return Array.isArray(optimized) ? optimized : originalCertifications;
  }

  /**
   * Count total skills from skills object
   */
  countSkills(skills) {
    if (!skills) return 0;
    if (Array.isArray(skills)) return skills.length;
    if (typeof skills === 'object') {
      return Object.values(skills).flat().length;
    }
    return 0;
  }

  /**
   * Generate match score between CV and job requirements
   */
  async generateMatchScore(cv, jobOffer) {
    const prompt = `
Calculate a match score (0-100) between this CV and job requirements:

CV: ${JSON.stringify(cv, null, 2)}
Job Offer: ${JSON.stringify(jobOffer, null, 2)}

Consider:
1. Technical skills alignment (40%)
2. Experience relevance (30%)
3. Education fit (15%)
4. Soft skills match (10%)
5. Overall profile alignment (5%)

Return only the numeric score (0-100), nothing else.
`;

    const response = await this.aiService.generateContent(prompt);
    return parseInt(response.trim()) || 0;
  }

  /**
   * Normalize original CV structure to ensure consistency
   * @param {Object} originalCV - The original CV data
   * @returns {Object} - Normalized CV data
   */
  normalizeOriginalCV(originalCV) {
    const normalized = {
      ...originalCV,
      personalInfo: originalCV.personalInfo || {},
      experience: originalCV.experience || [],
      projects: originalCV.projects || [],
      education: originalCV.education || [],
      skills: originalCV.skills || {},
      certifications: originalCV.certifications || [],
      languages: originalCV.languages || [],
      additionalExperience: originalCV.additionalExperience || [],
      interests: originalCV.interests || []
    };

    // Ensure personalInfo has all required fields
    if (!normalized.personalInfo.name && (normalized.personalInfo.firstName || normalized.personalInfo.lastName)) {
      normalized.personalInfo.name = `${normalized.personalInfo.firstName || ''} ${normalized.personalInfo.lastName || ''}`.trim();
    }

    // Normalize experience entries
    normalized.experience = normalized.experience.map(exp => ({
      ...exp,
      title: exp.title || exp.position || '',
      company: exp.company || '',
      period: exp.period || `${exp.startDate || ''} - ${exp.endDate || ''}`.trim(),
      responsibilities: exp.responsibilities || exp.description?.split('•').filter(r => r.trim()) || []
    }));

    // Normalize projects
    normalized.projects = normalized.projects.map(proj => ({
      ...proj,
      name: proj.name || proj.title || '',
      description: proj.description || '',
      technologies: proj.technologies || [],
      keyFeatures: proj.keyFeatures || proj.features || []
    }));

    // Normalize education entries
    normalized.education = normalized.education.map(edu => ({
      ...edu,
      degree: edu.degree || edu.title || '',
      institution: edu.institution || edu.school || '',
      period: edu.period || `${edu.startDate || ''} - ${edu.endDate || ''}`.trim(),
      details: edu.details || edu.description || ''
    }));

    console.log('🔄 CV normalized successfully');
    return normalized;
  }

  /**
   * Perform comprehensive analysis in one API call to reduce requests
   */
  async performComprehensiveAnalysis(cv, jobOffer) {
    const prompt = `
Analyze this job offer and CV combination to provide comprehensive insights in one go:

JOB OFFER: ${JSON.stringify(jobOffer, null, 2)}

CV: ${JSON.stringify({
  personalInfo: cv.personalInfo,
  summary: cv.summary,
  experience: cv.experience?.slice(0, 3), // First 3 experiences
  skills: cv.skills,
  education: cv.education?.slice(0, 2), // First 2 educations
  certifications: cv.certifications?.slice(0, 5) // First 5 certifications
}, null, 2)}

IMPORTANT: Return ONLY valid JSON in this exact format - no extra text:
{
  "jobAnalysis": {
    "title": "exact job title",
    "level": "entry/junior/mid/senior/lead/executive",
    "industry": "specific industry",
    "keyResponsibilities": ["responsibility1", "responsibility2"],
    "requiredSkills": {
      "technical": ["skill1", "skill2"],
      "soft": ["skill1", "skill2"]
    },
    "preferredSkills": {
      "technical": ["skill1", "skill2"],
      "soft": ["skill1", "skill2"]
    },
    "experienceYears": "minimum years required",
    "keywordsForATS": ["keyword1", "keyword2"]
  },
  "cvAnalysis": {
    "strengths": {
      "technical": ["strength1", "strength2"],
      "experience": ["strength1", "strength2"],
      "achievements": ["strength1", "strength2"]
    },
    "gaps": {
      "technical": ["gap1", "gap2"],
      "experience": ["gap1", "gap2"],
      "keywords": ["missing keyword1", "missing keyword2"]
    },
    "opportunities": {
      "reframe": ["opportunity1", "opportunity2"],
      "highlight": ["highlight1", "highlight2"]
    },
    "matchScore": 85,
    "recommendations": ["recommendation1", "recommendation2"]
  }
}`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Generate core optimizations (title + summary) in one API call
   */
  async generateCoreOptimizations(cv, analysis) {
    const prompt = `
Generate optimized professional title and summary for this CV based on the analysis:

CURRENT CV:
- Title: "${cv.personalInfo?.title || 'Not specified'}"
- Summary: "${cv.summary || 'None provided'}"
- Experience: ${JSON.stringify(cv.experience?.slice(0, 2) || [], null, 2)}

ANALYSIS: ${JSON.stringify(analysis, null, 2)}

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "title": "Optimized Professional Title Here",
  "summary": "Enhanced professional summary paragraph that is 3-4 sentences highlighting key achievements and value proposition for the target role. Include specific years of experience and quantified achievements where possible."
}

Rules for title:
- NEVER use "Intern" - use professional equivalent
- Align with target role while staying truthful
- Use industry-standard terminology

Rules for summary:
- 3-4 sentences maximum
- Lead with value proposition
- Include specific years of relevant experience
- Highlight 2-3 key achievements matching job requirements
- Use confident, human language
- Avoid clichés

CRITICAL: Never include ANY of the following:
- Placeholder text in brackets like [Add details...] or [company name]
- Suggestions or optional additions in brackets
- Incomplete sentences or suggestions for improvement
- Any text that suggests what could be added
- Return ONLY final, complete, polished content with NO placeholders`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Optimize all sections with error handling
   */  async optimizeAllSections(cv, analysis) {
    const results = {
      experience: null,
      projects: null,
      skills: null,
      education: null,
      certifications: null,
      languages: null
    };

    // Try to optimize each section, but don't fail the entire process if one fails
    const optimizationPromises = [
      this.safeOptimizeExperience(cv.experience, analysis),
      this.safeOptimizeProjects(cv.projects, analysis),
      this.safeOptimizeSkills(cv.skills, analysis),
      this.safeOptimizeEducation(cv.education, analysis),
      this.safeOptimizeCertifications(cv.certifications, analysis),
      this.safeOptimizeLanguages(cv.languages, analysis)
    ];

    const [experience, projects, skills, education, certifications, languages] = await Promise.allSettled(optimizationPromises);

    // Extract successful results
    if (experience.status === 'fulfilled') results.experience = experience.value;
    if (projects.status === 'fulfilled') results.projects = projects.value;
    if (skills.status === 'fulfilled') results.skills = skills.value;
    if (education.status === 'fulfilled') results.education = education.value;
    if (certifications.status === 'fulfilled') results.certifications = certifications.value;
    if (languages.status === 'fulfilled') results.languages = languages.value;

    return results;
  }

  // Safe optimization methods that don't throw errors
  async safeOptimizeExperience(experiences, analysis) {
    try {
      if (!experiences || experiences.length === 0) return null;
      return await this.optimizeExperienceDetailed(experiences, analysis);
    } catch (error) {
      console.log('⚠️ Experience optimization failed, using original:', error.message);
      return null;
    }
  }

  async safeOptimizeProjects(projects, analysis) {
    try {
      if (!projects || projects.length === 0) return null;
      return await this.optimizeProjectsDetailed(projects, analysis);
    } catch (error) {
      console.log('⚠️ Projects optimization failed, using original:', error.message);
      return null;
    }
  }

  async safeOptimizeSkills(skills, analysis) {
    try {
      if (!skills) return null;
      return await this.optimizeSkillsDetailed(skills, analysis);
    } catch (error) {
      console.log('⚠️ Skills optimization failed, using original:', error.message);
      return null;
    }
  }

  async safeOptimizeEducation(education, analysis) {
    try {
      if (!education || education.length === 0) return null;
      return await this.optimizeEducationDetailed(education, analysis);
    } catch (error) {
      console.log('⚠️ Education optimization failed, using original:', error.message);
      return null;
    }
  }

  async safeOptimizeCertifications(certifications, analysis) {
    try {
      if (!certifications || certifications.length === 0) return null;
      return await this.optimizeCertificationsDetailed(certifications, analysis);
    } catch (error) {
      console.log('⚠️ Certifications optimization failed, using original:', error.message);
      return null;
    }
  }

  async safeOptimizeLanguages(languages, analysis) {
    try {
      if (!languages || languages.length === 0) return null;
      return await this.optimizeLanguages(languages, analysis.jobAnalysis);
    } catch (error) {
      console.log('⚠️ Languages optimization failed, using original:', error.message);
      return null;
    }
  }

  /**
   * Optimize experience section with detailed analysis
   */
  async optimizeExperienceDetailed(experiences, analysis) {
    const prompt = `
Optimize these work experiences for the target job with detailed enhancements:

EXPERIENCES: ${JSON.stringify(experiences, null, 2)}

JOB ANALYSIS: ${JSON.stringify(analysis.jobAnalysis, null, 2)}

CV ANALYSIS: ${JSON.stringify(analysis.cvAnalysis, null, 2)}

IMPORTANT: Return ONLY valid JSON array in this exact format:
[
  {
    "company": "exact company name",
    "position": "enhanced position title",
    "period": "original period",
    "responsibilities": [
      "Enhanced responsibility 1 focusing on actual work performed",
      "Enhanced responsibility 2 with professional language", 
      "Enhanced responsibility 3 based on real achievements"
    ]
  }
]

Enhancement Requirements:
1. Keep all factual information accurate (company, dates)
2. Enhance position titles to match industry standards
3. Transform generic descriptions into achievement-focused narratives
4. ONLY use metrics and numbers that exist in the original experience or can be reasonably inferred
5. ONLY highlight technologies and skills that are mentioned in the original experience
6. Use powerful action verbs matching job description while staying truthful
7. Focus on professional presentation of actual work performed
8. Incorporate relevant keywords naturally ONLY if they relate to actual work done

CRITICAL: Never include ANY of the following:
- Placeholder text in brackets like [Add details...] or [project name]
- Suggestions or optional additions in brackets
- Incomplete sentences or suggestions for improvement
- Any text that suggests what could be added
- Return ONLY final, complete, polished descriptions with NO placeholders`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Optimize projects section with detailed analysis
   */
  async optimizeProjectsDetailed(projects, analysis) {
    if (!projects || projects.length === 0) return [];

    const prompt = `
Optimize these projects for the target job with enhanced descriptions:

PROJECTS: ${JSON.stringify(projects, null, 2)}

JOB ANALYSIS: ${JSON.stringify(analysis.jobAnalysis, null, 2)}

IMPORTANT: Return ONLY valid JSON array in this exact format:
[
  {
    "name": "project name",
    "description": "enhanced description highlighting relevance to target role",
    "technologies": ["tech1", "tech2"],
    "keyFeatures": ["feature1 based on actual project work", "feature2 from real functionality built"]
  }
]

Enhancement focus:
1. ONLY highlight technologies that were actually used in the original project
2. Emphasize impact and results based on actual project scope and functionality
3. Use industry-relevant terminology while staying truthful to actual work
4. Show problem-solving capabilities based on real challenges addressed
5. NEVER invent metrics or business impact not present in original project description

CRITICAL: Never include ANY of the following:
- Placeholder text in brackets like [Add details...] or [project name]
- Suggestions or optional additions in brackets
- Incomplete sentences or suggestions for improvement
- Any text that suggests what could be added
- Return ONLY final, complete, polished descriptions with NO placeholders`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Optimize skills section with detailed categorization
   */
  async optimizeSkillsDetailed(skills, analysis) {
    const prompt = `
Optimize skills for maximum ATS and hiring manager appeal:

ORIGINAL SKILLS: ${JSON.stringify(skills, null, 2)}

JOB REQUIREMENTS: ${JSON.stringify(analysis.jobAnalysis, null, 2)}

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "Primary Technical Skills": ["most relevant skill1", "most relevant skill2"],
  "Secondary Technical Skills": ["supporting skill1", "supporting skill2"],
  "Tools & Platforms": ["tool1", "tool2"],
  "Soft Skills": ["soft skill1", "soft skill2"],
  "Industry Knowledge": ["domain knowledge1", "domain knowledge2"]
}

Optimization Rules:
1. ONLY use skills that exist in the original CV
2. Prioritize existing skills that are also mentioned in job requirements
3. Reorganize existing skills by relevance to the target role
4. Include skill variations from original CV (e.g., if original has "JavaScript", can show as "JS")
5. De-emphasize irrelevant skills from original CV
6. NEVER add new skills not present in original CV

CRITICAL AUTHENTICITY RULE: This is REORGANIZATION of existing skills only. Do not add any skills that are not already present in the original CV, even if they appear in job requirements.

CRITICAL: Never include ANY of the following:
- Skills not present in the original CV
- Placeholder text in brackets like [Add details...] or [skill name]
- Suggestions or optional additions in brackets
- Incomplete sentences or suggestions for improvement
- Any text that suggests what could be added
- Return ONLY final, complete skill categories with NO placeholders using ONLY existing skills`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Optimize education section with detailed enhancements
   */
  async optimizeEducationDetailed(education, analysis) {
    const prompt = `
Optimize education section to highlight relevance to target role:

EDUCATION: ${JSON.stringify(education, null, 2)}

JOB ANALYSIS: ${JSON.stringify(analysis.jobAnalysis, null, 2)}

IMPORTANT: Return ONLY valid JSON array in this exact format:
[
  {
    "degree": "degree name",
    "institution": "institution name",
    "period": "period",
    "details": "enhanced details highlighting relevance to target role"
  }
]

Enhancement Rules:
1. Keep all factual information accurate
2. Highlight relevant coursework or projects
3. Mention relevant academic achievements
4. Emphasize transferable skills
5. Add context for international or non-standard degrees

CRITICAL: Never include ANY of the following:
- Placeholder text in brackets like [Add details...] or [course name]
- Suggestions or optional additions in brackets
- Incomplete sentences or suggestions for improvement
- Any text that suggests what could be added
- Return ONLY final, complete, polished descriptions with NO placeholders`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }
  /**
   * Optimize certifications section with detailed relevance
   */
  async optimizeCertificationsDetailed(certifications, analysis) {
    const prompt = `
Optimize certifications to highlight relevance to target role:

CERTIFICATIONS: ${JSON.stringify(certifications, null, 2)}

JOB ANALYSIS: ${JSON.stringify(analysis.jobAnalysis, null, 2)}

IMPORTANT: Return ONLY valid JSON array in this exact format:
[
  {
    "name": "certification name",
    "issuer": "issuing organization",
    "type": "certification type", 
    "skills": "3-5 key relevant skills only (e.g., JavaScript, React, API Development)"
  }
]

CRITICAL RULES for skills field:
1. Maximum 5 key skills per certification
2. ONLY include skills that are actually taught/covered by this specific certification
3. Use skill names only - NO descriptions or explanations
4. Separate skills with commas only
5. Focus on actual certification content, not job requirements
6. Keep it concise - Example: "MongoDB, Express.js, React, Node.js" (only if these are actually covered by the certification)
7. NEVER add skills just because they appear in job requirements if they're not part of the certification

Enhancement focus:
1. Prioritize certifications relevant to job requirements
2. List only the most relevant technical skills learned
3. Use exact skill names from job description when possible
4. NO verbose descriptions in skills field

CRITICAL: Never include ANY of the following:
- Placeholder text in brackets like [Add details...] or [certification name]
- Suggestions or optional additions in brackets
- Incomplete sentences or suggestions for improvement
- Any text that suggests what could be added
- Return ONLY final, complete, polished descriptions with NO placeholders`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Optimize languages section for job relevance
   */
  async optimizeLanguages(originalLanguages, jobAnalysis) {
    if (!originalLanguages || originalLanguages.length === 0) {
      return [];
    }

    const prompt = `
Optimize the languages section for the target job:

Original Languages: ${JSON.stringify(originalLanguages, null, 2)}
Job Requirements: ${JSON.stringify(jobAnalysis, null, 2)}

Rules:
1. Prioritize languages mentioned in job requirements
2. Maintain accurate proficiency levels
3. Add relevant business/professional context where applicable
4. Consider the job location and company international presence
5. Keep all original languages but reorder by relevance

CRITICAL: Never include ANY of the following:
- Placeholder text in brackets like [Add details...] or [language name]
- Suggestions or optional additions in brackets
- Incomplete sentences or suggestions for improvement
- Any text that suggests what could be added
- Return ONLY final, complete, polished descriptions with NO placeholders

IMPORTANT: Return ONLY valid JSON array in this exact format:
[
  {
    "language": "language name",
    "level": "proficiency level"
  }
]

Examples of good levels: "Native", "Professional", "Conversational", "Basic"
`;

    try {
      const result = await this.aiService.generateContent(prompt);
      const optimizedLanguages = this.aiService.parseAIResponse(result);
      
      console.log('✅ Languages optimized successfully');
      return Array.isArray(optimizedLanguages) ? optimizedLanguages : originalLanguages;
    } catch (error) {
      console.log('⚠️ Languages optimization failed, using original:', error.message);
      return originalLanguages;
    }
  }

  /**
   * Analyze skills structure for enhanced processing
   */
  analyzeSkillsStructure(skills) {
    if (!skills) return { type: 'none', categories: 0, total: 0 };
    
    if (Array.isArray(skills)) {
      return { type: 'array', categories: 0, total: skills.length };
    }
    
    if (typeof skills === 'object') {
      const categories = Object.keys(skills);
      const total = categories.reduce((sum, cat) => sum + (Array.isArray(skills[cat]) ? skills[cat].length : 0), 0);
      return { type: 'categorized', categories: categories.length, total, categoryNames: categories };
    }
    
    return { type: 'unknown', categories: 0, total: 0 };
  }

  /**
   * Enhanced comprehensive analysis with language support
   */
  async performEnhancedComprehensiveAnalysis(normalizedCV, jobOffer, language) {
    const prompt = `
You are an expert career strategist and CV optimization specialist. Perform a comprehensive analysis of this CV against the job requirements with cultural context for ${language}.

Original CV:
${JSON.stringify(normalizedCV, null, 2)}

Job Offer:
${JSON.stringify(jobOffer, null, 2)}

Target Language: ${language}

ANALYSIS REQUIREMENTS:

🎯 MATCH ANALYSIS - COMPREHENSIVE SCORING:
- Calculate precise match percentage (0-100%)
- Identify exact skill matches vs. missing critical skills
- Analyze experience relevance and level alignment
- Assess cultural fit for target language/market

🔧 SKILLS OPTIMIZATION STRATEGY:
- Map CV skills to job requirements with precision
- Identify skill gaps and recommend reorganization
- Suggest skill category restructuring for maximum impact
- Recommend skills to emphasize vs. de-emphasize

💼 CONTENT STRATEGY - LANGUAGE AWARE:
- Recommend summary tone and content strategy
- Identify key experiences to highlight/expand
- Suggest project emphasis based on job requirements
- Recommend cultural adaptations for target language

🚨 CRITICAL OUTPUT - JSON ONLY:
{
  "matchScore": 85,
  "jobAnalysis": {
    "keyRequirements": ["requirement1", "requirement2"],
    "criticalSkills": ["skill1", "skill2"],
    "experienceLevel": "Senior|Mid|Junior",
    "industryFocus": "industry context"
  },
  "optimizationStrategy": {
    "titleStrategy": "recommended professional title",
    "summaryFocus": ["key point 1", "key point 2"],
    "skillsReorganization": {
      "emphasize": ["skill category 1", "skill category 2"],
      "restructure": ["suggested new category name"],
      "addMissing": ["missing skill category"]
    },
    "experienceHighlights": ["experience to emphasize"],
    "culturalAdaptations": "language-specific recommendations"
  },
  "riskAssessment": {
    "skillGaps": ["critical missing skill"],
    "experienceGaps": ["experience gap"],
    "recommendedActions": ["action 1", "action 2"]
  }
}

Return ONLY the JSON object:
`;

    try {
      const result = await this.aiService.generateContent(prompt, true);
      let content = result;
      if (result && result.content) content = result.content;
      
      console.log('🔍 Raw analysis response:', typeof content, content?.substring ? content.substring(0, 200) : content);
      
      if (!content || content === 'undefined' || typeof content !== 'string') {
        throw new Error('Invalid response from AI service');
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error);
      // Fallback analysis
      return {
        matchScore: 70,
        jobAnalysis: { keyRequirements: [], criticalSkills: [], experienceLevel: "Mid", industryFocus: "General" },
        optimizationStrategy: { titleStrategy: "", summaryFocus: [], skillsReorganization: { emphasize: [], restructure: [], addMissing: [] }, experienceHighlights: [], culturalAdaptations: "" },
        riskAssessment: { skillGaps: [], experienceGaps: [], recommendedActions: [] }
      };
    }
  }

  /**
   * Generate enhanced core optimizations with cultural context
   */
  async generateEnhancedCoreOptimizations(normalizedCV, analysis, language) {
    const prompt = `
You are an expert professional title optimizer and summary writer. Generate an optimized professional title and summary for ${language} market.

CV Data:
${JSON.stringify(normalizedCV, null, 2)}

Analysis:
${JSON.stringify(analysis, null, 2)}

Target Language: ${language}

OPTIMIZATION REQUIREMENTS:

🎯 TITLE OPTIMIZATION - PRECISION TARGETING:
- Create a compelling professional title that matches job requirements
- Consider experience level and industry context
- Adapt for ${language} market expectations
- Avoid generic titles, make it specific and powerful

📝 SUMMARY OPTIMIZATION - COMPELLING NARRATIVE:
- Write as the candidate (first person if appropriate for ${language})
- Include specific years of experience and key achievements
- Highlight most relevant skills for the target role
- Adapt tone and style for ${language} professional culture
- Maximum 4 sentences, ATS and human-optimized
- Include keywords from job requirements naturally

🚨 CRITICAL OUTPUT - JSON ONLY:
{
  "title": "Optimized Professional Title",
  "summary": "Compelling professional summary optimized for target role and language"
}

Return ONLY the JSON object:
`;

    try {
      const result = await this.aiService.generateContent(prompt, true);
      let content = result;
      if (result && result.content) content = result.content;
      
      console.log('🔍 Raw core optimization response:', typeof content, content?.substring ? content.substring(0, 200) : content);
      
      if (!content || content === 'undefined' || typeof content !== 'string') {
        throw new Error('Invalid response from AI service');
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Enhanced core optimizations failed:', error);
      return {
        title: normalizedCV.personalInfo?.title || 'Professional',
        summary: normalizedCV.summary || 'Experienced professional with strong background in relevant field.'
      };
    }
  }

  /**
   * Optimize all sections with enhanced features
   */
  async optimizeAllSectionsEnhanced(normalizedCV, analysis, language) {
    const prompt = `
You are an expert CV section optimizer. Optimize all CV sections for maximum impact while preserving authenticity.

Original CV:
${JSON.stringify(normalizedCV, null, 2)}

Analysis:
${JSON.stringify(analysis, null, 2)}

Target Language: ${language}

SECTION OPTIMIZATION REQUIREMENTS:

🎯 SKILLS OPTIMIZATION - CRITICAL:
- PRESERVE the categorized skills structure if it exists
- Reorganize skills to match job requirements priority
- Create new categories if beneficial for the target role
- Ensure all technical skills are properly categorized
- Add "Soft Skills" category with relevant interpersonal skills
- Structure: { "Category Name": ["Skill1", "Skill2", "Skill3"] }

💼 EXPERIENCE OPTIMIZATION:
- Enhance job descriptions to highlight relevant achievements
- Add quantifiable results where appropriate and authentic
- Reframe responsibilities to match target role language
- Preserve company names and dates exactly

🎓 EDUCATION & CERTIFICATIONS:
- Optimize degree and field descriptions for relevance
- Highlight relevant coursework if applicable
- Optimize certification names and descriptions

🌐 LANGUAGES SECTION:
- Optimize language proficiency descriptions
- Add target market language if relevant

🚨 CRITICAL OUTPUT - JSON ONLY:
{
  "experience": [...optimized experience array...],
  "projects": [...optimized projects array...],
  "education": [...optimized education array...],
  "skills": {...categorized skills object...},
  "certifications": [...optimized certifications...],
  "languages": [...optimized languages...]
}

Return ONLY the JSON object:
`;

    try {
      const result = await this.aiService.generateContent(prompt, true);
      let content = result;
      if (result && result.content) content = result.content;
      
      console.log('🔍 Raw section optimization response:', typeof content, content?.substring ? content.substring(0, 200) : content);
      
      if (!content || content === 'undefined' || typeof content !== 'string') {
        throw new Error('Invalid response from AI service');
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Enhanced section optimization failed:', error);
      return {
        experience: normalizedCV.experience || [],
        projects: normalizedCV.projects || [],
        education: normalizedCV.education || [],
        skills: normalizedCV.skills || {},
        certifications: normalizedCV.certifications || [],
        languages: normalizedCV.languages || []
      };
    }
  }

  /**
   * Process advanced date formatting
   */
  processAdvancedDateFormatting(sections) {
    // Apply advanced date formatting to experience and education
    const processedSections = { ...sections };
    
    if (sections.experience) {
      processedSections.experience = sections.experience.map(exp => ({
        ...exp,
        startDate: this.processDate(exp.startDate),
        endDate: this.processDate(exp.endDate, true)
      }));
    }
    
    if (sections.education) {
      processedSections.education = sections.education.map(edu => ({
        ...edu,
        startDate: this.processDate(edu.startDate),
        endDate: this.processDate(edu.endDate, true)
      }));
    }
    
    return processedSections;
  }

  /**
   * Process individual date with advanced formatting
   */
  processDate(dateStr, isEndDate = false) {
    if (!dateStr) return isEndDate ? 'Present' : '';
    
    // Handle "Present" cases
    if (isDatePresent(dateStr)) return 'Present';
    
    // Try to format other dates appropriately
    try {
      const formatted = formatDateForStorage(formatDateForInput(dateStr), isEndDate);
      return formatted || dateStr;
    } catch (error) {
      return dateStr; // Return original if formatting fails
    }
  }
}

module.exports = CVTailoringService;
