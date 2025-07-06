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
    
    // Process the uploaded file to extract CV data
    const result = await fileProcessingService.processFile(req.file);
    
    // If successful and contains extracted data, add language detection
    if (result.success && result.data) {
      const LanguageService = require('../services/language/languageService');
      const languageService = new LanguageService();
      
      // Try to get original text for language detection
      const textForDetection = result.originalText || result.data.summary || 
        result.data.experience?.[0]?.description || 
        result.data.personalInfo?.name || '';
      
      if (textForDetection) {
        const detectedLanguage = languageService.detectLanguageFromText(textForDetection);
        
        // Format response with language choice options
        const languageResponse = languageService.formatLanguageChoiceResponse(
          detectedLanguage,
          result.data,
          'cv'
        );
        
        return res.json(languageResponse);
      }
    }
    
    // Fallback to original response if no language detection possible
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
 * @desc    Extract structured CV data from text using AI and detect language
 * @access  Public
 */
router.post('/extract-cv', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for CV extraction'
      });
    }

    // Extract CV data using AI
    const cvData = await cvProcessingService.extractCVFromText(text);
    
    // Import language service for detection
    const LanguageService = require('../services/language/languageService');
    const languageService = new LanguageService();
    
    // Detect language from the original text
    const detectedLanguage = languageService.detectLanguageFromText(text);
    
    // Format response with language choice options
    const response = languageService.formatLanguageChoiceResponse(
      detectedLanguage,
      cvData,
      'cv'
    );

    res.json(response);

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
 * @desc    Extract job offer requirements using AI and detect language
 * @access  Public
 */
router.post('/extract-job-offer', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for job offer extraction'
      });
    }

    // Extract job offer data using AI
    const jobData = await cvProcessingService.extractJobOffer(text);
    
    // Import language service for detection
    const LanguageService = require('../services/language/languageService');
    const languageService = new LanguageService();
    
    // Detect language from the original text
    const detectedLanguage = languageService.detectLanguageFromText(text);
    
    // Format response with language choice options
    const response = languageService.formatLanguageChoiceResponse(
      detectedLanguage,
      jobData,
      'jobOffer'
    );

    res.json(response);

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
 * @desc    Generate tailored CV using AI with language support
 * @access  Public
 */
router.post('/tailor-cv', async (req, res) => {
  try {
    const { cv, jobOffer, additionalRequirements, selectedLanguage } = req.body;
    
    if (!cv || !jobOffer) {
      return res.status(400).json({
        success: false,
        message: 'CV and job offer data are required'
      });
    }

    // If language is selected, use multilingual tailoring
    if (selectedLanguage) {
      const LanguageService = require('../services/language/languageService');
      const MultilingualContentGenerator = require('../services/language/multilingualContentGenerator');
      const AIService = require('../services/ai/aiService');
      
      const languageService = new LanguageService();
      const aiService = new AIService();
      const contentGenerator = new MultilingualContentGenerator(aiService);
      
      if (!languageService.isValidLanguage(selectedLanguage)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid language code'
        });
      }

      // Generate tailored CV in selected language
      const tailoredResult = await contentGenerator.tailorCVForJob(
        cv, 
        jobOffer, 
        selectedLanguage, 
        additionalRequirements
      );

      if (!tailoredResult.success) {
        return res.status(500).json({
          success: false,
          message: tailoredResult.error || 'Failed to generate tailored CV'
        });
      }

      // Apply tailored content to CV
      const tailoredCV = {
        ...cv,
        ...tailoredResult.tailoredContent,
        language: selectedLanguage,
        direction: languageService.getLanguageDetails(selectedLanguage).direction,
        metadata: {
          ...tailoredResult.metadata,
          originalCVId: cv._id || null
        }
      };

      return res.json({
        success: true,
        data: tailoredCV,
        language: selectedLanguage,
        metadata: tailoredResult.metadata,
        message: `Tailored CV generated successfully in ${languageService.getLanguageDetails(selectedLanguage).name}`
      });
    }

    // Fallback to original tailoring service if no language specified
    const tailoredCV = await cvProcessingService.tailorCV(cv, jobOffer, additionalRequirements);
    
    res.json({
      success: true,
      data: tailoredCV,
      message: 'CV tailored successfully'
    });

  } catch (error) {
    console.error('CV tailoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to tailor CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/generate-cover-letter
 * @desc    Generate cover letter using AI with language support
 * @access  Public
 */
router.post('/generate-cover-letter', async (req, res) => {
  try {
    const { cv, jobOffer, additionalRequirements, selectedLanguage } = req.body;
    
    if (!cv || !jobOffer) {
      return res.status(400).json({
        success: false,
        message: 'CV and job offer data are required'
      });
    }

    // If language is selected, use multilingual generation
    if (selectedLanguage) {
      const LanguageService = require('../services/language/languageService');
      const MultilingualContentGenerator = require('../services/language/multilingualContentGenerator');
      const AIService = require('../services/ai/aiService');
      
      const languageService = new LanguageService();
      const aiService = new AIService();
      const contentGenerator = new MultilingualContentGenerator(aiService);
      
      if (!languageService.isValidLanguage(selectedLanguage)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid language code'
        });
      }

      // Generate cover letter in selected language
      const coverLetter = await contentGenerator.generateCoverLetter(
        cv, 
        jobOffer, 
        selectedLanguage, 
        additionalRequirements
      );

      return res.json({
        success: true,
        data: {
          content: coverLetter,
          language: selectedLanguage,
          direction: languageService.getLanguageDetails(selectedLanguage).direction,
          generatedFor: jobOffer.title || 'Job Application',
          generatedAt: new Date().toISOString()
        },
        message: `Cover letter generated successfully in ${languageService.getLanguageDetails(selectedLanguage).name}`
      });
    }

    // Fallback to original cover letter service if no language specified
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
