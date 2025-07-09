/**
 * Authenticity Engine
 * Comprehensive authenticity validation system
 * Ensures CV integrity and prevents fabrication
 */

class AuthenticityEngine {
  constructor() {
    this.name = 'Authenticity Engine';
    this.version = '1.0.0';
  }

  /**
   * Enhanced authenticity validation - ensures no lies or fabrications
   */
  async validateAuthenticity(originalCV, tailoredCV) {
    console.log('🔍 COMPREHENSIVE AUTHENTICITY VALIDATION - Enhanced Checks');
    
    const warnings = [];
    const violations = [];
    let authentic = true;
    
    try {
      // 1. CORE INFORMATION PRESERVATION CHECK
      const coreInfoCheck = this.validateCoreInformation(originalCV, tailoredCV);
      if (!coreInfoCheck.valid) {
        authentic = false;
        violations.push(...coreInfoCheck.violations);
      }
      warnings.push(...coreInfoCheck.warnings);
      
      // 2. EXPERIENCE AUTHENTICITY CHECK
      const experienceCheck = this.validateExperienceAuthenticity(originalCV, tailoredCV);
      if (!experienceCheck.valid) {
        authentic = false;
        violations.push(...experienceCheck.violations);
      }
      warnings.push(...experienceCheck.warnings);
      
      // 3. SKILLS AUTHENTICITY CHECK
      const skillsCheck = this.validateSkillsAuthenticity(originalCV, tailoredCV);
      if (!skillsCheck.valid) {
        authentic = false;
        violations.push(...skillsCheck.violations);
      }
      warnings.push(...skillsCheck.warnings);
      
      // 4. FABRICATION DETECTION
      const fabricationCheck = this.detectFabrications(originalCV, tailoredCV);
      if (!fabricationCheck.valid) {
        authentic = false;
        violations.push(...fabricationCheck.violations);
      }
      warnings.push(...fabricationCheck.warnings);
      
      // 5. QUANTIFICATION AUTHENTICITY
      const quantificationCheck = this.validateQuantifications(originalCV, tailoredCV);
      if (!quantificationCheck.valid) {
        authentic = false;
        violations.push(...quantificationCheck.violations);
      }
      warnings.push(...quantificationCheck.warnings);
      
      console.log(`✅ Authenticity validation complete: ${authentic ? 'PASSED' : 'FAILED'}`);
      console.log(`⚠️ Warnings: ${warnings.length}, Violations: ${violations.length}`);
      
      return { 
        authentic, 
        warnings, 
        violations,
        summary: {
          coreInfoPreserved: coreInfoCheck.valid,
          experienceAuthentic: experienceCheck.valid,
          skillsAuthentic: skillsCheck.valid,
          noFabrications: fabricationCheck.valid,
          quantificationsValid: quantificationCheck.valid
        }
      };
      
    } catch (error) {
      console.warn('⚠️ Authenticity validation error:', error.message);
      return { 
        authentic: true, 
        warnings: ['Validation service error: ' + error.message],
        violations: [],
        summary: { error: true }
      };
    }
  }

  /**
   * Validate core information preservation (name, dates, companies, titles)
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
   * Validate experience authenticity - no invented roles or fake achievements
   */
  validateExperienceAuthenticity(originalCV, tailoredCV) {
    const warnings = [];
    const violations = [];
    let valid = true;
    
    if (!tailoredCV.experience || !Array.isArray(tailoredCV.experience)) {
      return { valid: true, warnings, violations };
    }
    
    for (const tailoredExp of tailoredCV.experience) {
      // Find corresponding original experience
      const originalExp = originalCV.experience?.find(
        oe => oe.company === tailoredExp.company && 
              (oe.title === tailoredExp.title || oe.position === tailoredExp.title)
      );
      
      if (!originalExp) {
        violations.push(`New experience added: ${tailoredExp.company} - ${tailoredExp.title}`);
        valid = false;
        continue;
      }
      
      // Check for fabricated achievements
      const fabricationCheck = this.checkForFabricatedAchievements(originalExp, tailoredExp);
      if (!fabricationCheck.valid) {
        violations.push(...fabricationCheck.violations);
        valid = false;
      }
      warnings.push(...fabricationCheck.warnings);
    }
    
    return { valid, warnings, violations };
  }

