/**
 * Skills Categorization Utility
 * Provides smart categorization of skills based on their names
 */

// Smart categorization patterns
export const categoryPatterns = {
  technical: [
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift',
    'typescript', 'html', 'css', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql', 'redis', 'sqlite',
    'machine learning', 'artificial intelligence', 'data science', 'deep learning', 'ai', 'ml',
    'blockchain', 'cryptocurrency', 'cybersecurity', 'networking', 'linux', 'unix', 'bash',
    'cloud computing', 'microservices', 'api', 'rest', 'graphql', 'json', 'xml'
  ],
  frameworks: [
    'react', 'angular', 'vue', 'svelte', 'nextjs', 'nuxt', 'express', 'fastapi', 'django', 'flask',
    'spring', 'laravel', 'rails', 'asp.net', 'node.js', 'nodejs', 'jquery', 'bootstrap', 'tailwind',
    'material-ui', 'mui', 'chakra', 'ant design', 'semantic ui', 'bulma', 'foundation',
    'redux', 'vuex', 'mobx', 'webpack', 'vite', 'parcel', 'rollup'
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'docker', 'kubernetes', 'jenkins', 'travis', 'circleci',
    'vs code', 'visual studio', 'intellij', 'eclipse', 'sublime', 'atom', 'vim', 'emacs',
    'photoshop', 'illustrator', 'figma', 'sketch', 'adobe', 'canva', 'blender', 'after effects',
    'jira', 'trello', 'asana', 'notion', 'slack', 'teams', 'zoom', 'postman', 'insomnia',
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify'
  ],
  soft: [
    'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
    'time management', 'project management', 'adaptability', 'creativity', 'analytical',
    'attention to detail', 'multitasking', 'decision making', 'conflict resolution',
    'negotiation', 'presentation', 'public speaking', 'mentoring', 'coaching',
    'customer service', 'sales', 'marketing', 'strategic planning', 'organization'
  ],
  languages: [
    'english', 'french', 'spanish', 'german', 'italian', 'portuguese', 'chinese', 'mandarin',
    'japanese', 'korean', 'arabic', 'russian', 'hindi', 'dutch', 'norwegian', 'swedish',
    'danish', 'finnish', 'polish', 'turkish', 'greek', 'hebrew', 'thai', 'vietnamese'
  ]
};

/**
 * Categorize a skill based on its name
 * @param {string} skillName - The name of the skill
 * @returns {string} - The category name
 */
export const categorizeSkill = (skillName) => {
  if (!skillName || typeof skillName !== 'string') return 'other';
  
  const lowerSkillName = skillName.toLowerCase().trim();
  
  // Check each category pattern
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(pattern => 
      lowerSkillName.includes(pattern) || 
      pattern.includes(lowerSkillName) ||
      lowerSkillName === pattern
    )) {
      return category;
    }
  }
  
  // Additional smart checks for compound terms
  if (lowerSkillName.includes('cloud') || lowerSkillName.includes('devops') || 
      lowerSkillName.includes('ci/cd') || lowerSkillName.includes('deployment')) {
    return 'technical';
  }
  
  if (lowerSkillName.includes('design') || lowerSkillName.includes('ui') || 
      lowerSkillName.includes('ux') || lowerSkillName.includes('prototyping')) {
    return 'tools';
  }
  
  if (lowerSkillName.includes('management') || lowerSkillName.includes('lead') ||
      lowerSkillName.includes('scrum') || lowerSkillName.includes('agile')) {
    return 'soft';
  }
  
  if (lowerSkillName.includes('framework') || lowerSkillName.includes('library')) {
    return 'frameworks';
  }
  
  return 'other';
};

/**
 * Convert skills array to categorized object format
 * @param {Array} skillsArray - Array of skills
 * @returns {Object} - Categorized skills object
 */
export const categorizeSkillsArray = (skillsArray) => {
  if (!Array.isArray(skillsArray)) return {};
  
  // For skills from UI (when user manually adds), create basic categories
  // The AI will create proper field-specific categories during extraction
  const categorized = {};
  
  skillsArray.forEach(skill => {
    const skillName = skill.name || skill;
    
    // If skill already has a category (from AI), use it
    if (skill.category) {
      if (!categorized[skill.category]) {
        categorized[skill.category] = [];
      }
      categorized[skill.category].push(skillName);
    } else {
      // For manually added skills, use a basic "Additional Skills" category
      if (!categorized['Additional Skills']) {
        categorized['Additional Skills'] = [];
      }
      categorized['Additional Skills'].push(skillName);
    }
  });
  
  return categorized;
};

/**
 * Convert categorized skills object to flat array format
 * @param {Object} skillsObject - Categorized skills object
 * @returns {Array} - Flat array of skills
 */
export const flattenSkillsObject = (skillsObject) => {
  if (Array.isArray(skillsObject)) return skillsObject;
  if (!skillsObject || typeof skillsObject !== 'object') return [];
  
  const flatSkills = [];
  Object.entries(skillsObject).forEach(([category, categorySkills]) => {
    if (Array.isArray(categorySkills)) {
      categorySkills.forEach(skill => {
        // Handle both string format and object format
        const skillName = typeof skill === 'string' ? skill : (skill.name || skill);
        flatSkills.push({
          name: skillName,
          category: category
        });
      });
    }
  });
  
  return flatSkills;
};

/**
 * Normalize skills data - handles both array and object formats
 * @param {Array|Object} skills - Skills data in any format
 * @returns {Array} - Normalized array format for UI
 */
export const normalizeSkillsForUI = (skills) => {
  if (Array.isArray(skills)) {
    return skills; // Already in array format
  }
  
  if (typeof skills === 'object' && skills !== null) {
    return flattenSkillsObject(skills);
  }
  
  return []; // Default to empty array
};

export default {
  categoryPatterns,
  categorizeSkill,
  categorizeSkillsArray,
  flattenSkillsObject,
  normalizeSkillsForUI
};
