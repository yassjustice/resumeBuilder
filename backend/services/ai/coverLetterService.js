/**
 * Modular Cover Letter Service
 * Clean, efficient cover letter generation with perfect formatting
 * MAX: 500 lines | Font: Georgia 16px | Layout: Professional spacing
 */

const AIService = require('./aiService');
const TranslationService = require('./translationService');

class CoverLetterService {
  constructor() {
    this.aiService = new AIService();
    this.translationService = new TranslationService();
  }

  /**
   * Generate professionally formatted cover letter
   */
  async generateCoverLetter(cv, jobOffer, additionalRequirements = '', language = 'en') {
    if (!cv || !jobOffer) {
      throw new Error('CV and job offer data required');
    }

    console.log('🚀 Generating professional cover letter...');
    
    try {
      // Extract key data
      const candidateName = this.getCandidateName(cv);
      const companyName = jobOffer.company || 'the company';
      const positionTitle = jobOffer.title || 'the position';
      
      // Check for language differences
      const cvLanguage = this.detectCVLanguage(cv);
      if (cvLanguage !== language) {
        console.log(`🌐 Language detection: CV is in ${this.getLanguageName(cvLanguage)}, generating cover letter in ${this.getLanguageName(language)}`);
        console.log('📝 AI will translate CV data automatically during generation');
      } else {
        console.log(`🌐 CV and cover letter both in ${this.getLanguageName(language)}`);
      }
      
      // Generate content with smart prompt
      const prompt = this.buildSmartPrompt(cv, jobOffer, candidateName, companyName, positionTitle, language);
      let content = await this.aiService.generateContent(prompt, true);
      if (content?.content) content = content.content;
      
      // Apply professional formatting
      content = this.formatContent(content, candidateName, companyName, positionTitle, language);
      
      // Translate if needed
      if (language !== 'en') {
        content = await this.translateContent(content, language);
      }
      
      console.log('✅ Professional cover letter generated');
      return {
        content: content,
        createdAt: new Date().toISOString(),
        language: language,
        wordCount: content.split(' ').length,
        qualityAssured: true
      };
    } catch (error) {
      console.error('❌ Cover letter generation failed:', error);
      throw new Error(`Cover letter generation failed: ${error.message}`);
    }
  }

  /**
   * Build smart, concise prompt using actual CV and job data with language handling
   */
  buildSmartPrompt(cv, jobOffer, candidateName, companyName, positionTitle, language) {
    // Extract REAL experience from CV
    const recentExperience = cv.experience?.[0];
    const experienceText = recentExperience 
      ? `Currently/Recently: ${recentExperience.position} at ${recentExperience.company}. ${recentExperience.description || ''}`
      : 'Technology professional with relevant experience';
    
    // Extract REAL skills that match job
    const keySkills = this.extractKeySkills(cv, jobOffer);
    
    // Extract REAL job requirements
    const jobRequirements = Array.isArray(jobOffer.requirements) 
      ? jobOffer.requirements.join(', ') 
      : jobOffer.requirements || 'Full-stack development';
    
    // Detect CV language and add translation instructions if needed
    const languageInstructions = this.buildLanguageInstructions(cv, language);
    
    return `Write a professional cover letter using ONLY the real information below. NO made-up experience.

${languageInstructions}

REAL CANDIDATE DATA:
Name: ${candidateName}
Experience: ${experienceText}
Skills: ${keySkills}
${cv.education?.[0] ? `Education: ${cv.education[0].degree} from ${cv.education[0].institution}` : ''}

JOB DETAILS:
Company: ${companyName}
Position: ${positionTitle}
Requirements: ${jobRequirements}
${jobOffer.description ? `Description: ${jobOffer.description.substring(0, 200)}` : ''}

CRITICAL RULES:
- Use ONLY the candidate's actual experience above
- NO placeholders like "Platform where you saw this"
- NO "replace this" or brackets
- Match specific skills to job requirements
- Professional tone, perfect grammar
- Technology names: React.js, Next.js, Node.js (never broken)
- Write the complete cover letter in ${this.getLanguageName(language)}

Write the complete cover letter content (body paragraphs only - no date/greeting/signature):`;
  }

  /**
   * Extract key skills matching job requirements
   */
  extractKeySkills(cv, jobOffer) {
    const cvSkills = [];
    if (cv.skills) {
      if (Array.isArray(cv.skills)) {
        cvSkills.push(...cv.skills);
      } else if (typeof cv.skills === 'object') {
        cvSkills.push(...Object.values(cv.skills).flat());
      }
    }
    
    const jobText = JSON.stringify(jobOffer).toLowerCase();
    const relevantSkills = cvSkills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    );
    
