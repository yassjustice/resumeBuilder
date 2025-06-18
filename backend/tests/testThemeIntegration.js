/**
 * Theme Integration Test
 * Tests the integration of themes with PDF generation
 */
const path = require('path');
const fs = require('fs');
const { generateEnhancedSmartPDF } = require('../services/index');
const { PROFESSIONAL_THEME } = require('../services/themes/professionalTheme');
const cvData = require('../utils/seedData');

// Define the modern theme based on ProjectDna.md
const MODERN_THEME = {
  colors: {
    primary: '#3498db',
    text: '#2c3e50',
    background: '#ffffff',
    border: '#3498db'
  },
  fonts: {
    main: 'Roboto, sans-serif',
    fallback: 'Arial, sans-serif'
  },
  spacing: {
    section: '16px',
    element: '10px',
    micro: '5px',
    large: '24px',
    tiny: '3px'
  },
  fontSizes: {
    name: '22pt',
    sectionHeader: '14pt',
    jobTitle: '12pt',
    body: '10pt',
    supporting: '9pt'
  },
  layout: {
    pageHeight: '297mm',
    pageWidth: '210mm',
    contentHeight: '257mm',
    sectionMinHeight: '40px',
    titleMinSpace: '30px'
  }
};

// Define the minimal theme based on ProjectDna.md
const MINIMAL_THEME = {
  colors: {
    primary: '#333333',
    text: '#333333',
    background: '#ffffff',
    border: '#999999'
  },
  fonts: {
    main: 'Open Sans, sans-serif',
    fallback: 'Arial, sans-serif'
  },
  spacing: {
    section: '20px',
    element: '12px',
    micro: '6px',
    large: '30px',
    tiny: '4px'
  },
  fontSizes: {
    name: '20pt',
    sectionHeader: '13pt',
    jobTitle: '11pt',
    body: '10pt',
    supporting: '9pt'
  },
  layout: {
    pageHeight: '297mm',
    pageWidth: '210mm',
    contentHeight: '257mm',
    sectionMinHeight: '40px',
    titleMinSpace: '30px'
  }
};

async function testThemeIntegration() {
  console.log('Testing theme integration with PDF generation...');
  
  // Define base options
  const baseOptions = {
    pageBreakThreshold: 80,
    titleSectionConnection: true,
    twoColumnSkills: true,
    twoColumnCertifications: true
  };
  
  // Generate PDF with professional theme
  console.log('Generating PDF with Professional theme...');
  const professionalPdf = await generateEnhancedSmartPDF(
    cvData,
    { ...baseOptions, theme: PROFESSIONAL_THEME }
  );
  fs.writeFileSync(path.join(__dirname, 'theme_professional.pdf'), professionalPdf);
  
  // Generate PDF with modern theme
  console.log('Generating PDF with Modern theme...');
  const modernPdf = await generateEnhancedSmartPDF(
    cvData,
    { ...baseOptions, theme: MODERN_THEME }
  );
  fs.writeFileSync(path.join(__dirname, 'theme_modern.pdf'), modernPdf);
  
  // Generate PDF with minimal theme
  console.log('Generating PDF with Minimal theme...');
  const minimalPdf = await generateEnhancedSmartPDF(
    cvData,
    { ...baseOptions, theme: MINIMAL_THEME }
  );
  fs.writeFileSync(path.join(__dirname, 'theme_minimal.pdf'), minimalPdf);
  
  console.log('Theme integration test completed successfully!');
  console.log('PDFs generated:');
  console.log('- theme_professional.pdf');
  console.log('- theme_modern.pdf');
  console.log('- theme_minimal.pdf');
}

testThemeIntegration().catch(console.error);
