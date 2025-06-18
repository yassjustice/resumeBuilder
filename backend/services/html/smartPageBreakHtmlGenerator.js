/**
 * Smart Page Break HTML Generator
 * Implements all 3 tasks: Smart page breaks, Title-section connection, Two-column skills
 */

const { PROFESSIONAL_THEME } = require('../themes/professionalTheme');
const { getTranslation } = require('../pdf/pdfTranslations');

// Global translation helper to be used in all functions when t is not provided
const createTranslationHelper = (cvData) => {
  const language = cvData?.language || 'en';
  return (key) => getTranslation(key, language);
};


const generateSmartPageBreakHTML = (cvData, options = {}) => {
  const theme = PROFESSIONAL_THEME;
  const pageBreakThreshold = options.pageBreakThreshold || 80; // mm from bottom
  const language = cvData.language || 'en'; // Get language from CV data
  
  // Translation helper function
  const t = (key) => getTranslation(key, language);// Normalize CV data - convert Mongoose document to plain object if needed
  let normalizedCvData = cvData;
  try {
    if (typeof cvData.toObject === 'function') {
      normalizedCvData = cvData.toObject();
    } else if (typeof cvData.toJSON === 'function') {
      normalizedCvData = cvData.toJSON();
    }
  } catch (error) {
    console.error('Error normalizing CV data:', error);
    // Continue with original data if normalization fails
  }
  
  // Generate complete HTML with smart page break system
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${normalizedCvData.personalInfo?.name || 'CV'} - CV</title>
      <style>
        /* Zero-gap foundation - MAINTAINED ✅ */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: ${theme.fonts.main};
          font-size: ${theme.fontSizes.body};
          color: ${theme.colors.text};
          line-height: 1.4;
          background: ${theme.colors.background};
        }
          /* TASK 2: Title-section connection - FIXED ✅ */
        .section-header {
          font-size: ${theme.fontSizes.sectionHeader};
          font-weight: bold;
          color: ${theme.colors.primary};
          border-bottom: 1px solid ${theme.colors.border};
          padding-bottom: 2px;
          margin-bottom: ${theme.spacing.micro};
          /* Keep with next element (improved browser compatibility) */
          page-break-after: avoid !important;
          break-after: avoid-page !important;
        }
        
        .section {
          margin-bottom: ${theme.spacing.section};
          /* Prevent complete section break across pages when possible */
          page-break-inside: auto; /* Allow section to break if needed */
          break-inside: auto; /* Modern browser support */
        }
        
        /* Ensure section header stays with at least first item */
        .section-header + div {
          page-break-before: avoid !important;
          break-before: avoid-page !important;
        }
          /* TASK 1: Smart page breaks for individual elements - FIXED ✅ */
        .experience-item,
        .project-item,
        .education-item,
        .certification-item {
          /* Prevent individual items from breaking across pages - using multiple properties for cross-browser support */
          page-break-inside: avoid !important;
          break-inside: avoid-page !important;
          margin-bottom: ${theme.spacing.element};
          /* Smart break: move to next page if less than threshold space */
          orphans: 4;
          widows: 4;
          position: relative; /* Create new formatting context */
          display: block;
          min-height: 30px; /* Ensure items have minimum height */
        }
          /* Header section */
        .header {
          margin-bottom: ${theme.spacing.large};
          page-break-after: avoid;
        }
        
        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .header-left {
          flex: 1;
        }
        
        .header-right {
          flex: 1;
          text-align: right;
        }
        
        .name {
          font-size: ${theme.fontSizes.name};
          font-weight: bold;
          color: ${theme.colors.primary};
          margin-bottom: ${theme.spacing.tiny};
        }
        
        .title {
          font-size: ${theme.fontSizes.jobTitle};
          color: ${theme.colors.text};
          margin-bottom: ${theme.spacing.micro};
        }
        
        .contact-info {
          font-size: ${theme.fontSizes.supporting};
          margin-bottom: ${theme.spacing.element};
        }
        
        .contact-row {
          margin-bottom: 2px;
          text-align: right;
        }
        
        .contact-label {
          font-weight: bold;
          color: ${theme.colors.primary};
        }
          /* Job and project titles */
        .job-title,
        .project-title {
          font-size: ${theme.fontSizes.jobTitle};
          font-weight: bold;
          color: ${theme.colors.primary};
          margin-bottom: ${theme.spacing.tiny};
          /* TASK 2: Keep job title with company and first responsibility */
          page-break-after: avoid !important;
          break-after: avoid-page !important;
        }
        
        .company,
        .institution {
          font-weight: bold;
          margin-bottom: ${theme.spacing.tiny};
        }
        
        .period {
          font-style: italic;
          color: #666;
          margin-bottom: ${theme.spacing.micro};
        }
        
        /* Lists */
        ul {
          margin-left: 16px;
          margin-bottom: ${theme.spacing.micro};
        }
        
        li {
          margin-bottom: 2px;
          line-height: 1.3;
        }        /* TASK 3: Two-column skills layout - FIXED ✅ */
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          column-gap: 20px; /* Space between columns */
          row-gap: 10px; /* Space between rows */
          margin-bottom: 0; /* Remove margin to prevent gaps */
          margin-top: 8px;
        }
        
        .skill-category {
          flex: 0 0 calc(50% - 10px); /* Two columns with gap consideration */
          margin-bottom: ${theme.spacing.micro}; /* Small gap between rows */
          break-inside: avoid-page !important;
          page-break-inside: avoid !important;
          background-color: #f9f9f9;
          border-radius: 4px;
          padding: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .skill-category-title {
          font-weight: bold;
          color: ${theme.colors.primary};
          margin-bottom: 6px;
          border-bottom: 1px solid #eee;
          padding-bottom: 4px;
        }
        
        .skill-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .skill-item {
          background-color: #f0f5ff;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid #d0e0ff;
          font-size: 0.9em;
          display: inline-block;
        }
          /* Two-column certifications */
        .certifications-grid {
          display: flex;
          gap: 20px;
          margin-top: 8px;
        }
        
        .cert-column {
          flex: 1;
          min-width: 0; /* Allow columns to shrink below content size */
        }
        
        .certification-item {
          margin-bottom: 12px;
          padding: 8px;
          border-radius: 4px;
          background-color: #f9f9f9;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .cert-title {
          font-weight: bold;
          color: ${theme.colors.primary};
          margin-bottom: 2px;
        }
        
        .cert-issuer {
          font-style: italic;
          margin-bottom: 2px;
        }
        
        .cert-date {
          font-size: 0.9em;
          color: #666;
          margin-bottom: 2px;
        }
        
        .cert-skills {
          font-size: 0.9em;
          border-top: 1px solid #eee;
          padding-top: 4px;
          margin-top: 4px;
        }
        
        .skill-category-title {
          font-weight: bold;
          color: ${theme.colors.primary};
          margin-bottom: 1px;
          font-size: ${theme.fontSizes.supporting};
        }
        
        .skill-list {
          font-size: ${theme.fontSizes.supporting};
          line-height: 1.2;
        }
          /* Responsive fallback for narrow pages */
        @media print and (max-width: 180mm) {
          .skills-grid {
            flex-direction: column;
          }
          
          .skill-category {
            flex: 0 0 100%;
          }
        }
        
        /* Summary section */
        .summary {
          text-align: justify;
          line-height: 1.4;
          margin-bottom: ${theme.spacing.element};
        }
        
        /* Fine-tune spacing for zero gaps */
        .section:last-child {
          margin-bottom: 0;
        }
          /* Print optimizations */
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          
          /* Enhanced page break control for print */
          .section-header {
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }
          
          /* Job titles should stay with company and description */
          .job-title, .project-title {
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }
          
          .experience-item,
          .project-item,
          .education-item,
          .certification-item {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
            display: block !important;
          }
          
          /* Avoid breaking between company and first list item */
          .company, .institution, .period {
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }
          
          /* Keep section headers with first content */
          .section-header + * {
            break-before: avoid-page !important;
            page-break-before: avoid !important;
          }
        }
      </style>
    </head>
    <body>
      ${generateHeader(normalizedCvData, t)}
      ${generateSummary(normalizedCvData, t)}
      ${generateSkills(normalizedCvData, t)}
      ${generateExperience(normalizedCvData, t)}
      ${generateProjects(normalizedCvData, t)}
      ${generateEducation(normalizedCvData, t)}
      ${generateCertifications(normalizedCvData, t)}
      ${generateAdditionalSections(normalizedCvData, t)}
    </body>
    </html>
  `;
};

// Helper functions for generating sections
function generateHeader(cvData, t) {
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  
  // Safety check for missing data
  if (!cvData.personalInfo) {
    return `<div class="header"><div class="name">CV</div></div>`;
  }
  
  // Convert Mongoose document to plain object if needed
  let personalInfo = cvData.personalInfo;
  if (typeof personalInfo.toObject === 'function') {
    personalInfo = personalInfo.toObject();
  } else if (typeof personalInfo.toJSON === 'function') {
    personalInfo = personalInfo.toJSON();
  }
  
  // Remove Mongoose specific properties
  if (personalInfo._id) delete personalInfo._id;
  
  const name = personalInfo.name || 'CV';
  const title = personalInfo.title || '';
  let contact = personalInfo.contact || {};
  
  // Convert contact Mongoose document to plain object if needed
  if (typeof contact.toObject === 'function') {
    contact = contact.toObject();
  } else if (typeof contact.toJSON === 'function') {
    contact = contact.toJSON();
  }
  
  // Remove Mongoose specific properties from contact
  if (contact._id) delete contact._id;
    // Format contact info safely
  const formatContact = (item, label) => {
    return item ? `<div class="contact-row"><span class="contact-label">${t(label.toLowerCase())}:</span> ${item}</div>` : '';
  };
  
  return `
    <div class="header">
      <div class="header-main">
        <div class="header-left">
          <div class="name">${name}</div>
          ${title ? `<div class="title">${title}</div>` : ''}
        </div>
        <div class="header-right">
          <div class="contact-info">
            ${formatContact(contact.email, 'email')}
            ${formatContact(contact.phone, 'phone')}
            ${formatContact(contact.location, 'location')}
            ${formatContact(contact.linkedin, 'linkedin')}
            ${formatContact(contact.github, 'github')}
            ${formatContact(contact.portfolio, 'portfolio')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateSummary(cvData, t) {
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }

  if (!cvData.summary) return '';
  
  // Safely extract summary text, handling Mongoose documents
  let summaryText = cvData.summary;
  if (typeof summaryText === 'object' && summaryText !== null) {
    // Handle if summary is an object (Mongoose document format)
    if (typeof summaryText.toObject === 'function') {
      summaryText = summaryText.toObject();
    } else if (typeof summaryText.toJSON === 'function') {
      summaryText = summaryText.toJSON();
    }
    
    // If it's still an object, convert to string representation
    if (typeof summaryText === 'object') {
      if (summaryText._id) delete summaryText._id; // Remove Mongoose _id if present
      summaryText = Object.values(summaryText).join(' ');
    }
  }
    return `
    <div class="section">
      <div class="section-header">${t('professional_summary')}</div>
      <div class="summary">${summaryText}</div>
    </div>
  `;
}

