/**
 * Cover Letter Service - Handles cover letter generation and PDF creation
 * Uses AI to generate personalized cover letters and converts to PDF
 */
const AIService = require('./aiService');

class CoverLetterService {
  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate cover letter using AI
   * @param {Object} cv - CV data
   * @param {Object} jobOffer - Job offer data
   * @param {string} additionalRequirements - Optional additional requirements
   * @returns {Promise<Object>} - Generated cover letter with metadata
   */
  async generateCoverLetter(cv, jobOffer, additionalRequirements = '') {
    if (!cv || !jobOffer) {
      throw new Error('CV and job offer data required');
    }

    console.log('🔄 Generating cover letter with multi-tier validation...');
    const prompt = this.buildCoverLetterPrompt(cv, jobOffer, additionalRequirements);
    
    try {
      // Use multi-tier AI system (generation task - no fallback parser)
      const rawContent = await this.aiService.generateContent(prompt, true);
      console.log('📄 Raw cover letter generated, applying validation...');
      
      // Apply AI slop validation and cleaning
      const cleanedContent = this.validateAndCleanContent(rawContent);
      
      // Final human-like validation
      const finalContent = this.applyHumanLikeValidation(cleanedContent, cv, jobOffer);
      
      console.log('✅ Cover letter generated and validated successfully');
      return {
        content: finalContent,
        createdAt: new Date().toISOString(),
        validationApplied: true
      };
    } catch (error) {
      console.error('❌ Cover letter generation failed:', error);
      throw new Error(`Cover letter generation failed: ${error.message}`);
    }
  }

