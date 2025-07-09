/**
 * Shared AI Services - Singleton instances for quota tracking
 * All routes and services should import from here to ensure proper quota tracking
 */
const AIService = require('./ai/aiService');
const TranslationService = require('./ai/translationService');
const CVProcessingService = require('./ai/cvProcessingService');
const CoverLetterService = require('./ai/coverLetterService');

// Create singleton instances
const aiService = new AIService();
const translationService = new TranslationService();
const cvProcessingService = new CVProcessingService();
const coverLetterService = new CoverLetterService();

console.log('🔗 Shared AI services initialized with singleton pattern');

module.exports = {
  aiService,
  translationService,
  cvProcessingService,
  coverLetterService
};
