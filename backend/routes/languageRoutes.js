/**
 * Language Routes - Handle language selection and multilingual content generation
 */

const express = require('express');
const router = express.Router();
const LanguageService = require('../services/language/languageService');
const MultilingualContentGenerator = require('../services/language/multilingualContentGenerator');
const AIService = require('../services/ai/aiService');

const languageService = new LanguageService();
const aiService = new AIService();
const contentGenerator = new MultilingualContentGenerator(aiService);

/**
 * GET /api/language/available
 * Get list of available languages
 */
router.get('/available', (req, res) => {
  try {
    const languages = languageService.getAvailableLanguages();
    res.json({
      success: true,
      languages: languages,
      default: languageService.getDefaultLanguage()
    });
  } catch (error) {
    console.error('Error getting available languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available languages'
    });
  }
});

/**
 * POST /api/language/detect
 * Detect language from CV text and return language choice options
 */
router.post('/detect', (req, res) => {
  try {
    const { text, extractedData, dataType = 'cv' } = req.body;

    if (!text && !extractedData) {
      return res.status(400).json({
        success: false,
        error: 'Text or extracted data is required for language detection'
      });
    }

    // Detect language from text
    const detectedLanguage = languageService.detectLanguageFromText(text);
    
    // Format response for language choice
    const response = languageService.formatLanguageChoiceResponse(
      detectedLanguage, 
      extractedData, 
      dataType
    );

    res.json(response);

  } catch (error) {
    console.error('Error detecting language:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect language'
    });
  }
});

/**
 * POST /api/language/apply-cv-language
 * Apply selected language to CV data and generate language-specific content
 */
router.post('/apply-cv-language', async (req, res) => {
  try {
    const { cvData, selectedLanguage, contentTypes = ['all'] } = req.body;

    if (!cvData || !selectedLanguage) {
      return res.status(400).json({
        success: false,
        error: 'CV data and selected language are required'
      });
    }

    if (!languageService.isValidLanguage(selectedLanguage)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language code'
      });
    }

    // Apply language formatting to CV data
    const formattedCV = languageService.formatCVDataForLanguage(cvData, selectedLanguage);

    // Generate language-specific content
    const generationResults = await Promise.allSettled(
      contentTypes.map(contentType => 
        contentGenerator.generateCVContent(formattedCV, selectedLanguage, contentType)
      )
    );

    // Merge successful results
    let generatedContent = {};
    generationResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        generatedContent = { ...generatedContent, ...result.value.generatedContent };
      }
    });

    // Apply generated content to CV
    const finalCV = {
      ...formattedCV,
      ...generatedContent,
      metadata: {
        ...formattedCV.metadata,
        contentGenerated: true,
        generatedAt: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      cv: finalCV,
      language: selectedLanguage,
      generatedContent: Object.keys(generatedContent),
      message: `CV successfully formatted for ${languageService.getLanguageDetails(selectedLanguage).name}`
    });

  } catch (error) {
    console.error('Error applying CV language:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply language to CV'
    });
  }
});

/**
 * POST /api/language/generate-tailored-cv
 * Generate tailored CV in selected language
 */
router.post('/generate-tailored-cv', async (req, res) => {
  try {
    const { cvData, jobData, selectedLanguage, additionalRequirements = '' } = req.body;

    if (!cvData || !jobData || !selectedLanguage) {
      return res.status(400).json({
        success: false,
        error: 'CV data, job data, and selected language are required'
      });
    }

    if (!languageService.isValidLanguage(selectedLanguage)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language code'
      });
    }

    // Generate tailored content in selected language
    const tailoredResult = await contentGenerator.tailorCVForJob(
      cvData, 
      jobData, 
      selectedLanguage, 
      additionalRequirements
    );

    if (!tailoredResult.success) {
      return res.status(500).json({
        success: false,
        error: tailoredResult.error || 'Failed to generate tailored CV'
      });
    }

    // Apply tailored content to CV
    const tailoredCV = {
      ...cvData,
      ...tailoredResult.tailoredContent,
      language: selectedLanguage,
      direction: languageService.getLanguageDetails(selectedLanguage).direction,
      metadata: {
        ...tailoredResult.metadata,
        originalCVId: cvData._id || null
      }
    };

    res.json({
      success: true,
      tailoredCV: tailoredCV,
      language: selectedLanguage,
      metadata: tailoredResult.metadata,
      message: `Tailored CV generated successfully in ${languageService.getLanguageDetails(selectedLanguage).name}`
    });

  } catch (error) {
    console.error('Error generating tailored CV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate tailored CV'
    });
  }
});

/**
 * POST /api/language/generate-cover-letter
 * Generate cover letter in selected language
 */
router.post('/generate-cover-letter', async (req, res) => {
  try {
    const { cvData, jobData, selectedLanguage, additionalRequirements = '' } = req.body;

    if (!cvData || !jobData || !selectedLanguage) {
      return res.status(400).json({
        success: false,
        error: 'CV data, job data, and selected language are required'
      });
    }

    if (!languageService.isValidLanguage(selectedLanguage)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language code'
      });
    }

    // Generate cover letter in selected language
    const coverLetter = await contentGenerator.generateCoverLetter(
      cvData, 
      jobData, 
      selectedLanguage, 
      additionalRequirements
    );

    res.json({
      success: true,
      coverLetter: {
        content: coverLetter,
        language: selectedLanguage,
        direction: languageService.getLanguageDetails(selectedLanguage).direction,
        generatedFor: jobData.title || 'Job Application',
        generatedAt: new Date().toISOString()
      },
      message: `Cover letter generated successfully in ${languageService.getLanguageDetails(selectedLanguage).name}`
    });

  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate cover letter'
    });
  }
});

/**
 * POST /api/language/optimize-content
 * Optimize specific CV content for selected language
 */
router.post('/optimize-content', async (req, res) => {
  try {
    const { content, contentType, selectedLanguage, context = {} } = req.body;

    if (!content || !contentType || !selectedLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Content, content type, and selected language are required'
      });
    }

    if (!languageService.isValidLanguage(selectedLanguage)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language code'
      });
    }

    let optimizedContent;

    switch (contentType) {
      case 'summary':
        optimizedContent = await contentGenerator.generateProfessionalSummary(
          { ...context, summary: content }, 
          selectedLanguage
        );
        break;
      case 'skills':
        optimizedContent = await contentGenerator.optimizeSkillsSection(content, selectedLanguage);
        break;
      case 'experience':
        optimizedContent = await contentGenerator.enhanceExperienceDescriptions(content, selectedLanguage);
        break;
      case 'projects':
        optimizedContent = await contentGenerator.optimizeProjectsSection(content, selectedLanguage);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid content type'
        });
    }

    res.json({
      success: true,
      optimizedContent: optimizedContent,
      contentType: contentType,
      language: selectedLanguage,
      optimizedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error optimizing content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize content'
    });
  }
});

/**
 * GET /api/language/field-labels/:languageCode
 * Get field labels for specified language
 */
router.get('/field-labels/:languageCode', (req, res) => {
  try {
    const { languageCode } = req.params;
    
    if (!languageService.isValidLanguage(languageCode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language code'
      });
    }

    const labels = languageService.getFieldLabels(languageCode);
    
    res.json({
      success: true,
      labels: labels,
      language: languageCode
    });

  } catch (error) {
    console.error('Error getting field labels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get field labels'
    });
  }
});

module.exports = router;
