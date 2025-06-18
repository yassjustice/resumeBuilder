/**
 * Language-aware PDF Test
 * Tests PDF generation with different languages
 */
const { generatePrecisePDF } = require('./services/pdf/precisePdfGenerator');
const CV = require('./models/CV');
const fs = require('fs');
const path = require('path');

// Get language from environment variable or use English as default
const language = process.env.LANGUAGE || 'en';
console.log(`Using language: ${language}`);

async function testLanguagePDF() {
  try {
    console.log('Starting language-aware PDF test...');
    
    // Get an active CV to use as template
    const cv = await CV.findOne({ isActive: true });
    
    if (!cv) {
      console.error('No active CV found in database');
      process.exit(1);
    }
    
    // Override the language
    cv.language = language;
    console.log(`Testing PDF generation for CV: ${cv.personalInfo?.name || 'Unnamed'} in ${language}`);
    
    const options = {
      pageBreakThreshold: 85,
      titleSectionConnection: true,
      twoColumnSkills: true,
      sectionSpacing: 2,
      elementSpacing: 2,
      language
    };
    
    // Generate PDF
    const pdfBuffer = await generatePrecisePDF(cv, options);
    
    // Save the PDF with language code in filename
    const fileName = `${language}_cv.pdf`;
    const outputPath = path.join(__dirname, '..', '..', fileName);
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`PDF generated and saved to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error in PDF generation test:', error);
    process.exit(1);
  }
}

// Connect to MongoDB
require('./config/database')()
  .then(() => {
    console.log('Connected to database');
    return testLanguagePDF();
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
