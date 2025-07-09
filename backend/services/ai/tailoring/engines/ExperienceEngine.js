/**
 * Experience Engine
 * Specialized engine for complex experience processing
 * Handles experience scoring, selection, and deep tailoring
 */

const ExperienceScorer = require('../utils/ExperienceScorer');
const ExperienceValidator = require('../utils/ExperienceValidator');

class ExperienceEngine {
  constructor(aiService, dataEngine) {
    this.aiService = aiService;
    this.dataEngine = dataEngine;
    this.scorer = new ExperienceScorer();
    this.validator = new ExperienceValidator();
    this.name = 'Experience Engine';
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
   * Tailor work experience with intelligent selection and deep content tailoring
   */
  async tailorExperience(normalizedExperience, jobAnalysis, targetLanguage) {
    if (normalizedExperience.length === 0) {
      console.log('📝 No experience to tailor');
      return [];
    }

    console.log(`💼 Intelligently selecting and tailoring ${normalizedExperience.length} experience entries...`);
    console.log('📋 Experience structure:', normalizedExperience.map(exp => ({
      company: exp.company,
      title: exp.title,
      period: exp.period,
      responsibilitiesCount: exp.responsibilities?.length || 0
    })));

    // Step 1: Score and select most relevant experiences
    const scoredExperiences = await this.scorer.scoreExperienceRelevance(normalizedExperience, jobAnalysis);
    
    // Step 2: Select top 4-5 most relevant experiences
    const selectedExperiences = scoredExperiences
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    console.log(`📊 Selected ${selectedExperiences.length} most relevant experiences out of ${normalizedExperience.length}`);

    const tailoredExperience = [];

    // Step 3: Deep tailor each selected experience
    for (const scoredExp of selectedExperiences) {
      const job = scoredExp.experience;
      
      if (!job || !job.company || !job.title) {
        console.warn('⚠️ Skipping invalid experience entry:', job);
        continue;
      }

      const tailoredJob = await this.tailorSingleExperience(job, jobAnalysis, targetLanguage);
      tailoredExperience.push(tailoredJob);
    }

    console.log(`✅ Experience tailoring complete: ${tailoredExperience.length} entries processed`);
    
    // Final validation: ensure we have at least some experience
    if (tailoredExperience.length === 0 && normalizedExperience.length > 0) {
      console.warn('⚠️ No experiences were tailored successfully, returning top 3 entries');
      return normalizedExperience.slice(0, 3).map(job => this.createFallbackExperience(job));
    }
    
    return tailoredExperience;
  }

  /**
   * Tailor a single experience entry
   */
  async tailorSingleExperience(job, jobAnalysis, targetLanguage = 'en') {
    const originalResponsibilities = Array.isArray(job.responsibilities) ? 
      job.responsibilities.join('. ') : 'Professional experience in this role.';

    const prompt = this.buildExperienceTailoringPrompt(job, jobAnalysis, originalResponsibilities, targetLanguage);

    try {
      const response = await this.generateContentWithTimeout(prompt, 30000);
      console.log(`🔍 AI Response for ${job.company}:`, response.substring(0, 200) + '...');
      
      const tailoredJob = this.parseAIResponse(response);
      console.log(`🔍 Parsed response structure for ${job.company}:`, Object.keys(tailoredJob || {}));
      
      // Validate the response
      if (this.validateTailoredExperience(tailoredJob, job)) {
        // Enhanced authenticity validation
        const authenticityCheck = this.validator.validateTailoredExperience(job, tailoredJob);
        if (!authenticityCheck.valid) {
          console.warn(`⚠️ Authenticity violation detected for ${job.company}:`, authenticityCheck.violations);
          console.warn('🚫 Using original experience to maintain authenticity');
          return await this.createFallbackExperience(job, targetLanguage);
        }
        
        return await this.finalizeTailoredExperience(tailoredJob, job, targetLanguage);
      } else {
        console.warn(`⚠️ Invalid tailored response structure for ${job.company}, using original`);
        return await this.createFallbackExperience(job, targetLanguage);
      }
    } catch (error) {
      console.warn(`⚠️ Experience tailoring failed for ${job.company}, using original:`, error.message);
      return await this.createFallbackExperience(job, targetLanguage);
    }
  }

  /**
   * Build experience tailoring prompt
   */
  buildExperienceTailoringPrompt(job, jobAnalysis, originalResponsibilities, targetLanguage = 'en') {
    const languageInstruction = this.getLanguageInstruction(targetLanguage);
    
    return `CRITICAL CV TRANSLATION & ENHANCEMENT: Create complete, translated, decisive content.

${languageInstruction}

ORIGINAL: ${job.company} | ${job.title} | ${job.period || ''}
RESPONSIBILITIES: ${originalResponsibilities}

TARGET: ${jobAnalysis.jobTitle} 
RELEVANT SKILLS: ${jobAnalysis.requiredSkills?.slice(0, 3).join(', ') || 'relevant skills'}

TRANSLATION REQUIREMENTS:
• TRANSLATE ALL CONTENT including job title and responsibilities to target language
• Maintain professional terminology appropriate for the target language
• Keep company names unchanged but translate everything else
• ALL responsibilities must be in the target language, not the original language

CONTENT REQUIREMENTS:
• Write COMPLETE sentences with NO placeholders like [mention...] or [e.g., ...]
• Be specific and decisive - use actual technologies from the original content
• NO incomplete thoughts or suggestions in brackets
• Every sentence must be publication-ready
• Sound confident and definitive

NATURAL ENHANCEMENT:
• Rewrite responsibilities to naturally show relevant skills
• NO forced keyword repetition or obvious stuffing
• Show accomplishments and impact naturally
• Keywords should flow organically in context
• Use specific technologies mentioned in original content

FORBIDDEN ELEMENTS:
❌ [mention specific technologies...]
❌ [e.g., React, Vue.js, etc.]
❌ Any bracketed placeholders or suggestions
❌ Incomplete or tentative language
❌ "As a [job title]" repetition
❌ Any content in the original language (must be fully translated)

RETURN COMPLETE JSON - FULLY TRANSLATED TO ${targetLanguage.toUpperCase()}:
{
  "title": "TRANSLATE '${job.title}' TO ${targetLanguage.toUpperCase()}",
  "company": "${job.company}",
  "period": "${job.period || ''}",
  "responsibilities": [
    "TRANSLATE: Complete accomplishment in ${targetLanguage} with technologies",
    "TRANSLATE: Impact statement in ${targetLanguage} with concrete details",
    "TRANSLATE: Achievement description in ${targetLanguage} with specific skills"
  ]
}`;
  }

  /**
   * Get language-specific instructions for AI prompts
   */
  getLanguageInstruction(targetLanguage) {
    const languageMap = {
      'fr': 'IMPORTANT: Translate ALL content (job title, company descriptions, responsibilities) to professional French. Use proper French business terminology.',
      'es': 'IMPORTANT: Translate ALL content (job title, company descriptions, responsibilities) to professional Spanish. Use proper Spanish business terminology.',
      'de': 'IMPORTANT: Translate ALL content (job title, company descriptions, responsibilities) to professional German. Use proper German business terminology.',
      'it': 'IMPORTANT: Translate ALL content (job title, company descriptions, responsibilities) to professional Italian. Use proper Italian business terminology.',
      'pt': 'IMPORTANT: Translate ALL content (job title, company descriptions, responsibilities) to professional Portuguese. Use proper Portuguese business terminology.',
      'ar': 'IMPORTANT: Translate ALL content (job title, company descriptions, responsibilities) to professional Arabic. Use proper Arabic business terminology.',
      'en': 'CRITICAL: TRANSLATE ALL content to English! Job titles like "Développeur Full Stack" → "Full Stack Developer", "Technicien IT" → "IT Technician". ALL responsibilities must be in professional English, not the original language.'
    };
    
    return languageMap[targetLanguage] || languageMap['en'];
  }

  /**
   * Validate tailored experience structure
   */
  validateTailoredExperience(tailoredJob, originalJob) {
    return tailoredJob && 
           tailoredJob.company === originalJob.company && 
           tailoredJob.title && // Allow title to be different (for translation)
           Array.isArray(tailoredJob.responsibilities) &&
           tailoredJob.responsibilities.length > 0;
  }

  /**
   * Finalize tailored experience with proper formatting
   */
  async finalizeTailoredExperience(tailoredJob, originalJob, targetLanguage = 'en') {
    // Ensure responsibilities is an array
    if (!Array.isArray(tailoredJob.responsibilities)) {
      tailoredJob.responsibilities = [tailoredJob.responsibilities];
    }
    
    // Ensure responsibilities array has substantial content
    if (tailoredJob.responsibilities.length === 0 || 
        tailoredJob.responsibilities.every(r => !r || r.trim().length < 15)) {
      console.warn(`⚠️ Responsibilities too short for ${tailoredJob.company}, using quick fallback`);
      
      // Use a simpler fallback that doesn't require translation to avoid timeout
      if (targetLanguage === 'en') {
        tailoredJob.responsibilities = Array.isArray(originalJob.responsibilities) ? 
          [...originalJob.responsibilities] : 
          [`Worked as ${originalJob.title} at ${originalJob.company}, contributing to various projects and initiatives.`];
      } else {
        // For non-English, use a quick synchronous fallback
        tailoredJob.responsibilities = [`${tailoredJob.title} at ${tailoredJob.company}`];
      }
    }
    
    // Ensure natural conciseness - NO brutal truncation
    tailoredJob.responsibilities = tailoredJob.responsibilities.map(resp => {
      if (resp.length > 140) {
        console.warn(`⚠️ Responsibility too long (${resp.length} chars), may need AI refinement`);
      }
      return resp; // Keep as-is, don't truncate
    });
    
    // Limit to maximum 4 responsibilities for natural conciseness
    if (tailoredJob.responsibilities.length > 4) {
      tailoredJob.responsibilities = tailoredJob.responsibilities.slice(0, 4);
    }
    
    // Ensure period is preserved exactly
    tailoredJob.period = originalJob.period || '';
    
    console.log(`✅ Deep tailored experience for ${tailoredJob.company}: ${tailoredJob.title} (${tailoredJob.responsibilities.length} responsibilities)`);
    return tailoredJob;
  }

  /**
   * Create fallback experience entry with translation
   */
  async createFallbackExperience(job, targetLanguage = 'en') {
    // Always return original content for fallback to avoid timeout
    // The main AI should handle translation, fallback should be fast
    console.log(`⚠️ Using quick fallback for ${job.company} (no translation to prevent timeout)`);
    
    return {
      title: job.title,
      company: job.company,
      period: job.period || '',
      responsibilities: Array.isArray(job.responsibilities) ? [...job.responsibilities] : 
        [`Worked as ${job.title} at ${job.company}, contributing to various projects and initiatives.`]
    };
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: 'active',
      components: {
        scorer: this.scorer.getStatus(),
        validator: this.validator.getStatus()
      },
      capabilities: [
        'Experience relevance scoring',
        'Intelligent experience selection',
        'Deep content tailoring',
        'Authenticity validation',
        'Natural language enhancement'
      ]
    };
  }
}

module.exports = ExperienceEngine;
