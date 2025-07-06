/**
 * Job Offer Extractor Module - Handles job offer text extraction and analysis
 */
class JobOfferExtractor {
  constructor(aiService) {
    this.aiService = aiService;
  }

  /**
   * Enhanced job offer extraction with advanced prompting from CV Builder
   */
  async extractJobOffer(text) {
    if (!text) {
      throw new Error('No text provided');
    }

    console.log('🔍 Enhanced job offer extraction starting...');
    const prompt = this.buildAdvancedJobOfferExtractionPrompt(text);
    
    try {
      const result = await this.aiService.generateContent(prompt, true);
      const content = result.content || result;
      console.log('✅ Enhanced job offer extraction completed');
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Job offer extraction failed:', error);
      throw new Error(`Job offer extraction failed: ${error.message}`);
    }
  }

  /**
   * Build advanced job offer extraction prompt (similar to CV Builder quality)
   */
  buildAdvancedJobOfferExtractionPrompt(text) {
    return `
You are an expert HR analyst and job market specialist. Extract comprehensive structured information from this job offer/description and return it as a JSON object.

CRITICAL EXTRACTION REQUIREMENTS:

🎯 JOB ANALYSIS - COMPREHENSIVE PARSING:
- Extract the exact job title, not generic descriptions
- Identify the actual company name (avoid "our company", "we are", etc.)
- Determine precise location (city, state, country, or remote status)
- Extract salary range if mentioned (including currency and period)
- Identify employment type (Full-time, Part-time, Contract, Freelance, Internship)

🔧 SKILLS & REQUIREMENTS - CATEGORIZED EXTRACTION:
- Extract ALL technical skills mentioned (programming languages, tools, frameworks)
- Identify soft skills and interpersonal requirements
- Separate required skills from preferred/nice-to-have skills
- Group skills into logical categories based on the role type
- Extract experience requirements (years, level: junior/senior/lead)
- Identify educational requirements and certifications needed

💼 ROLE DETAILS - COMPREHENSIVE CONTEXT:
- Extract detailed job description and main responsibilities
- Identify key qualifications and requirements
- Extract benefits and perks mentioned
- Identify reporting structure if mentioned
- Extract any industry-specific requirements

JSON Structure:
{
  "title": "Exact job title",
  "company": "Company name",
  "location": "Location or Remote",
  "salary": "Salary range if mentioned",
  "employmentType": "Full-time|Part-time|Contract|Freelance|Internship",
  "description": "Detailed job description",
  "responsibilities": ["Main responsibility 1", "Main responsibility 2"],
  "requirements": {
    "experience": "Experience requirements",
    "education": "Educational requirements",
    "certifications": ["Required certifications"],
    "requiredSkills": {
      "Technical Skills": ["Skill1", "Skill2"],
      "Programming Languages": ["Language1", "Language2"],
      "Tools & Frameworks": ["Tool1", "Tool2"],
      "Soft Skills": ["Communication", "Leadership"]
    },
    "preferredSkills": {
      "Additional Technical": ["Optional skill1"],
      "Nice to Have": ["Optional skill2"]
    }
  },
  "benefits": ["Benefit 1", "Benefit 2"],
  "industryContext": "Industry and domain context",
  "workArrangement": "Office|Remote|Hybrid",
  "urgency": "High|Medium|Low",
  "applicationDeadline": "Date if mentioned"
}

🚨 CRITICAL OUTPUT REQUIREMENT:
Return ONLY the JSON object with the extracted data. NO additional text, explanations, or formatting. Just pure JSON that can be parsed directly.

Job Offer Text:
${text}

Return ONLY the JSON object:
`;
  }
}

module.exports = JobOfferExtractor;
