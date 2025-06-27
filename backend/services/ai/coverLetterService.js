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

    const prompt = this.buildCoverLetterPrompt(cv, jobOffer, additionalRequirements);
    const coverLetter = await this.aiService.generateContent(prompt);

    return {
      content: coverLetter,
      createdAt: new Date().toISOString()
    };
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
You are an expert career consultant and professional writer. Create a compelling, personalized cover letter based on the following information:

Candidate CV:
${JSON.stringify(cv, null, 2)}

Job Offer:
${JSON.stringify(jobOffer, null, 2)}

${additionalRequirements ? `Additional Requirements: ${additionalRequirements}` : ''}

COVER LETTER WRITING INSTRUCTIONS:

📝 TONE & STYLE:
- Write in a confident, natural human voice - never robotic or templated
- Avoid overused clichés like "I am writing to express my interest" or "I am a results-driven professional"
- Make it feel personally crafted for this specific opportunity
- Show genuine enthusiasm for the role and company
- Use varied sentence structures for engaging readability

🎯 CONTENT REQUIREMENTS:
- Strong, engaging opening that immediately demonstrates fit for the role
- Highlight 2-3 most relevant achievements from the CV that match job requirements
- Address specific skills and requirements mentioned in the job offer
- Show knowledge of the company (if company info available in job offer)
- Include quantifiable achievements when available from CV
- Use the candidate's exact name from personalInfo

📊 STRUCTURE (3-4 paragraphs):
1. Opening: Compelling hook that shows immediate value and fit
2. Body: Relevant experience and achievements that match job requirements
3. Value: What unique value you bring to this role and company
4. Closing: Professional, confident call to action

⚡ ATS & PROFESSIONAL OPTIMIZATION:
- Include relevant keywords from the job description naturally
- Use action verbs that align with job requirements
- Maintain professional formatting with clear paragraph breaks
- Ensure easy readability for both ATS and human reviewers
- Keep concise but impactful (aim for 250-400 words)

Return the cover letter as plain text, properly formatted with paragraph breaks.
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

    // Simple HTML template for cover letter PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 40px; 
            color: #333;
          }
          h1 { 
            color: #333; 
            border-bottom: 2px solid #333; 
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          p { 
            margin-bottom: 15px; 
            text-align: justify;
          }
          .content {
            max-width: 700px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Cover Letter</h1>
          <div>${content.replace(/\n/g, '<br>')}</div>
        </div>
      </body>
      </html>
    `;

    try {
      // Use the existing PDF service to generate PDF
      const pdfService = require('../pdfService');
      return await pdfService.generateFromHtml(html);
    } catch (error) {
      throw new Error(`Failed to generate cover letter PDF: ${error.message}`);
    }
  }
}

module.exports = CoverLetterService;
