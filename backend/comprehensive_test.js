/**
 * Comprehensive Test Script for CV PDF Generation
 * This script provides detailed output and error checking
 */
const { generatePrecisePDF } = require('./services/pdf/precisePdfGenerator');
const CV = require('./models/CV');
const fs = require('fs');
const path = require('path');

// Enable more detailed console output
process.env.DEBUG = 'true';

// Helper function to log with timestamp
function logWithTime(message, type = 'info') {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const prefix = `[${timestamp}]`;
  
  switch(type) {
    case 'error':
      console.error(`${prefix} ERROR: ${message}`);
      break;
    case 'warning':
      console.warn(`${prefix} WARNING: ${message}`);
      break;
    case 'success':
      console.log(`${prefix} SUCCESS: ${message}`);
      break;
    default:
      console.log(`${prefix} INFO: ${message}`);
  }
}

async function checkDependencies() {
  try {
    logWithTime('Checking dependencies...');
    const puppeteer = require('puppeteer');
    logWithTime('Puppeteer is installed correctly', 'success');
    
    // Check if smartPageBreakHtmlGenerator is available
    const { generateSmartPageBreakHTML } = require('./services/html/smartPageBreakHtmlGenerator');
    if (typeof generateSmartPageBreakHTML !== 'function') {
      throw new Error('generateSmartPageBreakHTML is not a function');
    }
    logWithTime('HTML generator is available', 'success');
    
    return true;
  } catch (error) {
    logWithTime(`Dependency check failed: ${error.message}`, 'error');
    return false;
  }
}

async function runComprehensiveTest() {
  try {
    logWithTime('Starting comprehensive PDF test...');
    
    // First check dependencies
    const dependenciesOk = await checkDependencies();
    if (!dependenciesOk) {
      logWithTime('Test cannot continue due to missing dependencies', 'error');
      return false;
    }
    
    // Get a CV from the database
    logWithTime('Fetching CV from database...');
    const cv = await CV.findOne({ isActive: true });
    
    if (!cv) {
      logWithTime('No active CV found in database', 'error');
      return false;
    }
    
    logWithTime(`Found CV: ${cv.personalInfo?.name || 'Unnamed CV'}`);
    
    // Log CV structure to help debug
    logWithTime('CV structure check:');
    console.log('- personalInfo:', !!cv.personalInfo);
    console.log('  - name:', !!cv.personalInfo?.name);
    console.log('  - contact:', !!cv.personalInfo?.contact);
    console.log('- summary:', !!cv.summary);
    console.log('- skills:', !!cv.skills);
    console.log('- experience:', cv.experience?.length || 0, 'items');
    console.log('- education:', cv.education?.length || 0, 'items');
    console.log('- certifications:', cv.certifications?.length || 0, 'items');
    console.log('- languages:', cv.languages?.length || 0, 'items');
    
    // PDF generation options
    const options = {
      pageBreakThreshold: 85,
      titleSectionConnection: true,
      twoColumnSkills: true,
      sectionSpacing: 2,
      elementSpacing: 2
    };
    
    logWithTime('Generating PDF with options:');
    console.log(options);
    
    // Generate PDF
    logWithTime('Starting PDF generation process...');
    const startTime = Date.now();
    const pdfBuffer = await generatePrecisePDF(cv, options);
    const endTime = Date.now();
    
    logWithTime(`PDF generation completed in ${(endTime - startTime)/1000} seconds`, 'success');
    logWithTime(`PDF size: ${Math.round(pdfBuffer.length / 1024)} KB`);
    
    // Save the PDF with timestamp to avoid overwriting
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const fileName = `comprehensive_test_${timestamp}.pdf`;
    const outputPath = path.join(__dirname, '..', fileName);
    
    fs.writeFileSync(outputPath, pdfBuffer);
    logWithTime(`PDF saved to: ${outputPath}`, 'success');
    
    return true;
  } catch (error) {
    logWithTime(`Test failed: ${error.message}`, 'error');
    console.error(error.stack);
    return false;
  }
}

// Connect to MongoDB and run test
logWithTime('Initializing test...');
require('./config/database')()
  .then(() => {
    logWithTime('Connected to database', 'success');
    return runComprehensiveTest();
  })
  .then((success) => {
    if (success) {
      logWithTime('Comprehensive test completed successfully', 'success');
    } else {
      logWithTime('Comprehensive test failed', 'error');
      process.exit(1);
    }
  })
  .catch(err => {
    logWithTime(`Failed to connect to database: ${err.message}`, 'error');
    console.error(err.stack);
    process.exit(1);
  });
