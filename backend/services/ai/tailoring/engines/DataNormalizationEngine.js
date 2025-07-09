/**
 * Data Normalization Engine
 * Handles CV data normalization and format standardization
 * Ensures consistent data structures across different input formats
 */

class DataNormalizationEngine {
  constructor() {
    this.name = 'Data Normalization Engine';
    this.version = '1.0.0';
  }

  /**
   * Normalize CV data to standard format
   * @param {Object} originalCV - Raw CV data
   * @returns {Object} - Normalized CV data
   */
  normalizeCV(originalCV) {
    console.log('🔧 Normalizing CV data structure...');
    
    const normalized = {
      personalInfo: this.normalizePersonalInfo(originalCV.personalInfo || {}),
      summary: originalCV.summary || '',
      experience: this.normalizeExperience(originalCV.experience || []),
      skills: this.normalizeSkills(originalCV.skills || {}),
      education: this.normalizeEducation(originalCV.education || []),
      certifications: this.normalizeCertifications(originalCV.certifications || []),
      projects: this.normalizeProjects(originalCV.projects || []),
      languages: this.normalizeLanguages(originalCV.languages || []),
      awards: this.normalizeAwards(originalCV.awards || []),
      volunteering: this.normalizeVolunteering(originalCV.volunteering || []),
      interests: this.normalizeInterests(originalCV.interests || []),
      
      // Metadata
      language: originalCV.language || 'en',
      originalStructure: this.detectOriginalStructure(originalCV)
    };

    console.log('✅ CV normalization completed');
    console.log('📊 Normalized structure:', {
      personalInfo: !!normalized.personalInfo.name,
      experience: normalized.experience.length,
      education: normalized.education.length,
      certifications: normalized.certifications.length,
      skillCategories: Object.keys(normalized.skills).length
    });

    return normalized;
  }

  /**
   * Normalize personal information
   */
  normalizePersonalInfo(personalInfo) {
    // Extract name from various possible formats
    let name = '';
    let firstName = '';
    let lastName = '';
    
    if (personalInfo.name && personalInfo.name !== 'CV' && personalInfo.name.toLowerCase() !== 'cv') {
      name = personalInfo.name;
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else if (personalInfo.firstName && personalInfo.lastName) {
      firstName = personalInfo.firstName;
      lastName = personalInfo.lastName;
      name = `${firstName} ${lastName}`;
    } else if (personalInfo.firstName) {
      firstName = personalInfo.firstName;
      name = firstName;
    } else if (personalInfo.fullName) {
      name = personalInfo.fullName;
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Fallback if no valid name found
    if (!name || name.trim() === '' || name.toLowerCase() === 'cv') {
      firstName = personalInfo.firstName || 'Professional';
      lastName = personalInfo.lastName || '';
      name = lastName ? `${firstName} ${lastName}` : firstName;
    }
    
    return {
      name: name,
      firstName: firstName,
      lastName: lastName,
      title: personalInfo.title || personalInfo.jobTitle || personalInfo.position || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone || personalInfo.phoneNumber || '',
      location: personalInfo.location || personalInfo.address || personalInfo.city || '',
      linkedin: personalInfo.linkedin || personalInfo.linkedinUrl || '',
      github: personalInfo.github || personalInfo.githubUrl || '',
      website: personalInfo.website || personalInfo.portfolio || personalInfo.url || '',
      address: personalInfo.address || personalInfo.location || ''
    };
  }

  /**
   * Normalize experience data to handle both frontend and backend formats
   */
  normalizeExperience(originalExperience) {
    if (!Array.isArray(originalExperience)) {
      console.warn('⚠️ Experience is not an array:', typeof originalExperience);
      return [];
    }

    console.log('🔍 EXPERIENCE NORMALIZATION - Input format detection:');
    if (originalExperience.length > 0) {
      const sample = originalExperience[0];
      console.log('📋 Sample input structure:', Object.keys(sample));
      console.log('📋 Has frontend format (position/startDate/description):', 
        !!(sample.position || sample.startDate || sample.description));
      console.log('📋 Has backend format (title/period/responsibilities):', 
        !!(sample.title || sample.period || sample.responsibilities));
    }

    return originalExperience.map((exp, index) => {
      const normalized = {
        title: exp.title || exp.position || exp.jobTitle || '',
        company: exp.company || exp.employer || exp.organization || '',
        period: this.normalizePeriod(exp),
        responsibilities: this.normalizeResponsibilities(exp)
      };

      console.log(`🔍 Normalized experience ${index + 1}:`, {
        title: normalized.title,
        company: normalized.company,
        period: normalized.period,
        responsibilitiesCount: normalized.responsibilities.length
      });

      return normalized;
    }).filter(exp => exp.company && exp.title); // Only include valid entries
  }

  /**
   * Normalize period from various formats
   */
  normalizePeriod(exp) {
    // If period already exists, use it
    if (exp.period) return exp.period;
    
    // Build period from start/end dates
    if (exp.startDate || exp.endDate) {
      const start = exp.startDate || '';
      const end = exp.endDate || exp.currentJob ? 'Present' : '';
      if (start && end) {
        return `${start} - ${end}`;
      } else if (start) {
        return start;
      } else if (end) {
        return end;
      }
    }
    
    // Handle other date formats
    if (exp.duration) return exp.duration;
    if (exp.dateRange) return exp.dateRange;
    if (exp.workPeriod) return exp.workPeriod;
    
    return '';
  }

  /**
   * Normalize responsibilities from various formats
   */
  normalizeResponsibilities(exp) {
    // If responsibilities already exist as array
    if (Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0) {
      return exp.responsibilities;
    }
    
    // Convert from description
    if (exp.description && typeof exp.description === 'string') {
      return exp.description
        .split(/\n|- /)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^-+$/))
        .map(item => item.replace(/^-\s*/, '').trim())
        .filter(item => item.length > 10); // Filter out very short items
    }
    
    // Convert from duties
    if (Array.isArray(exp.duties)) {
      return exp.duties;
    }
    
    // Convert from tasks
    if (Array.isArray(exp.tasks)) {
      return exp.tasks;
    }
    
    // Convert from achievements
    if (Array.isArray(exp.achievements)) {
      return exp.achievements;
    }
    
    // Fallback
    return [`Worked as ${exp.title || exp.position} at ${exp.company}`];
  }