function generateSkills(cvData, t) {
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }

  if (!cvData.skills) return '';
  
  // First convert Mongoose document to plain object if needed
  let skillsData = cvData.skills;
  if (typeof skillsData.toObject === 'function') {
    skillsData = skillsData.toObject();
  } else if (typeof skillsData.toJSON === 'function') {
    skillsData = skillsData.toJSON();
  }
  
  // Remove Mongoose specific properties
  if (skillsData._id) delete skillsData._id;
  
  const skillCategories = Object.entries(skillsData).map(([category, skills]) => {
    // Skip if skills array is empty or undefined
    if (!skills || (Array.isArray(skills) && skills.length === 0)) {
      return '';
    }
    
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Safely handle skills data in different formats
    let skillsList = '';
    
    try {
      if (Array.isArray(skills)) {
        // If skills is an array (most common case)
        skillsList = skills.map(skill => {
          // Convert any objects to string representation
          if (typeof skill === 'object' && skill !== null) {
            if (skill._id) delete skill._id; // Remove Mongoose _id if present
            
            // Handle case for object with name/level properties
            if (skill.name) {
              return `<span class="skill-item">${skill.name}${skill.level ? `: ${skill.level}` : ''}</span>`;
            }
            
            // Otherwise use the first key/value pair
            const key = Object.keys(skill)[0];
            return key ? `<span class="skill-item">${key}: ${skill[key]}</span>` : '';
          }
          
          // Simple string case
          return `<span class="skill-item">${skill}</span>`;
        }).filter(Boolean).join(''); // Filter out empty items
      } else if (typeof skills === 'object' && skills !== null) {
        // If skills is an object with nested properties
        skillsList = Object.entries(skills)
          .map(([key, value]) => {
            if (key === '_id') return ''; // Skip Mongoose _id
            
            // Handle nested arrays or objects
            if (Array.isArray(value)) {
              return `<span class="skill-item">${key}: ${value.join(', ')}</span>`;
            } else if (typeof value === 'object' && value !== null) {
              if (value._id) delete value._id; // Remove Mongoose _id
              return `<span class="skill-item">${key}: ${Object.values(value).join(', ')}</span>`;
            }
            return `<span class="skill-item">${key}: ${value}</span>`;
          })
          .filter(Boolean) // Remove empty strings
          .join('');
      } else {
        // If skills is a string, split by commas and format
        skillsList = String(skills || '')
          .split(',')
          .map(skill => `<span class="skill-item">${skill.trim()}</span>`)
          .join('');
      }
    } catch (error) {
      console.error(`Error formatting skills for category ${category}:`, error);
      skillsList = `<span class="skill-item">Error formatting skills</span>`;
    }
    
    return skillsList ? `
      <div class="skill-category">
        <div class="skill-category-title">${categoryTitle}</div>
        <div class="skill-list">${skillsList}</div>
      </div>
    ` : '';
  }).filter(Boolean).join(''); // Filter out empty categories
    return skillCategories ? `
    <div class="section">
      <div class="section-header">${t('technical_skills')}</div>
      <div class="skills-grid">
        ${skillCategories}
      </div>
    </div>
  ` : '';
}

