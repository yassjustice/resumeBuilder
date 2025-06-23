const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text from image-based PDF using Gemini Vision OCR
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImagePDF(pdfBuffer) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured for OCR');
    }

    // Convert PDF to base64 for Gemini Vision
    const base64Data = pdfBuffer.toString('base64');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `
Extract all text content from this CV/resume document. 
Focus on capturing:
- Personal information (name, contact details)
- Professional summary or objective
- Work experience (job titles, companies, dates, responsibilities)
- Education details
- Skills and competencies
- Certifications and achievements
- Any other relevant career information

Return the extracted text in a clean, readable format while preserving the structure and hierarchy of information.
`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const extractedText = response.text();
    
    console.log('✅ Gemini Vision OCR completed');
    console.log('📝 Extracted text length:', extractedText.length);
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Gemini Vision OCR failed:', error);
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from image files using Gemini Vision OCR
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(imageBuffer, mimeType) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured for OCR');
    }

    // Convert image to base64 for Gemini Vision
    const base64Data = imageBuffer.toString('base64');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `
Extract all text content from this CV/resume image. 
Focus on capturing:
- Personal information (name, contact details)
- Professional summary or objective  
- Work experience (job titles, companies, dates, responsibilities)
- Education details
- Skills and competencies
- Certifications and achievements
- Any other relevant career information

Return the extracted text in a clean, readable format while preserving the structure and hierarchy of information.
`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const extractedText = response.text();
    
    console.log('✅ Gemini Vision image OCR completed');
    console.log('📝 Extracted text length:', extractedText.length);
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Gemini Vision image OCR failed:', error);
    throw new Error(`Image OCR extraction failed: ${error.message}`);
  }
}

/**
 * @route   GET /api/ai/test
 * @desc    Test AI service connectivity
 * @access  Public
 */
