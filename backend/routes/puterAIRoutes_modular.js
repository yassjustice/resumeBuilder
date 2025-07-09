/**
 * Puter AI Routes - Modular Implementation v2.0
 * Advanced modular routes using the new Puter Modular Service
 * Implements brutal authentication, request processing, and response handling
 */

const express = require('express');
const router = express.Router();

// Import the new modular Puter service
const { puterModularService } = require('../services/ai/puter');

/**
 * @route   GET /api/puter/v2/status
 * @desc    Get comprehensive Puter service status
 * @access  Public
 */
router.get('/v2/status', async (req, res) => {
  try {
    console.log('🔍 Checking Puter modular service status...');
    
    const status = puterModularService.getStatus();
    
    res.json({
      success: true,
      message: 'Puter modular service is operational',
      status,
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });

  } catch (error) {
    console.error('❌ Puter status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Puter service status check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/puter/v2/extract-cv
 * @desc    Extract structured CV data from Puter AI response (v2.0)
 * @access  Public
 */
router.post('/v2/extract-cv', async (req, res) => {
  try {
    const { puterData, options = {} } = req.body;
    
    console.log(`🆓 Processing CV extraction from Puter.js v2.0 (${puterData?.model})`);
    
    // Extract CV using modular service
    const result = await puterModularService.extractCVFromPuterData(puterData, {
      ...options,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'CV data extracted successfully using Puter Modular Service',
      data: result.data,
      metadata: result.metadata,
      responseMetadata: result.responseMetadata,
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Puter CV extraction v2.0 error:', error);
    
    // Check if the error has preserved data for fallback
    let fallbackData = null;
    let preservedMetadata = null;
    
    if (error.preservedData) {
      fallbackData = error.preservedData.originalData;
      preservedMetadata = error.preservedData.fallbackMetadata;
      console.log('📋 Found preserved CV data in error, including in response');
    }
    
    const errorResponse = {
      success: false,
      message: 'CV extraction failed in Puter Modular Service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'CV extraction failed',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    };
    
    // Include preserved data if available
    if (fallbackData) {
      errorResponse.fallbackData = fallbackData;
      errorResponse.preservedMetadata = preservedMetadata;
      errorResponse.hasFallback = true;
      errorResponse.message += ' - Preserved CV data available for recovery';
    }
    
    res.status(500).json(errorResponse);
  }
});

/**
 * @route   POST /api/puter/v2/enhance-cv
 * @desc    Enhance CV using Puter AI response (v2.0)
 * @access  Public
 */
router.post('/v2/enhance-cv', async (req, res) => {
  try {
    const { puterData, options = {} } = req.body;
    
    console.log(`🆓 Processing CV enhancement from Puter.js v2.0 (${puterData?.model})`);
    
    // Enhance CV using modular service
    const result = await puterModularService.enhanceCVFromPuterData(puterData, {
      ...options,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'CV enhanced successfully using Puter Modular Service',
      data: result.data,
      metadata: result.metadata,
      responseMetadata: result.responseMetadata,
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Puter CV enhancement v2.0 error:', error);
    
    res.status(500).json({
      success: false,
      message: 'CV enhancement failed in Puter Modular Service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'CV enhancement failed',
      version: '2.0.0'
    });
  }
});

/**
 * @route   POST /api/puter/v2/tailor-cv
 * @desc    Tailor CV for specific job using Puter AI (v2.0)
 * @access  Public
 */
router.post('/v2/tailor-cv', async (req, res) => {
  try {
    const { puterData, originalCV, jobData, options = {} } = req.body;
    
    console.log(`🆓 Processing CV tailoring from Puter.js v2.0 (${puterData?.model})`);
    
    // Tailor CV using modular service
    const result = await puterModularService.tailorCVFromPuterData(puterData, originalCV, jobData, {
      ...options,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'CV tailored successfully using Puter Modular Service',
      tailoredCV: result.tailoredCV,
      metadata: result.metadata,
      tailoringMetadata: result.tailoringMetadata,
      puterMetadata: result.puterMetadata,
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Puter CV tailoring v2.0 error:', error);
    
    // Extract request parameters for fallback
    const { originalCV, jobData } = req.body;
    
    // Check if the error has preserved data or fallback scenario
    let fallbackData = originalCV; // Default to original CV
    let preservedMetadata = null;
    
    if (error.preservedData) {
      fallbackData = error.preservedData.originalData || originalCV;
      preservedMetadata = error.preservedData.fallbackMetadata;
      console.log('📋 Found preserved CV data in tailoring error, returning original CV');
    }
    
    const errorResponse = {
      success: false,
      message: 'CV tailoring failed in Puter Modular Service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'CV tailoring failed',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    };
    
    // Always provide fallback CV data for tailoring errors
    if (fallbackData) {
      errorResponse.fallbackCV = {
        ...fallbackData,
        _tailoringFallback: true,
        _tailoringError: error.message,
        _tailoringFallbackTimestamp: new Date().toISOString()
      };
      errorResponse.preservedMetadata = preservedMetadata;
      errorResponse.hasFallback = true;
      errorResponse.message += ' - Original CV preserved for recovery';
      
      console.log('✅ Returning original CV as fallback for failed tailoring');
    }
    
    res.status(500).json(errorResponse);
  }
});

/**
 * @route   POST /api/puter/v2/generate-cover-letter
 * @desc    Generate cover letter from Puter AI data (v2.0)
 * @access  Public
 */
router.post('/v2/generate-cover-letter', async (req, res) => {
  try {
    const { puterData, options = {} } = req.body;
    
    console.log(`🆓 Processing cover letter from Puter.js v2.0 (${puterData?.model})`);
    
    // Generate cover letter using modular service
    const result = await puterModularService.generateCoverLetterFromPuterData(puterData, {
      ...options,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Cover letter generated successfully using Puter Modular Service',
      data: result.data,
      metadata: result.metadata,
      responseMetadata: result.responseMetadata,
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Puter cover letter v2.0 error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Cover letter generation failed in Puter Modular Service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Cover letter generation failed',
      version: '2.0.0'
    });
  }
});

/**
 * @route   POST /api/puter/v2/process-file
 * @desc    Process file using Puter AI (v2.0)
 * @access  Public
 */
router.post('/v2/process-file', async (req, res) => {
  try {
    const { puterData, options = {} } = req.body;
    
    console.log(`🆓 Processing file from Puter.js v2.0 (${puterData?.model})`);
    
    // Process file using modular service
    const result = await puterModularService.processFileFromPuterData(puterData, {
      ...options,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'File processed successfully using Puter Modular Service',
      data: result.data,
      metadata: result.metadata,
      responseMetadata: result.responseMetadata,
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Puter file processing v2.0 error:', error);
    
    res.status(500).json({
      success: false,
      message: 'File processing failed in Puter Modular Service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'File processing failed',
      version: '2.0.0'
    });
  }
});

/**
 * @route   POST /api/puter/v2/analyze-job
 * @desc    Analyze job description using Puter AI (v2.0)
 * @access  Public
 */
router.post('/v2/analyze-job', async (req, res) => {
  try {
    const { puterData, options = {} } = req.body;
    
    console.log(`🆓 Processing job analysis from Puter.js v2.0 (${puterData?.model})`);
    
    // Analyze job using modular service
    const result = await puterModularService.analyzeJobFromPuterData(puterData, {
      ...options,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Job analyzed successfully using Puter Modular Service',
      jobAnalysis: result.jobAnalysis,
      metadata: result.metadata,
      analysisMetadata: result.analysisMetadata,
      puterMetadata: result.puterMetadata,
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Puter job analysis v2.0 error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Job analysis failed in Puter Modular Service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Job analysis failed',
      version: '2.0.0'
    });
  }
});

/**
 * @route   POST /api/puter/v2/clear-caches
 * @desc    Clear all Puter service caches
 * @access  Public
 */
router.post('/v2/clear-caches', async (req, res) => {
  try {
    console.log('🧹 Clearing all Puter service caches...');
    
    puterModularService.clearAllCaches();
    
    res.json({
      success: true,
      message: 'All Puter service caches cleared successfully',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Cache clearing failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Cache clearing failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/puter/v2/reset-metrics
 * @desc    Reset Puter service metrics
 * @access  Public
 */
router.post('/v2/reset-metrics', async (req, res) => {
  try {
    console.log('📊 Resetting Puter service metrics...');
    
    puterModularService.resetMetrics();
    
    res.json({
      success: true,
      message: 'Puter service metrics reset successfully',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Metrics reset failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Metrics reset failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/puter/v2/update-config
 * @desc    Update Puter service configuration
 * @access  Public
 */
router.post('/v2/update-config', async (req, res) => {
  try {
    const { config } = req.body;
    
    console.log('⚙️ Updating Puter service configuration...');
    
    puterModularService.updateConfig(config);
    
    res.json({
      success: true,
      message: 'Puter service configuration updated successfully',
      newConfig: puterModularService.config,
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('❌ Configuration update failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Configuration update failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