function generateExperience(cvData, t) {
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }

  if (!cvData.experience || cvData.experience.length === 0) return '';
  
  // Convert Mongoose document array to plain array if needed
  let experience = cvData.experience;
  if (typeof experience.toObject === 'function') {
    experience = experience.toObject();
  } else if (typeof experience.toJSON === 'function') {
    experience = experience.toJSON();
  }
  
  const experienceItems = experience.map(exp => {
    // Convert individual Mongoose document to plain object if needed
    let expData = exp;
    if (typeof exp.toObject === 'function') {
      expData = exp.toObject();
    } else if (typeof exp.toJSON === 'function') {
      expData = exp.toJSON();
    }
    
    // Remove Mongoose specific properties
    if (expData._id) delete expData._id;
    
    // Handle responsibilities safely
    let responsibilities = expData.responsibilities || [];
    if (typeof responsibilities.toObject === 'function') {
      responsibilities = responsibilities.toObject();
    } else if (typeof responsibilities.toJSON === 'function') {
      responsibilities = responsibilities.toJSON();
    }
    
    // Ensure responsibilities is an array
    if (!Array.isArray(responsibilities)) {
      if (typeof responsibilities === 'string') {
        responsibilities = [responsibilities];
      } else {
        responsibilities = [];
      }
    }
    
    return `
    <div class="experience-item">
      <div class="job-title">${expData.title || ''}</div>
      <div class="company">${expData.company || ''}</div>
      <div class="period">${expData.period || ''}</div>
      <ul>
        ${responsibilities.slice(0, 4).map(resp => `<li>${resp}</li>`).join('')}
      </ul>
    </div>
  `}).join('');
    return `
    <div class="section">
      <div class="section-header">${t('professional_experience')}</div>
      ${experienceItems}
    </div>
  `;
}

