/**
 * Professional Theme Configuration
 * Theme settings for professional CV styling
 */

/**
 * Professional theme configuration with advanced layout control
 */
const PROFESSIONAL_THEME = {
  colors: {
    primary: '#2c3e50',
    text: '#000000',
    background: '#ffffff',
    border: '#2c3e50'
  },
  fonts: {
    main: 'Georgia, serif',
    fallback: 'Times New Roman, serif'
  },
  spacing: {
    section: '8px',      // Reduced from 16px
    element: '6px',      // Reduced from 10px
    micro: '3px',        // Reduced from 4px
    large: '12px',       // Reduced from 24px
    tiny: '2px'
  },
  fontSizes: {
    name: '20pt',
    sectionHeader: '12pt',
    jobTitle: '11pt',
    body: '10pt',
    supporting: '9pt'
  },
  layout: {
    pageHeight: '297mm', // A4 height
    pageWidth: '210mm',  // A4 width
    contentHeight: '257mm', // Available content height after margins
    sectionMinHeight: '40px', // Minimum height to keep section together
    titleMinSpace: '30px' // Minimum space required after section title
  }
};

module.exports = {
  PROFESSIONAL_THEME
};
