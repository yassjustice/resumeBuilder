/**
 * Advanced CV Tailoring Service
 * Provides sophisticated, modular CV tailoring with deep analysis and optimization
 */
const AIService = require('./aiService');

class CVTailoringService {
  constructor() {
    this.aiService = new AIService();
  }
  /**
   * Main entry point for CV tailoring
   * @param {Object} originalCV - The original CV data
   * @param {Object} jobOffer - The job offer data
   * @param {string} additionalRequirements - Additional requirements
   * @returns {Promise<Object>} - Tailored CV data
   */
  async tailorCV(originalCV, jobOffer, additionalRequirements = '') {
    if (!originalCV || !jobOffer) {
      throw new Error('Original CV and job offer data are required');
    }

    console.log('🎯 Starting advanced CV tailoring process...');
    
    // Validate and normalize original CV structure
    const normalizedCV = this.normalizeOriginalCV(originalCV);
    
    console.log('📊 Original CV structure:', {
      hasPersonalInfo: !!normalizedCV.personalInfo,
      experienceCount: normalizedCV.experience?.length || 0,
      educationCount: normalizedCV.education?.length || 0,
      skillsType: typeof normalizedCV.skills,
      skillsCount: this.countSkills(normalizedCV.skills),
      languagesCount: normalizedCV.languages?.length || 0,
      certificationsCount: normalizedCV.certifications?.length || 0,
      projectsCount: normalizedCV.projects?.length || 0    });

    try {
      // Step 1: Comprehensive analysis (combines job analysis and CV analysis in one call)
      const analysis = await this.performComprehensiveAnalysis(normalizedCV, jobOffer);
      console.log('✅ Comprehensive analysis completed');

      // Step 2: Generate core optimizations (title + summary in one call)
      const coreOptimizations = await this.generateCoreOptimizations(normalizedCV, analysis);
      console.log('✅ Core optimizations completed');

      // Step 3: Optimize all sections with error handling
      const sectionOptimizations = await this.optimizeAllSections(normalizedCV, analysis);
      console.log('✅ All sections optimized');      // Step 4: Compile final tailored CV with preserved structure
      const tailoredCV = {
        // Preserve original structure and add optimizations
        personalInfo: {
          ...normalizedCV.personalInfo,
          title: coreOptimizations.title || normalizedCV.personalInfo?.title
        },
        summary: coreOptimizations.summary || normalizedCV.summary,
        experience: sectionOptimizations.experience || normalizedCV.experience,
        projects: sectionOptimizations.projects || normalizedCV.projects,
        education: sectionOptimizations.education || normalizedCV.education,
        skills: sectionOptimizations.skills || normalizedCV.skills,
        certifications: sectionOptimizations.certifications || normalizedCV.certifications,
        languages: normalizedCV.languages || [],
        additionalExperience: normalizedCV.additionalExperience || [],
        interests: normalizedCV.interests || [],
        // Add metadata for tracking
        metadata: {
          tailoredFor: jobOffer.title || 'Job Application',
          tailoredDate: new Date().toISOString(),
          originalCVId: normalizedCV._id || null,
          matchScore: analysis.matchScore || 0,
          jobAnalysis: analysis.jobAnalysis,
          optimizationSummary: {
            titleChanged: coreOptimizations.title !== normalizedCV.personalInfo?.title,
            summaryEnhanced: !!coreOptimizations.summary,
            experienceOptimized: !!sectionOptimizations.experience,
            projectsOptimized: !!sectionOptimizations.projects,
            skillsReorganized: !!sectionOptimizations.skills,
            educationEnhanced: !!sectionOptimizations.education,
            certificationsOptimized: !!sectionOptimizations.certifications
          }
        }
      };

      console.log('🎉 CV tailoring completed successfully');
      console.log('📋 Final tailored CV structure:', {
        hasPersonalInfo: !!tailoredCV.personalInfo,
        hasSummary: !!tailoredCV.summary,
        experienceCount: tailoredCV.experience?.length || 0,
        projectsCount: tailoredCV.projects?.length || 0,
        educationCount: tailoredCV.education?.length || 0,
        skillsCategories: Object.keys(tailoredCV.skills || {}).length,
        certificationsCount: tailoredCV.certifications?.length || 0,
        hasMetadata: !!tailoredCV.metadata
      });
      
      return tailoredCV;

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
   */
  async tailorProfessionalSummary(cv, jobAnalysis, cvAnalysis) {
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
4. QUANTIFICATION: Add specific metrics, percentages, numbers wherever possible
5. KEYWORD INTEGRATION: Naturally incorporate keywords from job requirements
6. ACTION VERBS: Use powerful action verbs that match job description language
7. IMPACT FOCUS: Emphasize results, outcomes, and business impact
8. SKILL HIGHLIGHTING: Prominently feature technologies and skills mentioned in job requirements
9. PROGRESSION NARRATIVE: Show increasing responsibility and expertise
10. ATS OPTIMIZATION: Use terminology that will score well in ATS systems

DETAILED ANALYSIS AREAS:
- Technical Skills: Extract and enhance technical accomplishments
- Leadership: Highlight any team leadership, mentoring, or project management
- Problem Solving: Emphasize complex problems solved and innovative solutions
- Business Impact: Quantify revenue impact, cost savings, efficiency improvements
- Process Improvement: Show how you optimized processes or workflows
- Collaboration: Demonstrate cross-functional teamwork and communication
- Innovation: Highlight new technologies adopted or processes created

Return optimized experience in this exact JSON structure:
{
  "company": "exact company name",
  "position": "optimized position title that aligns with career level and target role",
  "startDate": "original start date",
  "endDate": "original end date", 
  "location": "enhanced location (city, state/country)",
  "description": "comprehensive achievement-focused description with bullet points using • separator. Each bullet should be a complete achievement with quantified results where possible.",
  "keyAchievements": [
    "Major achievement 1 with specific metrics",
    "Major achievement 2 showing business impact",
    "Major achievement 3 demonstrating technical expertise"
  ],
  "technologiesUsed": ["technology1", "technology2", "..."],
  "skillsDemonstrated": ["skill1", "skill2", "..."],
  "relevanceScore": 85,
  "optimizationNotes": "Brief explanation of how this role relates to target position"
}

Make each bullet point in the description compelling, specific, and achievement-focused. Use numbers, percentages, and concrete results wherever possible.
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
2. Enhance project description to highlight relevant achievements
3. Emphasize technologies and skills mentioned in job requirements
4. Quantify impact and results where possible
5. Highlight transferable skills and methodologies
6. Use keywords that match job description
7. Focus on business impact and technical challenges solved
8. Show progression in complexity or responsibility

Return optimized project in this exact JSON structure:
{
  "name": "enhanced project name",
  "description": "compelling description highlighting relevance and impact",
  "technologies": ["tech1", "tech2", ...],
  "keyFeatures": ["feature1", "feature2", ...],
  "impact": "quantified business or technical impact",
  "relevanceScore": 85,
  "keywordsMatched": ["keyword1", "keyword2", ...]
}

Make the project description achievement-focused and demonstrate clear value delivery.
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
1. Prioritize skills mentioned in job requirements
2. Create dynamic categories based on the target role and industry
3. Include skill variations (e.g., "JavaScript" and "JS")
4. Remove or de-emphasize irrelevant skills
5. Add soft skills mentioned in job requirements
6. Use exact terminology from job description
7. Group by relevance: Required → Preferred → Additional

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
    }

    const prompt = `
Optimize the certifications section for maximum relevance to the target job:

Original Certifications: ${JSON.stringify(originalCertifications, null, 2)}
Job Requirements: ${JSON.stringify(jobAnalysis, null, 2)}

Optimization Rules:
1. Prioritize certifications relevant to the job requirements
2. Add context for how each certification relates to the role
3. Highlight recent or advanced certifications
4. Include skills gained from each certification
5. Reorder by relevance to the target position
6. Add completion dates if missing
7. Enhance descriptions to show practical application

Return optimized certifications array maintaining this structure:
[
  {
    "name": "certification name",
    "issuer": "issuing organization",
    "date": "completion date",
    "relevance": "how this relates to the target job",
    "skills": "key skills gained from this certification",
    "priority": 1-10
  }
]

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
- Avoid clichés`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }

  /**
   * Optimize all sections with error handling
   */
  async optimizeAllSections(cv, analysis) {
    const results = {
      experience: null,
      projects: null,
      skills: null,
      education: null,
      certifications: null
    };

    // Try to optimize each section, but don't fail the entire process if one fails
    const optimizationPromises = [
      this.safeOptimizeExperience(cv.experience, analysis),
      this.safeOptimizeProjects(cv.projects, analysis),
      this.safeOptimizeSkills(cv.skills, analysis),
      this.safeOptimizeEducation(cv.education, analysis),
      this.safeOptimizeCertifications(cv.certifications, analysis)
    ];

    const [experience, projects, skills, education, certifications] = await Promise.allSettled(optimizationPromises);

    // Extract successful results
    if (experience.status === 'fulfilled') results.experience = experience.value;
    if (projects.status === 'fulfilled') results.projects = projects.value;
    if (skills.status === 'fulfilled') results.skills = skills.value;
    if (education.status === 'fulfilled') results.education = education.value;
    if (certifications.status === 'fulfilled') results.certifications = certifications.value;

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
      "Enhanced responsibility 1 with quantified results",
      "Enhanced responsibility 2 with relevant keywords",
      "Enhanced responsibility 3 with impact metrics"
    ]
  }
]

