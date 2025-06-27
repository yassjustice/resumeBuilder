/**
 * AI Routes - Clean route definitions using modular services
 * Handles AI-powered CV processing, file uploads, and cover letter generation
 */
const express = require('express');
const AIService = require('../services/ai/aiService');
const FileProcessingService = require('../services/ai/fileProcessingService');
const CVProcessingService = require('../services/ai/cvProcessingService');
const CoverLetterService = require('../services/ai/coverLetterService');

const router = express.Router();

// Initialize services
const aiService = new AIService();
const fileProcessingService = new FileProcessingService();
const cvProcessingService = new CVProcessingService();
const coverLetterService = new CoverLetterService();

/**
 * @route   GET /api/ai/test
 * @desc    Test AI service connectivity
 * @access  Public
 */
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing Gemini AI connection...');
    const response = await aiService.testConnection();
    
    console.log('✅ AI test successful');
    
    res.json({
      success: true,
      message: 'AI service is working',
      response: response
    });

  } catch (error) {
    console.error('❌ AI test failed:', error);
    res.status(500).json({
      success: false,
      message: 'AI service test failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/files/upload
 * @desc    Upload and process CV file
 * @access  Public
 */
router.post('/upload', fileProcessingService.getUploadMiddleware(), async (req, res) => {
  try {
    console.log('🔄 File upload request received');
    console.log('📁 Request file:', req.file);
    console.log('📋 Request body:', req.body);
    
    const result = await fileProcessingService.processFile(req.file);
    res.json(result);

  } catch (error) {
    console.error('❌ File upload error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to process file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/extract-cv
 * @desc    Extract structured CV data from text using AI
 * @access  Public
 */
router.post('/extract-cv', async (req, res) => {
  try {
    const { text } = req.body;
    
    const cvData = await cvProcessingService.extractCVFromText(text);
    
    res.json({
      success: true,
      data: cvData,
      message: 'CV data extracted successfully'
    });

  } catch (error) {
    console.error('❌ CV extraction error:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to extract CV data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/ai/extract-job-offer
 * @desc    Extract job offer requirements using AI
 * @access  Public
 */
router.post('/extract-job-offer', async (req, res) => {
  try {
    const { text } = req.body;
    
    const jobData = await cvProcessingService.extractJobOffer(text);
    
    res.json({
      success: true,
      data: jobData,
      message: 'Job offer data extracted successfully'
    });

  } catch (error) {
    console.error('Job offer extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract job offer data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/tailor-cv
 * @desc    Generate tailored CV using AI
 * @access  Public
 */
router.post('/tailor-cv', async (req, res) => {
  try {
    const { cv, jobOffer, additionalRequirements } = req.body;
    
    // Use the new advanced tailoring service
    const CVTailoringService = require('../services/ai/cvTailoringService');
    const tailoringService = new CVTailoringService();
    
    const tailoredCV = await tailoringService.tailorCV(cv, jobOffer, additionalRequirements);
    
    res.json({
      success: true,
      data: tailoredCV,
      message: 'CV tailored successfully using advanced AI processing'
    });

  } catch (error) {
    console.error('Advanced CV tailoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to tailor CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/generate-cover-letter
 * @desc    Generate cover letter using AI
 * @access  Public
 */
router.post('/generate-cover-letter', async (req, res) => {
  try {
    const { cv, jobOffer, additionalRequirements } = req.body;
    
    const result = await coverLetterService.generateCoverLetter(cv, jobOffer, additionalRequirements);
    
    res.json({
      success: true,
      data: result,
      message: 'Cover letter generated successfully'
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/download/cover-letter
 * @desc    Generate PDF for cover letter content
 * @access  Public
 */
router.post('/download/cover-letter', async (req, res) => {
  try {
    const { content, fileName } = req.body;
    
    const pdfBuffer = await coverLetterService.generateCoverLetterPDF(content, fileName);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'cover-letter'}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Cover letter PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
