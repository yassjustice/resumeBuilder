/**
 * Test for Header section in PDF generation
 */
const { generatePrecisePDF } = require('./services/pdf/precisePdfGenerator');
const { generateSmartPageBreakHTML } = require('./services/html/smartPageBreakHtmlGenerator');
const CV = require('./models/CV');
const fs = require('fs');
const path = require('path');

// Test CV data with different header formats
const testData = {
  personalInfo: {
    name: 'John Doe',
    title: 'Senior Software Developer',
    contact: {
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      portfolio: 'johndoe.dev'
    }
  },
  summary: 'Experienced software developer with 10+ years experience in full-stack development.',
  skills: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
    frameworks: ['React', 'Node.js', 'Express', 'Next.js'],
    databases: ['MongoDB', 'PostgreSQL', 'MySQL'],
    tools: ['Git', 'Docker', 'AWS', 'CI/CD']
  }
};

async function testHeader() {
  try {
    console.log('Starting header test...');
    
    // Get a real CV from the database
    const dbCv = await CV.findOne({ isActive: true });
    
    if (!dbCv) {
      console.error('No active CV found in database');
      process.exit(1);
    }
    
    // First test with real CV data
    console.log(`Testing header with real CV: ${dbCv.personalInfo?.name || 'Unnamed'}`);
    const realPdfBuffer = await generatePrecisePDF(dbCv, {
      pageBreakThreshold: 85,
      titleSectionConnection: true,
      twoColumnSkills: true
    });
    
    // Save the real CV PDF
    const realOutputPath = path.join(__dirname, '../', 'header_test_real.pdf');
    fs.writeFileSync(realOutputPath, realPdfBuffer);
    console.log(`Real CV PDF saved to: ${realOutputPath}`);
    
    // Create a test CV with our test data
    const testCv = {
      ...dbCv.toObject(),
      personalInfo: testData.personalInfo
    };
    
    // Generate PDF with test data
    console.log('Testing header with test data');
    const testPdfBuffer = await generatePrecisePDF(testCv, {
      pageBreakThreshold: 85,
      titleSectionConnection: true,
      twoColumnSkills: true
    });
    
    // Save the test PDF
    const testOutputPath = path.join(__dirname, '../', 'header_test_sample.pdf');
    fs.writeFileSync(testOutputPath, testPdfBuffer);
    console.log(`Test CV PDF saved to: ${testOutputPath}`);
    
    console.log('Header tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in header test:', error);
    process.exit(1);
  }
}

// Connect to MongoDB
require('./config/database')()
  .then(() => {
    console.log('Connected to database');
    return testHeader();
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });