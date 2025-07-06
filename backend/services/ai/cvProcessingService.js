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
  "skills": {
    "Technical Skills": ["Skill1", "Skill2"],
    "Programming Languages": ["Language1", "Language2"],
    "Soft Skills": ["Communication", "Leadership"]
  },
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
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "startDate": "",
      "endDate": "",
      "url": ""
    }
  ]
}

CRITICAL EXTRACTION INSTRUCTIONS:

📧 EMAIL AND CONTACT PRECISION - CRITICAL:
- Extract email addresses with ABSOLUTE PRECISION - every character matters
- Double-check email format: username@domain.com
- Pay special attention to numbers in emails (60, not 0 or 6)
- Verify spelling of email domains (gmail.com, outlook.com, etc.)
- Extract phone numbers exactly as written
- Preserve all contact information formatting
- For LinkedIn, extract clean URL without "linkedin.com/in/" prefix if present
- For websites/portfolios, ensure proper URL format

📅 DATE STANDARDIZATION - CRITICAL:
- ALL dates must be in MM/YYYY format (e.g., "03/2024", "12/2023")
- Convert any date format to MM/YYYY: "March 2024" → "03/2024", "2024-03" → "03/2024"
- For ongoing positions/education, use "Present" for endDate
- Ensure startDate is always before endDate logically
- Handle single year dates: "2023" → "01/2023" for startDate, "12/2023" for endDate
- Be consistent across all experience, education, certification, and project dates

🎯 JOB TITLE DETERMINATION - CRITICAL CONTEXTUAL ANALYSIS:
- Analyze the ENTIRE CV to determine the most accurate professional title
- Consider: Career progression, experience level, primary expertise, industry, and current role
- DO NOT just copy the most recent job title - SYNTHESIZE from the whole career story
- Look at the full context: years of experience, progression pattern, skill set, achievements
- For entry-level: Focus on specialization (e.g., "Junior Frontend Developer", "Marketing Associate")
- For mid-level: Emphasize expertise area (e.g., "Full Stack Developer", "Digital Marketing Specialist")
- For senior: Include seniority (e.g., "Senior Software Engineer", "Lead UX Designer")

🚨 INTERNSHIP HANDLING - CRITICAL:
- NEVER use "Intern" as a job title - ALWAYS extract the actual role/function performed
- If someone is a "Marketing Intern" → Position: "Marketing Associate" or "Digital Marketing Assistant"
- If someone is a "Software Engineering Intern" → Position: "Software Developer" or "Junior Developer"  
- If someone is a "Data Science Intern" → Position: "Data Analyst" or "Junior Data Scientist"
- ACKNOWLEDGE internship status in the job description naturally (e.g., "Internship role where I developed...")
- Focus on the ACTUAL WORK AND RESPONSIBILITIES, not the employment status
- Maintain transparency about internship context while using professional titles

🏷️ SKILLS CATEGORIZATION - MANDATORY EXTRACTION:
- YOU MUST EXTRACT ALL SKILLS from the CV - this is CRITICAL for the application
- Look for skills in ALL sections: experience descriptions, skills sections, summary, projects, education
- Create COMPLETELY DYNAMIC categories based on the specific skills found in THIS CV
- Analyze the person's field/industry from their experience and create relevant categories
- Do NOT use generic fixed categories - adapt to the individual's profession and skill set
- Group related skills logically based on their actual field of work
- Each skill should ONLY have the name - NO LEVELS NEEDED
- Skills object structure: { "CategoryName": ["SkillName1", "SkillName2", "SkillName3"] }
- Categories should be descriptive, professional, and FIELD-SPECIFIC
- MINIMUM 3 categories with at least 2 skills each - extract more if available
- Include granular subcategories when applicable (e.g., separate "JavaScript Frameworks" from "Programming Languages")

EXAMPLES BY FIELD:
- Software Developer: "Programming Languages", "Frontend Frameworks", "Backend Technologies", "Development Tools", "Cloud Platforms", "Databases"
- Marketing Professional: "Digital Marketing", "Analytics & Reporting", "Content Creation", "Social Media Platforms", "Marketing Automation", "Design Tools"
- Finance Professional: "Financial Software", "Analysis Tools", "Risk Management", "Investment Platforms", "Compliance Systems", "Data Analysis"
- Data Scientist: "Programming Languages", "Machine Learning", "Data Visualization", "Statistical Analysis", "Big Data Tools", "Cloud Platforms"

Always include "Soft Skills" or "Interpersonal Skills" as one category for communication, leadership, etc.

📝 PROFESSIONAL SUMMARY ENHANCEMENT:
- Create a compelling, human-sounding professional summary
- Use confident, natural language - never robotic or templated
- Avoid clichés like "results-driven", "team player", "detail-oriented"
- Include specific years of experience, key achievements, and value proposition
- Make it feel personal and tailored to this individual's career story
- Use action-oriented language and quantifiable achievements when mentioned in CV
- Maximum 3-4 sentences, optimized for both ATS and human readability
- Include relevant keywords naturally from their experience and skills
- Focus on unique value proposition and career trajectory

🔧 PROJECT EXTRACTION ENHANCEMENT:
- Extract ALL projects mentioned in the CV, including academic, personal, and professional projects
- For each project, identify: name, comprehensive description, technologies used, dates, and URLs if available
- Group technologies logically (avoid listing every library/tool separately)
- Make descriptions achievement-focused and impact-oriented
- Include quantifiable results when mentioned

🔥 CRITICAL OUTPUT REQUIREMENT:
Return ONLY the JSON object with the extracted data. NO additional text, explanations, or formatting. Just pure JSON that can be parsed directly.

⚠️ COMPREHENSIVE EXTRACTION REMINDER:
- The "skills" field MUST be populated with categories and skills found in the CV
- If no explicit skills section exists, extract skills from job descriptions and experience
- Skills are CRITICAL for CV matching - never leave this field empty
- Always include at least "Technical Skills" and "Soft Skills" categories
- Ensure dates are consistent and properly formatted across all sections
- Maintain accuracy while improving presentation and organization

CV Text:
${text}

Return ONLY the JSON object:
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