Enhancement Requirements:
1. Keep all factual information accurate (company, dates)
2. Enhance position titles to match industry standards
3. Transform generic descriptions into achievement-focused narratives
4. Quantify accomplishments with metrics where possible
5. Highlight technologies and skills from job requirements
6. Use powerful action verbs matching job description
7. Focus on results and impact, not just duties
8. Incorporate relevant keywords naturally`;

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
    "keyFeatures": ["feature1 with business impact", "feature2 with metrics"]
  }
]

Enhancement focus:
1. Highlight technologies matching job requirements
2. Emphasize business impact and results
3. Use industry-relevant terminology
4. Show problem-solving capabilities`;

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
1. Prioritize skills mentioned in job requirements
2. Use exact terminology from job description
3. Group by relevance: Required → Preferred → Additional
4. Include skill variations (e.g., "JavaScript" and "JS")
5. Remove or de-emphasize irrelevant skills`;

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
5. Add context for international or non-standard degrees`;

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
    "skills": "enhanced skills description with relevance to target role"
  }
]

Enhancement focus:
1. Prioritize certifications relevant to job requirements
2. Highlight transferable skills from each certification
3. Use industry-standard terminology
4. Connect certifications to job responsibilities`;

    const response = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(response);
  }
}

module.exports = CVTailoringService;
