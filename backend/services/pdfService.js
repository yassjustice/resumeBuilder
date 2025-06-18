/**
 * PDF Service - Clean Implementation
 * Uses the precise PDF generator for all PDF generation
 */

const { generatePrecisePDF } = require('./pdf/precisePdfGenerator');
const { generateSmartPageBreakHTML } = require('./html/smartPageBreakHtmlGenerator');

// Import utilities
const { validateCVData, getLayoutSuggestions, optimizeLayoutForContent } = require('./utils/cvValidation');
const { PROFESSIONAL_THEME } = require('./themes/professionalTheme');

// Export only what we need
module.exports = {
  // Main PDF generation function now using precise generator
  generateEnhancedSmartPDF: generatePrecisePDF,
  generatePrecisePDF,
  
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