  /**
   * Normalize skills structure
   */
  normalizeSkills(originalSkills) {
    if (!originalSkills) return {};
    
    // If already properly structured
    if (typeof originalSkills === 'object' && !Array.isArray(originalSkills)) {
      const normalized = {};
      for (const [category, skills] of Object.entries(originalSkills)) {
        if (Array.isArray(skills) && skills.length > 0) {
          normalized[category] = skills;
        }
      }
      return normalized;
    }
    
    // If it's a flat array, categorize
    if (Array.isArray(originalSkills)) {
      return {
        'Technical': originalSkills
      };
    }
    
    return {};
  }

  /**
   * Normalize education entries
   */
  normalizeEducation(originalEducation) {
    if (!Array.isArray(originalEducation)) {
      return [];
    }
    
    return originalEducation.map(edu => ({
      institution: edu.institution || edu.school || edu.university || '',
      degree: edu.degree || edu.qualification || edu.program || '',
      year: edu.year || edu.graduationYear || edu.endYear || '',
      period: edu.period || edu.duration || edu.year || '',
      startYear: edu.startYear || '',
      endYear: edu.endYear || edu.graduationYear || '',
      details: edu.details || edu.description || edu.coursework || ''
    })).filter(edu => edu.institution && edu.degree);
  }

  /**
   * Normalize certifications
   */
  normalizeCertifications(originalCertifications) {
    if (!Array.isArray(originalCertifications)) {
      return [];
    }
    
    return originalCertifications.map(cert => ({
      name: cert.name || cert.title || cert.certification || '',
      issuer: cert.issuer || cert.organization || cert.provider || '',
      year: cert.year || cert.date || cert.obtained || '',
      description: cert.description || cert.details || '',
      url: cert.url || cert.link || cert.credentialUrl || ''
    })).filter(cert => cert.name && cert.issuer);
  }

  /**
   * Normalize projects
   */
  normalizeProjects(originalProjects) {
    if (!Array.isArray(originalProjects)) {
      return [];
    }
    
    return originalProjects.map(project => ({
      name: project.name || project.title || '',
      description: project.description || project.summary || '',
      technologies: project.technologies || project.tech || project.stack || '',
      url: project.url || project.link || project.github || '',
      year: project.year || project.date || ''
    })).filter(project => project.name);
  }

  /**
   * Normalize languages
   */
  normalizeLanguages(originalLanguages) {
    if (!Array.isArray(originalLanguages)) {
      return [];
    }
    
    return originalLanguages.map(lang => {
      if (typeof lang === 'string') {
        return { language: lang, level: 'Conversational' };
      }
      return {
        language: lang.language || lang.name || '',
        level: lang.level || lang.proficiency || 'Conversational'
      };
    }).filter(lang => lang.language);
  }

  /**
   * Normalize awards
   */
  normalizeAwards(originalAwards) {
    if (!Array.isArray(originalAwards)) {
      return [];
    }
    
    return originalAwards.map(award => ({
      title: award.title || award.name || '',
      issuer: award.issuer || award.organization || '',
      year: award.year || award.date || '',
      description: award.description || ''
    })).filter(award => award.title);
  }

  /**
   * Normalize volunteering
   */
  normalizeVolunteering(originalVolunteering) {
    if (!Array.isArray(originalVolunteering)) {
      return [];
    }
    
    return originalVolunteering.map(vol => ({
      organization: vol.organization || vol.company || '',
      role: vol.role || vol.position || vol.title || '',
      period: vol.period || vol.duration || '',
      description: vol.description || vol.activities || ''
    })).filter(vol => vol.organization);
  }

  /**
   * Normalize interests
   */
  normalizeInterests(originalInterests) {
    if (Array.isArray(originalInterests)) {
      return originalInterests.filter(interest => typeof interest === 'string' && interest.trim().length > 0);
    }
    return [];
  }

  /**
   * Detect original CV structure for metadata
   */
  detectOriginalStructure(originalCV) {
    const structure = {
      format: 'unknown',
      hasPersonalInfo: !!originalCV.personalInfo,
      hasExperience: Array.isArray(originalCV.experience),
      experienceFormat: 'unknown',
      hasEducation: Array.isArray(originalCV.education),
      hasSkills: !!originalCV.skills,
      skillsFormat: Array.isArray(originalCV.skills) ? 'array' : 'object'
    };
    
    // Detect experience format
    if (originalCV.experience && originalCV.experience.length > 0) {
      const sample = originalCV.experience[0];
      if (sample.position || sample.startDate) {
        structure.experienceFormat = 'frontend';
      } else if (sample.title || sample.period) {
        structure.experienceFormat = 'backend';
      }
    }
    
    return structure;
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: 'active',
      capabilities: [
        'CV structure normalization',
        'Multi-format experience handling',
        'Personal info standardization',
        'Skills categorization',
        'Date format unification'
      ]
    };
  }
}

module.exports = DataNormalizationEngine;
