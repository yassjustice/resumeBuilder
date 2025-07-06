/**
 * UI Direction Utilities
 * Handles text direction (LTR/RTL) and UI layout adjustments based on language
 */

/**
 * Determine text direction based on language
 * @param {string} language - Language code (en, fr, ar, es, etc.)
 * @returns {string} - 'rtl' or 'ltr'
 */
export const getTextDirection = (language) => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur']; // Arabic, Hebrew, Persian, Urdu
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
};

/**
 * Get CSS direction class based on language
 * @param {string} language - Language code
 * @returns {string} - CSS class name for direction
 */
export const getDirectionClass = (language) => {
  return getTextDirection(language) === 'rtl' ? 'direction-rtl' : 'direction-ltr';
};

/**
 * Get localized alignment based on language and intended alignment
 * @param {string} language - Language code
 * @param {string} alignment - Intended alignment ('start', 'end', 'left', 'right', 'center')
 * @returns {string} - Localized alignment class
 */
export const getLocalizedAlignment = (language, alignment) => {
  const isRTL = getTextDirection(language) === 'rtl';
  
  switch (alignment) {
    case 'start':
      return isRTL ? 'text-right' : 'text-left';
    case 'end':
      return isRTL ? 'text-left' : 'text-right';
    case 'left':
      return 'text-left';
    case 'right':
      return 'text-right';
    case 'center':
      return 'text-center';
    default:
      return isRTL ? 'text-right' : 'text-left';
  }
};

/**
 * Get flex direction for RTL/LTR layouts
 * @param {string} language - Language code
 * @param {string} direction - Base direction ('row', 'row-reverse', 'column', 'column-reverse')
 * @returns {string} - Localized flex direction
 */
export const getLocalizedFlexDirection = (language, direction = 'row') => {
  const isRTL = getTextDirection(language) === 'rtl';
  
  if (!isRTL) return direction;
  
  switch (direction) {
    case 'row':
      return 'row-reverse';
    case 'row-reverse':
      return 'row';
    default:
      return direction;
  }
};

/**
 * Get padding/margin adjustments for RTL layouts
 * @param {string} language - Language code
 * @param {Object} spacing - Spacing object { left, right, top, bottom }
 * @returns {Object} - Adjusted spacing for RTL
 */
export const getLocalizedSpacing = (language, spacing) => {
  const isRTL = getTextDirection(language) === 'rtl';
  
  if (!isRTL) return spacing;
  
  return {
    ...spacing,
    left: spacing.right,
    right: spacing.left,
    paddingLeft: spacing.paddingRight,
    paddingRight: spacing.paddingLeft,
    marginLeft: spacing.marginRight,
    marginRight: spacing.marginLeft
  };
};

/**
 * Apply direction-aware styles to an element
 * @param {string} language - Language code
 * @param {Object} baseStyles - Base CSS styles object
 * @returns {Object} - Direction-aware styles
 */
export const applyDirectionStyles = (language, baseStyles = {}) => {
  const direction = getTextDirection(language);
  
  return {
    ...baseStyles,
    direction,
    textAlign: direction === 'rtl' ? 'right' : 'left'
  };
};

/**
 * Get language-specific font families and typography settings
 * @param {string} language - Language code
 * @returns {Object} - Typography settings
 */
export const getLanguageTypography = (language) => {
  const typographySettings = {
    en: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      lineHeight: '1.5',
      letterSpacing: '0'
    },
    fr: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      lineHeight: '1.5',
      letterSpacing: '0'
    },
    ar: {
      fontFamily: '"Noto Sans Arabic", "Cairo", "Tahoma", sans-serif',
      lineHeight: '1.6',
      letterSpacing: '0'
    },
    es: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      lineHeight: '1.5',
      letterSpacing: '0'
    }
  };

  return typographySettings[language] || typographySettings.en;
};

/**
 * Check if language requires RTL layout
 * @param {string} language - Language code
 * @returns {boolean} - True if RTL language
 */
export const isRTLLanguage = (language) => {
  return getTextDirection(language) === 'rtl';
};

/**
 * Get document direction attribute
 * @param {string} language - Language code
 * @returns {string} - Direction attribute value
 */
export const getDocumentDirection = (language) => {
  return getTextDirection(language);
};

// Default export with all utilities
export default {
  getTextDirection,
  getDirectionClass,
  getLocalizedAlignment,
  getLocalizedFlexDirection,
  getLocalizedSpacing,
  applyDirectionStyles,
  getLanguageTypography,
  isRTLLanguage,
  getDocumentDirection
};
