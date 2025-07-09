/**
 * Experience Scorer Utility
 * Advanced algorithms for scoring experience relevance to job requirements
 * Implements micro-effective scoring with multiple criteria
 */

class ExperienceScorer {
  constructor() {
    this.name = 'Experience Scorer';
    this.version = '1.0.0';
  }

  /**
   * Score experience relevance to job offer with enhanced algorithms
   */
  async scoreExperienceRelevance(experiences, jobAnalysis) {
    const scoredExperiences = [];
    
    console.log('🎯 MICRO-EFFECTIVE EXPERIENCE SCORING - Enhanced Algorithm');
    console.log(`📋 Analyzing ${experiences.length} experiences against job requirements`);
    
    for (const exp of experiences) {
      let score = 0;
      let matchDetails = {};
      
      // Prepare text for analysis
      const responsibilitiesText = Array.isArray(exp.responsibilities) ? exp.responsibilities.join(' ') : '';
      const expText = `${exp.title || ''} ${responsibilitiesText} ${exp.company || ''}`.toLowerCase();
      
      // 1. CRITICAL SKILLS MATCHING (High Impact)
      matchDetails.requiredSkillsMatched = [];
      if (jobAnalysis.requiredSkills) {
        for (const skill of jobAnalysis.requiredSkills) {
          if (expText.includes(skill.toLowerCase())) {
            score += 5; // High weight for required skills
            matchDetails.requiredSkillsMatched.push(skill);
          }
          
          // Check for skill variations and synonyms
          const skillVariations = this.generateSkillVariations(skill);
          for (const variation of skillVariations) {
            if (expText.includes(variation.toLowerCase()) && !matchDetails.requiredSkillsMatched.includes(skill)) {
              score += 4; // Slightly lower for variations
              matchDetails.requiredSkillsMatched.push(skill);
              break;
            }
          }
        }
      }
      
      // 2. PREFERRED SKILLS MATCHING (Medium Impact)
      matchDetails.preferredSkillsMatched = [];
      if (jobAnalysis.preferredSkills) {
        for (const skill of jobAnalysis.preferredSkills) {
          if (expText.includes(skill.toLowerCase())) {
            score += 3; // Medium weight for preferred skills
            matchDetails.preferredSkillsMatched.push(skill);
          }
        }
      }
      
      // 3. JOB TITLE SIMILARITY (Very High Impact)
      const titleSimilarity = this.calculateTitleSimilarity(exp.title, jobAnalysis.jobTitle);
      if (titleSimilarity > 0.7) {
        score += 8; // Very high weight for similar titles
        matchDetails.titleSimilarity = titleSimilarity;
      } else if (titleSimilarity > 0.4) {
        score += 4; // Medium weight for somewhat similar titles
        matchDetails.titleSimilarity = titleSimilarity;
      }
      
      // 4. RESPONSIBILITY DEPTH ANALYSIS
      const responsibilityDepth = this.analyzeResponsibilityDepth(exp.responsibilities, jobAnalysis);
      score += responsibilityDepth.score;
      matchDetails.responsibilityDepth = responsibilityDepth;
      
      // 5. INDUSTRY RELEVANCE BOOST
      if (jobAnalysis.industry && expText.includes(jobAnalysis.industry.toLowerCase())) {
        score += 3; // Industry match boost
        matchDetails.industryMatch = true;
      }
      
      // 6. EXPERIENCE RECENCY BOOST
      const recencyBoost = this.calculateRecencyBoost(exp.period);
      score += recencyBoost.score;
      matchDetails.recencyBoost = recencyBoost;
      
      // 7. KEYWORD DENSITY ANALYSIS
      const keywordDensity = this.analyzeKeywordDensity(expText, jobAnalysis.keywords);
      score += keywordDensity.score;
      matchDetails.keywordDensity = keywordDensity;
      
      // 8. ACHIEVEMENT INDICATORS
      const achievementScore = this.scoreAchievementIndicators(responsibilitiesText);
      score += achievementScore.score;
      matchDetails.achievementScore = achievementScore;
      
      console.log(`📊 DEEP ANALYSIS - ${exp.company} (${exp.title}): ${score} points`);
      console.log(`   ✅ Required Skills: ${matchDetails.requiredSkillsMatched.length}/${jobAnalysis.requiredSkills?.length || 0}`);
      console.log(`   🎯 Title Similarity: ${(matchDetails.titleSimilarity * 100 || 0).toFixed(1)}%`);
      console.log(`   📝 Responsibility Depth: ${matchDetails.responsibilityDepth.score}`);
      console.log(`   🕒 Recency Boost: ${matchDetails.recencyBoost.score}`);
      
      scoredExperiences.push({
        experience: exp,
        relevanceScore: score,
        matchDetails: matchDetails
      });
    }
    
    // Sort by relevance score and log final ranking
    const sortedExperiences = scoredExperiences.sort((a, b) => b.relevanceScore - a.relevanceScore);
    console.log('🏆 FINAL EXPERIENCE RANKING:');
    sortedExperiences.forEach((scoredExp, index) => {
      console.log(`   ${index + 1}. ${scoredExp.experience.company} - ${scoredExp.relevanceScore} points`);
    });
    
    return sortedExperiences;
  }

