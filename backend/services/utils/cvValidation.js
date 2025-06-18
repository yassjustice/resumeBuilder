/**
 * CV Data Validation and Optimization Utilities
 * Validates CV data structure and provides layout optimization suggestions
 */

const { APIError } = require('../../middleware/errorHandler');

/**
 * Enhanced CV data validation with layout considerations
 */
const validateCVData = (cvData) => {
  const required = ['personalInfo', 'summary', 'experience', 'skills', 'education'];
  
  for (const field of required) {
    if (!cvData[field]) {
      throw new APIError(`Missing required field: ${field}`, 400);
    }
  }

  if (!cvData.personalInfo.name || !cvData.personalInfo.title) {
    throw new APIError('Missing required personal information', 400);
  }

  if (!cvData.experience || cvData.experience.length === 0) {
    throw new APIError('At least one experience entry is required', 400);
  }

  // Layout-specific validations
  if (cvData.experience.length > 10) {
    console.warn('Warning: Large number of experience entries may affect layout');
  }

  if (cvData.projects && cvData.projects.length > 8) {
    console.warn('Warning: Large number of projects may affect layout');
  }

  return true;
};

/**
 * Get layout optimization suggestions based on CV data
 */
const getLayoutSuggestions = (cvData) => {
  const suggestions = [];
  
  // Analyze content length
  const experienceCount = cvData.experience?.length || 0;
  const projectCount = cvData.projects?.length || 0;
  const totalContent = experienceCount + projectCount;
  
  if (totalContent > 10) {
    suggestions.push({
      type: 'content',
      message: 'Consider reducing content or using compact layout',
      recommendation: 'Use compact spacing and limit items per section'
    });
  }
  
  if (experienceCount > 6) {
    suggestions.push({
      type: 'experience',
      message: 'Large number of experience entries detected',
      recommendation: 'Consider prioritizing most recent or relevant positions'
    });
  }
  
  if (projectCount > 5) {
    suggestions.push({
      type: 'projects',
      message: 'Many projects detected',
      recommendation: 'Focus on 3-5 most significant projects'
    });
  }
  
  // Check for long text content
  const longSummary = cvData.summary?.length > 500;
  if (longSummary) {
    suggestions.push({
      type: 'summary',
      message: 'Professional summary is quite long',
      recommendation: 'Consider condensing to 2-3 key sentences'
    });
  }
  
  return suggestions;
};

/**
 * Apply layout optimizations based on content analysis
 */
const optimizeLayoutForContent = (cvData, options = {}) => {
  const optimized = { ...cvData };
  const suggestions = getLayoutSuggestions(cvData);
  
  // Auto-optimize if requested
  if (options.autoOptimize) {
    // Limit experience entries if too many
    if (optimized.experience?.length > 6) {
      optimized.experience = optimized.experience.slice(0, 6);
    }
    
    // Limit project entries
    if (optimized.projects?.length > 5) {
      optimized.projects = optimized.projects.slice(0, 5);
    }
    
    // Truncate long summaries
    if (optimized.summary?.length > 500) {
      optimized.summary = optimized.summary.substring(0, 480) + '...';
    }
    
    // Limit responsibilities per job
    if (optimized.experience) {
      optimized.experience = optimized.experience.map(exp => ({
        ...exp,
        responsibilities: exp.responsibilities?.slice(0, 4) || []
      }));
    }
  }
  
  return {
    optimizedData: optimized,
    suggestions,
    appliedOptimizations: options.autoOptimize
  };
};

module.exports = {
  validateCVData,
  getLayoutSuggestions,
  optimizeLayoutForContent
};
