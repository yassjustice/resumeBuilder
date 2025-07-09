/**
 * Puter Services Index - Modular Architecture
 * Central export point for all Puter AI services
 * Follows the modular pattern established by Gemini services with brutal efficiency
 */

// Core service manager
const PuterServiceManager = require('./puterServiceManager');

// New modular engines
const PuterAuthEngine = require('./engines/PuterAuthEngine');
const PuterRequestEngine = require('./engines/PuterRequestEngine');
const PuterResponseEngine = require('./engines/PuterResponseEngine');

// Specialized tailoring engines
const PuterJobAnalysisEngine = require('./tailoring/PuterJobAnalysisEngine');
const PuterCVTailoringEngine = require('./tailoring/PuterCVTailoringEngine');

// Utility classes
const PuterDataValidator = require('./utils/PuterDataValidator');
const PuterResponseParser = require('./utils/PuterResponseParser');
const PuterPerformanceMonitor = require('./utils/PuterPerformanceMonitor');
const PuterErrorHandler = require('./utils/PuterErrorHandler');

// New modular Puter service
const PuterModularService = require('./PuterModularService');

// Create singleton instances
const puterServiceManager = new PuterServiceManager();

// Create modular service instance
const puterModularService = new PuterModularService();

module.exports = {
  // Main modular service (recommended for new implementations)
  puterModularService,
  
  // Service manager
  puterServiceManager,
  
  // Engine classes (for direct instantiation if needed)
  PuterAuthEngine,
  PuterRequestEngine,
  PuterResponseEngine,
  PuterJobAnalysisEngine,
  PuterCVTailoringEngine,
  
  // Utility classes
  PuterDataValidator,
  PuterResponseParser,
  PuterPerformanceMonitor,
  PuterErrorHandler,
  
  // Main service class
  PuterModularService
};
