/**
 * Cover Letter Service - Handles cover letter generation and PDF creation
 * Uses AI to generate personalized cover letters and converts to PDF
 */
const AIService = require('./aiService');
const TranslationService = require('./translationService');
const { formatDateForInput, formatDateForStorage, isDatePresent } = require('../../utils/dateUtils');

class CoverLetterService {
  constructor() {
    this.aiService = new AIService();
    this.translationService = new TranslationService();
  }

  /**
   * Generate cover letter using AI with advanced normalization and translation
   * @param {Object} cv - CV data
   * @param {Object} jobOffer - Job offer data
   * @param {string} additionalRequirements - Optional additional requirements
   * @param {string} language - Target language for cover letter
   * @returns {Promise<Object>} - Generated cover letter with metadata
   */
  async generateCoverLetter(cv, jobOffer, additionalRequirements = '', language = 'en') {
    if (!cv || !jobOffer) {
      throw new Error('CV and job offer data required');
    }

    // Normalize CV structure for consistency
    const normalizedCV = this.normalizeCV(cv);

    console.log('🔄 Generating cover letter with multi-tier validation...');
    const prompt = this.buildCoverLetterPrompt(normalizedCV, jobOffer, additionalRequirements, language);
    try {
      // Use multi-tier AI system (generation task - no fallback parser)
      let rawContent = await this.aiService.generateContent(prompt, true);
      if (rawContent && rawContent.content) rawContent = rawContent.content;
      console.log('📄 Raw cover letter generated, applying comprehensive validation...');

      // Apply AI slop validation and cleaning
      let cleanedContent = this.validateAndCleanContent(rawContent);

      // Apply human-like validation for completeness
      let validatedContent = this.applyHumanLikeValidation(cleanedContent, normalizedCV, jobOffer);

      // Apply final polish for send-ready quality
      let finalContent = this.finalPolishAndComplete(validatedContent);

      // Translate cover letter if needed
      if (language && language !== 'en') {
        try {
          finalContent = await this.translationService.translateCVContent({ content: finalContent }, language);
          finalContent = finalContent.content || finalContent;
          console.log('🌐 Cover letter translated to', language);
          
          // Apply final polish again after translation
          finalContent = this.finalPolishAndComplete(finalContent);
        } catch (translationError) {
          console.warn('⚠️ Cover letter translation failed, using original:', translationError.message);
        }
      }

      console.log('✅ Cover letter generated, validated, and polished successfully');
      return {
        content: finalContent,
        createdAt: new Date().toISOString(),
        validationApplied: true,
        language: language || 'en',
        qualityAssured: true
      };
    } catch (error) {
      console.error('❌ Cover letter generation failed:', error);
      throw new Error(`Cover letter generation failed: ${error.message}`);
    }
  }

  /**
   * Normalize CV structure for cover letter generation
   */
  normalizeCV(cv) {
    return {
      ...cv,
      personalInfo: cv.personalInfo || {},
      experience: cv.experience || [],
      education: cv.education || [],
      skills: cv.skills || {},
      certifications: cv.certifications || [],
      languages: cv.languages || []
    };
  }

