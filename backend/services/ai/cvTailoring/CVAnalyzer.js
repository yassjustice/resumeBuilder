/**
 * CV Analysis Module - Handles comprehensive CV and job analysis
 */
class CVAnalyzer {
  constructor(aiService) {
    this.aiService = aiService;
  }

  /**
   * Enhanced comprehensive analysis with language support
   */
  async performEnhancedComprehensiveAnalysis(normalizedCV, jobOffer, language) {
    const prompt = `
You are an expert career strategist and CV optimization specialist. Perform a comprehensive analysis of this CV against the job requirements with cultural context for ${language}.

Original CV:
${JSON.stringify(normalizedCV, null, 2)}

Job Offer:
${JSON.stringify(jobOffer, null, 2)}

Target Language: ${language}

ANALYSIS REQUIREMENTS:

🎯 MATCH ANALYSIS - COMPREHENSIVE SCORING:
- Calculate precise match percentage (0-100%)
- Identify exact skill matches vs. missing critical skills
- Analyze experience relevance and level alignment
- Assess cultural fit for target language/market

🔧 SKILLS OPTIMIZATION STRATEGY:
- Map CV skills to job requirements with precision
- Identify skill gaps and recommend reorganization
- Suggest skill category restructuring for maximum impact
- Recommend skills to emphasize vs. de-emphasize

💼 CONTENT STRATEGY - LANGUAGE AWARE:
- Recommend summary tone and content strategy
- Identify key experiences to highlight/expand
- Suggest project emphasis based on job requirements
- Recommend cultural adaptations for target language

🚨 CRITICAL OUTPUT - JSON ONLY:
{
  "matchScore": 85,
  "jobAnalysis": {
    "keyRequirements": ["requirement1", "requirement2"],
    "criticalSkills": ["skill1", "skill2"],
    "experienceLevel": "Senior|Mid|Junior",
    "industryFocus": "industry context"
  },
  "optimizationStrategy": {
    "titleStrategy": "recommended professional title",
    "summaryFocus": ["key point 1", "key point 2"],
    "skillsReorganization": {
      "emphasize": ["skill category 1", "skill category 2"],
      "restructure": ["suggested new category name"],
      "addMissing": ["missing skill category"]
    },
    "experienceHighlights": ["experience to emphasize"],
    "culturalAdaptations": "language-specific recommendations"
  },
  "riskAssessment": {
    "skillGaps": ["critical missing skill"],
    "experienceGaps": ["experience gap"],
    "recommendedActions": ["action 1", "action 2"]
  }
}

Return ONLY the JSON object:
`;

    try {
      const result = await this.aiService.generateContent(prompt, true);
      const content = result.content || result;
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error);
      // Fallback analysis
      return {
        matchScore: 70,
        jobAnalysis: { keyRequirements: [], criticalSkills: [], experienceLevel: "Mid", industryFocus: "General" },
        optimizationStrategy: { titleStrategy: "", summaryFocus: [], skillsReorganization: { emphasize: [], restructure: [], addMissing: [] }, experienceHighlights: [], culturalAdaptations: "" },
        riskAssessment: { skillGaps: [], experienceGaps: [], recommendedActions: [] }
      };
    }
  }

  /**
   * Analyze skills structure for enhanced processing
   */
  analyzeSkillsStructure(skills) {
    if (!skills) return { type: 'none', categories: 0, total: 0 };
    
    if (Array.isArray(skills)) {
      return { type: 'array', categories: 0, total: skills.length };
    }
    
    if (typeof skills === 'object') {
      const categories = Object.keys(skills);
      const total = categories.reduce((sum, cat) => sum + (Array.isArray(skills[cat]) ? skills[cat].length : 0), 0);
      return { type: 'categorized', categories: categories.length, total, categoryNames: categories };
    }
    
    return { type: 'unknown', categories: 0, total: 0 };
  }
}

module.exports = CVAnalyzer;
