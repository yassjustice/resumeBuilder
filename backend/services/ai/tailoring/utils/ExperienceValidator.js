/**
 * Experience Validator Utility
 * Validates tailored experience entries for authenticity
 * Prevents fabrication and maintains CV integrity
 */

class ExperienceValidator {
  constructor() {
    this.name = 'Experience Validator';
    this.version = '1.0.0';
  }

  /**
   * Validate a tailored experience entry for authenticity
   */
  validateTailoredExperience(originalExp, tailoredExp) {
    const violations = [];
    let score = 100; // Start with perfect score
    
    // 1. Core information must match exactly
    if (originalExp.company !== tailoredExp.company) {
      violations.push(`Company name changed: ${originalExp.company} → ${tailoredExp.company}`);
      score -= 50; // Major violation
    }
    
    if (originalExp.title !== tailoredExp.title) {
      violations.push(`Job title changed: ${originalExp.title} → ${tailoredExp.title}`);
      score -= 50; // Major violation
    }
    
    if (originalExp.period !== tailoredExp.period) {
      violations.push(`Period changed: ${originalExp.period} → ${tailoredExp.period}`);
      score -= 30; // Moderate violation
    }
    
    // 2. Check for fabricated metrics/achievements
    const originalText = JSON.stringify(originalExp).toLowerCase();
    const tailoredText = JSON.stringify(tailoredExp).toLowerCase();
    
    // Patterns that indicate potential fabrication
    const fabricationPatterns = [
      { pattern: /\d+%\s+(increase|improvement|growth|boost)/i, penalty: 20, description: 'percentage improvement' },
      { pattern: /\d+%\s+(reduction|decrease|cut|savings)/i, penalty: 20, description: 'percentage reduction' },
      { pattern: /(led|managed|supervised)\s+team\s+of\s+\d+/i, penalty: 25, description: 'team size specification' },
      { pattern: /\$[\d,]+/i, penalty: 25, description: 'monetary amounts' },
      { pattern: /over\s+\d+|more\s+than\s+\d+/i, penalty: 15, description: 'quantity specifications' },
      { pattern: /(generated|created|produced)\s+\d+/i, penalty: 20, description: 'output quantities' }
    ];
    
    for (const { pattern, penalty, description } of fabricationPatterns) {
      const tailoredMatch = tailoredText.match(pattern);
      const originalMatch = originalText.match(pattern);
      
      if (tailoredMatch && !originalMatch) {
        violations.push(`Potentially fabricated ${description}: ${tailoredMatch[0]}`);
        score -= penalty;
      }
    }
    
    // 3. Check for excessive enhancement (responsibilities becoming too different)
    if (Array.isArray(originalExp.responsibilities) && Array.isArray(tailoredExp.responsibilities)) {
      const originalLength = originalExp.responsibilities.join(' ').length;
      const tailoredLength = tailoredExp.responsibilities.join(' ').length;
      
      // If tailored is more than 2x longer, it might be over-enhanced
      if (tailoredLength > originalLength * 2) {
        violations.push(`Responsibilities significantly expanded (${originalLength} → ${tailoredLength} chars)`);
        score -= 10;
      }
    }
    
    // 4. Check for technology/skill inflation
    const techPatterns = [
      /\b(AI|machine learning|blockchain|cloud|microservices|kubernetes|docker)\b/i,
      /\b(react|angular|vue|node\.?js|python|java|aws|azure|gcp)\b/i
    ];
    
    for (const pattern of techPatterns) {
      const tailoredTechMatches = (tailoredText.match(pattern) || []).length;
      const originalTechMatches = (originalText.match(pattern) || []).length;
      
      if (tailoredTechMatches > originalTechMatches + 2) { // Allow some enhancement
        violations.push(`Excessive technology keywords added`);
        score -= 10;
      }
    }
    
    // 5. Check for suspicious accomplishment patterns
    const suspiciousAccomplishments = this.detectSuspiciousAccomplishments(originalText, tailoredText);
    if (suspiciousAccomplishments.length > 0) {
      violations.push(...suspiciousAccomplishments);
      score -= suspiciousAccomplishments.length * 5;
    }
    
    // 6. Validate quantifications authenticity
    const quantificationCheck = this.validateQuantifications(originalExp, tailoredExp);
    if (!quantificationCheck.valid) {
      violations.push(...quantificationCheck.violations);
      score -= quantificationCheck.penalty;
    }
    
    const valid = score >= 70; // Require 70+ score to pass
    
    return {
      valid,
      score,
      violations,
      authenticity: valid ? 'PASS' : 'FAIL',
      recommendations: this.generateRecommendations(violations)
    };
  }

