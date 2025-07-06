/**
 * AI Services Index - Central export for all AI-related services
 * Provides easy access to all AI functionality modules
 */

const AIService = require('./aiService');
const FileProcessingService = require('./fileProcessingService');
const CVProcessingService = require('./cvProcessingService');
const CoverLetterService = require('./coverLetterService');
const CVValidationService = require('./cvValidationService');
const CVTailoringService = require('./cvTailoringService');

module.exports = {
  AIService,
  FileProcessingService,
  CVProcessingService,
  CoverLetterService,
  CVValidationService,
  CVTailoringService
};
