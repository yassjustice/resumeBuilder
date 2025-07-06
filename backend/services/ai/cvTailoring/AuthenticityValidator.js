/**
 * Authenticity Validator Module - Handles CV authenticity validation
 */
class AuthenticityValidator {
  static generateReport(originalCV, tailoredCV) {
    // Simple authenticity validation
    const score = this.calculateAuthenticityScore(originalCV, tailoredCV);
    const warnings = this.findWarnings(originalCV, tailoredCV);
    
    return {
      status: score >= 70 ? 'PASSED' : 'FAILED',
      authenticityScore: score,
      details: {
        warnings: warnings
      }
    };
  }

  static calculateAuthenticityScore(originalCV, tailoredCV) {
    let score = 100;
    
    // Check if basic structure is preserved
    if (!tailoredCV.personalInfo) score -= 20;
    if (!tailoredCV.experience || tailoredCV.experience.length === 0) score -= 20;
    if (!tailoredCV.skills) score -= 10;
    
    // Check if experience count matches (allow for reordering but not removal)
    const originalExpCount = originalCV.experience?.length || 0;
    const tailoredExpCount = tailoredCV.experience?.length || 0;
    if (tailoredExpCount < originalExpCount) {
      score -= (originalExpCount - tailoredExpCount) * 5;
    }
    
    return Math.max(0, score);
  }

  static findWarnings(originalCV, tailoredCV) {
    const warnings = [];
    
    // Check for missing sections
    if (originalCV.experience?.length > 0 && (!tailoredCV.experience || tailoredCV.experience.length === 0)) {
      warnings.push('Experience section was removed');
    }
    
    if (originalCV.education?.length > 0 && (!tailoredCV.education || tailoredCV.education.length === 0)) {
      warnings.push('Education section was removed');
    }
    
    if (Object.keys(originalCV.skills || {}).length > 0 && (!tailoredCV.skills || Object.keys(tailoredCV.skills).length === 0)) {
      warnings.push('Skills section was removed');
    }
    
    return warnings;
  }
}

module.exports = AuthenticityValidator;
