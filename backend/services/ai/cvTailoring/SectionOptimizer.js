/**
 * Section Optimization Module - Handles optimization of all CV sections
 */
class SectionOptimizer {
  constructor(aiService) {
    this.aiService = aiService;
  }

  /**
   * Optimize all sections with enhanced features
   */
  async optimizeAllSectionsEnhanced(normalizedCV, analysis, language) {
    const prompt = `
You are an expert CV section optimizer. Optimize all CV sections for maximum impact while preserving authenticity.

Original CV:
${JSON.stringify(normalizedCV, null, 2)}

Analysis:
${JSON.stringify(analysis, null, 2)}

Target Language: ${language}

SECTION OPTIMIZATION REQUIREMENTS:

🎯 SKILLS OPTIMIZATION - CRITICAL:
- PRESERVE the categorized skills structure if it exists
- Reorganize skills to match job requirements priority
- Create new categories if beneficial for the target role
- Ensure all technical skills are properly categorized
- Add "Soft Skills" category with relevant interpersonal skills
- Structure: { "Category Name": ["Skill1", "Skill2", "Skill3"] }

💼 EXPERIENCE OPTIMIZATION:
- Enhance job descriptions to highlight relevant achievements
- Add quantifiable results where appropriate and authentic
- Reframe responsibilities to match target role language
- Preserve company names and dates exactly

🎓 EDUCATION & CERTIFICATIONS:
- Optimize degree and field descriptions for relevance
- Highlight relevant coursework if applicable
- Optimize certification names and descriptions

🌐 LANGUAGES SECTION:
- Optimize language proficiency descriptions
- Add target market language if relevant

🚨 CRITICAL OUTPUT - JSON ONLY:
{
  "experience": [...optimized experience array...],
  "projects": [...optimized projects array...],
  "education": [...optimized education array...],
  "skills": {...categorized skills object...},
  "certifications": [...optimized certifications...],
  "languages": [...optimized languages...]
}

Return ONLY the JSON object:
`;

    try {
      const result = await this.aiService.generateContent(prompt, true);
      const content = result.content || result;
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Enhanced section optimization failed:', error);
      return {
        experience: normalizedCV.experience,
        projects: normalizedCV.projects,
        education: normalizedCV.education,
        skills: normalizedCV.skills,
        certifications: normalizedCV.certifications,
        languages: normalizedCV.languages
      };
    }
  }
}

module.exports = SectionOptimizer;
