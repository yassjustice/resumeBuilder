/**
 * Professional Cover Letter Service
 * Handles advanced cover letter generation with perfect formatting
 */
const AIService = require('./aiService');
const TranslationService = require('./translationService');

class ProfessionalCoverLetterService {
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
      // Extract key information
      const candidateName = this.extractCandidateName(cv);
      const companyName = jobOffer.company || 'the company';
      const positionTitle = jobOffer.title || 'the position';
      
      // Build intelligent prompt
      const prompt = this.buildIntelligentPrompt(cv, jobOffer, candidateName, companyName, positionTitle, language);
      
      // Generate content
      let content = await this.aiService.generateContent(prompt, true);
      if (content && content.content) content = content.content;
      
      // Apply professional formatting
      content = this.applyProfessionalFormatting(content, candidateName, companyName, positionTitle, language);
      
      // Final quality assurance
      content = this.finalQualityCheck(content, cv, jobOffer, language);
      
      console.log('✅ Professional cover letter generated successfully');
      
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
   * Build intelligent prompt for cover letter generation
   */
  buildIntelligentPrompt(cv, jobOffer, candidateName, companyName, positionTitle, language) {
    const today = new Date();
    const dateFormat = this.getDateFormat(today, language);
    
    return `
Create a professional business cover letter with PERFECT formatting and structure.

CRITICAL FORMATTING REQUIREMENTS:
1. Start with the date: "${dateFormat}"
2. Add TWO blank lines after the date
3. Professional greeting (Dear Hiring Manager, or Dear Hiring Team,)
4. Subject line: "Re: ${positionTitle} Position"
5. Body with clear paragraph breaks (each paragraph separated by blank line)
6. Professional closing: "Sincerely,"
7. Candidate name: "${candidateName}"

CONTENT REQUIREMENTS:
- Company: ${companyName}
- Position: ${positionTitle}
- Candidate: ${candidateName}
- Write 3-4 well-structured paragraphs
- Use specific examples from the CV
- Match skills to job requirements
- Professional tone throughout
- NO brackets, placeholders, or incomplete sections

CV DATA:
${JSON.stringify(cv, null, 2)}

JOB OFFER:
${JSON.stringify(jobOffer, null, 2)}

LANGUAGE: ${language === 'fr' ? 'Write in French' : language === 'ar' ? 'Write in Arabic' : 'Write in English'}

FORMATTING EXAMPLE:
${dateFormat}


Dear Hiring Manager,

Re: ${positionTitle} Position

[First paragraph - opening and interest]

[Second paragraph - relevant experience and skills]

[Third paragraph - value proposition and company knowledge]

[Fourth paragraph - closing and call to action]

Sincerely,

${candidateName}

Generate the complete, perfectly formatted cover letter now:
`;
  }