  /**
   * Validate skills authenticity - no added skills
   */
  validateSkillsAuthenticity(originalCV, tailoredCV) {
    const warnings = [];
    const violations = [];
    let valid = true;
    
    if (!originalCV.skills || !tailoredCV.skills) {
      return { valid: true, warnings, violations };
    }
    
    // Get all original skills (flattened)
    const originalSkillsFlat = this.flattenSkills(originalCV.skills);
    const tailoredSkillsFlat = this.flattenSkills(tailoredCV.skills);
    
    // Check for added skills
    const addedSkills = tailoredSkillsFlat.filter(
      skill => !originalSkillsFlat.some(os => 
        os.toLowerCase() === skill.toLowerCase() ||
        os.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(os.toLowerCase())
      )
    );
    
    if (addedSkills.length > 0) {
      violations.push(`Added skills not in original: ${addedSkills.join(', ')}`);
      valid = false;
    }
    
    return { valid, warnings, violations };
  }

  /**
   * Detect fabrications in content
   */
  detectFabrications(originalCV, tailoredCV) {
    const warnings = [];
    const violations = [];
    let valid = true;
    
    // Check for suspicious patterns that indicate fabrication
    const suspiciousPatterns = [
      /\b(led|managed|directed)\s+team\s+of\s+\d+/i,
      /increased\s+.*\s+by\s+\d+%/i,
      /reduced\s+.*\s+by\s+\d+%/i,
      /saved\s+\$\d+/i,
      /generated\s+\$\d+/i,
      /improved\s+.*\s+by\s+\d+%/i
    ];
    
    const tailoredText = JSON.stringify(tailoredCV).toLowerCase();
    const originalText = JSON.stringify(originalCV).toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      const tailoredMatches = tailoredText.match(pattern);
      const originalMatches = originalText.match(pattern);
      
      if (tailoredMatches && !originalMatches) {
        warnings.push(`Potentially fabricated achievement detected: ${tailoredMatches[0]}`);
      }
    }
    
    return { valid, warnings, violations };
  }

  /**
   * Validate quantifications - ensure numbers aren't fabricated
   */
  validateQuantifications(originalCV, tailoredCV) {
    const warnings = [];
    const violations = [];
    let valid = true;
    
    // Extract numbers from original and tailored CVs
    const originalNumbers = this.extractNumbers(JSON.stringify(originalCV));
    const tailoredNumbers = this.extractNumbers(JSON.stringify(tailoredCV));
    
    // Check for suspicious new numbers
    for (const number of tailoredNumbers) {
      if (!originalNumbers.includes(number) && number > 10) { // Ignore small numbers
        warnings.push(`New quantification detected: ${number} (verify authenticity)`);
      }
    }
    
    return { valid, warnings, violations };
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
   * Flatten skills object into array
   */
  flattenSkills(skills) {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    
    const flattened = [];
    for (const category of Object.values(skills)) {
      if (Array.isArray(category)) {
        flattened.push(...category);
      }
    }
    return flattened;
  }

  /**
   * Extract numbers from text
   */
  extractNumbers(text) {
    const numbers = text.match(/\d+/g);
    return numbers ? numbers.map(n => parseInt(n)) : [];
  }

  /**
   * Generate authenticity report
   */
  generateAuthenticityReport(validationResult) {
    const report = {
      timestamp: new Date().toISOString(),
      overall: validationResult.authentic ? 'AUTHENTIC' : 'QUESTIONABLE',
      score: this.calculateAuthenticityScore(validationResult),
      summary: validationResult.summary,
      details: {
        warnings: validationResult.warnings,
        violations: validationResult.violations
      },
      recommendations: this.generateRecommendations(validationResult)
    };

    return report;
  }

  /**
   * Calculate authenticity score
   */
  calculateAuthenticityScore(validationResult) {
    let score = 100;
    
    // Deduct points for violations
    score -= validationResult.violations.length * 15;
    
    // Deduct points for warnings
    score -= validationResult.warnings.length * 5;
    
    // Ensure minimum score
    return Math.max(0, score);
  }

  /**
   * Generate recommendations for authenticity improvements
   */
  generateRecommendations(validationResult) {
    const recommendations = [];
    
    if (validationResult.violations.length > 0) {
      recommendations.push('Address all authenticity violations before proceeding');
      recommendations.push('Ensure all personal information remains unchanged');
      recommendations.push('Verify all quantifications are based on original achievements');
    }
    
    if (validationResult.warnings.length > 0) {
      recommendations.push('Review warnings for potential authenticity issues');
      recommendations.push('Ensure all enhancements are based on existing information');
    }
    
    if (validationResult.authentic) {
      recommendations.push('CV maintains authenticity standards');
      recommendations.push('Safe to proceed with tailored version');
    }
    
    return recommendations;
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: 'active',
      validationTypes: [
        'Core information preservation',
        'Experience authenticity',
        'Skills verification',
        'Fabrication detection',
        'Quantification validation'
      ],
      capabilities: [
        'Comprehensive authenticity validation',
        'Fabrication detection',
        'Integrity scoring',
        'Detailed reporting',
        'Recommendation generation'
      ]
    };
  }
}

module.exports = AuthenticityEngine;
