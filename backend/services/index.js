/**
 * Main PDF Service Index - CLEANED UP
 * Only the enhanced smart PDF generator with all 3 tasks implemented
 */

// Enhanced PDF generator with all 3 tasks
const { generateEnhancedSmartPDF } = require('./pdf/smartPageBreakPdfGenerator');

// HTML generator with smart page breaks
const { generateSmartPageBreakHTML } = require('./html/smartPageBreakHtmlGenerator');

// Utilities
const { validateCVData, getLayoutSuggestions, optimizeLayoutForContent } = require('./utils/cvValidation');

// Theme
const { PROFESSIONAL_THEME } = require('./themes/professionalTheme');

module.exports = {
  // PDF generation with all 3 tasks implemented
  generateEnhancedSmartPDF,
  
  // HTML generation
  generateSmartPageBreakHTML,
  
  // Validation and optimization
  validateCVData,
  getLayoutSuggestions,
  optimizeLayoutForContent,
  
  // Theme
  PROFESSIONAL_THEME
};
