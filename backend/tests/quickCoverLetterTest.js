/**
 * Quick Cover Letter Test
 * Tests the new modular cover letter service
 */

const CoverLetterService = require('../services/ai/coverLetterService');

// Test data
const testCV = {
  personalInfo: {
    firstName: "Yassir",
    lastName: "Hakimi",
    email: "yassir@example.com"
  },
  experience: [{
    company: "TechCorp",
    position: "Full Stack Developer",
    description: "Developed web applications using React.js and Node.js"
  }],
  skills: {
    technical: ["React.js", "Next.js", "Node.js"]
  }
};

const testJob = {
  company: "Masterlys",
  title: "Développeur Fullstack (Next.js)",
  requirements: ["React.js experience", "Full stack development"]
};

async function testCoverLetter() {
  console.log('🧪 Testing New Modular Cover Letter Service');
  console.log('='.repeat(50));
  
  try {
    const service = new CoverLetterService();
    
    // Test English
    console.log('\n📝 Testing English...');
    const englishResult = await service.generateCoverLetter(testCV, testJob, '', 'en');
    
    console.log('✅ English generation successful');
    console.log('📊 Word count:', englishResult.wordCount);
    console.log('📄 Content preview:');
    console.log(englishResult.content.substring(0, 200) + '...');
    
    // Test French
    console.log('\n🇫🇷 Testing French...');
    const frenchResult = await service.generateCoverLetter(testCV, testJob, '', 'fr');
    
    console.log('✅ French generation successful');
    console.log('📊 Word count:', frenchResult.wordCount);
    console.log('📄 Content preview:');
    console.log(frenchResult.content.substring(0, 200) + '...');
    
    // Quality checks
    const checks = {
      'Has proper date': /\w+.*\d{4}/.test(englishResult.content),
      'Has greeting': /Dear|Madame/.test(englishResult.content),
      'Has company name': englishResult.content.includes('Masterlys'),
      'Has position': englishResult.content.includes('Fullstack'),
      'Has closing': /Sincerely|Cordialement/.test(englishResult.content),
      'Has candidate name': englishResult.content.includes('Yassir Hakimi'),
      'No brackets': !/\[|\]/.test(englishResult.content),
      'Fixed tech names': /React\.js/.test(englishResult.content)
    };
    
    console.log('\n🔍 Quality Checks:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    console.log(`\n📈 Score: ${passedChecks}/${Object.keys(checks).length}`);
    
    if (passedChecks >= 7) {
      console.log('🎉 SUCCESS: Modular solution working perfectly!');
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT: Some checks failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testCoverLetter();
}

module.exports = testCoverLetter;
