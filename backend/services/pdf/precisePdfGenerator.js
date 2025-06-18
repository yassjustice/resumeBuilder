/**
 * Precise PDF Generator
 * Generates PDFs with precise layout control
 */

const puppeteer = require('puppeteer');
const { APIError } = require('../../middleware/errorHandler');
const { generateSmartPageBreakHTML } = require('../html/smartPageBreakHtmlGenerator');

/**
 * Generate PDF with precise layout control
 */
const generatePrecisePDF = async (cvData, options = {}) => {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Generate HTML with precise layout
    const preciseOptions = {
      ...options,
      pageBreakThreshold: options.pageBreakThreshold || 85, // mm from bottom (larger threshold)
      titleSectionConnection: options.titleSectionConnection !== false,
      twoColumnSkills: options.twoColumnSkills !== false,
      sectionSpacing: options.sectionSpacing || 2, // Slightly larger spacing
      elementSpacing: options.elementSpacing || 2  // Slightly larger spacing
    };
    
    const htmlContent = generateSmartPageBreakHTML(cvData, preciseOptions);
    
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });
    
    // Precise PDF options
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      scale: 1.0
    };    // Wait for content to be fully rendered
    await page.evaluate(() => {
      return new Promise(resolve => {
        // Force layout recalculation
        const body = document.body;
        const height = body.offsetHeight;
        
        // Add a small delay to ensure fonts and styles are fully loaded
        // This is important for proper rendering of multi-column layouts
        setTimeout(() => {
          console.log(`Content height: ${height}px`);
          resolve();
        }, 500); // Increased timeout for better rendering
      });
    });

    const pdfBuffer = await page.pdf(pdfOptions);
    
    console.log('Precise PDF generated successfully');
    return pdfBuffer;

  } catch (error) {
    console.error('Precise PDF Generation Error:', error);
    throw new APIError(`Precise PDF generation failed: ${error.message}`, 500);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  generatePrecisePDF
};