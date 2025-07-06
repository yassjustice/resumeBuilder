/**
 * CV Normalizer Module - Handles CV data normalization and structure validation
 */
class CVNormalizer {
  /**
   * Normalize original CV structure to ensure consistency
   */
  normalizeOriginalCV(originalCV) {
    const normalized = {
      ...originalCV,
      personalInfo: originalCV.personalInfo || {},
      experience: originalCV.experience || [],
      projects: originalCV.projects || [],
      education: originalCV.education || [],
      skills: originalCV.skills || {},
      certifications: originalCV.certifications || [],
      languages: originalCV.languages || [],
      additionalExperience: originalCV.additionalExperience || [],
      interests: originalCV.interests || []
    };

    // Ensure personalInfo has all required fields
    if (!normalized.personalInfo.name && (normalized.personalInfo.firstName || normalized.personalInfo.lastName)) {
      normalized.personalInfo.name = `${normalized.personalInfo.firstName || ''} ${normalized.personalInfo.lastName || ''}`.trim();
    }

    // Normalize experience entries
    normalized.experience = normalized.experience.map(exp => ({
      ...exp,
      title: exp.title || exp.position || '',
      company: exp.company || '',
      period: exp.period || `${exp.startDate || ''} - ${exp.endDate || ''}`.trim(),
      responsibilities: exp.responsibilities || exp.description?.split('•').filter(r => r.trim()) || []
    }));

    // Normalize projects
    normalized.projects = normalized.projects.map(proj => ({
      ...proj,
      name: proj.name || proj.title || '',
      description: proj.description || '',
      technologies: proj.technologies || [],
      keyFeatures: proj.keyFeatures || proj.features || []
    }));

    // Normalize education entries
    normalized.education = normalized.education.map(edu => ({
      ...edu,
      degree: edu.degree || edu.title || '',
      institution: edu.institution || edu.school || '',
      period: edu.period || `${edu.startDate || ''} - ${edu.endDate || ''}`.trim(),
      details: edu.details || edu.description || ''
    }));

    console.log('🔄 CV normalized successfully');
    return normalized;
  }
}

module.exports = CVNormalizer;
