/**
 * Final Test Script for CV PDF Generation
 */
const { generatePrecisePDF } = require('./services/pdf/precisePdfGenerator');
const CV = require('./models/CV');
const fs = require('fs');
const path = require('path');

async function testAllFormats() {
  try {
    console.log('Starting comprehensive PDF test...');
    
    // Get all CVs to test with different data formats
    const cvs = await CV.find({ isActive: true }).limit(2);
    
    if (!cvs || cvs.length === 0) {
      console.error('No active CVs found in database');
      process.exit(1);
    }
    
    for (let i = 0; i < cvs.length; i++) {
      const cv = cvs[i];
      console.log(`Testing PDF generation for CV [${i+1}/${cvs.length}]: ${cv.personalInfo?.name || 'Unnamed'}`);
      
      const options = {
        pageBreakThreshold: 85,
        titleSectionConnection: true,
        twoColumnSkills: true,
        sectionSpacing: 2,
        elementSpacing: 2
      };
      
      // Generate PDF with precise PDF generator
      const pdfBuffer = await generatePrecisePDF(cv, options);
      
      // Save the PDF
      const fileName = `cv_${i+1}_${cv.personalInfo?.name?.replace(/\s+/g, '_') || 'unnamed'}.pdf`;
      const outputPath = path.join(__dirname, '../', fileName);
      fs.writeFileSync(outputPath, pdfBuffer);
      
      console.log(`PDF generated and saved to: ${outputPath}`);
    }
    
    console.log('All PDF tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in PDF generation tests:', error);
    process.exit(1);
  }
}

// Connect to MongoDB
require('./config/database')()
  .then(() => {
    console.log('Connected to database');
    return testAllFormats();
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });