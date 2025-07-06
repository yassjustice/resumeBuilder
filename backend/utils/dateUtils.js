/**
 * Date Utilities for Backend CV Processing
 * Handles date normalization, formatting, and validation for CV data
 */

/**
 * Format date for input fields (yyyy-MM-dd)
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string or original if "Present"
 */
function formatDateForInput(date) {
  if (!date || date === 'Present' || date === 'Current' || date === 'Now') {
    return 'Present';
  }
  
  if (typeof date === 'string') {
    // Handle various date formats
    const cleanDate = date.trim();
    
    // Already in yyyy-MM-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return cleanDate;
    }
    
    // Handle MM/yyyy or MM-yyyy format
    if (/^\d{1,2}[-/]\d{4}$/.test(cleanDate)) {
      const [month, year] = cleanDate.split(/[-/]/);
      return `${year}-${month.padStart(2, '0')}-01`;
    }
    
    // Handle yyyy format
    if (/^\d{4}$/.test(cleanDate)) {
      return `${cleanDate}-01-01`;
    }
    
    // Handle Month YYYY format (e.g., "January 2020")
    if (/^[A-Za-z]+ \d{4}$/.test(cleanDate)) {
      const monthNames = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12',
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09',
        'oct': '10', 'nov': '11', 'dec': '12'
      };
      
      const [monthStr, year] = cleanDate.toLowerCase().split(' ');
      const month = monthNames[monthStr];
      if (month) {
        return `${year}-${month}-01`;
      }
    }
    
    // Try to parse as Date
    try {
      const parsed = new Date(cleanDate);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (e) {
      // Fall through to return original
    }
  }
  
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  return date; // Return original if can't parse
}

/**
 * Format date for storage/display
 * @param {string} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDateForStorage(date) {
  if (!date || date === 'Present' || date === 'Current' || date === 'Now') {
    return 'Present';
  }
  
  return formatDateForInput(date);
}

/**
 * Check if date represents "Present" or ongoing
 * @param {string} date - Date to check
 * @returns {boolean} - True if date represents present/ongoing
 */
function isDatePresent(date) {
  if (!date) return false;
  
  const presentTerms = ['present', 'current', 'now', 'ongoing', 'till date', 'to date'];
  return presentTerms.includes(date.toLowerCase().trim());
}

/**
 * Normalize date range for CV entries
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} - Normalized date range
 */
function normalizeDateRange(startDate, endDate) {
  return {
    startDate: formatDateForInput(startDate),
    endDate: formatDateForInput(endDate),
    isOngoing: isDatePresent(endDate)
  };
}

/**
 * Parse period string into start and end dates
 * @param {string} period - Period string (e.g., "Jan 2020 - Present")
 * @returns {Object} - Parsed dates
 */
function parsePeriodString(period) {
  if (!period || typeof period !== 'string') {
    return { startDate: '', endDate: '' };
  }
  
  // Handle various separators
  const separators = [' - ', ' – ', ' to ', ' until ', '-', '–'];
  let separator = separators.find(sep => period.includes(sep));
  
  if (!separator) {
    // Single date or year
    return {
      startDate: formatDateForInput(period.trim()),
      endDate: formatDateForInput(period.trim())
    };
  }
  
  const [start, end] = period.split(separator).map(d => d.trim());
  
  return {
    startDate: formatDateForInput(start),
    endDate: formatDateForInput(end)
  };
}

/**
 * Validate date format
 * @param {string} date - Date to validate
 * @returns {boolean} - True if valid
 */
function isValidDate(date) {
  if (!date || isDatePresent(date)) {
    return true;
  }
  
  // Check if it's a valid date format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  
  return false;
}

/**
 * Enhanced date formatting for different languages and cultures
 * @param {string|Date} date - Date to format
 * @param {string} language - Language code (en, fr, ar)
 * @param {string} format - Format type: 'short', 'medium', 'long'
 * @returns {string} - Culturally appropriate formatted date
 */
function formatDateForLanguage(date, language = 'en', format = 'medium') {
  if (!date || date === 'Present' || date === 'Current' || date === 'Now') {
    const presentTranslations = {
      en: 'Present',
      fr: 'Présent',
      ar: 'الحاضر'
    };
    return presentTranslations[language] || 'Present';
  }

  // Convert to standardized date first
  const standardDate = formatDateForInput(date);
  if (standardDate === 'Present') {
    const presentTranslations = {
      en: 'Present',
      fr: 'Présent',
      ar: 'الحاضر'
    };
    return presentTranslations[language] || 'Present';
  }

  const dateObj = new Date(standardDate);
  if (isNaN(dateObj.getTime())) {
    return date; // Return original if parsing fails
  }

  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();

  // Month names for different languages
  const monthNames = {
    en: {
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    fr: {
      short: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      long: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    },
    ar: {
      short: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      long: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    }
  };

  const months = monthNames[language] || monthNames.en;

  switch (format) {
    case 'short':
      return language === 'ar' 
        ? `${months.short[month]} ${year}`  // Arabic: Month Year
        : `${months.short[month]} ${year}`;  // Others: Month Year
    case 'long':
      return language === 'ar'
        ? `${months.long[month]} ${year}`
        : `${months.long[month]} ${year}`;
    case 'medium':
    default:
      // MM/yyyy format for most languages, but adapt for cultural preferences
      if (language === 'ar') {
        return `${months.short[month]} ${year}`;
      } else if (language === 'fr') {
        return `${months.short[month]} ${year}`;
      } else {
        return `${(month + 1).toString().padStart(2, '0')}/${year}`;
      }
  }
}

/**
 * Enhanced date range formatting for different languages
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @param {string} language - Language code
 * @returns {string} - Formatted date range
 */
function formatDateRangeForLanguage(startDate, endDate, language = 'en') {
  const start = formatDateForLanguage(startDate, language, 'medium');
  const end = formatDateForLanguage(endDate, language, 'medium');
  
  const separators = {
    en: ' - ',
    fr: ' - ',
    ar: ' - '
  };
  
  const separator = separators[language] || ' - ';
  return `${start}${separator}${end}`;
}

module.exports = {
  formatDateForInput,
  formatDateForStorage,
  isDatePresent,
  normalizeDateRange,
  parsePeriodString,
  isValidDate,
  formatDateForLanguage,
  formatDateRangeForLanguage
};
