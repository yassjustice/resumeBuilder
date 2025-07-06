/**
 * Date Processing Module - Handles advanced date formatting and processing
 */
const { formatDateForInput, formatDateForStorage, isDatePresent } = require('../../../utils/dateUtils');

class DateProcessor {
  /**
   * Process advanced date formatting for all sections
   */
  processAdvancedDateFormatting(sections) {
    // Apply advanced date formatting to experience and education
    const processedSections = { ...sections };
    
    if (sections.experience) {
      processedSections.experience = sections.experience.map(exp => ({
        ...exp,
        startDate: this.processDate(exp.startDate),
        endDate: this.processDate(exp.endDate, true)
      }));
    }
    
    if (sections.education) {
      processedSections.education = sections.education.map(edu => ({
        ...edu,
        startDate: this.processDate(edu.startDate),
        endDate: this.processDate(edu.endDate, true)
      }));
    }
    
    return processedSections;
  }

  /**
   * Process individual date with advanced formatting
   */
  processDate(dateStr, isEndDate = false) {
    if (!dateStr) return isEndDate ? 'Present' : '';
    
    // Handle "Present" cases
    if (isDatePresent(dateStr)) return 'Present';
    
    // Try to format other dates appropriately
    try {
      const formatted = formatDateForStorage(formatDateForInput(dateStr), isEndDate);
      return formatted || dateStr;
    } catch (error) {
      return dateStr; // Return original if formatting fails
    }
  }
}

module.exports = DateProcessor;
