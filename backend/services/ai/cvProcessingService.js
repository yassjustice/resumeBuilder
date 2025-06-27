/**
 * CV Processing Service - Handles CV extraction and tailoring
 * Uses AI to extract structured data from CV text and tailor CVs to job offers
 */
const AIService = require('./aiService');

class CVProcessingService {
  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Extract structured CV data from text using AI
   * @param {string} text - Raw CV text
   * @returns {Promise<Object>} - Structured CV data
   */
  async extractCVFromText(text) {
    if (!text) {
      throw new Error('No text provided');
    }

    console.log('🤖 CV extraction request received');
    console.log('📝 Text length:', text.length);

    const prompt = this.buildExtractionPrompt(text);
    
    console.log('🔄 Sending request to Gemini AI...');
    const jsonText = await this.aiService.generateContent(prompt);

    console.log('📤 AI Response length:', jsonText.length);
    console.log('📄 AI Response preview:', jsonText.substring(0, 200) + '...');

    try {
      const cvData = this.aiService.parseAIResponse(jsonText);
      console.log('✅ CV extraction completed successfully');
      return cvData;
    } catch (error) {
      console.error('❌ CV extraction error:', error);
      
      // Fallback: return a basic structure with extracted text in summary
      const fallbackData = {
        personalInfo: {
          firstName: '',
          lastName: '',
          title: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          website: ''
        },
        summary: text.substring(0, 500), // First 500 chars as summary
        experience: [],
        education: [],
        skills: {},
        languages: [],
        certifications: []
      };
      console.log('📝 Using fallback structure');
      return fallbackData;
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
  "summary": "",  "experience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "location": ""
    }
  ],

🎯 EXPERIENCE POSITION EXTRACTION - CRITICAL:
- For the "position" field in experience entries, NEVER use "Intern" or "Trainee" as the job title
- Extract the actual role/function performed, not the employment classification
- BUT acknowledge internship status in the description field when relevant
- Examples: 
  * "Marketing Intern" → Position: "Marketing Associate", Description: "Internship role focusing on..."
  * "Software Engineering Intern" → Position: "Software Developer", Description: "Internship position developing..."
- Use industry-standard job titles that reflect the actual responsibilities
- Mention internship context naturally in the job description to maintain transparency
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

ANALYSIS STEPS:
1. EXPERIENCE ANALYSIS: Review all work experience to identify career pattern and progression
   - Separate internships from full-time positions
   - Calculate total professional experience (including internships as partial experience)
   - Identify career progression trajectory from internships to full-time roles
2. SKILL ASSESSMENT: Examine skills to determine primary expertise and specialization 
3. SENIORITY EVALUATION: Calculate total years of experience and leadership indicators
   - Internships count as 0.5x experience (6-month internship = 3 months professional experience)
   - Full-time roles count as full experience
   - Consider progression: Intern → Junior → Mid-level → Senior
4. INDUSTRY IDENTIFICATION: Determine the professional field/industry from experience
5. SPECIALIZATION FOCUS: Identify what they're most skilled/experienced in

TITLE GENERATION LOGIC (ENHANCED FOR MEANINGFUL ROLES):
- NEVER use "Intern" - always extract the actual role performed
- For current/recent internships: Use the actual job function (e.g., "Software Developer", "Marketing Specialist", "Data Analyst")
- Add seniority prefix based on total experience: "Junior [Role]" for 0-2 years, "[Role]" for 2-5 years, "Senior [Role]" for 5+ years
- Focus on what they DO, not their employment classification
- Examples: "Marketing Intern" → "Digital Marketing Specialist", "Dev Intern" → "Software Developer"

INTERNSHIP ROLE EXTRACTION EXAMPLES:
- "Marketing Intern at Company X" → Position: "Digital Marketing Specialist", Description: "Internship role managing social media campaigns and analyzing customer engagement metrics..."
- "Software Engineering Intern" → Position: "Software Developer", Description: "Internship position developing full-stack web applications using React and Node.js..."
- "Data Science Intern" → Position: "Data Analyst", Description: "Internship role analyzing customer data and building predictive models..."
- "UX Design Intern" → Position: "UX Designer", Description: "Internship position designing user interfaces and conducting usability testing..."
- "Business Analyst Intern" → Position: "Business Analyst", Description: "Internship role conducting market research and process optimization..."
- "Finance Intern" → Position: "Financial Analyst", Description: "Internship position performing financial modeling and investment analysis..."

EXAMPLES OF CONTEXTUAL ANALYSIS:
- If someone has 5 years of React development + Node.js backend work → "Full Stack Developer"
- If someone has 7 years across multiple frontend frameworks + team lead role → "Senior Frontend Developer"
- If someone has 3 years React + 2 years mobile apps → "Frontend & Mobile Developer"
- If someone has 6 years marketing + specializes in social media → "Senior Digital Marketing Specialist"
- If someone has 4 years data analysis + Python/SQL expertise → "Data Analyst"
- If someone has 8 years + manages teams + various tech projects → "Senior Technical Lead"

INTERNSHIP CONTEXTUAL EXAMPLES:
- Marketing intern who managed social media campaigns → Position: "Social Media Marketing Specialist", Description: "Internship role developing and executing social media strategies..."
- Software engineering intern who built full-stack applications → Position: "Full Stack Developer", Description: "Internship position building web applications using modern frameworks..."
- Data science intern who created ML models → Position: "Machine Learning Engineer", Description: "Internship role developing predictive models and data analysis pipelines..."
- Finance intern who performed financial analysis → Position: "Financial Analyst", Description: "Internship position conducting financial modeling and market research..."
- Design intern who created user interfaces → Position: "UI/UX Designer", Description: "Internship role designing user experiences and conducting user research..."
- Business development intern who conducted market research → Position: "Business Analyst", Description: "Internship position analyzing market trends and competitive landscape..."

CAREER PROGRESSION RECOGNITION:
- Intern → Junior → Regular → Senior progression should be reflected in title
- Don't penalize someone for starting with internships - focus on their current capabilities
- Consider the trajectory: someone who interned 5 years ago and now has senior responsibilities should have a senior title
- Internships show initiative and early career development, not current skill level

AVOID GENERIC TITLES:
❌ "Professional", "Specialist", "Expert", "Consultant" (unless that's their actual role)
❌ Just copying the field name like "Information Technology" or "Marketing"
❌ Overly broad titles that don't reflect their specific expertise

🚨 CRITICAL TITLE EXTRACTION MISTAKES TO AVOID:
❌ Using "Intern" as any part of the job title
❌ Using generic terms like "Intern", "Trainee", "Student" as job titles
❌ Ignoring the actual work performed during internships
❌ Not extracting meaningful professional roles from internship descriptions
❌ Defaulting to "Intern" when the person performed real professional work

✅ CORRECT APPROACH FOR ROLE EXTRACTION:
✅ Extract the actual job function and responsibilities performed
✅ Use professional, industry-standard job titles
✅ Focus on WHAT they did, not their employment status
✅ Analyze the job description/responsibilities to determine the real role
✅ Use context clues from technologies, tasks, and achievements to determine precise titles
✅ MAINTAIN TRANSPARENCY: Include internship context naturally in job descriptions
✅ Balance professionalism with honesty about the nature of the experience

🔍 TRANSPARENCY GUIDELINES:
- Job Title: Professional role (e.g., "Software Developer")
- Job Description: Natural mention of internship context (e.g., "Internship role where I...")
- Keep the experience honest while presenting it professionally
- Acknowledge the learning/development aspect when relevant
- Show progression and growth throughout the internship experience

PRIORITIZE ACCURACY AND RELEVANCE:
✅ Reflect their actual level of experience and expertise
✅ Match their primary area of specialization
✅ Include appropriate seniority level
✅ Use industry-standard professional titles
✅ Consider their career trajectory and current capabilities

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
- Healthcare Worker: "Medical Equipment", "Healthcare Software", "Clinical Skills", "Patient Management Systems", "Medical Certifications"
- Designer: "Design Software", "Prototyping Tools", "Creative Platforms", "Typography & Layout", "User Experience Design"
- Project Manager: "Project Management Tools", "Methodologies", "Communication Platforms", "Resource Planning", "Quality Assurance"
- Sales Professional: "CRM Systems", "Sales Tools", "Prospecting Platforms", "Presentation Software", "Customer Analysis"

Always include "Soft Skills" or "Interpersonal Skills" as one category for communication, leadership, etc.
Never use generic "Other" unless absolutely necessary - create specific relevant categories instead.

📝 PROFESSIONAL SUMMARY:
- Create a compelling, human-sounding professional summary
- Use confident, natural language - never robotic or templated
- Avoid clichés like "results-driven", "team player", "detail-oriented"
- Include specific years of experience, key achievements, and value proposition
- Make it feel personal and tailored to this individual's career story
- Use action-oriented language and quantifiable achievements when mentioned in CV
- Maximum 3-4 sentences, optimized for both ATS and human readability
- Include relevant keywords naturally from their experience and skills

⚡ ATS & READABILITY OPTIMIZATION:
- Use clear, straightforward sentence structures
- Include relevant action verbs (developed, implemented, led, designed, etc.)
- Ensure keywords from experience and skills appear naturally in summary
- Use standard industry terminology
- Maintain professional tone while being engaging

CV Text:
${text}
`;
  }

  /**
   * Extract job offer requirements using AI
   * @param {string} text - Job offer text
   * @returns {Promise<Object>} - Structured job offer data
   */
  async extractJobOffer(text) {
    if (!text) {
      throw new Error('No text provided');
    }

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

    const jsonText = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(jsonText);
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
    const jsonText = await this.aiService.generateContent(prompt);
    return this.aiService.parseAIResponse(jsonText);
  }

  /**
   * Build the tailoring prompt for CV optimization
   * @param {Object} cv - Original CV data
   * @param {Object} jobOffer - Job offer data
   * @param {string} additionalRequirements - Additional requirements
   * @returns {string} - Complete prompt
   */  buildTailoringPrompt(cv, jobOffer, additionalRequirements) {
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
4. Enhance achievements with quantifiable metrics where possible
5. Ensure perfect alignment with job requirements and company culture
6. Maintain complete factual accuracy - NEVER invent or exaggerate

🚨 PROFESSIONAL TITLE OPTIMIZATION:
- Analyze the job title and requirements to determine the most relevant professional title
- If the current title doesn't align with the target role, suggest the most appropriate title that reflects their actual experience
- Consider industry standards and role progression
- Examples: "Software Engineer" → "Full Stack Developer" (if job requires full stack), "Marketing Associate" → "Digital Marketing Specialist" (if focused on digital)
- NEVER use "Intern" - always use professional equivalent based on actual work performed
- Ensure the title appeals to both ATS and hiring managers
- Balance accuracy with target role alignment

ROLE ALIGNMENT LOGIC:
1. If target role is "Senior Developer" but candidate has 2 years experience → use "Developer" or "Software Developer"
2. If target role is "Developer" but candidate has 6+ years + leadership → use "Senior Developer"
3. If target role is specific (e.g., "React Developer") and candidate has React expertise → align exactly
4. If target role is broad but candidate is specialized → use their specialization
5. Calculate total professional experience including internships but don't diminish current capabilities

📝 PROFESSIONAL SUMMARY TRANSFORMATION:
Create a completely new, compelling summary that:
- Opens with a powerful value proposition statement aligned with the job requirements
- Includes specific years of experience relevant to the target role
- Highlights 2-3 key achievements that directly relate to job requirements
- Incorporates critical keywords from the job description naturally
- Mentions relevant technologies, methodologies, or industry knowledge
- Concludes with a forward-looking statement about value they'll bring to this role
- Uses confident, human language - never robotic or templated
- 3-4 sentences maximum, optimized for both ATS and human appeal
- Avoid clichés: "results-driven", "team player", "detail-oriented", "passionate"

💼 EXPERIENCE SECTION ENHANCEMENT:
For each position, optimize as follows:

1. **Job Titles**: Ensure alignment with industry standards and target role relevance
2. **Company Context**: If applicable, add brief company description for lesser-known companies
3. **Achievement Optimization**:
   - Lead each role with the most relevant achievements for the target job
   - Quantify achievements with metrics, percentages, and specific outcomes
   - Use powerful action verbs that match job description language
   - Focus on results and impact, not just responsibilities
   - Include technology stack and methodologies mentioned in job requirements
4. **Keyword Integration**: Naturally weave in relevant keywords from job description
5. **Skill Demonstration**: Show progression and increasing responsibility
6. **ATS Optimization**: Use standard formatting and clear section headers

🎓 EDUCATION ENHANCEMENT:
- Highlight relevant coursework, projects, or thesis topics that align with job requirements
- Include GPA if above 3.5 and recent graduate
- Mention relevant certifications or academic achievements
- For career changers, emphasize transferable skills from education

🏅 SKILLS SECTION TRANSFORMATION:
Create dynamic, job-specific skill categories:

1. **Technical Skills Priority Order**:
   - Lead with skills directly mentioned in job requirements
   - Group by relevance: Required → Preferred → Additional
   - Use exact terminology from job description when possible

2. **Dynamic Categorization** (adapt to job field):
   - **Software Development**: "Programming Languages", "Frameworks & Libraries", "Development Tools", "Databases & Cloud", "DevOps & Deployment"
   - **Marketing**: "Digital Marketing Platforms", "Analytics & Data Tools", "Content Management", "Campaign Management", "Marketing Automation"
   - **Data Science**: "Programming & Analytics", "Machine Learning", "Data Visualization", "Databases & Big Data", "Statistical Software"
   - **Project Management**: "PM Methodologies", "Project Management Tools", "Collaboration Platforms", "Process Optimization", "Leadership & Communication"
   - **Design**: "Design Software", "Prototyping Tools", "User Research", "Design Systems", "Creative Platforms"

3. **Skill Optimization Rules**:
   - Prioritize skills that appear in job requirements
   - Include skill variations (e.g., "JavaScript" and "JS", "PostgreSQL" and "Postgres")
   - Balance technical and soft skills appropriately for the role
   - Remove or de-emphasize irrelevant skills
   - Add "Soft Skills" category highlighting interpersonal abilities mentioned in job requirements

🏆 CERTIFICATIONS & LANGUAGES:
- Prioritize certifications relevant to the target role
- Include certification dates and validity periods
- For languages, emphasize those mentioned in job requirements
- Include business/professional language proficiency where relevant

🔍 KEYWORD OPTIMIZATION STRATEGY:
1. **Primary Keywords** (5-10): Most critical terms from job title and requirements
2. **Secondary Keywords** (10-15): Supporting skills and qualifications
3. **Long-tail Keywords**: Specific phrases from job description
4. **Natural Integration**: Weave keywords organically throughout content
5. **Density Balance**: 2-3% keyword density - visible but not stuffed
6. **Variation Usage**: Include synonyms and related terms

⚡ ATS OPTIMIZATION TECHNIQUES:
1. **Standard Section Headers**: Use conventional headings (Experience, Education, Skills, etc.)
2. **Clean Formatting**: Avoid tables, columns, graphics, or unusual fonts
3. **Keyword Placement**: Strategic placement in summary, experience, and skills
4. **Job Title Matching**: Align position titles with industry standards
5. **Technology Mentions**: Include all relevant technical terms
6. **Action Verb Optimization**: Use strong, relevant action verbs
7. **Quantified Achievements**: Include numbers, percentages, and measurable outcomes

🎨 COMPELLING NARRATIVE CREATION:
Transform each section to tell a cohesive story:
- **Opening Hook**: Summary that immediately positions candidate as ideal fit
- **Progressive Narrative**: Show career growth and increasing responsibilities
- **Achievement Focus**: Emphasize outcomes and value delivered
- **Relevance Priority**: Most relevant information appears first in each section
- **Future Alignment**: Demonstrate clear path to target role success

🔒 INTEGRITY & ACCURACY REQUIREMENTS:
- Maintain ALL factual information - dates, companies, roles, education
- NEVER invent achievements, projects, or responsibilities
- Only optimize and reframe existing content
- Preserve the original JSON structure exactly
- Ensure all claims are verifiable and truthful
- Focus on presentation and emphasis, not fabrication

📊 ACHIEVEMENT QUANTIFICATION GUIDELINES:
When optimizing achievements, focus on:
- Scale/Scope: Team size, project size, budget managed
- Performance: Efficiency gains, quality improvements, targets exceeded
- Impact: Revenue generated, costs saved, processes improved
- Growth: User growth, market expansion, skill development
- Recognition: Awards, promotions, positive feedback

🎯 TARGET ALIGNMENT CHECKLIST:
✅ Professional title aligns with target role
✅ Summary directly addresses job requirements
✅ Top 3-5 job requirements clearly addressed in experience
✅ Required skills prominently featured and categorized
✅ Industry-specific terminology used throughout
✅ Achievement metrics relate to job success criteria
✅ Company culture fit subtly demonstrated
✅ Career progression shows readiness for target role

📋 FINAL OUTPUT REQUIREMENTS:
Return a completely transformed CV in the exact same JSON structure as the original, with:
- Enhanced professional title
- Completely rewritten, job-targeted summary
- Optimized experience descriptions with strategic keyword placement
- Reorganized and prioritized skills sections
- Enhanced education and certifications
- Improved overall ATS compatibility and human appeal

The result should be a CV that:
1. Passes ATS screening with high relevance scores
2. Compels hiring managers to schedule interviews
3. Demonstrates clear value proposition for the specific role
4. Maintains complete factual accuracy and integrity
5. Stands out among hundreds of applications

Return only the tailored CV JSON object, no additional text or explanations.
`;
  }
}

module.exports = CVProcessingService;
