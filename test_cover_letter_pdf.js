/**
 * Test cover letter PDF generation directly
 */
const path = require('path');
const fs = require('fs');

// Import the cover letter service
const CoverLetterService = require('./backend/services/ai/coverLetterService');

async function testCoverLetterPDF() {
  console.log('🧪 Testing cover letter PDF generation...');
  
  const coverLetterService = new CoverLetterService();
  
  const testContent = `Dear Hiring Manager,

I am writing to express my strong interest in the Software Developer position at your company. With my background in JavaScript and full-stack development, I believe I would be a valuable addition to your team.

My experience includes:
- Frontend development with React and Vue.js
- Backend development with Node.js and Express
- Database management with MongoDB and PostgreSQL
- API development and integration

I am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my skills and enthusiasm can benefit your organization.

Thank you for your consideration.

Sincerely,
John Doe`;

  try {
    console.log('🔄 Generating test cover letter PDF...');
    const pdfBuffer = await coverLetterService.generateCoverLetterPDF(testContent, 'test-cover-letter');
    
    console.log('✅ PDF generated successfully');
    console.log('📦 Buffer size:', pdfBuffer.length);
    console.log('📦 Buffer type:', typeof pdfBuffer);
    console.log('📦 Is Buffer:', Buffer.isBuffer(pdfBuffer));
    
    // Write to file for testing
    const outputPath = path.join(__dirname, 'test_cover_letter_output.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log('💾 PDF saved to:', outputPath);
    
    // Check first few bytes to see if it's a valid PDF
    const firstBytes = pdfBuffer.slice(0, 10).toString();
    console.log('🔍 First bytes:', firstBytes);
    console.log('🔍 Starts with %PDF?', firstBytes.startsWith('%PDF'));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCoverLetterPDF();