  /**
   * Detect suspicious accomplishment patterns
   */
  detectSuspiciousAccomplishments(originalText, tailoredText) {
    const suspiciousPatterns = [
      { pattern: /\b(revolutionized|transformed|pioneered)\b/i, description: 'Overly dramatic language' },
      { pattern: /\b(single-handedly|solely responsible)\b/i, description: 'Unrealistic sole responsibility claims' },
      { pattern: /\b(world-class|industry-leading|cutting-edge)\b/i, description: 'Exaggerated adjectives' },
      { pattern: /\b(saved millions|generated billions)\b/i, description: 'Unrealistic monetary claims' },
      { pattern: /\b(increased.*1000%|improved.*500%)\b/i, description: 'Unrealistic percentage improvements' }
    ];
    
    const violations = [];
    
    for (const { pattern, description } of suspiciousPatterns) {
      const tailoredMatch = tailoredText.match(pattern);
      const originalMatch = originalText.match(pattern);
      
      if (tailoredMatch && !originalMatch) {
        violations.push(`Suspicious accomplishment language: ${description} - "${tailoredMatch[0]}"`);
      }
    }
    
    return violations;
  }

  /**
   * Validate quantifications for authenticity
   */
  validateQuantifications(originalExp, tailoredExp) {
    const violations = [];
    let penalty = 0;
    
    // Extract numbers from both versions
    const originalNumbers = this.extractNumbers(JSON.stringify(originalExp));
    const tailoredNumbers = this.extractNumbers(JSON.stringify(tailoredExp));
    
    // Check for suspicious new numbers
    for (const number of tailoredNumbers) {
      if (!originalNumbers.includes(number) && number > 10) {
        // Allow some reasonable enhancements but flag large fabrications
        if (number > 100) {
          violations.push(`Large quantification potentially fabricated: ${number}`);
          penalty += 15;
        } else if (number > 50) {
          violations.push(`Moderate quantification added: ${number} (verify authenticity)`);
          penalty += 5;
        }
      }
    }
    
    // Check for percentage fabrications
    const originalPercentages = this.extractPercentages(JSON.stringify(originalExp));
    const tailoredPercentages = this.extractPercentages(JSON.stringify(tailoredExp));
    
    for (const percentage of tailoredPercentages) {
      if (!originalPercentages.includes(percentage)) {
        if (percentage > 50) {
          violations.push(`High percentage improvement potentially fabricated: ${percentage}%`);
          penalty += 20;
        } else if (percentage > 20) {
          violations.push(`Moderate percentage improvement added: ${percentage}% (verify authenticity)`);
          penalty += 10;
        }
      }
    }
    
    return {
      valid: penalty < 30, // Allow some enhancement but not excessive
      violations,
      penalty
    };
  }

  /**
   * Extract numbers from text
   */
  extractNumbers(text) {
    const numbers = text.match(/\d+/g);
    return numbers ? numbers.map(n => parseInt(n)) : [];
  }

  /**
   * Extract percentages from text
   */
  extractPercentages(text) {
    const percentages = text.match(/(\d+)%/g);
    return percentages ? percentages.map(p => parseInt(p.replace('%', ''))) : [];
  }

