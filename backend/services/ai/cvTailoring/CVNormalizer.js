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

    // Ensure personalInfo has all required fields and proper contact structure
    if (!normalized.personalInfo.name && (normalized.personalInfo.firstName || normalized.personalInfo.lastName)) {
      normalized.personalInfo.name = `${normalized.personalInfo.firstName || ''} ${normalized.personalInfo.lastName || ''}`.trim();
    }

    // Normalize contact information structure
    // Convert flat CV Builder structure to nested tailored CV structure
    console.log('🔍 CVNormalizer: Original personalInfo structure:', {
      hasContact: !!normalized.personalInfo.contact,
      flatEmail: normalized.personalInfo.email,
      flatPhone: normalized.personalInfo.phone,
      flatLocation: normalized.personalInfo.location,
      flatLinkedIn: normalized.personalInfo.linkedin
    });
    
    if (!normalized.personalInfo.contact) {
      normalized.personalInfo.contact = {
        email: normalized.personalInfo.email || '',
        phone: normalized.personalInfo.phone || '',
        location: normalized.personalInfo.location || '',
        linkedin: normalized.personalInfo.linkedin || '',
        github: normalized.personalInfo.github || '',
        portfolio: normalized.personalInfo.website || normalized.personalInfo.portfolio || ''
      };
      console.log('🔄 CVNormalizer: Created nested contact structure:', normalized.personalInfo.contact);
    }

    // Keep backward compatibility by preserving both flat and nested structures
    // This ensures compatibility with both CV Builder and Tailored CV systems
    if (normalized.personalInfo.contact) {
      // Ensure flat structure exists for CV Builder compatibility
      normalized.personalInfo.email = normalized.personalInfo.email || normalized.personalInfo.contact.email;
      normalized.personalInfo.phone = normalized.personalInfo.phone || normalized.personalInfo.contact.phone;
      normalized.personalInfo.location = normalized.personalInfo.location || normalized.personalInfo.contact.location;
      normalized.personalInfo.linkedin = normalized.personalInfo.linkedin || normalized.personalInfo.contact.linkedin;
      normalized.personalInfo.github = normalized.personalInfo.github || normalized.personalInfo.contact.github;
      normalized.personalInfo.website = normalized.personalInfo.website || normalized.personalInfo.contact.portfolio;
      
      console.log('✅ CVNormalizer: Both flat and nested structures preserved');
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