  /**
   * Generate skill variations and synonyms for better matching
   */
  generateSkillVariations(skill) {
    const skillLower = skill.toLowerCase();
    const variations = [];
    
    // Common technology variations
    const techVariations = {
      'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
      'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy'],
      'java': ['spring', 'maven', 'gradle', 'hibernate'],
      'react': ['reactjs', 'react.js', 'jsx'],
      'node.js': ['nodejs', 'node', 'express'],
      'sql': ['mysql', 'postgresql', 'database', 'queries'],
      'aws': ['amazon web services', 'cloud', 'ec2', 's3'],
      'docker': ['containerization', 'containers'],
      'kubernetes': ['k8s', 'orchestration']
    };
    
    // Professional skill variations
    const professionalVariations = {
      'leadership': ['team lead', 'management', 'mentoring', 'supervising'],
      'project management': ['project coordination', 'scrum', 'agile', 'planning'],
      'communication': ['presentation', 'collaboration', 'stakeholder management'],
      'problem solving': ['troubleshooting', 'debugging', 'analysis', 'optimization']
    };
    
    // Add variations if skill matches known patterns
    if (techVariations[skillLower]) {
      variations.push(...techVariations[skillLower]);
    }
    if (professionalVariations[skillLower]) {
      variations.push(...professionalVariations[skillLower]);
    }
    
    // Add partial matches for compound skills
    if (skillLower.includes(' ')) {
      variations.push(...skillLower.split(' '));
    }
    
