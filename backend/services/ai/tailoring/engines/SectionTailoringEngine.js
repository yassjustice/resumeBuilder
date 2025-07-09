/**
 * Section Tailoring Engine
 * Handles tailoring of individual CV sections (title, summary, skills, etc.)
 * Processes sections in parallel for optimal performance
 */

class SectionTailoringEngine {
  constructor(aiService) {
    this.aiService = aiService;
    this.name = 'Section Tailoring Engine';
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
   * Parse AI response and clean JSON
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
      throw error;
    }
  }

  /**
   * Tailor all CV sections with performance optimization
   * @param {Object} normalizedCV - Normalized CV data
   * @param {Object} jobAnalysis - Job analysis results
   * @param {string} targetLanguage - Target language
   * @returns {Promise<Object>} - Tailored sections
   */
  async tailorAllSections(normalizedCV, jobAnalysis, targetLanguage) {
    const sections = {};

    // FIRST: Preserve personal info (name, contact details) - no AI call needed
    sections.personalInfo = this.preservePersonalInfo(normalizedCV, targetLanguage);
    
    console.log('🚀 Starting parallel AI processing for CV sections...');
    
    // Process sections in parallel to reduce total time
    const promises = [];
    
    // Title tailoring
    promises.push(
      this.tailorTitle(normalizedCV, jobAnalysis, targetLanguage)
        .then(result => ({ type: 'title', result }))
        .catch(error => ({ type: 'title', result: normalizedCV.personalInfo?.title || '', error }))
    );
    
    // Summary tailoring
    if (normalizedCV.summary) {
      promises.push(
        this.tailorSummary(normalizedCV.summary, jobAnalysis, targetLanguage)
          .then(result => ({ type: 'summary', result }))
          .catch(error => ({ type: 'summary', result: normalizedCV.summary, error }))
      );
    }
    
    // Skills tailoring - less critical, can be done quickly
    if (normalizedCV.skills) {
      promises.push(
        this.tailorSkills(normalizedCV.skills, jobAnalysis, targetLanguage)
          .then(result => ({ type: 'skills', result }))
          .catch(error => ({ type: 'skills', result: normalizedCV.skills, error }))
      );
    }
    
    // Wait for the quick parallel tasks
    console.log('⏱️ Processing title, summary, and skills in parallel...');
    const quickResults = await Promise.allSettled(promises);
    
    // Process results
    quickResults.forEach(({ value }) => {
      if (value && !value.error) {
        sections[value.type] = value.result;
      } else if (value && value.error) {
        console.warn(`⚠️ ${value.type} tailoring failed, using original:`, value.error.message);
        sections[value.type] = value.result;
      }
    });
    
    // Handle other sections with minimal processing to save time
    sections.projects = this.processProjects(normalizedCV.projects, jobAnalysis);
    sections.education = await this.tailorEducation(normalizedCV.education, jobAnalysis, targetLanguage);
    sections.certifications = await this.tailorCertifications(normalizedCV.certifications, jobAnalysis, targetLanguage);
    sections.languages = await this.tailorLanguages(normalizedCV.languages, targetLanguage);

    console.log('✅ All sections processed');
    return sections;
  }

  /**
   * Preserve personal information (name, contact details)
   * This ensures the user's real name and contact info are always maintained
   */
  preservePersonalInfo(normalizedCV, targetLanguage) {
    console.log('🔍 Preserving personal information...');
    
    const personalInfo = normalizedCV.personalInfo || {};
    
    console.log(`📝 Preserved name: "${personalInfo.name}"`);
    
    return {
      name: personalInfo.name,
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      title: personalInfo.title, // Will be updated by tailorTitle
      email: personalInfo.email,
      phone: personalInfo.phone,
      location: personalInfo.location,
      linkedin: personalInfo.linkedin,
      github: personalInfo.github,
      website: personalInfo.website,
      address: personalInfo.address
    };
  }

  /**
   * Tailor CV title/objective
   */
  async tailorTitle(normalizedCV, jobAnalysis, targetLanguage) {
    const originalTitle = normalizedCV.personalInfo?.title || 'Professional';
    
    // Language-specific instructions
    const languageInstructions = this.getLanguageInstructions(targetLanguage);
    
    const prompt = `AUTHENTIC TITLE REFINEMENT: Enhance the title while staying 100% truthful to experience level.

${languageInstructions}

ORIGINAL TITLE: ${originalTitle}
TARGET JOB: ${jobAnalysis.jobTitle}
REQUIRED SKILLS: ${jobAnalysis.requiredSkills?.slice(0, 3).join(', ') || 'relevant skills'}

AUTHENTICITY RULES:
- NEVER add seniority levels not in original (no "Senior" if they weren't senior)
- NEVER inflate experience or expertise beyond what's authentic
- Only adjust technical focus/specialization if genuinely applicable
- Keep the same professional level as original
- NO fabricated titles or false credentials

ACCEPTABLE CHANGES:
✅ "Web Developer" → "React Developer" (if they use React)
✅ "Software Developer" → "Frontend Developer" (if that's their focus)
✅ "Developer" → "Full Stack Developer" (if they do both frontend/backend)

FORBIDDEN CHANGES:
❌ "Developer" → "Senior Developer" (adding false seniority)
❌ "Junior Developer" → "Developer" (removing honesty about level)
❌ Any title inflation or false expertise claims

Return ONLY the refined title in ${targetLanguage} language, no quotes or extra text:`;

    try {
      const tailoredTitle = await this.generateContentWithTimeout(prompt, 15000);
      const result = tailoredTitle.trim().replace(/['"]/g, ''); // Remove quotes
      console.log(`✅ Title tailored: "${originalTitle}" → "${result}"`);
      return result;
    } catch (error) {
      console.warn('⚠️ Title tailoring failed, using enhanced original:', error.message);
      // Enhanced fallback based on job analysis
      if (jobAnalysis.jobTitle) {
        return jobAnalysis.jobTitle;
      }
      return originalTitle;
    }
  }

  /**
   * Tailor CV summary with compelling relevance
   */
  async tailorSummary(originalSummary, jobAnalysis, targetLanguage) {
    if (!originalSummary || originalSummary.trim().length === 0) {
      console.log('📄 No summary to tailor');
      return originalSummary;
    }

    // Language-specific instructions
    const languageInstructions = this.getLanguageInstructions(targetLanguage);

    const prompt = `NATURAL PROFESSIONAL SUMMARY: Rewrite this summary to sound authentic and confident, not desperate.

${languageInstructions}

ORIGINAL: ${originalSummary}

TARGET ROLE: ${jobAnalysis.jobTitle}
KEY SKILLS: ${jobAnalysis.requiredSkills?.slice(0, 3).join(', ') || 'relevant skills'}

TONE REQUIREMENTS:
• Professional but human - NO corporate buzzwords
• Confident, not desperate or needy
• State qualifications matter-of-factly
• Avoid phrases like "seeking challenging role" or "leverage expertise"
• Sound like a real person wrote it
• 2-3 sentences maximum

Return natural, confident summary:`;

    try {
      const tailoredSummary = await this.generateContentWithTimeout(prompt, 25000);
      let result = tailoredSummary.trim();
      
      // Natural length guidance - warn if too long but don't truncate brutally
      if (result.length > 900) {
        console.warn(`⚠️ Summary is quite long (${result.length} chars), consider making it more naturally concise`);
      }
      
      console.log(`✅ Summary tailored successfully (${result.length} chars)`);
      return result;
    } catch (error) {
      console.warn('⚠️ Summary tailoring failed, using original:', error.message);
      return originalSummary;
    }
  }

  /**
   * Tailor skills section
   */
  async tailorSkills(originalSkills, jobAnalysis, targetLanguage) {
    if (!originalSkills) {
      console.log('🔧 No skills to tailor');
      return originalSkills;
    }

    // Language-specific instructions
    const languageInstructions = this.getLanguageInstructions(targetLanguage);

    const prompt = `SKILLS REORDERING: Prioritize skills by job relevance. Use ONLY existing skills and professional categories.

${languageInstructions}

ORIGINAL: ${JSON.stringify(originalSkills)}
JOB NEEDS: ${jobAnalysis.requiredSkills?.slice(0, 5).join(', ') || 'Relevant skills'}

RULES:
• Reorder by relevance - job-critical skills first
• Translate category names to ${targetLanguage} if needed
• Categories: "Technical", "Programming", "Frameworks", "Tools", "Languages", "Soft Skills", "Databases", "Cloud", "DevOps"
• NO new skills, NO unprofessional categories
• Return same structure, reorganized in ${targetLanguage}

JSON Response:`;

    try {
      const response = await this.generateContentWithTimeout(prompt, 20000);
      const tailoredSkills = this.parseAIResponse(response);
      
      // Validate and clean the response - VERY strict filtering
      if (tailoredSkills && typeof tailoredSkills === 'object') {
        const cleanedSkills = {};
        const forbiddenWords = ['less', 'irrelevant', 'other', 'additional', 'misc', 'general', 'basic', 'random', 'extra'];
        
        for (const [category, skills] of Object.entries(tailoredSkills)) {
          const cleanCategory = category.toLowerCase();
          
          // Check if category contains any forbidden words
          const isForbidden = forbiddenWords.some(word => cleanCategory.includes(word));
          
          if (!isForbidden && Array.isArray(skills) && skills.length > 0) {
            // Only include categories with actual content
            cleanedSkills[category] = skills;
          } else if (isForbidden) {
            console.warn(`🚫 Blocked unprofessional category: "${category}"`);
            // Move skills to "Technical" category instead
            if (Array.isArray(skills) && skills.length > 0) {
              if (!cleanedSkills['Technical']) cleanedSkills['Technical'] = [];
              cleanedSkills['Technical'].push(...skills);
            }
          }
        }
        
        console.log('✅ Skills reorganized successfully with strict validation');
        return Object.keys(cleanedSkills).length > 0 ? cleanedSkills : originalSkills;
      } else {
        throw new Error('Invalid skills structure returned');
      }
    } catch (error) {
      console.warn('⚠️ Skills tailoring failed, using original:', error.message);
      return originalSkills;
    }
  }

  /**
   * Process projects with minimal tailoring
   */
  processProjects(originalProjects, jobAnalysis) {
    if (!Array.isArray(originalProjects) || originalProjects.length === 0) {
      return [];
    }
    
    // Score projects by relevance and return top 4
    const scoredProjects = originalProjects.map(project => {
      let relevanceScore = 0;
      const projectText = `${project.name} ${project.description} ${project.technologies}`.toLowerCase();
      
      // Check for required skills
      if (jobAnalysis.requiredSkills) {
        for (const skill of jobAnalysis.requiredSkills) {
          if (projectText.includes(skill.toLowerCase())) {
            relevanceScore += 3;
          }
        }
      }
      
      // Check for keywords
      if (jobAnalysis.keywords) {
        for (const keyword of jobAnalysis.keywords) {
          if (projectText.includes(keyword.toLowerCase())) {
            relevanceScore += 1;
          }
        }
      }
      
      return { project, relevanceScore };
    });
    
    return scoredProjects
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 4)
      .map(scored => scored.project);
  }

  /**
   * Tailor education section with language-compliant translations
   */
  async tailorEducation(originalEducation, jobAnalysis, targetLanguage) {
    if (!Array.isArray(originalEducation) || originalEducation.length === 0) {
      console.log('🎓 No education to tailor');
      return [];
    }

    console.log(`🎓 Processing ${originalEducation.length} education entries for language: ${targetLanguage}...`);
    
    const processedEducation = [];
    
    for (const edu of originalEducation) {
      if (!edu || !edu.institution || !edu.degree) {
        console.warn('⚠️ Skipping invalid education entry:', edu);
        continue;
      }

      // Translate degree/education titles to target language
      const translatedDegree = await this.translateEducationTitle(edu.degree, targetLanguage);

      // Ensure proper structure with all needed fields
      const processedEdu = {
        institution: edu.institution,
        degree: translatedDegree,
        year: edu.year || '',
        period: edu.period || edu.year || '',
        startYear: edu.startYear || '',
        endYear: edu.endYear || '',
        details: edu.details || ''
      };

      processedEducation.push(processedEdu);
    }

    console.log(`✅ Education processing complete: ${processedEducation.length} entries in ${targetLanguage}`);
    return processedEducation;
  }

  /**
   * Tailor certifications section with intelligent selection
   */
  async tailorCertifications(originalCertifications, jobAnalysis, targetLanguage) {
    if (!Array.isArray(originalCertifications) || originalCertifications.length === 0) {
      console.log('📜 No certifications to tailor');
      return [];
    }

    console.log(`📜 Selecting most relevant certifications from ${originalCertifications.length} available...`);
    
    // Score certifications by relevance
    const scoredCerts = [];
    
    for (const cert of originalCertifications) {
      let relevanceScore = 0;
      const certText = `${cert.name} ${cert.issuer} ${cert.description || ''}`.toLowerCase();
      
      // High relevance: matches required skills
      if (jobAnalysis.requiredSkills) {
        for (const skill of jobAnalysis.requiredSkills) {
          if (certText.includes(skill.toLowerCase())) {
            relevanceScore += 5;
          }
        }
      }
      
      // Medium relevance: matches preferred skills
      if (jobAnalysis.preferredSkills) {
        for (const skill of jobAnalysis.preferredSkills) {
          if (certText.includes(skill.toLowerCase())) {
            relevanceScore += 3;
          }
        }
      }
      
      // Lower relevance: matches job keywords
      if (jobAnalysis.keywords) {
        for (const keyword of jobAnalysis.keywords) {
          if (certText.includes(keyword.toLowerCase())) {
            relevanceScore += 1;
          }
        }
      }
      
      // Industry relevance
      if (jobAnalysis.industry && certText.includes(jobAnalysis.industry.toLowerCase())) {
        relevanceScore += 2;
      }
      
      // Recent certifications get bonus points
      if (cert.year) {
        const currentYear = new Date().getFullYear();
        const certYear = parseInt(cert.year);
        if (certYear >= currentYear - 3) {
          relevanceScore += 1;
        }
      }
      
      scoredCerts.push({
        certification: cert,
        relevanceScore
      });
    }
    
    // Sort by relevance and select top 6 most relevant
    const selectedCerts = scoredCerts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6)
      .filter(scored => scored.relevanceScore > 0)
      .map(scored => scored.certification);
    
    // If no relevant certs found, include top 3 anyway
    if (selectedCerts.length === 0) {
      const topCerts = scoredCerts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3)
        .map(scored => scored.certification);
      
      console.log(`📜 No highly relevant certifications found, including top ${topCerts.length}`);
      return topCerts;
    }
    
    console.log(`📜 Selected ${selectedCerts.length} most relevant certifications`);
    return selectedCerts;
  }

  /**
   * Get language-specific instructions for AI prompts
   */
  getLanguageInstructions(targetLanguage) {
    const instructions = {
      'en': 'LANGUAGE: Write the response in English.',
      'fr': 'LANGUE: Écrivez la réponse en français. Utilisez un français professionnel et approprié.',
      'es': 'IDIOMA: Escribe la respuesta en español. Usa español profesional y apropiado.',
      'de': 'SPRACHE: Schreiben Sie die Antwort auf Deutsch. Verwenden Sie professionelles und angemessenes Deutsch.',
      'it': 'LINGUA: Scrivi la risposta in italiano. Usa italiano professionale e appropriato.',
      'pt': 'IDIOMA: Escreva a resposta em português. Use português profissional e apropriado.',
      'ar': 'اللغة: اكتب الإجابة باللغة العربية. استخدم اللغة العربية المهنية والمناسبة.',
      'nl': 'TAAL: Schrijf het antwoord in het Nederlands. Gebruik professioneel en gepast Nederlands.',
      'pl': 'JĘZYK: Napisz odpowiedź po polsku. Używaj profesjonalnego i odpowiedniego języka polskiego.'
    };
    
    return instructions[targetLanguage] || instructions['en'];
  }

  /**
   * Translate education titles to target language
   */
  async translateEducationTitle(degree, targetLanguage) {
    if (!degree) {
      return degree;
    }

    try {
      const languageInstructions = this.getLanguageInstructions(targetLanguage);
      
      const prompt = `EDUCATION DEGREE TRANSLATION: Translate this education degree/qualification to the target language.

${languageInstructions}

ORIGINAL DEGREE: ${degree}

RULES:
- Translate accurately while preserving the academic meaning
- Use standard academic terminology in the target language
- If it's a proper name or international certification, keep it as is
- Return ONLY the translated degree title, no extra text

Examples for English:
- "Technicien Spécialisé en Développement Informatique" → "Specialized Technician in Computer Development"
- "Baccalauréat en Physique" → "Bachelor's in Physics"
- "Licence en Sciences" → "Bachelor of Science"

Examples for French:
- "Bachelor of Science" → "Licence en Sciences"
- "Master's in Computer Science" → "Master en Informatique"
- "PhD in Engineering" → "Doctorat en Ingénierie"

Translation:`;

      const translatedDegree = await this.generateContentWithTimeout(prompt, 10000);
      const result = translatedDegree.trim().replace(/['"]/g, '');
      console.log(`🎓 Education title translated: "${degree}" → "${result}"`);
      return result;
    } catch (error) {
      console.warn('⚠️ Education title translation failed, using original:', error.message);
      return degree;
    }
  }

  /**
   * Tailor languages section with proper level translations
   */
  async tailorLanguages(originalLanguages, targetLanguage) {
    if (!Array.isArray(originalLanguages) || originalLanguages.length === 0) {
      console.log('🌐 No languages to tailor');
      return [];
    }

    console.log(`🌐 Processing ${originalLanguages.length} language entries for target: ${targetLanguage}...`);
    
    const processedLanguages = [];
    
    for (const lang of originalLanguages) {
      // Handle different language data structures
      const languageName = lang.language || lang.name;
      const languageLevel = lang.level || lang.proficiency;
      
      if (!lang || !languageName) {
        console.warn('⚠️ Skipping invalid language entry:', lang);
        continue;
      }

      // Translate both language name and level to target language
      const translatedLanguage = await this.translateLanguageName(languageName, targetLanguage);
      const translatedLevel = await this.translateLanguageLevel(languageLevel, targetLanguage);

      const processedLang = {
        language: translatedLanguage,
        level: translatedLevel,
        proficiency: translatedLevel, // Some systems use 'proficiency' instead of 'level'
        name: translatedLanguage // Some systems use 'name' instead of 'language'
      };

      processedLanguages.push(processedLang);
    }

    console.log(`✅ Languages processing complete: ${processedLanguages.length} entries in ${targetLanguage}`);
    return processedLanguages;
  }

  /**
   * Translate language proficiency levels to target language
   */
  async translateLanguageLevel(level, targetLanguage) {
    if (!level) {
      return level;
    }

    try {
      const languageInstructions = this.getLanguageInstructions(targetLanguage);
      
      const prompt = `LANGUAGE LEVEL TRANSLATION: Translate this language proficiency level to the target language.

${languageInstructions}

ORIGINAL LEVEL: ${level}

COMMON LEVELS TO TRANSLATE:
- Native/Mother tongue → Native/Langue maternelle/Nativo...
- Fluent/Advanced/Professional → Advanced/Avancé/Avanzado...
- Intermediate/Conversational → Intermediate/Intermédiaire/Intermedio...
- Beginner/Basic/Elementary → Beginner/Débutant/Principiante...
- A1, A2, B1, B2, C1, C2 (keep these as is)

RULES:
- Use standard language proficiency terminology for ${targetLanguage}
- Keep CEFR levels (A1-C2) unchanged
- Return ONLY the translated level, no extra text

Translation:`;

      const translatedLevel = await this.generateContentWithTimeout(prompt, 8000);
      const result = translatedLevel.trim().replace(/['"]/g, '');
      console.log(`🌐 Language level translated: "${level}" → "${result}"`);
      return result;
    } catch (error) {
      console.warn('⚠️ Language level translation failed, using original:', error.message);
      return level;
    }
  }

  /**
   * Translate language names to target language
   */
  async translateLanguageName(languageName, targetLanguage) {
    if (!languageName) {
      return languageName;
    }

    try {
      const languageInstructions = this.getLanguageInstructions(targetLanguage);
      
      const prompt = `LANGUAGE NAME TRANSLATION: Translate this language name to the target language.

${languageInstructions}

ORIGINAL LANGUAGE: ${languageName}

RULES:
- Translate to the standard name in the target language
- Examples: "Français" → "French" (English), "Anglais" → "English" (English), "Spanish" → "Español" (Spanish)
- Return ONLY the translated language name, no extra text

Translation:`;

      const translatedName = await this.generateContentWithTimeout(prompt, 8000);
      const result = translatedName.trim().replace(/['"]/g, '');
      console.log(`🌐 Language name translated: "${languageName}" → "${result}"`);
      return result;
    } catch (error) {
      console.warn('⚠️ Language name translation failed, using original:', error.message);
      return languageName;
    }
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
        'Parallel section processing',
        'Authentic title refinement',
        'Natural summary tailoring',
        'Skills reorganization',
        'Education processing',
        'Certification selection'
      ]
    };
  }
}

module.exports = SectionTailoringEngine;
