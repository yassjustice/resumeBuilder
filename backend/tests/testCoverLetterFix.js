/**
 * Test script for Cover Letter Service - Mission Critical Fix Verification
 * Ensures cover letters are completely polished with no placeholders or incomplete content
 */

const CoverLetterService = require('../services/ai/coverLetterService');

// Mock CV data for testing
const mockCV = {
  personalInfo: {
    firstName: "Yassir",
    lastName: "Hakimi",
    title: "Full Stack Developer",
    email: "yassirhakimi60@gmail.com",
    phone: "+212605616855",
    location: "Sala Al Jadida, Morocco"
  },
  summary: "Versatile Full Stack Developer with 2+ years of experience in web and mobile application development using MERN stack, React Native, and ASP.NET.",
  experience: [
    {
      company: "Freelance",
      position: "Full Stack Developer & Digital Solutions Consultant",
      startDate: "11/2024",
      endDate: "Present",
      description: "Developing custom business catalogues and digitalization solutions for small businesses across diverse industries"
    },
    {
      company: "CloudLink",
      position: "React Developer",
      startDate: "01/2024",
      endDate: "03/2024",
      description: "Received training on Amazon Web Services (AWS) cloud infrastructure and integrated APIs in React Native applications"
    }
  ],
  skills: {
    "Programming Languages": ["JavaScript", "React.js", "Node.js"],
    "Cloud Platforms": ["AWS", "Azure"],
    "Development Tools": ["Git", "Visual Studio", "Bootstrap"]
  }
};

// Mock job offer for testing
const mockJobOffer = {
  company: "Sobrus",
  title: "Frontend Developer",
  requirements: [
    "Experience with React.js",
    "Responsive web design",
    "UI/UX principles",
    "API integration"
  ],
  description: "Join our healthcare technology team to build innovative frontend solutions"
};

async function testCoverLetterGeneration() {
  console.log('🧪 Testing Cover Letter Service - Mission Critical Fix');
  console.log('=' .repeat(60));
  
  const coverLetterService = new CoverLetterService();
  
  try {
    // Test English cover letter
    console.log('\n📝 Testing English Cover Letter Generation...');
    const englishResult = await coverLetterService.generateCoverLetter(
      mockCV, 
      mockJobOffer, 
      'Focus on React.js experience and responsive design skills',
      'en'
    );
    
    console.log('\n📋 English Cover Letter Quality Check:');
    console.log('-'.repeat(40));
    
    const englishContent = englishResult.content;
    
    // Quality checks
    const qualityChecks = {
      'Has Date': /\w+ \d{1,2}, \d{4}/.test(englishContent),
      'Has Greeting': /Dear\s+\w+/i.test(englishContent),
      'Has Subject': /subject/i.test(englishContent),
      'Mentions Company': englishContent.toLowerCase().includes('sobrus'),
      'Mentions Position': englishContent.toLowerCase().includes('frontend'),
      'Has Closing': /(sincerely|best regards)/i.test(englishContent),
      'Has Name': englishContent.toLowerCase().includes('hakimi'),
      'No Brackets': !/\[|\]/.test(englishContent),
      'No Curly Braces': !/\{|\}/.test(englishContent),
      'No Edit Instructions': !/edit|customize|fill/i.test(englishContent),
      'Proper Length': englishContent.split(/\s+/).length >= 100,
      'No AI Clichés': !/(results?-driven|team player|detail-oriented)/i.test(englishContent)
    };
    
    Object.entries(qualityChecks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    const passedChecks = Object.values(qualityChecks).filter(Boolean).length;
    const totalChecks = Object.keys(qualityChecks).length;
    console.log(`\n📊 Quality Score: ${passedChecks}/${totalChecks} (${Math.round(passedChecks/totalChecks*100)}%)`);
    
    console.log('\n📄 Generated English Cover Letter:');
    console.log('='.repeat(60));
    console.log(englishContent);
    console.log('='.repeat(60));
    
    // Test French cover letter
    console.log('\n🇫🇷 Testing French Cover Letter Generation...');
    const frenchResult = await coverLetterService.generateCoverLetter(
      mockCV, 
      mockJobOffer, 
      'Mettez l\'accent sur l\'expérience React.js',
      'fr'
    );
    
    console.log('\n📋 French Cover Letter Quality Check:');
    console.log('-'.repeat(40));
    
    const frenchContent = frenchResult.content;
    
    const frenchQualityChecks = {
      'Has French Date': /\d{1,2}\s+\w+\s+\d{4}/.test(frenchContent),
      'Has French Greeting': /(madame|monsieur|cher)/i.test(frenchContent),
      'Mentions Company': frenchContent.toLowerCase().includes('sobrus'),
      'Has French Closing': /(cordialement|sincèrement)/i.test(frenchContent),
      'Has Name': frenchContent.toLowerCase().includes('hakimi'),
      'No Brackets': !/\[|\]/.test(frenchContent),
      'No English Words': !/\b(and|the|with|for|experience)\b/i.test(frenchContent),
      'Proper Length': frenchContent.split(/\s+/).length >= 100
    };
    
    Object.entries(frenchQualityChecks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    const frenchPassed = Object.values(frenchQualityChecks).filter(Boolean).length;
    const frenchTotal = Object.keys(frenchQualityChecks).length;
    console.log(`\n📊 French Quality Score: ${frenchPassed}/${frenchTotal} (${Math.round(frenchPassed/frenchTotal*100)}%)`);
    
    console.log('\n📄 Generated French Cover Letter:');
    console.log('='.repeat(60));
    console.log(frenchContent);
    console.log('='.repeat(60));
    
    // Overall assessment
    console.log('\n🎯 MISSION CRITICAL FIX ASSESSMENT:');
    console.log('='.repeat(60));
    
    const overallScore = (passedChecks + frenchPassed) / (totalChecks + frenchTotal) * 100;
    console.log(`📈 Overall Quality Score: ${Math.round(overallScore)}%`);
    
    if (overallScore >= 90) {
      console.log('🎉 MISSION CRITICAL FIX: SUCCESS');
      console.log('✅ Cover letters are professional, complete, and send-ready');
    } else if (overallScore >= 75) {
      console.log('⚠️ MISSION CRITICAL FIX: NEEDS MINOR IMPROVEMENTS');
      console.log('🔧 Some quality issues detected but generally acceptable');
    } else {
      console.log('❌ MISSION CRITICAL FIX: NEEDS MAJOR IMPROVEMENTS');
      console.log('🚨 Significant quality issues need to be addressed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}

// Run the test
testCoverLetterGeneration().then(() => {
  console.log('\n🏁 Cover Letter Service Test Completed');
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});

module.exports = { testCoverLetterGeneration };