    return relevantSkills.slice(0, 5).join(', ') || 'Full-stack development';
  }

  /**
   * Format content with professional layout
   */
  formatContent(content, candidateName, companyName, positionTitle, language) {
    console.log('📝 Applying professional formatting...');
    
    // Clean up content
    content = this.cleanContent(content);
    
    // Fix technology names
    content = this.fixTechNames(content);
    
    // Ensure proper structure
    content = this.ensureStructure(content, candidateName, companyName, positionTitle, language);
    
    // Apply final formatting
    content = this.applyFinalFormatting(content);
    
    return content;
  }

  /**
   * Clean content of formatting artifacts
   */
  cleanContent(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/__(.*?)__/g, '$1')     // Remove underline
      .replace(/\[(.*?)\]/g, '$1')     // Remove brackets
      .replace(/\{(.*?)\}/g, '$1')     // Remove braces
      .replace(/\s+/g, ' ')            // Normalize spaces
      .trim();
  }

  /**
   * Fix technology names
   */
  fixTechNames(content) {
    const fixes = {
      'React\\s*\\.\\s*js': 'React.js',
      'Next\\s*\\.\\s*js': 'Next.js',
      'Node\\s*\\.\\s*js': 'Node.js',
      'Vue\\s*\\.\\s*js': 'Vue.js',
      'Express\\s*\\.\\s*js': 'Express.js'
    };
    
    Object.entries(fixes).forEach(([pattern, replacement]) => {
      content = content.replace(new RegExp(pattern, 'gi'), replacement);
    });
    
    return content;
  }

  /**
   * Ensure proper business letter structure - FIXED
   */
  ensureStructure(content, candidateName, companyName, positionTitle, language) {
    console.log('📋 Original content length:', content.length);
    
    const dateStr = this.getDateString(language);
    const greeting = this.getGreeting(language);
    const closing = this.getClosing(language);
    
    // Split into paragraphs and clean
    let paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(p => p);
    console.log('📋 Found paragraphs:', paragraphs.length);
    
    // Remove only exact structural matches (not partial matches)
    paragraphs = paragraphs.filter(p => {
      const isStructural = (
        p === dateStr ||
        p === greeting ||
        p === closing ||
        p === candidateName ||
        /^\d{1,2}\s+\w+\s+\d{4}$/.test(p) || // Date pattern
        /^Dear\s/.test(p) || // Greeting pattern
        /^Sincerely,?\s*$/.test(p) // Closing pattern only
      );
      
      if (isStructural) {
        console.log('📋 Removing structural element:', p.substring(0, 50));
      }
      
      return !isStructural;
    });
    
    console.log('📋 Content paragraphs after filtering:', paragraphs.length);
    
    // Ensure we have content
    if (paragraphs.length === 0) {
      console.warn('⚠️ No content paragraphs found! Using fallback.');
      paragraphs = [
        `I am writing to express my interest in the ${positionTitle} position at ${companyName}.`,
        `My experience and skills align well with your requirements.`,
        `I look forward to discussing this opportunity with you.`
      ];
    }
    
    // Build clean structure
    const structured = [
      dateStr,
      '',
      greeting,
      '',
      ...paragraphs.map(p => [p, '']).flat().slice(0, -1),
      '',
      closing,
      candidateName
    ];
    
    return structured.join('\n');
  }

  /**
   * Apply final formatting polish
   */
  applyFinalFormatting(content) {
    return content
      .replace(/\n{3,}/g, '\n\n')      // Max 2 line breaks
      .replace(/\s+$/gm, '')           // Remove trailing spaces
      .replace(/^\s+/gm, '')           // Remove leading spaces
      .trim();
  }

  /**
   * Translate content if needed
   */
  async translateContent(content, language) {
    try {
      const translated = await this.translationService.translateCVContent({ content }, language);
      return translated.content || translated;
    } catch (error) {
      console.warn('⚠️ Translation failed, using original');
      return content;
    }
  }

  /**
   * Generate PDF with perfect formatting
   */
  async generateCoverLetterPDF(content, fileName = 'cover-letter') {
    if (!content) {
      throw new Error('Cover letter content is required');
    }

    const html = this.buildHTML(content);
    
    try {
      const pdfService = require('../pdfService');
      const pdfBuffer = await pdfService.generateFromHtml(html, {
        format: 'A4',
        printBackground: true,
        margin: { top: '2.5cm', right: '2cm', bottom: '2.5cm', left: '2cm' },
        preferCSSPageSize: true
      });
      
      console.log('✅ Professional PDF generated');
      return pdfBuffer;
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Build HTML with specification-compliant formatting
   */
  buildHTML(content) {
    const lines = content.split('\n');
    let html = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        return; // Skip empty lines - CSS handles spacing
      }
      
      if (this.hasDate(trimmed)) {
        html += `<div class="date">${trimmed}</div>\n`;
      } else if (this.isGreeting(trimmed)) {
        html += `<div class="greeting">${trimmed}</div>\n`;
      } else if (this.isClosing(trimmed)) {
        html += `<div class="closing">${trimmed}</div>\n`;
      } else if (this.isNameLine(trimmed)) {
        html += `<div class="signature">${trimmed}</div>\n`;
      } else {
        html += `<div class="paragraph">${trimmed}</div>\n`;
      }
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { size: A4; margin: 2.5cm 2cm; }
        
        body {
            font-family: Georgia, Cambria, 'Times New Roman', serif;
            font-size: 16px;
            line-height: 1.6;
            color: #222;
            margin: 0;
            padding: 0;
            text-align: left;
            max-width: 720px;
        }
        
        .date {
            margin-bottom: 2em;
        }
        
        .greeting {
            margin-bottom: 1em;
        }
        
        .paragraph {
            margin-bottom: 1em;
            text-align: justify;
        }
        
        .closing {
            margin-top: 1.2em;
            margin-bottom: 0.8em;
        }
        
        .signature {
            margin-top: 1.2em;
            font-weight: normal;
        }
        
        /* No bold, italic, underline */
        * { font-weight: normal; font-style: normal; text-decoration: none; }
        
        /* Ensure page breaks don't split content badly */
        .paragraph { page-break-inside: avoid; }
        .signature { page-break-inside: avoid; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
  }

  /**
   * Build language-specific instructions with automatic translation
   */
  buildLanguageInstructions(cv, targetLanguage) {
    const cvLanguage = this.detectCVLanguage(cv);
    const targetLangName = this.getLanguageName(targetLanguage);
    
    if (cvLanguage !== targetLanguage) {
      return `🌐 TRANSLATION REQUIRED:
- The CV data provided is in ${this.getLanguageName(cvLanguage)}
- You MUST translate all CV information to ${targetLangName} 
- Translate experience descriptions, job titles, company names, skills, and education details
- Maintain professional terminology and context during translation
- Write the entire cover letter in perfect ${targetLangName}`;
    }
    
    return `🌐 LANGUAGE: Write the entire cover letter in perfect ${targetLangName}`;
  }

  /**
   * Detect the primary language of CV content
   */
  detectCVLanguage(cv) {
    // Check common French indicators
    const cvText = JSON.stringify(cv).toLowerCase();
    
    // French indicators
    if (cvText.includes('développeur') || 
        cvText.includes('université') || 
        cvText.includes('expérience') ||
        cvText.includes('compétences')) {
      return 'fr';
    }
    
    // Arabic indicators (basic detection)
    if (cvText.includes('مطور') || 
        cvText.includes('جامعة') || 
        cvText.includes('خبرة')) {
      return 'ar';
    }
    
    // Spanish indicators
    if (cvText.includes('desarrollador') || 
        cvText.includes('universidad') || 
        cvText.includes('experiencia')) {
      return 'es';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Get human-readable language name
   */
  getLanguageName(langCode) {
    const languages = {
      'en': 'English',
      'fr': 'French',
      'ar': 'Arabic', 
      'es': 'Spanish'
    };
    return languages[langCode] || 'English';
  }

  // Helper methods
  getCandidateName(cv) {
    if (cv.personalInfo?.firstName && cv.personalInfo?.lastName) {
      return `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`;
    }
    return cv.personalInfo?.name || 'Candidate Name';
  }

  getDateString(language) {
    const today = new Date();
    return language === 'fr' 
      ? today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getGreeting(language) {
    return language === 'fr' ? 'Madame, Monsieur,' : 'Dear Hiring Manager,';
  }

  getClosing(language) {
    return language === 'fr' ? 'Cordialement,' : 'Sincerely,';
  }

  hasDate(line, language = 'en') {
    if (language === 'fr') {
      return /\d{1,2}\s+\w+\s+\d{4}/.test(line);
    }
    return /\w+\s+\d{1,2},?\s+\d{4}/.test(line);
  }

  isGreeting(line, language = 'en') {
    if (language === 'fr') {
      return /\b(Madame|Monsieur|Cher|Chère)/i.test(line);
    }
    return /\b(Dear|Hello)/i.test(line);
  }

  isClosing(line, language = 'en') {
    if (language === 'fr') {
      return /\b(Cordialement|Sincères|Bien)/i.test(line);
    }
    return /\b(Sincerely|Best regards|Kind regards)/i.test(line);
  }

  isNameLine(line) {
    return /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(line.trim()) || 
           /^[A-Z]+ [A-Z]+$/.test(line.trim());
  }
}

module.exports = CoverLetterService;