    return variations;
  }

  /**
   * Calculate title similarity using enhanced string matching
   */
  calculateTitleSimilarity(expTitle, jobTitle) {
    if (!expTitle || !jobTitle) return 0;
    
    const expTitleLower = expTitle.toLowerCase();
    const jobTitleLower = jobTitle.toLowerCase();
    
    // Exact match
    if (expTitleLower === jobTitleLower) return 1.0;
    
    // Calculate word overlap
    const expWords = expTitleLower.split(/\s+/);
    const jobWords = jobTitleLower.split(/\s+/);
    
    let matchingWords = 0;
    for (const expWord of expWords) {
      if (jobWords.some(jobWord => 
        jobWord.includes(expWord) || expWord.includes(jobWord) || 
        this.calculateLevenshteinSimilarity(expWord, jobWord) > 0.8
      )) {
        matchingWords++;
      }
    }
    
    return matchingWords / Math.max(expWords.length, jobWords.length);
  }

  /**
   * Calculate Levenshtein similarity between two words
   */
  calculateLevenshteinSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[len2][len1];
    return 1 - (distance / Math.max(len1, len2));
  }

  /**
   * Analyze responsibility depth and relevance
   */
  analyzeResponsibilityDepth(responsibilities, jobAnalysis) {
    if (!Array.isArray(responsibilities) || responsibilities.length === 0) {
      return { score: 0, depth: 'minimal', details: 'No responsibilities found' };
    }
    
    let score = 0;
    let qualityIndicators = 0;
    
    for (const responsibility of responsibilities) {
      const respText = responsibility.toLowerCase();
      
      // Check for action words (indicates responsibility depth)
      const actionWords = ['developed', 'implemented', 'designed', 'led', 'managed', 'created', 'optimized', 'improved', 'reduced', 'increased'];
      if (actionWords.some(word => respText.includes(word))) {
        score += 1;
        qualityIndicators++;
      }
      
      // Check for quantifiable results
      if (/\d+%|\d+\+|over \d+|\$\d+|increased.*\d+|reduced.*\d+|improved.*\d+/.test(respText)) {
        score += 2; // Higher weight for quantified achievements
        qualityIndicators++;
      }
      
      // Check for technical depth
      const technicalTerms = jobAnalysis.requiredSkills?.concat(jobAnalysis.preferredSkills || []) || [];
      if (technicalTerms.some(term => respText.includes(term.toLowerCase()))) {
        score += 1;
        qualityIndicators++;
      }
    }
    
    const depth = qualityIndicators >= 3 ? 'high' : qualityIndicators >= 1 ? 'medium' : 'low';
    
    return {
      score: score,
      depth: depth,
      qualityIndicators: qualityIndicators,
      responsibilityCount: responsibilities.length
    };
  }

  /**
   * Calculate recency boost based on experience period
   */
  calculateRecencyBoost(period) {
    if (!period) return { score: 0, type: 'unknown' };
    
    const currentYear = new Date().getFullYear();
    const periodText = period.toLowerCase();
    
    // Current/ongoing experience
    if (periodText.includes('present') || periodText.includes('current') || 
        periodText.includes(currentYear.toString())) {
      return { score: 3, type: 'current', details: 'Currently active experience' };
    }
    
    // Recent experience (last 2 years)
    const lastTwoYears = [currentYear - 1, currentYear - 2].map(y => y.toString());
    if (lastTwoYears.some(year => periodText.includes(year))) {
      return { score: 2, type: 'recent', details: 'Recent experience (last 2 years)' };
    }
    
    // Moderately recent (last 5 years)
    const lastFiveYears = [currentYear - 3, currentYear - 4, currentYear - 5].map(y => y.toString());
    if (lastFiveYears.some(year => periodText.includes(year))) {
      return { score: 1, type: 'moderate', details: 'Moderately recent (3-5 years ago)' };
    }
    
    return { score: 0, type: 'old', details: 'Older experience (5+ years ago)' };
  }

  /**
   * Analyze keyword density and strategic placement
   */
  analyzeKeywordDensity(experienceText, keywords) {
    if (!keywords || keywords.length === 0) {
      return { score: 0, density: 0, matchedKeywords: [] };
    }
    
    const matchedKeywords = [];
    let totalMatches = 0;
    
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const matches = (experienceText.match(new RegExp(keywordLower, 'g')) || []).length;
      if (matches > 0) {
        matchedKeywords.push({ keyword, matches });
        totalMatches += matches;
      }
    }
    
    const density = totalMatches / experienceText.split(' ').length;
    const score = Math.min(Math.floor(density * 100), 3); // Cap at 3 points
    
    return {
      score: score,
      density: density,
      matchedKeywords: matchedKeywords,
      totalMatches: totalMatches
    };
  }

  /**
   * Score achievement indicators in responsibilities
   */
  scoreAchievementIndicators(responsibilitiesText) {
    if (!responsibilitiesText) return { score: 0, indicators: [] };
    
    const indicators = [];
    let score = 0;
    
    // Achievement patterns
    const achievementPatterns = [
      { pattern: /increased.*(\d+)%/i, type: 'percentage_increase', weight: 3 },
      { pattern: /reduced.*(\d+)%/i, type: 'percentage_reduction', weight: 3 },
      { pattern: /improved.*(\d+)%/i, type: 'percentage_improvement', weight: 3 },
      { pattern: /saved.*\$(\d+)/i, type: 'cost_savings', weight: 3 },
      { pattern: /generated.*\$(\d+)/i, type: 'revenue_generation', weight: 3 },
      { pattern: /led.*team.*(\d+)/i, type: 'team_leadership', weight: 2 },
      { pattern: /managed.*(\d+).*projects?/i, type: 'project_management', weight: 2 },
      { pattern: /delivered.*on.*time/i, type: 'timely_delivery', weight: 1 },
      { pattern: /exceeded.*target/i, type: 'target_exceeded', weight: 2 },
      { pattern: /awarded|recognized|promoted/i, type: 'recognition', weight: 2 }
    ];
    
    for (const { pattern, type, weight } of achievementPatterns) {
      const matches = responsibilitiesText.match(pattern);
      if (matches) {
        indicators.push({ type, match: matches[0], weight });
        score += weight;
      }
    }
    
    return { score: Math.min(score, 5), indicators }; // Cap at 5 points
  }

  /**
   * Get scorer status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: 'active',
      algorithms: [
        'Skills matching with variations',
        'Title similarity calculation',
        'Responsibility depth analysis',
        'Recency scoring',
        'Keyword density analysis',
        'Achievement indicators detection'
      ]
    };
  }
}

module.exports = ExperienceScorer;