  /**
   * Build the cover letter generation prompt
   * @param {Object} cv - CV data
   * @param {Object} jobOffer - Job offer data
   * @param {string} additionalRequirements - Additional requirements
   * @returns {string} - Complete prompt
   */
  buildCoverLetterPrompt(cv, jobOffer, additionalRequirements) {
    return `
You are an expert career consultant and professional writer. Create a compelling, personalized cover letter that fits on ONE PAGE ONLY. Write it as if you ARE the candidate - use first person throughout.

Candidate CV:
${JSON.stringify(cv, null, 2)}

Job Offer:
${JSON.stringify(jobOffer, null, 2)}

${additionalRequirements ? `Additional Requirements: ${additionalRequirements}` : ''}

🚨 CRITICAL RULES - NO EXCEPTIONS:

� HUMAN WRITING REQUIREMENTS:
- Write as if you ARE the candidate (first person: "I", "my", "me")
- NEVER use bracketed placeholders like [Company Name], [Position], [Platform], etc.
- NEVER use phrases like "I am writing to express my interest" or "I would like to apply"
- NEVER use corporate buzzwords like "results-driven", "team player", "synergy", "leverage"
- NEVER use AI-generated phrases or templates
- Write with genuine personality and authentic voice
- Use specific, concrete examples from the candidate's actual experience

🎯 OPENING ALTERNATIVES (Choose ONE natural approach):
- Start with a relevant achievement or skill that matches the role
- Begin with what excites you about the specific company/role
- Open with a brief story about relevant experience
- Start with a connection between your background and their needs

❌ FORBIDDEN PHRASES & PATTERNS:
- "I am writing to express..."
- "I would like to apply for..."
- "As advertised on [platform]..."
- "I am excited to submit my application..."
- Any text with brackets [ ]
- "Please find my resume attached"
- "I look forward to hearing from you"
- "Thank you for your consideration"
- "I am confident that my skills..."
- "I would be a valuable addition..."

✅ NATURAL ALTERNATIVES:
- Jump straight into relevant experience or skills
- "My experience with [specific technology] at [actual company] directly aligns with..."
- "When I saw this position, I immediately thought of..."
- "Having worked with [specific tools/methods], I understand..."
- "Your recent [project/initiative] caught my attention because..."

📊 STRUCTURE (3 paragraphs ONLY):
1. Opening: Direct connection between your experience and their needs (3-4 sentences)
2. Body: Specific achievements and skills that match requirements (3-4 sentences)  
3. Closing: Next steps with confidence, no generic phrases (2-3 sentences)

🔍 VALIDATION REQUIREMENTS:
- Every company name, position title, and detail must come from the actual data provided
- No generic industry terms - use specific technologies, tools, or methods mentioned
- Include at least 2 quantifiable achievements from the CV
- Reference specific requirements from the job offer
- Use the candidate's actual name and experience details

💡 WRITING QUALITY:
- Vary sentence length and structure
- Use active voice throughout
- Show personality while maintaining professionalism
- Demonstrate genuine interest in THIS specific role at THIS specific company
- Connect your experience to their actual needs

Return ONLY the cover letter text. Start with a natural greeting and write as the candidate would write it themselves.
- Include relevant keywords from the job description naturally
- Use action verbs that align with job requirements
- Maintain professional formatting with clear paragraph breaks
- Ensure easy readability for both ATS and human reviewers
- Keep concise but impactful (350-400 words maximum)

💡 WRITING TIPS:
- Start with a strong opening that grabs attention
- Use specific examples with numbers/metrics when possible
- Show passion for the company/role
- End with confidence and next steps
- Use the candidate's name naturally throughout

Return the cover letter as plain text, properly formatted with paragraph breaks. Start with "Dear Hiring Manager," and end with "Sincerely," followed by the candidate's name.
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
   * Validate and clean cover letter content to remove AI slop
   * @param {string} content - Raw cover letter content
   * @returns {string} - Cleaned content
   */
  validateAndCleanContent(content) {
    console.log('🔍 Validating cover letter for AI slop and placeholders...');
    
    // Define AI slop patterns to detect and fix
    const aiSlopPatterns = [
      {
        pattern: /\[([^\]]+)\]/g,
        replacement: '',
        description: 'Bracketed placeholders'
      },
      {
        pattern: /I am writing to express my (?:strong )?interest in/gi,
        replacement: 'I\'m excited about',
        description: 'Generic opening'
      },
      {
        pattern: /I would like to apply for/gi,
        replacement: 'I\'m interested in',
        description: 'Generic application phrase'
      },
      {
        pattern: /as advertised on .+?\./gi,
        replacement: '.',
        description: 'Platform reference'
      },
      {
        pattern: /Please find my resume attached/gi,
        replacement: '',
        description: 'Attachment reference'
      },
      {
        pattern: /Thank you for your consideration/gi,
        replacement: 'I look forward to discussing this opportunity',
        description: 'Generic closing'
      },
      {
        pattern: /I am confident that my skills/gi,
        replacement: 'My experience',
        description: 'Confidence cliche'
      },
      {
        pattern: /results?-driven/gi,
        replacement: 'focused',
        description: 'Corporate buzzword'
      },
      {
        pattern: /team player/gi,
        replacement: 'collaborative professional',
        description: 'Corporate buzzword'
      },
      {
        pattern: /I would be a valuable addition/gi,
        replacement: 'I would contribute',
        description: 'Generic value proposition'
      },
      {
        pattern: /I look forward to hearing from you/gi,
        replacement: 'I\'d welcome the opportunity to discuss this further',
        description: 'Generic closing'
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

    // Clean up multiple spaces and empty lines
    cleanedContent = cleanedContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // Remove empty sentences
    cleanedContent = cleanedContent
      .split('.')
      .filter(sentence => sentence.trim().length > 3)
      .join('.')
      .replace(/\.\./g, '.');

    if (issuesFound > 0) {
      console.log(`🧹 Cleaned ${issuesFound} AI slop issues from cover letter`);
    } else {
      console.log('✅ Cover letter passed AI slop validation');
    }

    return cleanedContent;
  }

  /**
   * Apply final human-like validation to ensure natural writing
   * @param {string} content - Cleaned content
   * @param {Object} cv - CV data for context
   * @param {Object} jobOffer - Job offer data for context
   * @returns {string} - Final validated content
   */
  applyHumanLikeValidation(content, cv, jobOffer) {
    console.log('🎯 Applying human-like validation...');
    
    let validatedContent = content;
    
    // Ensure proper greeting without generic phrases
    if (!validatedContent.startsWith('Dear')) {
      validatedContent = `Dear Hiring Manager,\n\n${validatedContent}`;
    }
    
    // Ensure proper closing
    if (!validatedContent.includes('Sincerely') && !validatedContent.includes('Best regards')) {
      const candidateName = cv.personalInfo?.firstName && cv.personalInfo?.lastName 
        ? `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`
        : cv.personalInfo?.name || 'Candidate';
      
      validatedContent += `\n\nSincerely,\n${candidateName}`;
    }
    
    // Validate that specific company and position are mentioned
    const companyName = jobOffer.company || 'the company';
    const positionTitle = jobOffer.title || 'this position';
    
    if (!validatedContent.toLowerCase().includes(companyName.toLowerCase()) && companyName !== 'Company Not Specified') {
      console.log('⚠️ Company name not found in content, this may need manual review');
    }
    
    if (!validatedContent.toLowerCase().includes(positionTitle.toLowerCase()) && positionTitle !== 'Position Not Specified') {
      console.log('⚠️ Position title not found in content, this may need manual review');
    }
    
    // Check for remaining AI artifacts
    const aiArtifacts = [
      /\[.*?\]/g,  // Any remaining brackets
      /\{.*?\}/g,  // Curly braces
      /as mentioned above/gi,
      /in conclusion/gi,
      /to summarize/gi,
      /furthermore/gi,
      /moreover/gi
    ];
    
    aiArtifacts.forEach((pattern, index) => {
      if (pattern.test(validatedContent)) {
        console.log(`⚠️ Found AI artifact pattern ${index + 1}, manual review recommended`);
      }
    });
    
    // Ensure paragraphs are properly formatted
    validatedContent = validatedContent
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');
    
    console.log('✅ Human-like validation completed');
    return validatedContent;
  }
}

module.exports = CoverLetterService;
