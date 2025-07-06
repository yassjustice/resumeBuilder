/**
 * Date Utilities for CV Builder
 * Handles conversion between different date formats
 */

/**
 * Convert various date formats to yyyy-MM-dd format for HTML date inputs
 * @param {string} dateStr - Date in various formats
 * @returns {string} - Date in yyyy-MM-dd format or empty string
 */
export const formatDateForInput = (dateStr) => {
  if (!dateStr || dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'current') {
    return ''; // Return empty for "Present" to indicate ongoing
  }

  // Try to parse different date formats
  let date = null;

  // Handle "YYYY" format (e.g., "2023")
  if (/^\d{4}$/.test(dateStr)) {
    date = new Date(`${dateStr}-01-01`);
  }
  // Handle "Month YYYY" format (e.g., "January 2024", "Jan 2024")
  else if (/^[A-Za-z]+ \d{4}$/.test(dateStr)) {
    date = new Date(dateStr + ' 01');
  }
  // Handle "MM/YYYY" format (e.g., "01/2024")
  else if (/^\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [month, year] = dateStr.split('/');
    date = new Date(`${year}-${month.padStart(2, '0')}-01`);
  }
  // Handle "YYYY-MM-DD" format (already correct)
  else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // Try parsing as is
  else {
    date = new Date(dateStr);
  }

  // Check if date is valid
  if (date && !isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]; // Return yyyy-MM-dd format
  }

  return ''; // Return empty string if parsing fails
};

/**
 * Convert yyyy-MM-dd format back to human-readable format for storage
 * @param {string} isoDate - Date in yyyy-MM-dd format
 * @param {boolean} isEndDate - Whether this is an end date (to add "Present" option)
 * @returns {string} - Human-readable date format
 */
export const formatDateForStorage = (isoDate, isEndDate = false) => {
  if (!isoDate) {
    return isEndDate ? 'Present' : '';
  }

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return isoDate; // Return as-is if invalid
  }

  // Format as "Month YYYY" for better readability
  const options = { year: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Check if a date string represents "Present" or current/ongoing
 * @param {string} dateStr - Date string to check
 * @returns {boolean} - True if represents "Present"
 */
export const isDatePresent = (dateStr) => {
  if (!dateStr) return false;
  const lowerStr = dateStr.toLowerCase();
  return lowerStr === 'present' || lowerStr === 'current' || lowerStr === 'ongoing';
};

export default {
  formatDateForInput,
  formatDateForStorage,
  isDatePresent
};
