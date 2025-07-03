/**
 * Test for Improved CV Tailoring - Natural & Authentic
 * Tests the fixes for over-quantification and skills addition issues
 */

const CVTailoringService = require('../services/ai/cvTailoringService');

async function testImprovedTailoring() {
  console.log('🧪 Testing Improved CV Tailoring Service...');
  
  const tailoringService = new CVTailoringService();

  // Sample original CV with realistic data
  const originalCV = {
    personalInfo: {
      name: "John Doe",
      title: "Web Developer",
      contact: {
        email: "john.doe@email.com",
        phone: "+1234567890"
      }
    },
    summary: "Web developer with experience in creating websites for small businesses using modern technologies.",
    experience: [
      {
        title: "Web Developer",
        company: "Tech Startup Inc",
        period: "2022 - Present",
        responsibilities: [
          "Developed responsive websites using React and Node.js",
          "Collaborated with design team to implement user interfaces",
          "Maintained and updated existing client websites"
        ]
      }
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built an online store using React and Express",
        technologies: ["React", "Express", "MongoDB"]
      }
    ],
    skills: {
      "Frontend": ["React", "JavaScript", "HTML", "CSS"],
      "Backend": ["Node.js", "Express"],
      "Database": ["MongoDB"]
    },
    education: [
      {
        degree: "Computer Science",
        institution: "University of Technology",
        period: "2018-2022"
      }
    ]
  };

  // Job offer that might tempt the AI to add irrelevant skills
  const jobOffer = {
    title: "Senior Full Stack Developer",
    description: "Looking for a senior developer with expertise in React, Node.js, Python, AWS, Docker, Kubernetes, and microservices architecture.",
    requirements: [
      "5+ years experience",
      "React and Node.js",
      "Python programming",
      "AWS cloud services",
      "Docker and Kubernetes",
      "Microservices architecture"
    ]
  };

  try {
    console.log('\n🎯 Testing CV tailoring with improved authenticity...');
    
    const tailoredCV = await tailoringService.tailorCV(originalCV, jobOffer);
    
    console.log('\n📊 Results Analysis:');
    
    // Check for over-quantification
    const experienceText = JSON.stringify(tailoredCV.experience);
    const hasOverQuantification = /\d+%|\d+\+|over \d+|resulting in \d+|increased by \d+|improved by \d+/i.test(experienceText);
    
    console.log(`❌ Over-quantification detected: ${hasOverQuantification ? 'YES - NEEDS FIX' : 'NO - GOOD'}`);
    
    // Check for added skills not in original
    const originalSkillsFlat = Object.values(originalCV.skills).flat();
    const tailoredSkillsFlat = Object.values(tailoredCV.skills || {}).flat();
    
    const addedSkills = tailoredSkillsFlat.filter(skill => 
      !originalSkillsFlat.some(originalSkill => 
        originalSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(originalSkill.toLowerCase())
      )
    );
    
    console.log(`📝 Original skills count: ${originalSkillsFlat.length}`);
    console.log(`📝 Tailored skills count: ${tailoredSkillsFlat.length}`);
    console.log(`❌ Unverified skills added: ${addedSkills.length > 0 ? addedSkills.join(', ') : 'NONE - GOOD'}`);
    
    // Check experience enhancement quality
    if (tailoredCV.experience && tailoredCV.experience[0]) {
      const originalExp = originalCV.experience[0];
      const tailoredExp = tailoredCV.experience[0];
      
      console.log('\n📈 Experience Enhancement:');
      console.log(`Original: ${originalExp.responsibilities[0]}`);
      console.log(`Tailored: ${tailoredExp.responsibilities ? tailoredExp.responsibilities[0] : 'N/A'}`);
    }
    
    // Check if authentic technologies are preserved
    const originalTechs = originalCV.projects[0].technologies;
    const tailoredTechs = tailoredCV.projects && tailoredCV.projects[0] ? tailoredCV.projects[0].technologies : [];
    
    const techsPreserved = originalTechs.every(tech => 
      tailoredTechs.some(tailoredTech => 
        tailoredTech.toLowerCase().includes(tech.toLowerCase())
      )
    );
    
    console.log(`🔧 Original project technologies preserved: ${techsPreserved ? 'YES - GOOD' : 'NO - NEEDS FIX'}`);
    
    console.log('\n✅ Improved tailoring test completed!');
    
    return {
      overQuantification: hasOverQuantification,
      addedSkills: addedSkills.length,
      techsPreserved,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Export for use in other tests
module.exports = { testImprovedTailoring };

// Run if called directly
if (require.main === module) {
  testImprovedTailoring()
    .then(result => {
      console.log('\n🏁 Test Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test crashed:', error);
      process.exit(1);
    });
}
