/**
 * Professional Cover Letter Formatting Test
 * Tests the new formatting system to ensure perfect output
 */

const ProfessionalCoverLetterService = require('../services/ai/professionalCoverLetterService');

// Sample data for testing
const sampleCV = {
  personalInfo: {
    firstName: "Yassir",
    lastName: "Hakimi",
    email: "yassir.hakimi@email.com",
    phone: "+1234567890"
  },
  experience: [
    {
      position: "Full Stack Developer",
      company: "TechStartup Inc",
      description: "Developed responsive web applications using React.js, Node.js, and MongoDB."
    }
  ],
  skills: {
    technical: ["React.js", "Next.js", "Node.js", "Express.js", "MongoDB"]
  }
};

const sampleJobOffer = {
  title: "Senior Full Stack Developer",
  company: "Masterlys",
  requirements: ["React.js experience", "Node.js proficiency", "Full-stack development"]
};

async function testProfessionalFormatting() {
  console.log('🧪 Testing Professional Cover Letter Formatting');
  console.log('=' .repeat(60));

  try {
    const service = new ProfessionalCoverLetterService();
    
    console.log('\n📝 Generating cover letter...');
    const result = await service.generateCoverLetter(
      sampleCV, 
      sampleJobOffer, 
      '', 
      'en'
    );

    console.log('\n✅ Cover letter generated successfully!');
    console.log('📊 Word count:', result.wordCount);
    console.log('🌍 Language:', result.language);
    
    console.log('\n📄 Generated Content:');
    console.log('─'.repeat(60));
    console.log(result.content);
    console.log('─'.repeat(60));

    // Check formatting quality
    console.log('\n🔍 Formatting Quality Checks:');
    
    const content = result.content;
    const lines = content.split('\n');
    
    // Check for date
    const hasDate = lines.some(line => service.isDateLine(line.trim()));
    console.log(`   📅 Has Date: ${hasDate ? '✅' : '❌'}`);
    
    // Check for greeting
    const hasGreeting = lines.some(line => service.isGreeting(line.trim()));
    console.log(`   👋 Has Greeting: ${hasGreeting ? '✅' : '❌'}`);
    
    // Check for closing
    const hasClosing = lines.some(line => service.isClosing(line.trim()));
    console.log(`   📝 Has Closing: ${hasClosing ? '✅' : '❌'}`);
    
    // Check for signature
    const hasSignature = lines.some(line => service.isSignature(line.trim(), 'Yassir Hakimi'));
    console.log(`   ✍️ Has Signature: ${hasSignature ? '✅' : '❌'}`);
    
    // Check for company mention
    const hasCompany = content.includes('Masterlys');
    console.log(`   🏢 Mentions Company: ${hasCompany ? '✅' : '❌'}`);
    
    // Check for position mention
    const hasPosition = content.includes('Senior Full Stack Developer');
    console.log(`   💼 Mentions Position: ${hasPosition ? '✅' : '❌'}`);
    
    // Check for proper tech names (no line breaks)
    const hasBrokenTech = /React\.\s+js|Node\.\s+js|Next\.\s+js/.test(content);
    console.log(`   🔧 Tech Names OK: ${!hasBrokenTech ? '✅' : '❌'}`);
    
    // Check for no brackets or placeholders
    const hasPlaceholders = /\[.*?\]|\{.*?\}|YOUR_|COMPANY_|POSITION_/.test(content);
    console.log(`   🚫 No Placeholders: ${!hasPlaceholders ? '✅' : '❌'}`);
    
    // Check paragraph structure
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 20);
    console.log(`   📄 Paragraph Count: ${paragraphs.length} ${paragraphs.length >= 3 ? '✅' : '❌'}`);
    
    // Test PDF generation
    console.log('\n📄 Testing PDF generation...');
    try {
      const pdfBuffer = await service.generateCoverLetterPDF(result.content);
      console.log(`   📄 PDF Generated: ${pdfBuffer && pdfBuffer.length > 0 ? '✅' : '❌'}`);
      console.log(`   📦 PDF Size: ${pdfBuffer ? pdfBuffer.length : 0} bytes`);
    } catch (pdfError) {
      console.log(`   📄 PDF Generated: ❌ (${pdfError.message})`);
    }

    // Overall assessment
    const checks = [hasDate, hasGreeting, hasClosing, hasSignature, hasCompany, hasPosition, !hasBrokenTech, !hasPlaceholders, paragraphs.length >= 3];
    const passedChecks = checks.filter(Boolean).length;
    const totalChecks = checks.length;
    
    console.log('\n📊 OVERALL RESULTS:');
    console.log(`   Quality Score: ${passedChecks}/${totalChecks} (${(passedChecks/totalChecks*100).toFixed(1)}%)`);
    
    if (passedChecks === totalChecks) {
      console.log('   🌟 EXCELLENT! Perfect formatting achieved!');
    } else if (passedChecks >= totalChecks * 0.8) {
      console.log('   👍 GOOD! Minor improvements needed.');
    } else {
      console.log('   ⚠️ NEEDS WORK! Significant formatting issues remain.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run test if script is executed directly
if (require.main === module) {
  testProfessionalFormatting().catch(console.error);
}

module.exports = testProfessionalFormatting;