  /**
   * Apply professional formatting to ensure perfect structure
   */
  applyProfessionalFormatting(content, candidateName, companyName, positionTitle, language) {
    console.log('📝 Applying professional formatting...');
    
    // Clean up the content first
    content = content.trim();
    
    // Remove any markdown or formatting artifacts
    content = content.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
    content = content.replace(/\*(.*?)\*/g, '$1'); // Remove italic markdown
    content = content.replace(/__(.*?)__/g, '$1'); // Remove underline markdown
    content = content.replace(/\[(.*?)\]/g, '$1'); // Remove brackets
    content = content.replace(/\{(.*?)\}/g, '$1'); // Remove curly braces
    
    // Fix technology names that might be broken
    const techFixes = {
      'React. js': 'React.js',
      'React .js': 'React.js',
      'Next. js': 'Next.js',
      'Next .js': 'Next.js',
      'Node. js': 'Node.js',
      'Node .js': 'Node.js',
      'Vue. js': 'Vue.js',
      'Vue .js': 'Vue.js',
      'Express. js': 'Express.js',
      'Express .js': 'Express.js'
    };
    
    Object.entries(techFixes).forEach(([broken, fixed]) => {
      content = content.replace(new RegExp(broken, 'g'), fixed);
    });
    
    // Ensure proper business letter structure
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const formattedLines = [];
    
    // Add date if not present
    const today = new Date();
    const dateFormat = this.getDateFormat(today, language);
    if (!lines[0] || !this.isDateLine(lines[0])) {
      formattedLines.push(dateFormat);
      formattedLines.push(''); // Blank line after date
      formattedLines.push(''); // Second blank line after date
    }
    
    let inBody = false;
    let paragraphCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip date line if already added
      if (this.isDateLine(line) && formattedLines[0] === dateFormat) {
        continue;
      }
      
      // Handle greeting
      if (this.isGreeting(line)) {
        formattedLines.push(line);
        formattedLines.push(''); // Blank line after greeting
        inBody = true;
        continue;
      }
      
      // Handle subject line
      if (this.isSubjectLine(line, positionTitle)) {
        formattedLines.push(line);
        formattedLines.push(''); // Blank line after subject
        continue;
      }
      
      // Handle closing
      if (this.isClosing(line)) {
        if (inBody) {
          formattedLines.push(''); // Blank line before closing
        }
        formattedLines.push(line);
        formattedLines.push(''); // Blank line after closing
        inBody = false;
        continue;
      }
      
      // Handle signature
      if (this.isSignature(line, candidateName)) {
        formattedLines.push(line);
        continue;
      }
      
      // Handle body paragraphs
      if (inBody && line.length > 20) {
        if (paragraphCount > 0) {
          formattedLines.push(''); // Blank line between paragraphs
        }
        formattedLines.push(line);
        paragraphCount++;
      } else if (!inBody) {
        formattedLines.push(line);
      }
    }
    
    // Ensure we have proper closing and signature
    const lastLines = formattedLines.slice(-3);
    const hasClosing = lastLines.some(line => this.isClosing(line));
    const hasSignature = lastLines.some(line => this.isSignature(line, candidateName));
    
    if (!hasClosing) {
      formattedLines.push('');
      formattedLines.push('Sincerely,');
      formattedLines.push('');
    }
    
    if (!hasSignature) {
      formattedLines.push(candidateName);
    }
    