router.get('/test', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY not configured'
      });
    }    console.log('🧪 Testing Gemini AI connection...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ AI test successful');
    
    res.json({
      success: true,
      message: 'AI service is working',
      response: text
    });

  } catch (error) {
    console.error('❌ AI test failed:', error);
    res.status(500).json({
      success: false,
      message: 'AI service test failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/files/upload
 * @desc    Upload and process CV file
 * @access  Public
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('🔄 File upload request received');
    console.log('📁 Request file:', req.file);
    console.log('📋 Request body:', req.body);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('✅ File uploaded successfully:', req.file.filename);
    const filePath = req.file.path;
    let extractedText = '';    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      console.log('📄 Processing PDF file...');
      const dataBuffer = await fs.readFile(filePath);
      
      try {
        // First try to extract text using pdf-parse (for text-based PDFs)
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
        
        // If no text extracted (likely image-based PDF), use Gemini Vision
        if (!extractedText || extractedText.trim().length < 50) {
          console.log('📸 PDF appears to be image-based, using Gemini Vision OCR...');
          extractedText = await extractTextFromImagePDF(dataBuffer);
        }
      } catch (pdfParseError) {
        console.log('⚠️ PDF parsing failed, trying Gemini Vision OCR...');
        extractedText = await extractTextFromImagePDF(dataBuffer);
      }
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('📄 Processing DOCX file...');
      const dataBuffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      extractedText = result.value;    } else if (req.file.mimetype === 'text/plain') {
      console.log('📄 Processing TXT file...');
      extractedText = await fs.readFile(filePath, 'utf8');
    } else if (req.file.mimetype.startsWith('image/')) {
      console.log('📸 Processing image file with Gemini Vision OCR...');
      const dataBuffer = await fs.readFile(filePath);
      extractedText = await extractTextFromImage(dataBuffer, req.file.mimetype);
    }

    console.log('📝 Extracted text length:', extractedText.length);

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.json({
      success: true,
      fileId: req.file.filename,
      extractedText: extractedText,
      message: 'File processed successfully'
    });

  } catch (error) {
    console.error('❌ File upload error:', error);
    
    // Clean up file if it exists
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/extract-cv
 * @desc    Extract structured CV data from text using AI
 * @access  Public
 */
router.post('/extract-cv', async (req, res) => {
  try {
    const { text } = req.body;

    console.log('🤖 CV extraction request received');
    console.log('📝 Text length:', text ? text.length : 0);

    if (!text) {
      console.log('❌ No text provided');
      return res.status(400).json({
        success: false,
        message: 'No text provided'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ Gemini API key not configured');
      return res.status(500).json({
        success: false,
        message: 'AI service not configured'
      });
    }    console.log('🔄 Initializing Gemini AI...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });    const prompt = `
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
    }  ],
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

ANALYSIS STEPS:
1. EXPERIENCE ANALYSIS: Review all work experience to identify career pattern and progression
2. SKILL ASSESSMENT: Examine skills to determine primary expertise and specialization 
3. SENIORITY EVALUATION: Calculate total years of experience and leadership indicators
4. INDUSTRY IDENTIFICATION: Determine the professional field/industry from experience
5. SPECIALIZATION FOCUS: Identify what they're most skilled/experienced in

TITLE GENERATION LOGIC:
- 0-2 years experience: "Junior [Specialization]" or "[Specialization]"
- 3-5 years experience: "[Specialization]" or "Mid-level [Specialization]"  
- 6-8 years experience: "Senior [Specialization]"
- 9+ years experience: "Senior [Specialization]" or "Lead [Specialization]"
- Management/Leadership experience: Add "Lead", "Manager", or "Director" as appropriate

EXAMPLES OF CONTEXTUAL ANALYSIS:
- If someone has 5 years of React development + Node.js backend work → "Full Stack Developer"
- If someone has 7 years across multiple frontend frameworks + team lead role → "Senior Frontend Developer"
- If someone has 3 years React + 2 years mobile apps → "Frontend & Mobile Developer"
- If someone has 6 years marketing + specializes in social media → "Senior Digital Marketing Specialist"
- If someone has 4 years data analysis + Python/SQL expertise → "Data Analyst"
- If someone has 8 years + manages teams + various tech projects → "Senior Technical Lead"

AVOID GENERIC TITLES:
❌ "Professional", "Specialist", "Expert", "Consultant" (unless that's their actual role)
❌ Just copying the field name like "Information Technology" or "Marketing"
❌ Overly broad titles that don't reflect their specific expertise

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

    console.log('🔄 Sending request to Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    console.log('📤 AI Response length:', jsonText.length);
    console.log('📄 AI Response preview:', jsonText.substring(0, 200) + '...');

    // Parse and validate the JSON response
    let cvData;
    try {
      // Clean the response text
      const cleanedText = jsonText.trim().replace(/```json|```/g, '');
      cvData = JSON.parse(cleanedText);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.log('⚠️  JSON parsing failed, trying to extract JSON...');
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          cvData = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON extracted successfully');
        } catch (secondParseError) {
          console.error('❌ Second JSON parse failed:', secondParseError.message);
          throw new Error('Invalid JSON response from AI');
        }
      } else {
        console.error('❌ No JSON found in response');
        console.log('🔍 Full response:', jsonText);
        
        // Fallback: return a basic structure with extracted text in summary
        cvData = {
          personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: ''
          },
          summary: text.substring(0, 500), // First 500 chars as summary
          experience: [],
          education: [],
          skills: [],
          languages: [],
          certifications: []
        };
        console.log('📝 Using fallback structure');
      }
    }

    console.log('✅ CV extraction completed successfully');

    res.json({
      success: true,
      data: cvData,
      message: 'CV data extracted successfully'
    });

  } catch (error) {
    console.error('❌ CV extraction error:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to extract CV data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/ai/extract-job-offer
 * @desc    Extract job offer requirements using AI
 * @access  Public
 */
router.post('/extract-job-offer', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'No text provided'
      });
    }    if (!process.env.GEMINI_API_KEY) {      return res.status(500).json({
        success: false,
        message: 'AI service not configured'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    let jobData;
    try {
      jobData = JSON.parse(jsonText);
    } catch (parseError) {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jobData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    res.json({
      success: true,
      data: jobData,
      message: 'Job offer data extracted successfully'
    });

  } catch (error) {
    console.error('Job offer extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract job offer data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/tailor-cv
 * @desc    Generate tailored CV using AI
 * @access  Public
 */
router.post('/tailor-cv', async (req, res) => {
  try {
    const { cv, jobOffer, additionalRequirements } = req.body;

    if (!cv || !jobOffer) {
      return res.status(400).json({
        success: false,
        message: 'CV and job offer data required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,        message: 'AI service not configured'
      });    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });    const prompt = `
You are an expert CV writer and career consultant. Tailor the following CV to match the job requirements while maintaining the highest professional standards.

Original CV:
${JSON.stringify(cv, null, 2)}

Job Offer:
${JSON.stringify(jobOffer, null, 2)}

${additionalRequirements ? `Additional Requirements: ${additionalRequirements}` : ''}

CRITICAL TAILORING INSTRUCTIONS:

🎯 CONTEXTUAL JOB TITLE ALIGNMENT:
- Analyze BOTH the candidate's experience AND the target job requirements
- Create a title that accurately reflects their experience level while aligning with the target role
- DO NOT just copy the job posting title - ensure it matches their actual experience level
- Consider the candidate's years of experience, expertise, and career progression

ALIGNMENT LOGIC:
1. If target role is "Senior Developer" but candidate has 2 years experience → use "Developer" or "Junior Developer"
2. If target role is "Developer" but candidate has 8 years + leadership → use "Senior Developer"
3. If target role is specific (e.g., "React Developer") and candidate has React expertise → align exactly
4. If target role is broad but candidate is specialized → use their specialization

EXAMPLES:
- Target: "Software Engineer" + Candidate: 6 years full-stack → "Senior Full Stack Developer"
- Target: "Senior Marketing Manager" + Candidate: 3 years marketing → "Digital Marketing Specialist"  
- Target: "Data Scientist" + Candidate: data analysis background → "Data Analyst" (if no ML/science experience)
- Target: "Frontend Developer" + Candidate: 5 years React/Vue → "Senior Frontend Developer"

MAINTAIN HONESTY: Never inflate titles beyond the candidate's actual experience level

🏷️ SKILLS OPTIMIZATION:
- Prioritize skills mentioned in the job offer across ALL skill categories
- Maintain the dynamic categorization structure from the original CV
- Reorder skills within categories to highlight job-relevant ones first
- Ensure skill levels accurately reflect experience for the target role
- Add skill categories if the job requires skills not previously categorized

📝 PROFESSIONAL SUMMARY REWRITE:
- Completely rewrite the summary to emphasize relevance to this specific role
- Include keywords from the job description naturally
- Highlight achievements and experience most relevant to the target position
- Maintain confident, human tone - avoid robotic language
- Make it feel personally crafted for this opportunity
- Keep 3-4 sentences maximum, ATS and human-optimized

⚡ ATS & CONTENT OPTIMIZATION:
- Use exact keywords from the job description where truthful and relevant
- Reorder experience bullet points to highlight job-relevant achievements first
- Ensure action verbs align with job requirements (led, developed, implemented, etc.)
- Maintain clear, professional language structure
- Optimize for both ATS scanning and human readability

🔒 INTEGRITY REQUIREMENTS:
- Maintain all factual information - never invent or exaggerate
- Keep the same JSON structure as the original CV
- Ensure all dates, companies, and achievements remain accurate
- Only reorder, emphasize, and optimize existing content

Return only the tailored CV JSON object, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    let tailoredCV;
    try {
      tailoredCV = JSON.parse(jsonText);
    } catch (parseError) {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        tailoredCV = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    res.json({
      success: true,
      data: tailoredCV,
      message: 'CV tailored successfully'
    });

  } catch (error) {
    console.error('CV tailoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to tailor CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/generate-cover-letter
 * @desc    Generate cover letter using AI
 * @access  Public
 */
router.post('/generate-cover-letter', async (req, res) => {
  try {
    const { cv, jobOffer, additionalRequirements } = req.body;

    if (!cv || !jobOffer) {
      return res.status(400).json({
        success: false,
        message: 'CV and job offer data required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {      return res.status(500).json({
        success: false,
        message: 'AI service not configured'
      });    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });    const prompt = `
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text();

    res.json({
      success: true,
      data: {
        content: coverLetter,
        createdAt: new Date().toISOString()
      },
      message: 'Cover letter generated successfully'
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/download/cover-letter
 * @desc    Generate PDF for cover letter content
 * @access  Public
 */
router.post('/download/cover-letter', async (req, res) => {
  try {
    const { content, fileName } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Cover letter content is required'
      });
    }

    // Simple HTML template for cover letter PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          h1 { color: #333; border-bottom: 2px solid #333; }
          p { margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <h1>Cover Letter</h1>
        <div>${content.replace(/\n/g, '<br>')}</div>
      </body>
      </html>
    `;

    // Use the existing PDF service to generate PDF
    const pdfService = require('../services/pdfService');
    const pdfBuffer = await pdfService.generateFromHtml(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'cover-letter'}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Cover letter PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