  /**
   * Generate recommendations for improvements
   */
  generateRecommendations(violations) {
    const recommendations = [];
    
    if (violations.some(v => v.includes('Company name changed'))) {
      recommendations.push('Never change company names - this is a critical authenticity violation');
    }
    
    if (violations.some(v => v.includes('Job title changed'))) {
      recommendations.push('Job titles must remain exactly as they were in the original experience');
    }
    
    if (violations.some(v => v.includes('Period changed'))) {
      recommendations.push('Employment periods must remain accurate and unchanged');
    }
    
    if (violations.some(v => v.includes('fabricated'))) {
      recommendations.push('Remove any fabricated achievements or quantifications');
      recommendations.push('Base all enhancements on actual accomplishments from the original');
    }
    
    if (violations.some(v => v.includes('Excessive'))) {
      recommendations.push('Reduce keyword stuffing and make language more natural');
      recommendations.push('Focus on organic integration of relevant skills');
    }
    
    if (violations.some(v => v.includes('Suspicious'))) {
      recommendations.push('Use more modest, realistic language');
      recommendations.push('Avoid dramatic or exaggerated claims');
    }
    
    return recommendations;
  }

  /**
   * Validate core information preservation
   */
  validateCoreInformation(originalCV, tailoredCV) {
    const warnings = [];
    const violations = [];
    let valid = true;
    
    // Check personal info preservation
    const originalName = originalCV.personalInfo?.name;
    const tailoredName = tailoredCV.personalInfo?.name;
    if (originalName && tailoredName && originalName !== tailoredName) {
      violations.push(`Name changed from "${originalName}" to "${tailoredName}"`);
      valid = false;
    }
    
    // Check experience preservation
    if (originalCV.experience && tailoredCV.experience) {
      for (const originalExp of originalCV.experience) {
        const matchingTailored = tailoredCV.experience.find(
          te => te.company === originalExp.company && 
                (te.title === originalExp.title || te.title === originalExp.position)
        );
        
        if (matchingTailored) {
          // Check period preservation
          const originalPeriod = originalExp.period || `${originalExp.startDate} - ${originalExp.endDate}`;
          const tailoredPeriod = matchingTailored.period;
          
          if (originalPeriod && tailoredPeriod && 
              this.normalizePeriod(originalPeriod) !== this.normalizePeriod(tailoredPeriod)) {
            violations.push(`Period changed for ${originalExp.company}: "${originalPeriod}" → "${tailoredPeriod}"`);
            valid = false;
          }
        }
      }
    }
    
    return { valid, warnings, violations };
  }

  /**
   * Normalize period strings for comparison
   */
  normalizePeriod(period) {
    if (!period) return '';
    return period.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .trim();
  }

  /**
   * Check for fabricated achievements in experience
   */
  checkForFabricatedAchievements(originalExp, tailoredExp) {
    const warnings = [];
    const violations = [];
    let valid = true;
    
    const originalText = JSON.stringify(originalExp).toLowerCase();
    const tailoredText = JSON.stringify(tailoredExp).toLowerCase();
    
    // Check for added quantified achievements
    const achievementPatterns = [
      /\d+%\s+(increase|improvement|reduction)/i,
      /(led|managed)\s+team\s+of\s+\d+/i,
      /\$\d+/i,
      /over\s+\d+/i
    ];
    
    for (const pattern of achievementPatterns) {
      const tailoredMatch = tailoredText.match(pattern);
      const originalMatch = originalText.match(pattern);
      
      if (tailoredMatch && !originalMatch) {
        warnings.push(`Potential fabrication in ${tailoredExp.company}: ${tailoredMatch[0]}`);
      }
    }
    
    return { valid, warnings, violations };
  }

  /**
   * Get validator status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: 'active',
      validationTypes: [
        'Core information preservation',
        'Achievement fabrication detection',
        'Quantification authenticity',
        'Technology inflation detection',
        'Suspicious language patterns',
        'Accomplishment realism'
      ]
    };
  }
}

module.exports = ExperienceValidator;
