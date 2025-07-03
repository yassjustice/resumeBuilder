/**
 * CV Processing Service - CV extraction and tailoring
 * Uses AI to extract structured data from CV text and tailor CVs to job offers
 */
const AIService = require('./aiService');

class CVProcessingService {
  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Extract structured CV data from text using AI with fallback
   * @param {string} text - CV text content
   * @returns {Promise<Object>} - Structured CV data
   */
  async extractCVFromText(text) {
    if (!text) {
      throw new Error('No text provided');
    }

    console.log('🤖 CV extraction request received');
    console.log('📝 Text length:', text.length);

    const prompt = this.buildExtractionPrompt(text);
    
    try {
      console.log('🔄 Sending request to AI services...');
      const result = await this.aiService.generateContentWithFallback(prompt, text, 'cv');
      console.log(`📊 CV extracted using: ${result.serviceUsed}`);
      console.log('✅ CV extraction completed successfully');
      return result.data;
    } catch (error) {
      console.error('❌ All CV extraction methods failed:', error);
      throw error;
    }
  }

  /**
   * Build the extraction prompt for CV data
   * @param {string} text - CV text
   * @returns {string} - Complete prompt
   */
  buildExtractionPrompt(text) {
    return `
You are an expert CV/Resume parser and career consultant. Extract structured information from this CV/resume text and return it as a JSON object with the following structure:

{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "location": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "grade": ""
    }
  ],
  "skills": {},
  "languages": [
    {
      "name": "",
      "level": "Basic|Intermediate|Advanced|Native"
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "url": ""
    }
  ]
}

CRITICAL EXTRACTION INSTRUCTIONS:

🎯 JOB TITLE DETERMINATION - CRITICAL CONTEXTUAL ANALYSIS:
- Analyze the ENTIRE CV to determine the most accurate professional title
- Consider: Career progression, experience level, primary expertise, industry, and current role
- DO NOT just copy the most recent job title - SYNTHESIZE from the whole career story
- Look at the full context: years of experience, progression pattern, skill set, achievements

🚨 INTERNSHIP HANDLING - CRITICAL:
- NEVER use "Intern" as a job title - ALWAYS extract the actual role/function performed
- If someone is a "Marketing Intern" → Position: "Marketing Assistant" or "Digital Marketing Associate"
- If someone is a "Software Engineering Intern" → Position: "Software Developer" or "Junior Developer"  
- If someone is a "Data Science Intern" → Position: "Data Analyst" or "Junior Data Scientist"
- ACKNOWLEDGE internship status in the job description naturally (e.g., "Internship role where I developed...")
- Focus on the ACTUAL WORK AND RESPONSIBILITIES, not the employment status
- Maintain transparency about internship context while using professional titles

🏷️ SKILLS CATEGORIZATION:
- Create COMPLETELY DYNAMIC categories based on the specific skills found in THIS CV
- Analyze the person's field/industry from their experience and create relevant categories
- Do NOT use generic fixed categories - adapt to the individual's profession and skill set
- Group related skills logically based on their actual field of work
- Each skill should ONLY have the name - NO LEVELS NEEDED
- Skills object structure: { "CategoryName": ["SkillName1", "SkillName2", "SkillName3"] }
- Categories should be descriptive, professional, and FIELD-SPECIFIC

EXAMPLES BY FIELD:
- Software Developer: "Programming Languages", "Frameworks & Libraries", "Development Tools", "Databases", "Cloud Platforms"
- Marketing Professional: "Digital Marketing", "Analytics & Reporting", "Content Creation", "Social Media Platforms", "Marketing Automation"
- Finance Professional: "Financial Software", "Analysis Tools", "Risk Management", "Investment Platforms", "Compliance Systems"

Always include "Soft Skills" or "Interpersonal Skills" as one category for communication, leadership, etc.

📝 PROFESSIONAL SUMMARY:
- Create a compelling, human-sounding professional summary
- Use confident, natural language - never robotic or templated
- Avoid clichés like "results-driven", "team player", "detail-oriented"
- Include specific years of experience, key achievements, and value proposition
- Make it feel personal and tailored to this individual's career story
- Use action-oriented language and quantifiable achievements when mentioned in CV
- Maximum 3-4 sentences, optimized for both ATS and human readability
- Include relevant keywords naturally from their experience and skills

CV Text:
${text}
`;
  }

  /**
   * Extract job offer requirements using AI with fallback
   * @param {string} text - Job offer text
   * @returns {Promise<Object>} - Structured job offer data
   */
  async extractJobOffer(text) {
    if (!text) {
      throw new Error('No text provided');
    }

    try {
      const prompt = `
Extract structured information from this job offer/description and return it as a JSON object:

{
  "title": "",
  "company": "",
  "location": "",
  "salary": "",
  "employmentType": "",
  "description": "",
  "requirements": [],
  "keySkills": [],
  "preferredQualifications": [],
  "benefits": []
}

Job Offer Text:
${text}

Return only the JSON object, no additional text or formatting.
`;

      const result = await this.aiService.generateContentWithFallback(prompt, text, 'jobOffer');
      console.log(`📊 Job offer extracted using: ${result.serviceUsed}`);
      return result.data;
      
    } catch (error) {
      console.log('❌ All extraction methods failed:', error.message);
      throw error;
    }
  }

  /**
   * Tailor CV to match job requirements
   * @param {Object} cv - Original CV data
   * @param {Object} jobOffer - Job offer data
   * @param {string} additionalRequirements - Optional additional requirements
   * @returns {Promise<Object>} - Tailored CV data
   */
  async tailorCV(cv, jobOffer, additionalRequirements = '') {
    if (!cv || !jobOffer) {
      throw new Error('CV and job offer data required');
    }

    const prompt = this.buildTailoringPrompt(cv, jobOffer, additionalRequirements);
    const jsonText = await this.aiService.generateContent(prompt, true); // Mark as generation task
    return this.aiService.parseAIResponse(jsonText);
  }

  /**
   * Build the tailoring prompt for CV optimization
   * @param {Object} cv - Original CV data
   * @param {Object} jobOffer - Job offer data
   * @param {string} additionalRequirements - Additional requirements
   * @returns {string} - Complete prompt
   */
  buildTailoringPrompt(cv, jobOffer, additionalRequirements) {
    return `
You are an expert CV writer, career consultant, and ATS optimization specialist. Transform this CV into a highly targeted, ATS-friendly document that perfectly matches the job requirements while maintaining complete factual accuracy.

Original CV:
${JSON.stringify(cv, null, 2)}

Job Offer:
${JSON.stringify(jobOffer, null, 2)}

${additionalRequirements ? `Additional Requirements: ${additionalRequirements}` : ''}

🎯 CRITICAL TAILORING OBJECTIVES:
1. Create an ATS-optimized CV that ranks in the top 10% for this specific role
2. Transform generic content into role-specific, compelling narratives  
3. Optimize keyword density and relevance without keyword stuffing
4. Enhance achievement descriptions to match job requirements
5. Stands out among hundreds of applications

Return only the tailored CV JSON object, no additional text or explanations.
`;
  }
}

module.exports = CVProcessingService;
