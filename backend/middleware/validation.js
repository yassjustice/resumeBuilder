/**
 * Validation Middleware
 * Request validation using express-validator
 */

const { body, param, validationResult } = require('express-validator');
const { APIError } = require('./errorHandler');

/**
 * Middleware to handle validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => 
      `${error.path}: ${error.msg}`
    ).join(', ');
    
    return next(new APIError(`Validation failed: ${errorMessages}`, 400));
  }
  
  next();
};

/**
 * CV creation/update validation rules
 */
const validateCV = [
  body('language')
    .isIn(['en', 'fr'])
    .withMessage('Language must be either "en" or "fr"'),
  
  body('theme')
    .isIn(['professional', 'modern', 'minimal'])
    .withMessage('Theme must be one of: professional, modern, minimal'),
  
  body('personalInfo.name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('personalInfo.title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  
  body('personalInfo.contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('personalInfo.contact.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
    body('summary')
    .notEmpty()
    .withMessage('Summary is required')
    .isLength({ min: 10, max: 1000 }) // Reduced minimum length requirement
    .withMessage('Summary must be between 10 and 1000 characters'),
  
  body('skills')
    .isObject()
    .withMessage('Skills must be an object'),
  
  body('skills.frontend')
    .optional()
    .isArray()
    .withMessage('Frontend skills must be an array'),
  
  body('skills.backend')
    .optional()
    .isArray()
    .withMessage('Backend skills must be an array'),
    body('experience')
    .isArray()
    .withMessage('Experience must be an array')
    .optional(), // Made experience optional
  
  body('experience.*.title')
    .notEmpty()
    .withMessage('Experience title is required'),
  
  body('experience.*.company')
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('experience.*.period')
    .notEmpty()
    .withMessage('Experience period is required'),
  
  body('experience.*.responsibilities')
    .isArray()
    .withMessage('Responsibilities must be an array')
    .isLength({ min: 1 })
    .withMessage('At least one responsibility is required'),
  
  handleValidationErrors
];

/**
 * CV ID parameter validation (strict - requires real MongoDB ObjectId)
 */
const validateCVId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid CV ID format'),
  
  handleValidationErrors
];

/**
 * Flexible CV ID validation for preview (allows generated IDs)
 */
const validateCVIdForPreview = [
  param('id')
    .isLength({ min: 3, max: 50 })
    .withMessage('ID must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('ID can only contain letters, numbers, hyphens, and underscores'),
  
  handleValidationErrors
];

/**
 * Theme validation rules
 */
const validateTheme = [
  body('name')
    .notEmpty()
    .withMessage('Theme name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Theme name must be between 2 and 50 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Theme name must contain only lowercase letters, numbers, and hyphens'),
  
  body('displayName')
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters'),
  
  body('colors.primary')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Primary color must be a valid hex color'),
  
  body('typography.main')
    .notEmpty()
    .withMessage('Main font is required'),
  
  body('useCase')
    .optional()
    .isIn(['corporate', 'tech', 'creative', 'general'])
    .withMessage('Use case must be one of: corporate, tech, creative, general'),
  
  handleValidationErrors
];

/**
 * PDF generation validation
 */
const validatePDFRequest = [
  param('id')
    .isMongoId()
    .withMessage('Invalid CV ID format'),
  
  body('format')
    .optional()
    .isIn(['pdf', 'a4'])
    .withMessage('Format must be either "pdf" or "a4"'),
  
  body('includeHeaders')
    .optional()
    .isBoolean()
    .withMessage('includeHeaders must be a boolean'),
  
  body('marginSize')
    .optional()
    .isIn(['small', 'medium', 'large'])
    .withMessage('Margin size must be small, medium, or large'),
  
  handleValidationErrors
];

module.exports = {
  validateCV,
  validateCVId,
  validateCVIdForPreview,
  validateTheme,
  validatePDFRequest,
  handleValidationErrors
};
