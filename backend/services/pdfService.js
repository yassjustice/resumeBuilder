/**
 * PDF Service - Clean Implementation
 * Uses the precise PDF generator for all PDF generation
 */

const { generatePrecisePDF } = require('./pdf/precisePdfGenerator');
const { generateSmartPageBreakHTML } = require('./html/smartPageBreakHtmlGenerator');
const puppeteer = require('puppeteer');

// Import utilities
const { validateCVData, getLayoutSuggestions, optimizeLayoutForContent } = require('./utils/cvValidation');
const { PROFESSIONAL_THEME } = require('./themes/professionalTheme');

/**
 * Generate PDF from HTML string
 */
const generateFromHtml = async (html, options = {}) => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      ...options
    });
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

/**
 * Generate PDF from CV data
 */
const generatePDF = async (cvData, options = {}) => {
  return generatePrecisePDF(cvData, options);
};

// Export only what we need
module.exports = {
  // Main PDF generation function now using precise generator
  generateEnhancedSmartPDF: generatePrecisePDF,
  generatePrecisePDF,
  generatePDF,
  generateFromHtml,
  
  // HTML generation
  generateSmartPageBreakHTML,
  
  // Legacy compatibility - all point to precise version
  generateCVPDF: generatePrecisePDF,
  generatePreciseCVPDF: generatePrecisePDF,
  generateOptimizedCVPDF: generatePrecisePDF,
  
  // Utilities
  validateCVData,
  getLayoutSuggestions,
  optimizeLayoutForContent,
  PROFESSIONAL_THEME
};