  /**
   * Build the cover letter generation prompt
   * @param {Object} cv - CV data
   * @param {Object} jobOffer - Job offer data
   * @param {string} additionalRequirements - Additional requirements
   * @param {string} language - Target language
   * @returns {string} - Complete prompt
   */
  buildCoverLetterPrompt(cv, jobOffer, additionalRequirements, language) {
    const languageInstruction = language && language !== 'en' 
      ? `🌐 LANGUAGE REQUIREMENT - CRITICAL:
- Write the ENTIRE cover letter in ${language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : language}
- Use proper ${language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : language} grammar, vocabulary, and cultural context
- Adapt the writing style to ${language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : language} business communication standards
- All content must be in ${language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : language} - NO English words or phrases
- Use appropriate ${language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : language} date format and cultural formalities

` 
      : '';

    // Extract key information for intelligent completion
    const candidateName = cv.personalInfo?.firstName && cv.personalInfo?.lastName 
      ? `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`
      : cv.personalInfo?.name || '';
    
    const companyName = jobOffer.company || '';
    const positionTitle = jobOffer.title || '';
    const jobRequirements = Array.isArray(jobOffer.requirements) ? jobOffer.requirements.join(', ') : '';
    const candidateSkills = typeof cv.skills === 'object' ? Object.values(cv.skills).flat().join(', ') : '';

    return `
You are an expert cover letter writer creating a final, polished, ready-to-send business letter. This must be a complete, professional document with zero placeholders, brackets, or incomplete sections.

${languageInstruction}

� CRITICAL REQUIREMENTS - NO EXCEPTIONS:
- NEVER use brackets [], parentheses (), or any placeholder text
- NEVER include phrases like "editable by human", "customize this", or "fill in"
- NEVER leave blank spaces or incomplete sentences
- ALWAYS complete every thought and sentence fully
- ALWAYS use specific, real information from the CV and job offer
- This must be a FINAL, SEND-READY document

📄 PROFESSIONAL STRUCTURE REQUIREMENTS:

📅 DATE FORMATTING:
${language === 'fr' ? '- Use French date format: "6 juillet 2025"' : 
  language === 'ar' ? '- Use Arabic date format with proper RTL formatting' : 
  '- Use professional English date format: "July 6, 2025"'}

👋 GREETING:
${language === 'fr' ? '- Use "Madame, Monsieur," or "Cher(e) Madame, Cher Monsieur,"' :
  language === 'ar' ? '- Use appropriate Arabic business greeting' :
  '- Use "Dear Hiring Manager," or "Dear [Department] Team," if company name provided'}

📋 SUBJECT LINE:
- Include specific position title: ${positionTitle ? `"${positionTitle}"` : 'the advertised position'}
${candidateName ? `- Include candidate name: "${candidateName}"` : ''}

🎯 CONTENT STRATEGY - SPECIFIC REQUIREMENTS:

OPENING PARAGRAPH (Hook + Intent):
- Reference specific role: ${positionTitle || 'the position'}
${companyName ? `- Mention company by name: "${companyName}"` : '- Reference the company naturally'}
- Connect candidate's background to role requirements
- NO generic phrases like "I am writing to express interest"

BODY PARAGRAPH 1 (Relevant Experience):
- Use specific examples from candidate's experience
- Match CV experience to job requirements: ${jobRequirements.substring(0, 200) || 'demonstrated in job posting'}
- Include quantifiable achievements when available
- Reference specific technologies/skills: ${candidateSkills.substring(0, 200) || 'mentioned in CV'}

BODY PARAGRAPH 2 (Value Proposition):
- Highlight unique qualifications and achievements
- Connect past success to potential future contributions
${companyName ? `- Show understanding of ${companyName}'s needs/industry` : '- Show understanding of company needs'}
- Demonstrate knowledge of role requirements

CLOSING PARAGRAPH (Call to Action):
- Express enthusiasm for next steps
- Indicate availability for interview
- Professional sign-off
${candidateName ? `- End with "Sincerely, ${candidateName}"` : '- End with "Sincerely," followed by candidate name'}

🚀 ADVANCED QUALITY REQUIREMENTS:

FORMATTING & PRESENTATION:
- Technology names must be written as single units (e.g., "Next.js", "React.js", "Node.js")
- NO line breaks within technology names or company names
- Proper paragraph structure with clear breaks between sections
- Professional spacing and punctuation
- NO duplicate dates or repeated elements

LANGUAGE & TONE:
- Confident but not arrogant
- Specific and detailed, not generic
- Natural conversational business tone
- NO corporate buzzwords or clichés
- NO AI-generated phrases

CONTENT INTELLIGENCE:
- Every statement must be backed by CV information
- Connect each skill/experience to job requirements
- Use active voice throughout
- Vary sentence length and structure
- Perfect grammar and punctuation

🔍 FORBIDDEN PHRASES & PATTERNS:
❌ NEVER use: "I am writing to express interest"
❌ NEVER use: "Please find my resume attached"
❌ NEVER use: "Thank you for your consideration"
❌ NEVER use: "I would be a valuable addition"
❌ NEVER use: "results-driven", "team player", "detail-oriented"
❌ NEVER use: brackets, placeholders, or incomplete sections
❌ NEVER use: "customize this" or "editable" instructions

📊 CANDIDATE INFORMATION:
Name: ${candidateName || 'Extract from CV data below'}
${cv.personalInfo?.email ? `Email: ${cv.personalInfo.email}` : ''}
${cv.personalInfo?.phone ? `Phone: ${cv.personalInfo.phone}` : ''}

Key Experience: ${cv.experience?.slice(0, 2).map(exp => `${exp.position} at ${exp.company}`).join(', ') || 'Extract from experience below'}
Key Skills: ${candidateSkills.substring(0, 300) || 'Extract from skills below'}

Full CV Data:
${JSON.stringify(cv, null, 2)}

💼 JOB OPPORTUNITY:
Company: ${companyName || 'Extract from job data below'}
Position: ${positionTitle || 'Extract from job data below'}
Key Requirements: ${jobRequirements || 'Extract from requirements below'}

Full Job Data:
${JSON.stringify(jobOffer, null, 2)}

${additionalRequirements ? `📋 ADDITIONAL REQUIREMENTS:
${additionalRequirements}` : ''}

🎯 FINAL VALIDATION CHECKLIST:
✅ Complete date in appropriate format
✅ Professional greeting
✅ Clear subject line with position title
✅ Specific company and position references
✅ Concrete examples from CV
✅ Natural, engaging language
✅ Professional closing with candidate name
✅ Zero placeholders or brackets
✅ Perfect grammar and spelling
✅ Ready to send immediately

CRITICAL: Return ONLY the complete, final, ready-to-send cover letter. No explanations, no metadata, no instructions. This must be a perfect, professional business letter that requires no further editing.
`;
  }

  /**
   * Generate PDF for cover letter content
   * @param {string} content - Cover letter content
   * @param {string} fileName - Optional file name
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateCoverLetterPDF(content, fileName = 'cover-letter') {
    if (!content) {
      throw new Error('Cover letter content is required');
    }

    // Professional cover letter HTML template - one page, no title, beautiful design
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4;
            margin: 2cm 2.5cm;
          }
          
          body { 
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #2c3e50;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .header {
            text-align: right;
            margin-bottom: 2em;
            font-size: 10pt;
            color: #7f8c8d;
          }
          
          .date {
            margin-bottom: 1em;
          }
          
          .content {
            flex: 1;
            font-size: 11pt;
          }
          
          .greeting {
            margin-bottom: 1.5em;
            font-weight: 500;
          }
          
          .body-text {
            text-align: justify;
            margin-bottom: 1.2em;
          }
          
          .body-text:last-of-type {
            margin-bottom: 2em;
          }
          
          .closing {
            margin-bottom: 1em;
          }
          
          .signature {
            margin-top: 2em;
            font-weight: 500;
          }
          
          /* Professional styling for paragraphs */
          p {
            margin: 0 0 1.2em 0;
            text-align: justify;
            hyphens: auto;
          }
          
          /* Ensure single page fit */
          .page-container {
            max-height: 25cm;
            overflow: hidden;
          }
          
          /* Style for bullet points if any */
          ul {
            margin: 0.5em 0;
            padding-left: 1.5em;
          }
          
          li {
            margin-bottom: 0.3em;
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header">
            <div class="date">${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          
          <div class="content">
            ${this.formatCoverLetterContent(content)}
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log('🔄 Generating cover letter PDF...');
      console.log('📄 Content length:', content?.length || 0);
      
      // Use the existing PDF service to generate PDF with specific options for single page
      const pdfService = require('../pdfService');
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: { 
          top: '2cm', 
          right: '2.5cm', 
          bottom: '2cm', 
          left: '2.5cm' 
        },
        preferCSSPageSize: true
      };
      
      const pdfBuffer = await pdfService.generateFromHtml(html, pdfOptions);
      
      console.log('✅ Cover letter PDF generated successfully');
      console.log('📦 PDF buffer size:', pdfBuffer?.length || 0);
      
      return pdfBuffer;
    } catch (error) {
      console.error('❌ Cover letter PDF generation failed:', error);
      throw new Error(`Failed to generate cover letter PDF: ${error.message}`);
    }
  }

  /**
   * Format cover letter content for professional PDF display
   * @param {string} content - Raw cover letter content
   * @returns {string} - Formatted HTML content
   */
  formatCoverLetterContent(content) {
    if (!content) return '';
    
    // Split content into paragraphs
    let paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    
    // If no paragraph breaks, split by sentences for better formatting
    if (paragraphs.length === 1) {
      const sentences = content.split(/\.\s+/);
      if (sentences.length > 6) {
        // Group sentences into paragraphs (3-4 sentences each)
        paragraphs = [];
        for (let i = 0; i < sentences.length; i += 3) {
          const paragraph = sentences.slice(i, i + 3).join('. ');
          if (paragraph.trim()) {
            paragraphs.push(paragraph + (paragraph.endsWith('.') ? '' : '.'));
          }
        }
      }
    }
    
    let formattedContent = '';
    
    paragraphs.forEach((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Detect greeting (first paragraph starting with Dear, Hello, etc.)
      if (index === 0 && /^(Dear|Hello|Hi|To whom)/i.test(trimmedParagraph)) {
        formattedContent += `<div class="greeting">${trimmedParagraph}</div>\n`;
      }
      // Detect closing (last paragraph with Sincerely, Best regards, etc.)
      else if (index === paragraphs.length - 1 && /^(Sincerely|Best regards|Kind regards|Yours truly|Thank you)/i.test(trimmedParagraph)) {
        formattedContent += `<div class="closing">${trimmedParagraph}</div>\n`;
      }
      // Regular body paragraphs
      else {
        formattedContent += `<p class="body-text">${trimmedParagraph}</p>\n`;
      }
    });
    
    return formattedContent;
  }

  /**
   * Validate and clean cover letter content to remove AI slop and ensure completion
   * @param {string} content - Raw cover letter content
   * @returns {string} - Cleaned content
   */
  validateAndCleanContent(content) {
    console.log('🔍 Validating cover letter for completeness and professionalism...');
    
    // Enhanced AI slop patterns - more comprehensive detection
    const aiSlopPatterns = [
      {
        pattern: /\[([^\]]*)\]/g,
        replacement: '',
        description: 'Bracketed placeholders'
      },
      {
        pattern: /\{([^}]*)\}/g,
        replacement: '',
        description: 'Curly brace placeholders'
      },
      {
        pattern: /\(([^)]*)\)/g,
        replacement: (match, group) => {
          // Keep legitimate parentheses but remove placeholder ones
          if (group.toLowerCase().includes('edit') || group.toLowerCase().includes('fill') || 
              group.toLowerCase().includes('insert') || group.toLowerCase().includes('customize')) {
            return '';
          }
          return match;
        },
        description: 'Placeholder parentheses'
      },
      {
        pattern: /(?:customize|edit|fill in|insert|modify|update) (?:this|here|above|below)/gi,
        replacement: '',
        description: 'Edit instructions'
      },
      {
        pattern: /editable by human/gi,
        replacement: '',
        description: 'Human edit instructions'
      },
      {
        pattern: /\*\*\*.*?\*\*\*/g,
        replacement: '',
        description: 'Starred placeholders'
      },
      {
        pattern: /___+/g,
        replacement: '',
        description: 'Underscore placeholders'
      },
      {
        pattern: /\.{3,}/g,
        replacement: '.',
        description: 'Multiple dots'
      },
      {
        pattern: /I am writing to express my (?:strong )?interest in/gi,
        replacement: 'I\'m excited about the opportunity to contribute to',
        description: 'Generic opening'
      },
      {
        pattern: /I would like to apply for/gi,
        replacement: 'I\'m interested in joining your team for',
        description: 'Generic application phrase'
      },
      {
        pattern: /as advertised on .+?\./gi,
        replacement: '.',
        description: 'Platform reference'
      },
      {
        pattern: /Please find my (?:resume|CV) attached/gi,
        replacement: '',
        description: 'Attachment reference'
      },
      {
        pattern: /Thank you for your (?:time and )?consideration/gi,
        replacement: 'I look forward to discussing how I can contribute to your team',
        description: 'Generic closing'
      },
      {
        pattern: /I am confident that my skills/gi,
        replacement: 'My experience demonstrates',
        description: 'Confidence cliche'
      },
      {
        pattern: /results?-driven/gi,
        replacement: 'focused on achieving measurable outcomes',
        description: 'Corporate buzzword'
      },
      {
        pattern: /team player/gi,
        replacement: 'collaborative professional',
        description: 'Corporate buzzword'
      },
      {
        pattern: /I would be a valuable addition/gi,
        replacement: 'I would contribute effectively',
        description: 'Generic value proposition'
      },
      {
        pattern: /I look forward to hearing from you/gi,
        replacement: 'I\'d welcome the opportunity to discuss this position further',
        description: 'Generic closing'
      },
      {
        pattern: /detail-oriented/gi,
        replacement: 'attentive to quality and precision',
        description: 'Corporate buzzword'
      },
      {
        pattern: /proven track record/gi,
        replacement: 'demonstrated success',
        description: 'Corporate buzzword'
      },
      {
        pattern: /hit the ground running/gi,
        replacement: 'contribute immediately',
        description: 'Corporate cliche'
      },
      {
        pattern: /think outside the box/gi,
        replacement: 'approach challenges creatively',
        description: 'Corporate cliche'
      }
    ];

    let cleanedContent = content;
    let issuesFound = 0;

    // Apply all cleaning patterns
    aiSlopPatterns.forEach(({ pattern, replacement, description }) => {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        console.log(`⚠️ Found ${description}: ${matches.length} instances`);
        cleanedContent = cleanedContent.replace(pattern, replacement);
        issuesFound += matches.length;
      }
    });

    // Remove incomplete sentences and fragments
    cleanedContent = cleanedContent
      .split('.')
      .map(sentence => sentence.trim())
      .filter(sentence => {
        // Remove very short fragments or incomplete thoughts
        if (sentence.length < 10) return false;
        
        // Remove sentences with placeholder indicators
        const placeholderIndicators = ['xxx', '___', '[', ']', '{', '}', 'edit this', 'fill in', 'customize'];
        return !placeholderIndicators.some(indicator => 
          sentence.toLowerCase().includes(indicator)
        );
      })
      .join('. ')
      .replace(/\.\s*\./g, '.');

    // Clean up whitespace and formatting
    cleanedContent = cleanedContent
      .replace(/\s+/g, ' ')           // Multiple spaces to single space
      .replace(/\n\s*\n/g, '\n\n')    // Clean up line breaks
      .replace(/\s*\n\s*/g, '\n')     // Clean spaces around line breaks
      .trim();

    // Ensure proper sentence endings
    cleanedContent = cleanedContent.replace(/([^.!?])\s*$/g, '$1.');

    // Remove orphaned punctuation
    cleanedContent = cleanedContent.replace(/\s+[,.;:]\s*/g, ' ');

    if (issuesFound > 0) {
      console.log(`🧹 Cleaned ${issuesFound} AI slop issues from cover letter`);
    } else {
      console.log('✅ Cover letter passed initial validation');
    }

    return cleanedContent;
  }

  /**
   * Apply final human-like validation to ensure natural writing and completeness
   * @param {string} content - Cleaned content
   * @param {Object} cv - CV data for context
   * @param {Object} jobOffer - Job offer data for context
   * @returns {string} - Final validated content
   */
  applyHumanLikeValidation(content, cv, jobOffer) {
    console.log('🎯 Applying comprehensive validation for professional quality...');
    
    let validatedContent = content;
    
    // Extract key information for intelligent completion
    const candidateName = cv.personalInfo?.firstName && cv.personalInfo?.lastName 
      ? `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`
      : cv.personalInfo?.name || 'The Candidate';
    
    const companyName = jobOffer.company || 'the organization';
    const positionTitle = jobOffer.title || 'this position';
    
    // Ensure proper date formatting based on language
    const currentDate = new Date();
    const dateFormatted = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Ensure content starts with proper date (if not already present)
    if (!validatedContent.match(/^\s*\w+ \d{1,2}, \d{4}/)) {
      validatedContent = `${dateFormatted}\n\n${validatedContent}`;
    }
    
    // Ensure proper greeting
    if (!validatedContent.match(/Dear\s+/i)) {
      validatedContent = validatedContent.replace(/^([^,\n]*)/m, 'Dear Hiring Manager,');
    }
    
    // Ensure subject line is present and properly formatted
    if (!validatedContent.toLowerCase().includes('subject:') && 
        !validatedContent.toLowerCase().includes('objet:') &&
        !validatedContent.toLowerCase().includes('candidature')) {
      const subjectLine = `\nSubject: Application for ${positionTitle} Position\n`;
      validatedContent = validatedContent.replace(/(Dear[^,\n]*,)/, `$1${subjectLine}`);
    }
    
    // Ensure company name is mentioned if provided
    if (companyName && companyName !== 'the organization' && 
        !validatedContent.toLowerCase().includes(companyName.toLowerCase())) {
      // Find a good place to insert company name naturally
      validatedContent = validatedContent.replace(
        /(opportunity|position|role|team)/i, 
        `$1 at ${companyName}`
      );
    }
    
    // Ensure position title is mentioned if provided
    if (positionTitle && positionTitle !== 'this position' && 
        !validatedContent.toLowerCase().includes(positionTitle.toLowerCase())) {
      validatedContent = validatedContent.replace(
        /the (position|role|opportunity)/i, 
        `the ${positionTitle} $1`
      );
    }
    
    // Ensure proper closing structure
    const hasClosing = validatedContent.match(/(sincerely|best regards|cordialement)/i);
    if (!hasClosing) {
      // Add professional closing
      if (!validatedContent.endsWith('.')) {
        validatedContent += '.';
      }
      validatedContent += `\n\nI am available for an interview at your convenience and look forward to discussing how my experience can contribute to your team's success.\n\nSincerely,\n${candidateName}`;
    } else {
      // Ensure candidate name is present in closing
      if (!validatedContent.toLowerCase().includes(candidateName.toLowerCase()) && 
          candidateName !== 'The Candidate') {
        validatedContent = validatedContent.replace(
          /(sincerely|best regards|cordialement),?\s*$/i,
          `$1,\n${candidateName}`
        );
      }
    }
    