    return formattedLines.join('\n');
  }

  /**
   * Final quality check and cleanup
   */
  finalQualityCheck(content, cv, jobOffer, language) {
    console.log('🔍 Performing final quality check...');
    
    // Ensure no duplicate dates
    const lines = content.split('\n');
    const dateLines = lines.filter(line => this.isDateLine(line));
    if (dateLines.length > 1) {
      // Remove duplicate dates
      let firstDateFound = false;
      content = lines.filter(line => {
        if (this.isDateLine(line)) {
          if (firstDateFound) return false;
          firstDateFound = true;
          return true;
        }
        return true;
      }).join('\n');
    }
    
    // Ensure proper spacing
    content = content.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
    content = content.replace(/^\s+/, ''); // Remove leading whitespace
    content = content.replace(/\s+$/, ''); // Remove trailing whitespace
    
    // Ensure company and position are mentioned
    const companyName = jobOffer.company;
    const positionTitle = jobOffer.title;
    
    if (companyName && !content.includes(companyName)) {
      console.warn('⚠️ Company name not found in cover letter');
    }
    
    if (positionTitle && !content.includes(positionTitle)) {
      console.warn('⚠️ Position title not found in cover letter');
    }
    
    return content;
  }

  /**
   * Generate professional PDF with proper formatting
   */
  async generateCoverLetterPDF(content, fileName = 'cover-letter') {
    if (!content) {
      throw new Error('Cover letter content is required');
    }

    const html = this.buildProfessionalHTML(content);

    try {
      console.log('📄 Generating professional PDF...');
      
      const pdfService = require('../pdfService');
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: { 
          top: '2.5cm', 
          right: '2.5cm', 
          bottom: '2.5cm', 
          left: '2.5cm' 
        },
        preferCSSPageSize: true,
        displayHeaderFooter: false
      };
      
      const pdfBuffer = await pdfService.generateFromHtml(html, pdfOptions);
      
      console.log('✅ Professional PDF generated successfully');
      return pdfBuffer;
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`Failed to generate cover letter PDF: ${error.message}`);
    }
  }

  /**
   * Build professional HTML for PDF generation
   */
  buildProfessionalHTML(content) {
    const lines = content.split('\n');
    let htmlContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        htmlContent += '<br>\n';
        continue;
      }
      
      if (this.isDateLine(line)) {
        htmlContent += `<div class="date">${line}</div>\n`;
      } else if (this.isGreeting(line)) {
        htmlContent += `<div class="greeting">${line}</div>\n`;
      } else if (this.isSubjectLine(line)) {
        htmlContent += `<div class="subject">${line}</div>\n`;
      } else if (this.isClosing(line)) {
        htmlContent += `<div class="closing">${line}</div>\n`;
      } else if (this.isSignature(line)) {
        htmlContent += `<div class="signature">${line}</div>\n`;
      } else {
        htmlContent += `<p class="body-text">${line}</p>\n`;
      }
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            size: A4;
            margin: 2.5cm;
        }
        
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000000;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .date {
            text-align: right;
            margin-bottom: 2em;
            font-size: 11pt;
        }
        
        .greeting {
            margin-bottom: 1em;
            font-weight: normal;
        }
        
        .subject {
            margin-bottom: 1.5em;
            font-weight: bold;
        }
        
        .body-text {
            margin-bottom: 1.2em;
            text-align: justify;
            text-indent: 0;
        }
        
        .closing {
            margin-top: 1.5em;
            margin-bottom: 3em;
        }
        
        .signature {
            font-weight: normal;
        }
        
        /* Ensure proper spacing */
        p {
            margin: 0 0 1.2em 0;
        }
        
        /* Print optimization */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
  }

  // Helper methods
  extractCandidateName(cv) {
    if (cv.personalInfo?.firstName && cv.personalInfo?.lastName) {
      return `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`;
    }
    return cv.personalInfo?.name || 'Candidate Name';
  }

  getDateFormat(date, language) {
    switch (language) {
      case 'fr':
        return date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      case 'ar':
        return date.toLocaleDateString('ar-EG', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      default:
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
    }
  }

  isDateLine(line) {
    // Check for various date patterns
    const datePatterns = [
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i,
      /\b\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}\b/i,
      /\d{1,2}\/\d{1,2}\/\d{4}/,
      /\d{4}-\d{1,2}-\d{1,2}/
    ];
    return datePatterns.some(pattern => pattern.test(line));
  }

  isGreeting(line) {
    const greetingPatterns = [
      /^Dear\s+/i,
      /^Hello\s+/i,
      /^Hi\s+/i,
      /^Madame,?\s*Monsieur/i,
      /^Cher\s+/i,
      /^Chère\s+/i
    ];
    return greetingPatterns.some(pattern => pattern.test(line));
  }

  isSubjectLine(line, positionTitle = '') {
    const subjectPatterns = [
      /^(Re:|Subject:|Objet:)/i,
      /application/i,
      /position/i,
      /poste/i
    ];
    return subjectPatterns.some(pattern => pattern.test(line)) || 
           (positionTitle && line.includes(positionTitle));
  }

  isClosing(line) {
    const closingPatterns = [
      /^Sincerely,?$/i,
      /^Best regards,?$/i,
      /^Kind regards,?$/i,
      /^Yours truly,?$/i,
      /^Cordialement,?$/i,
      /^Sincères salutations,?$/i,
      /^Respectueusement,?$/i
    ];
    return closingPatterns.some(pattern => pattern.test(line));
  }

  isSignature(line, candidateName = '') {
    if (!candidateName) return false;
    
    // Check if line contains the candidate name
    const nameParts = candidateName.split(' ');
    return nameParts.some(part => line.includes(part)) && line.length < 50;
  }
}

module.exports = ProfessionalCoverLetterService;
