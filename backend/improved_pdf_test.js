/**
 * Test script for improved PDF generation
 */
const pdfService = require('./services/pdfService');
const CV = require('./models/CV');
const fs = require('fs');
const path = require('path');

async function testImprovedPDF() {
  try {
    console.log('Starting improved PDF generation test...');
    
    // Get a CV from the database
    const cv = await CV.findOne({ isActive: true });
    
    if (!cv) {
      console.error('No active CV found in database');
      process.exit(1);
    }
    
    console.log(`Testing improved PDF generation for CV: ${cv.personalInfo.name}`);
    
    // Generate PDF with improved layout
    const pdfBuffer = await pdfService.generatePrecisePDF(cv, {
      pageBreakThreshold: 85,
      titleSectionConnection: true,
      twoColumnSkills: true,
      sectionSpacing: 2,
      elementSpacing: 2
    });
    
    // Save the PDF
    const outputPath = path.join(__dirname, '../improved_cv.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`Improved PDF generated and saved to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error testing improved PDF generator:', error);
    process.exit(1);
  }
}

// Connect to MongoDB
require('./config/database')()
  .then(() => {
    console.log('Connected to database');
    return testImprovedPDF();
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
