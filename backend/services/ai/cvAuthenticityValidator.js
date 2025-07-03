/**
 * CV Tailoring Authenticity Validator
 * Ensures tailored CVs maintain authenticity and don't contain fabricated information
 */

class CVAuthenticityValidator {
  /**
   * Validate that a tailored CV maintains authenticity
   * @param {Object} originalCV - The original CV data
   * @param {Object} tailoredCV - The tailored CV data
   * @returns {Object} - Validation result with issues found
   */
  static validateTailoredCV(originalCV, tailoredCV) {
    const issues = [];
    const warnings = [];

    try {
      // 1. Check for over-quantification in experience
      const quantificationIssues = this.checkOverQuantification(originalCV.experience, tailoredCV.experience);
      issues.push(...quantificationIssues);

      // 2. Check for added skills not in original CV
      const skillsIssues = this.checkAddedSkills(originalCV.skills, tailoredCV.skills);
      issues.push(...skillsIssues);

      // 3. Check for added technologies in projects
      const projectTechIssues = this.checkProjectTechnologies(originalCV.projects, tailoredCV.projects);
      issues.push(...projectTechIssues);

      // 4. Check for fabricated achievements
      const achievementIssues = this.checkFabricatedAchievements(originalCV, tailoredCV);
      warnings.push(...achievementIssues);

      // 5. Check for authentic experience enhancement
      const experienceQuality = this.checkExperienceQuality(originalCV.experience, tailoredCV.experience);
      warnings.push(...experienceQuality);

      return {
        isValid: issues.length === 0,
        issues,
        warnings,
        score: this.calculateAuthenticityScore(issues, warnings)
      };

    } catch (error) {
      return {
        isValid: false,
        issues: [`Validation error: ${error.message}`],
        warnings: [],
        score: 0
      };
    }
  }

  /**
   * Check for over-quantification patterns
   */
  static checkOverQuantification(originalExp, tailoredExp) {
    const issues = [];
    
    if (!tailoredExp || !Array.isArray(tailoredExp)) return issues;

    const overQuantificationPatterns = [
      /over \d+/gi,
      /\d+\+.*increase/gi,
      /resulting in \d+%/gi,
      /improved by \d+%/gi,
      /increased.*by \d+%/gi,
      /\d+% improvement/gi,
      /\d+% boost/gi,
      /\d+% reduction/gi
    ];

    tailoredExp.forEach((exp, index) => {
      const expText = JSON.stringify(exp);
      const originalText = originalExp && originalExp[index] ? JSON.stringify(originalExp[index]) : '';

      overQuantificationPatterns.forEach((pattern, patternIndex) => {
        const matches = expText.match(pattern);
        if (matches && !originalText.match(pattern)) {
          issues.push(`Over-quantification detected in experience ${index + 1}: "${matches[0]}" - appears to be fabricated`);
        }
      });
    });

    return issues;
  }

  /**
   * Check for skills added that weren't in original CV
   */
  static checkAddedSkills(originalSkills, tailoredSkills) {
    const issues = [];
    
    if (!originalSkills || !tailoredSkills) return issues;

    // Flatten original skills
    const originalSkillsFlat = this.flattenSkills(originalSkills);
    const tailoredSkillsFlat = this.flattenSkills(tailoredSkills);

    // Find skills in tailored that aren't in original
    const addedSkills = tailoredSkillsFlat.filter(skill => {
      return !originalSkillsFlat.some(originalSkill => 
        this.areSkillsSimilar(skill, originalSkill)
      );
    });

    if (addedSkills.length > 0) {
      issues.push(`Unverified skills added: ${addedSkills.join(', ')} - these skills were not present in the original CV`);
    }

    return issues;
  }

  /**
   * Check for technologies added to projects that weren't in original
   */
  static checkProjectTechnologies(originalProjects, tailoredProjects) {
    const issues = [];
    
    if (!originalProjects || !tailoredProjects) return issues;

    originalProjects.forEach((originalProject, index) => {
      const tailoredProject = tailoredProjects[index];
      if (!tailoredProject) return;

      const originalTechs = originalProject.technologies || [];
      const tailoredTechs = tailoredProject.technologies || [];

      const addedTechs = tailoredTechs.filter(tech => {
        return !originalTechs.some(originalTech => 
          this.areSkillsSimilar(tech, originalTech)
        );
      });

      if (addedTechs.length > 0) {
        issues.push(`Unverified technologies added to project "${originalProject.name}": ${addedTechs.join(', ')}`);
      }
    });

    return issues;
  }