    // Remove any remaining AI artifacts and incomplete content
    const finalCleanupPatterns = [
      /\[.*?\]/g,  // Any remaining brackets
      /\{.*?\}/g,  // Curly braces  
      /\(edit.*?\)/gi, // Edit instructions in parentheses
      /\(customize.*?\)/gi, // Customize instructions
      /\(fill.*?\)/gi, // Fill instructions
      /as mentioned above/gi,
      /in conclusion/gi,
      /to summarize/gi,
      /\s+furthermore\s+/gi,
      /\s+moreover\s+/gi,
      /please note/gi
    ];
    
    finalCleanupPatterns.forEach((pattern) => {
      validatedContent = validatedContent.replace(pattern, '');
    });
    
    // Ensure proper paragraph structure
    validatedContent = validatedContent
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');
    
    // Final sentence completion check
    validatedContent = validatedContent.replace(/([^.!?])\s*$/g, '$1.');
    
    // Quality checks and warnings
    const wordCount = validatedContent.split(/\s+/).length;
    if (wordCount < 150) {
      console.log('⚠️ Cover letter seems short (< 150 words), may need more content');
    } else if (wordCount > 400) {
      console.log('⚠️ Cover letter is quite long (> 400 words), consider condensing');
    }
    
    // Check for key elements
    const hasCompanyReference = validatedContent.toLowerCase().includes(companyName.toLowerCase());
    const hasPositionReference = validatedContent.toLowerCase().includes(positionTitle.toLowerCase());
    const hasSpecificExperience = validatedContent.match(/\d+\s+(years?|months?)/i);
    