function generateProjects(cvData, t) {
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  
  if (!cvData.projects || cvData.projects.length === 0) return '';
  
  // Convert Mongoose document array to plain array if needed
  let projects = cvData.projects;
  if (typeof projects.toObject === 'function') {
    projects = projects.toObject();
  } else if (typeof projects.toJSON === 'function') {
    projects = projects.toJSON();
  }
  
  const projectItems = projects.map(project => {
    // Convert individual Mongoose document to plain object if needed
    let projectData = project;
    if (typeof project.toObject === 'function') {
      projectData = project.toObject();
    } else if (typeof project.toJSON === 'function') {
      projectData = project.toJSON();
    }
    
    // Remove Mongoose specific properties
    if (projectData._id) delete projectData._id;
    
    // Handle technologies safely
    let technologies = projectData.technologies || [];
    if (typeof technologies.toObject === 'function') {
      technologies = technologies.toObject();
    } else if (typeof technologies.toJSON === 'function') {
      technologies = technologies.toJSON();
    }
    
    // Ensure technologies is an array
    if (!Array.isArray(technologies)) {
      if (typeof technologies === 'string') {
        technologies = [technologies];
      } else {
        technologies = [];
      }
    }
    
    // Handle key features safely
    let keyFeatures = projectData.keyFeatures || [];
    if (typeof keyFeatures.toObject === 'function') {
      keyFeatures = keyFeatures.toObject();
    } else if (typeof keyFeatures.toJSON === 'function') {
      keyFeatures = keyFeatures.toJSON();
    }
    
    // Ensure keyFeatures is an array
    if (!Array.isArray(keyFeatures)) {
      if (typeof keyFeatures === 'string') {
        keyFeatures = [keyFeatures];
      } else {
        keyFeatures = [];
      }
    }
      return `
    <div class="project-item">
      <div class="project-title">${projectData.name || ''}</div>
      <div class="description">${projectData.description || ''}</div>
      <div class="technologies"><strong>${t('technologies')}:</strong> ${technologies.join(', ')}</div>
      ${keyFeatures.length > 0 ? `
        <ul>
          ${keyFeatures.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `}).join('');
    return `
    <div class="section">
      <div class="section-header">${t('projects')}</div>
      ${projectItems}
    </div>
  `;
}

function generateEducation(cvData, t) {
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  
  if (!cvData.education || cvData.education.length === 0) return '';
  
  // Convert Mongoose document array to plain array if needed
  let education = cvData.education;
  if (typeof education.toObject === 'function') {
    education = education.toObject();
  } else if (typeof education.toJSON === 'function') {
    education = education.toJSON();
  }
  
  const educationItems = education.map(edu => {
    // Convert individual Mongoose document to plain object if needed
    let eduData = edu;
    if (typeof edu.toObject === 'function') {
      eduData = edu.toObject();
    } else if (typeof edu.toJSON === 'function') {
      eduData = edu.toJSON();
    }
    
    // Remove Mongoose specific properties
    if (eduData._id) delete eduData._id;
    
    return `
    <div class="education-item">
      <div class="job-title">${eduData.degree || ''}</div>
      <div class="institution">${eduData.institution || ''}</div>
      <div class="period">${eduData.period || ''}</div>
      ${eduData.details ? `<div class="description">${eduData.details}</div>` : ''}
    </div>
  `}).join('');
    return `
    <div class="section">
      <div class="section-header">${t('education')}</div>
      ${educationItems}
    </div>
  `;
}

function generateCertifications(cvData, t) {
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }

  if (!cvData.certifications || cvData.certifications.length === 0) return '';
  
  // Convert Mongoose document array to plain array if needed
  let certifications = cvData.certifications;
  if (typeof certifications.toObject === 'function') {
    certifications = certifications.toObject();
  } else if (typeof certifications.toJSON === 'function') {
    certifications = certifications.toJSON();
  }
  
  // Split certifications into two columns
  const midpoint = Math.ceil(certifications.length / 2);
  const leftColumn = certifications.slice(0, midpoint);
  const rightColumn = certifications.slice(midpoint);
  
  // Generate certification item HTML
  const generateCertItem = (cert) => {
    try {
      // Convert individual Mongoose document to plain object if needed
      let certData = cert;
      if (typeof cert.toObject === 'function') {
        certData = cert.toObject();
      } else if (typeof cert.toJSON === 'function') {
        certData = cert.toJSON();
      }
      
      // Remove Mongoose specific properties
      if (certData._id) delete certData._id;
      
      const name = certData.name || 'Certification';
      const issuer = certData.issuer || '';
      const date = certData.date || certData.year || '';
      const type = certData.type || '';
        return `
      <div class="certification-item">
        <div class="cert-title">${name}</div>
        <div class="cert-issuer">${issuer}${type ? ` - ${type}` : ''}</div>
        ${date ? `<div class="cert-date">${t('date')}: ${date}</div>` : ''}
        ${certData.skills ? `<div class="cert-skills">${t('skills')}: ${certData.skills}</div>` : ''}
      </div>
      `;
    } catch (error) {
      console.error('Error formatting certification:', error);
      return `
      <div class="certification-item">
        <div class="cert-title">Certification (Error)</div>
        <div class="cert-issuer">Error processing certification data</div>
      </div>
      `;
    }
  };
  
  // Generate left column
  const leftColumnItems = leftColumn.map(generateCertItem).join('');
  
  // Generate right column (only if there are items)
  const rightColumnItems = rightColumn.length > 0 
    ? rightColumn.map(generateCertItem).join('')
    : '';
    return `
    <div class="section">
      <div class="section-header">${t('certifications')}</div>
      <div class="certifications-grid">
        <div class="cert-column">
          ${leftColumnItems}
        </div>
        ${rightColumn.length > 0 ? `
        <div class="cert-column">
          ${rightColumnItems}
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function generateAdditionalSections(cvData, t) {
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }
  // If t is not provided, create a default one
  if (typeof t !== 'function') {
    t = createTranslationHelper(cvData);
  }

  let additionalHTML = '';
  
  // Languages
  if (cvData.languages && cvData.languages.length > 0) {
    // Convert Mongoose document array to plain array if needed
    let languages = cvData.languages;
    if (typeof languages.toObject === 'function') {
      languages = languages.toObject();
    } else if (typeof languages.toJSON === 'function') {
      languages = languages.toJSON();
    }
    
    const languagesList = languages.map(lang => {
      // Convert individual Mongoose document to plain object if needed
      let langData = lang;
      if (typeof lang.toObject === 'function') {
        langData = lang.toObject();
      } else if (typeof lang.toJSON === 'function') {
        langData = lang.toJSON();
      }
      
      // Remove Mongoose specific properties
      if (langData._id) delete langData._id;
      
      return `${langData.language || ''}: ${langData.level || ''}`;
    }).join(' | ');
      additionalHTML += `
      <div class="section">
        <div class="section-header">${t('languages')}</div>
        <div>${languagesList}</div>
      </div>
    `;
  }
  
  // Interests
  if (cvData.interests && cvData.interests.length > 0) {
    // Convert Mongoose document array to plain array if needed
    let interests = cvData.interests;
    if (typeof interests.toObject === 'function') {
      interests = interests.toObject();
    } else if (typeof interests.toJSON === 'function') {
      interests = interests.toJSON();
    }
    
    // Ensure interests is a simple array of strings
    let interestsArray = Array.isArray(interests) ? interests : [interests];
    interestsArray = interestsArray.map(item => {
      if (typeof item === 'object' && item !== null) {
        if (item._id) delete item._id; // Remove Mongoose _id
        return Object.values(item).join(', ');
      }
      return item;
    });
      additionalHTML += `
      <div class="section">
        <div class="section-header">${t('interests')}</div>
        <div>${interestsArray.join(', ')}</div>
      </div>
    `;
  }
  
  return additionalHTML;
}

module.exports = {
  generateSmartPageBreakHTML
};
