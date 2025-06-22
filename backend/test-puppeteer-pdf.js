const pdfService = require('./services/pdfService');

const testCV = {
  personalInfo: { 
    name: 'Test User', 
    contact: { email: 'test@test.com', phone: '123-456-7890' } 
  },
  summary: 'Test summary for PDF generation',
  experience: [{
    title: 'Software Developer',
    company: 'Test Company',
    startDate: '2020-01',
    endDate: '2023-12',
    description: 'Developed software applications'
  }],
  education: [{
    degree: 'Bachelor of Science',
    institution: 'Test University',
    graduationDate: '2020-05'
  }],
  skills: {
    technical: ['JavaScript', 'Node.js', 'React'],
    soft: ['Communication', 'Problem Solving']
  }
};

async function testPuppeteerPDF() {
  try {
    console.log('🚀 Testing Puppeteer PDF generation...');
    const buffer = await pdfService.generatePDF(testCV);
    console.log('✅ PDF generated successfully, size:', buffer.length);
    
    require('fs').writeFileSync('test-puppeteer-only.pdf', buffer);
    console.log('✅ PDF saved as test-puppeteer-only.pdf');
    
    // Test if it's a valid PDF
    const fs = require('fs');
    const firstBytes = fs.readFileSync('test-puppeteer-only.pdf').slice(0, 4);
    if (firstBytes.toString() === '%PDF') {
      console.log('✅ Generated file is a valid PDF');
    } else {
      console.log('❌ Generated file is NOT a valid PDF');
    }
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.error('Error details:', error);
  }
}

testPuppeteerPDF();