    if (!hasCompanyReference && companyName !== 'the organization') {
      console.log('⚠️ Company name not prominently featured in content');
    }
    if (!hasPositionReference && positionTitle !== 'this position') {
      console.log('⚠️ Position title not prominently featured in content');
    }
    if (!hasSpecificExperience) {
      console.log('ℹ️ Consider adding specific experience duration for stronger impact');
    }
    
    console.log('✅ Human-like validation completed - cover letter is ready to send');
    return validatedContent;
  }

  /**
   * Final processing to ensure completely polished, send-ready cover letter
   * @param {string} content - Validated content
   * @returns {string} - Final polished content
   */
  finalPolishAndComplete(content) {
    console.log('💎 Applying final polish for send-ready quality...');
    
    let polishedContent = content;
    
    // 1. Fix technology name formatting issues that break across lines
    const techNameFixes = {
      'Next\\. ?Js': 'Next.js',
      'React\\. ?Js': 'React.js', 
      'Express\\. ?Js': 'Express.js',
      'Node\\. ?Js': 'Node.js',
      'Vue\\. ?Js': 'Vue.js',
      'Angular\\. ?Js': 'AngularJS',
      'Nest\\. ?Js': 'Nest.js'
    };
    
    Object.entries(techNameFixes).forEach(([pattern, replacement]) => {
      polishedContent = polishedContent.replace(new RegExp(pattern, 'gi'), replacement);
    });

    // 2. Remove duplicate dates at the beginning
    polishedContent = polishedContent.replace(/^(\w+ \d{1,2}, \d{4})\s*(\w+ \d{1,2}, \d{4})/m, '$1');

    // 3. Fix improper line breaks within sentences
    polishedContent = polishedContent.replace(/(\w+)\s*\n+(\w+)/g, (match, word1, word2) => {
      // Don't join if there should be a paragraph break
      if (word1.endsWith('.') || word1.endsWith(',') || word1.endsWith(':') || 
          word2.match(/^(Dear|Subject:|Sincerely|Best|Kind)/)) {
        return match;
      }
      return `${word1} ${word2}`;
    });

    // 4. Emergency completion for any remaining incomplete elements
    const incompletePatterns = [
      {
        pattern: /\s+(\.{2,})\s*/g,
        replacement: '.',
        description: 'Multiple dots cleanup'
      },
      {
        pattern: /\s*_+\s*/g,
        replacement: ' ',
        description: 'Underscore placeholder removal'
      },
      {
        pattern: /\s*\*+\s*/g,
        replacement: ' ',
        description: 'Asterisk placeholder removal'
      },
      {
        pattern: /\s+,/g,
        replacement: ',',
        description: 'Space before comma cleanup'
      },
      {
        pattern: /\s+\./g,
        replacement: '.',
        description: 'Space before period cleanup'
      },
      {
        pattern: /\s{2,}/g,
        replacement: ' ',
        description: 'Multiple spaces cleanup'
      },
      {
        pattern: /\n{3,}/g,
        replacement: '\n\n',
        description: 'Multiple line breaks cleanup'
      }
    ];
    
    incompletePatterns.forEach(({ pattern, replacement, description }) => {
      if (pattern.test(polishedContent)) {
        polishedContent = polishedContent.replace(pattern, replacement);
        console.log(`🔧 Applied ${description}`);
      }
    });

    // 5. Ensure proper paragraph structure
    const lines = polishedContent.split('\n').filter(line => line.trim());
    let structuredContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (i > 0) {
        const prevLine = lines[i - 1].trim();
        
        // Double line break after key elements
        if (prevLine.match(/\d{4}$/) || // After date
            prevLine.match(/^Dear|^Hello/) || // After greeting
            prevLine.match(/^Subject:/) || // After subject
            line.match(/^Sincerely|^Best|^Kind/)) { // Before closing
          structuredContent += '\n\n';
        } else {
          structuredContent += '\n';
        }
      }
      
      structuredContent += line;
    }
    
    polishedContent = structuredContent;
    
    // 6. Ensure proper capitalization after periods
    polishedContent = polishedContent.replace(/\.\s+([a-z])/g, (match, letter) => {
      return match.replace(letter, letter.toUpperCase());
    });
    
    // 7. Ensure proper spacing around punctuation
    polishedContent = polishedContent.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
    
    // 8. Final trim and cleanup
    polishedContent = polishedContent.trim();
    
    // Validate final quality
    const finalQualityChecks = {
      hasDate: /\w+ \d{1,2}, \d{4}/.test(polishedContent),
      hasGreeting: /Dear\s+\w+/i.test(polishedContent),
      hasClosing: /(sincerely|best regards|cordialement)/i.test(polishedContent),
      hasName: polishedContent.split('\n').pop().trim().length > 2,
      noBrackets: !/\[|\]/.test(polishedContent),
      noCurlyBraces: !/\{|\}/.test(polishedContent),
      noPlaceholders: !/edit|customize|fill|insert/i.test(polishedContent),
      properLength: polishedContent.split(/\s+/).length >= 100,
      noTechNameIssues: !/\w+\.\s+[Jj]s/.test(polishedContent) // Check for broken tech names
    };
    
    const qualityScore = Object.values(finalQualityChecks).filter(Boolean).length;
    const totalChecks = Object.keys(finalQualityChecks).length;
    
    console.log(`📊 Cover letter quality score: ${qualityScore}/${totalChecks}`);
    
    if (qualityScore < totalChecks) {
      console.log('⚠️ Quality issues detected:', 
        Object.entries(finalQualityChecks)
          .filter(([key, value]) => !value)
          .map(([key]) => key)
      );
    } else {
      console.log('✅ Cover letter meets all quality standards');
    }
    
    return polishedContent;
  }
}

module.exports = CoverLetterService;
