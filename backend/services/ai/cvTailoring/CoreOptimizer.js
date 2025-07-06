/**
 * Core Optimization Module - Handles title and summary optimization
 */
class CoreOptimizer {
  constructor(aiService) {
    this.aiService = aiService;
  }

  /**
   * Generate enhanced core optimizations with cultural context and advanced job matching
   */
  async generateEnhancedCoreOptimizations(normalizedCV, analysis, language) {
    const prompt = `
You are an expert professional title optimizer and summary writer with deep knowledge of global job markets. Generate an optimized professional title and summary that perfectly aligns with the target job opportunity.

CV Data:
${JSON.stringify(normalizedCV, null, 2)}

Job Analysis & Requirements:
${JSON.stringify(analysis, null, 2)}

Target Language: ${language}

ADVANCED OPTIMIZATION REQUIREMENTS:

🎯 TITLE OPTIMIZATION - STRATEGIC POSITIONING:
- Create a compelling professional title that matches EXACT job requirements
- Consider experience level progression and industry standards
- Incorporate key role-specific terminology from job requirements
- Adapt for ${language} market expectations and title conventions
- Balance specificity with broad appeal (e.g., "Senior Full Stack Developer" vs "Full Stack Developer")
- Avoid generic titles, make it specific, powerful, and ATS-optimized

🧠 STRATEGIC TITLE ANALYSIS:
- If 0-2 years experience → Use "Junior", "Associate", or "Entry-level" prefixes
- If 3-5 years experience → Use specific role title (e.g., "React Developer", "Marketing Specialist")
- If 5+ years experience → Use "Senior", "Lead", or specialized titles
- For career changes → Focus on transferable skills and new field targeting
- For consultants/freelancers → Emphasize expertise area and value proposition

📝 SUMMARY OPTIMIZATION - COMPELLING NARRATIVE WITH QUANTIFIED IMPACT:
- Write in a confident, professional tone appropriate for ${language} business culture
- Start with years of experience and primary expertise area
- Include 2-3 most relevant achievements with quantifiable impact when possible
- Highlight skills that directly match job requirements (use EXACT keywords)
- Mention industry expertise and value proposition
- Include technology stack and specializations relevant to the role
- End with career objective or value statement
- Maximum 4 sentences, optimized for both ATS and human readers
- Integrate keywords from job analysis naturally and strategically

🌐 CULTURAL ADAPTATION FOR ${language.toUpperCase()}:
${language === 'fr' ? `
- Use French professional conventions and formal language
- Emphasize education and certifications (valued in French market)
- Use confident but humble tone
- Include industry-specific French terminology
` : language === 'ar' ? `
- Respect Arabic professional formalities and cultural context
- Emphasize team collaboration and respect
- Use appropriate Arabic business terminology
- Structure for RTL reading direction
` : `
- Use direct, achievement-focused American/British professional style
- Emphasize results and impact
- Use action-oriented language
- Include quantifiable achievements
`}

🔥 KEYWORD INTEGRATION STRATEGY:
- Identify top 5-7 keywords from job requirements
- Integrate them naturally into title and summary
- Maintain readability while maximizing ATS score
- Use variations and synonyms of key terms
- Include both hard skills (technical) and soft skills when relevant

🚨 CRITICAL OUTPUT REQUIREMENT - JSON ONLY:
{
  "title": "Optimized Professional Title with Strategic Keywords",
  "summary": "Compelling professional summary with quantified achievements, exact job keywords, and cultural adaptation for [language] market. Must be achievement-focused, ATS-optimized, and human-engaging."
}

VALIDATION CHECKLIST:
✅ Title includes relevant seniority level and exact role match
✅ Summary includes years of experience and quantified achievements
✅ Keywords from job requirements integrated naturally
✅ Tone and style appropriate for ${language} professional culture
✅ Length optimized for ATS (title: 2-4 words, summary: 3-4 sentences)
✅ Compelling value proposition that differentiates candidate

Return ONLY the JSON object:
`;

    try {
      const result = await this.aiService.generateContent(prompt, true);
      const content = result.content || result;
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Enhanced core optimizations failed:', error);
      return {
        title: normalizedCV.personalInfo?.title || '',
        summary: normalizedCV.summary || ''
      };
    }
  }
}

module.exports = CoreOptimizer;
