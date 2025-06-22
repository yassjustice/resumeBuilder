// Simple test to verify PDF generation with actual CV data
const pdfService = require('./services/pdfService');

const testCV = {
  "personalInfo": {
    "firstName": "YASSIR",
    "lastName": "HAKIMI",
    "email": "yassir.hakimi@example.com",
    "phone": "+1-234-567-8900",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/yassirhakimi",
    "website": "yassirhakimi.dev"
  },
  "summary": "Versatile Full Stack Developer and IT Technician with expertise in modern web technologies, system administration, and technical support. Proficient in React, Node.js, and database management with a strong foundation in both frontend and backend development.",
  "experience": [
    {
      "title": "Full Stack Developer",
      "company": "Tech Solutions Inc.",
      "period": "2022-01 - Present",
      "responsibilities": ["Developed web applications using React and Node.js", "Managed database operations with MongoDB and MySQL"]
    }
  ],
  "education": [
    {
      "institution": "University of Technology",
      "degree": "Bachelor of Science in Computer Science",
      "field": "Computer Science",
      "period": "2018-09 - 2022-06",
      "grade": "3.8/4.0"
    }
  ],
  "skills": {
    "technical": ["JavaScript", "React", "Node.js", "MongoDB", "MySQL", "HTML", "CSS"],
    "soft": ["Problem Solving", "Team Collaboration", "Communication"]
  },
  "languages": [
    {
      "language": "English",
      "level": "Native"
    },
    {
      "language": "French",
      "level": "Professional"
    }
  ],
  "certifications": [
    {
      "name": "Full Stack Web Development",
      "issuer": "Tech Institute",
      "type": "Certificate",
      "skills": "React, Node.js, MongoDB"
    }
  ]
};

async function testSinglePDFGeneration() {
  try {
    console.log('🚀 Testing single PDF generation...');
    console.log('📋 Test CV data for:', testCV.personalInfo.firstName, testCV.personalInfo.lastName);
    
    const startTime = Date.now();
    const pdfBuffer = await pdfService.generatePDF(testCV);
    const endTime = Date.now();
    
    console.log('✅ PDF generated successfully!');
    console.log('📊 Size:', pdfBuffer.length, 'bytes');
    console.log('⏱️ Time taken:', (endTime - startTime), 'ms');
    
    // Save to file
    require('fs').writeFileSync('test-single-generation.pdf', pdfBuffer);
    console.log('💾 PDF saved as test-single-generation.pdf');
    
    // Verify it's a valid PDF
    const firstBytes = pdfBuffer.slice(0, 4).toString();
    if (firstBytes === '%PDF') {
      console.log('✅ Generated file is a valid PDF');
    } else {
      console.log('❌ Generated file is NOT a valid PDF, first bytes:', firstBytes);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSinglePDFGeneration();
