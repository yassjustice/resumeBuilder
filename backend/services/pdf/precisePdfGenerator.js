/**
 * Precise PDF Generator
 * Generates PDFs with precise layout control
 */

const puppeteer = require('puppeteer');
const { APIError } = require('../../middleware/errorHandler');
const { generateSmartPageBreakHTML } = require('../html/smartPageBreakHtmlGenerator');

/**
 * Generate PDF with retry logic for Windows Puppeteer issues
 */
const generatePrecisePDFWithRetry = async (cvData, options = {}, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 PDF generation attempt ${attempt}/${maxRetries}`);
      return await generatePrecisePDF(cvData, options);
    } catch (error) {
      console.error(`❌ PDF generation attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error; // Re-throw on final attempt
      }
      
      // Wait before retry
      console.log(`⏳ Waiting before retry attempt ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

/**
 * Generate PDF with precise layout control
 */
const generatePrecisePDF = async (cvData, options = {}) => {
  let browser;
  
  try {    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-first-run',
        '--disable-default-apps'
      ],
      timeout: 30000,
      protocolTimeout: 60000 // Increased protocol timeout
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
    });    console.log('🔄 Generating PDF...');
    const pdfBuffer = await page.pdf(pdfOptions);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }
    
    console.log('✅ Precise PDF generated successfully, size:', pdfBuffer.length);
    return pdfBuffer;

  } catch (error) {
    console.error('Precise PDF Generation Error:', error);
    throw new APIError(`Precise PDF generation failed: ${error.message}`, 500);  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.warn('Warning: Browser cleanup failed:', closeError.message);
        // Force kill browser processes on Windows if normal close fails
        try {
          const pages = await browser.pages();
          await Promise.all(pages.map(page => page.close().catch(() => {})));
          await browser.close();
        } catch (forceCloseError) {
          console.warn('Warning: Force browser close failed:', forceCloseError.message);
        }
      }
    }
  }
};

module.exports = {
  generatePrecisePDF: generatePrecisePDFWithRetry // Export the version with retry logic
};