  /**
   * Check for fabricated achievements
   */
  static checkFabricatedAchievements(originalCV, tailoredCV) {
    const warnings = [];
    
    // Look for achievements that seem fabricated
    const fabricationIndicators = [
      /successfully.*\d+.*clients?/gi,
      /achieved.*\d+%.*growth/gi,
      /led.*team of \d+/gi,
      /managed.*\d+.*projects?/gi,
      /delivered.*\d+.*solutions?/gi
    ];

    const tailoredText = JSON.stringify(tailoredCV);
    const originalText = JSON.stringify(originalCV);

    fabricationIndicators.forEach(pattern => {
      const tailoredMatches = tailoredText.match(pattern);
      const originalMatches = originalText.match(pattern);

      if (tailoredMatches && !originalMatches) {
        warnings.push(`Potentially fabricated achievement detected: "${tailoredMatches[0]}" - verify this is based on actual experience`);
      }
    });

    return warnings;
  }

  /**
   * Check experience enhancement quality
   */
  static checkExperienceQuality(originalExp, tailoredExp) {
    const warnings = [];
    
    if (!originalExp || !tailoredExp) return warnings;

    // Check if enhancement maintains professional tone without being too aggressive
    tailoredExp.forEach((exp, index) => {
      const original = originalExp[index];
      if (!original) return;

      const expText = JSON.stringify(exp).toLowerCase();
      
      // Check for overly aggressive language
      const aggressivePatterns = [
        /revolutionized/g,
        /transformed.*entire/g,
        /completely.*redesigned/g,
        /single-handedly/g
      ];

      aggressivePatterns.forEach(pattern => {
        if (expText.match(pattern)) {
          warnings.push(`Overly aggressive enhancement in experience ${index + 1}: may not sound authentic`);
        }
      });
    });

    return warnings;
  }

  /**
   * Helper function to flatten skills object
   */
  static flattenSkills(skills) {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'object' && skills !== null) {
      return Object.values(skills).flat();
    }
    return [];
  }

  /**
   * Helper function to check if two skills are similar
   */
  static areSkillsSimilar(skill1, skill2) {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();
    
    // Exact match
    if (s1 === s2) return true;
    
    // One contains the other
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Common abbreviations
    const abbreviations = {
      'javascript': ['js'],
      'typescript': ['ts'],
      'html': ['html5'],
      'css': ['css3'],
      'react': ['reactjs', 'react.js'],
      'vue': ['vuejs', 'vue.js'],
      'angular': ['angularjs'],
      'node': ['nodejs', 'node.js'],
      'express': ['expressjs', 'express.js']
    };

    for (const [full, abbrevs] of Object.entries(abbreviations)) {
      if ((s1 === full && abbrevs.includes(s2)) || 
          (s2 === full && abbrevs.includes(s1))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate authenticity score (0-100)
   */
  static calculateAuthenticityScore(issues, warnings) {
    let score = 100;
    
    // Each issue reduces score by 20 points
    score -= issues.length * 20;
    
    // Each warning reduces score by 5 points
    score -= warnings.length * 5;
    
    return Math.max(0, score);
  }

  /**
   * Generate authenticity report
   */
  static generateReport(originalCV, tailoredCV) {
    const validation = this.validateTailoredCV(originalCV, tailoredCV);
    
    const report = {
      timestamp: new Date().toISOString(),
      authenticityScore: validation.score,
      status: validation.isValid ? 'PASSED' : 'FAILED',
      summary: {
        criticalIssues: validation.issues.length,
        warnings: validation.warnings.length,
        recommendation: validation.score >= 80 ? 'APPROVED' : 
                      validation.score >= 60 ? 'REVIEW REQUIRED' : 'MAJOR REVISION NEEDED'
      },
      details: validation
    };

    return report;
  }
}

module.exports = CVAuthenticityValidator;
