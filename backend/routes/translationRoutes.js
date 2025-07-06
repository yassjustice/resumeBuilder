/**
 * Translation Routes
 * Handles AI-powered translation of CV content
 */
const express = require('express');
const router = express.Router();
const TranslationService = require('../services/ai/translationService');

// Initialize translation service
const translationService = new TranslationService();

/**
 * POST /api/translation/translate-cv
 * Translate CV content to target language
 */
router.post('/translate-cv', async (req, res) => {
  try {
    console.log('🤖 Translation Route: CV translation request received');
    const { cvData, targetLanguage, sourceLanguage } = req.body;

    // Validate request
    if (!cvData) {
      console.error('❌ Translation Route: No CV data provided');
      return res.status(400).json({
        success: false,
        error: 'CV data is required'
      });
    }

    if (!targetLanguage) {
      console.error('❌ Translation Route: No target language provided');
      return res.status(400).json({
        success: false,
        error: 'Target language is required'
      });
    }

    console.log(`🌐 Translation Route: Translation request: ${sourceLanguage || 'auto'} -> ${targetLanguage}`);
    console.log('📋 Translation Route: CV data to translate:', {
      hasPersonalInfo: !!cvData.personalInfo,
      hasSummary: !!cvData.summary,
      hasExperience: !!cvData.experience?.length,
      personalInfo: cvData.personalInfo
    });

    // Perform translation
    const translatedCV = await translationService.translateCVContent(
      cvData, 
      targetLanguage, 
      sourceLanguage
    );

    console.log('✅ Translation Route: Translation completed successfully');
    console.log('📄 Translation Route: Translated CV sample:', {
      hasPersonalInfo: !!translatedCV.personalInfo,
      hasSummary: !!translatedCV.summary,
      personalInfo: translatedCV.personalInfo,
      translationMetadata: translatedCV._translation
    });

    res.json({
      success: true,
      translatedCV,
      message: `CV successfully translated to ${targetLanguage}`
    });

  } catch (error) {
    console.error('❌ Translation Route: Translation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Translation failed'
    });
  }
});

/**
 * POST /api/translation/detect-language
 * Detect the language of CV content
 */
router.post('/detect-language', async (req, res) => {
  try {
    console.log('🔍 Translation Route: Language detection request received');
    const { cvData } = req.body;

    if (!cvData) {
      console.error('❌ Translation Route: No CV data provided');
      return res.status(400).json({
        success: false,
        error: 'CV data is required'
      });
    }

    console.log('📋 Translation Route: CV data received:', {
      hasPersonalInfo: !!cvData.personalInfo,
      hasSummary: !!cvData.summary,
      hasExperience: !!cvData.experience?.length
    });

    const detectedLanguage = await translationService.detectLanguage(cvData);
    console.log('✅ Translation Route: Language detected:', detectedLanguage);

    res.json({
      success: true,
      detectedLanguage,
      message: `Language detected: ${detectedLanguage}`
    });

  } catch (error) {
    console.error('❌ Translation Route: Language detection error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Language detection failed'
    });
  }
});

/**
 * GET /api/translation/supported-languages
 * Get list of supported languages
 */
router.get('/supported-languages', async (req, res) => {
  try {
    const supportedLanguages = translationService.getSupportedLanguages();

    res.json({
      success: true,
      supportedLanguages,
      message: 'Supported languages retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting supported languages:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get supported languages'
    });
  }
});

/**
 * POST /api/translation/test
 * Test translation service
 */
router.post('/test', async (req, res) => {
  try {
    const result = await translationService.testTranslation();

    res.json({
      success: true,
      result,
      message: 'Translation service test completed'
    });

  } catch (error) {
    console.error('❌ Translation test error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Translation test failed'
    });
  }
});

module.exports = router;
