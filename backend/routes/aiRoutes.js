/**
 * AI Routes - Clean route definitions using modular services
 * Handles AI-powered CV processing, file uploads, and cover letter generation
 */
const express = require('express');

// Import shared services for proper quota tracking
const { 
  aiService, 
  cvProcessingService, 
  coverLetterService 
} = require('../services/sharedAIServices');

const FileProcessingService = require('../services/ai/fileProcessingService');

const router = express.Router();

// Initialize only services not in shared module
const fileProcessingService = new FileProcessingService();

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
    const { cv, jobOffer, additionalRequirements, language } = req.body;
    
    console.log('📋 Tailoring request data:', {
      hasCV: !!cv,
      cvExperienceCount: cv.experience?.length || 0,
      cvCertificationsCount: cv.certifications?.length || 0,
      cvTitle: cv.personalInfo?.title || cv.title || 'N/A',
      cvSkillsCategories: Object.keys(cv.skills || {}),
      jobOfferType: typeof jobOffer,
      jobOfferContent: typeof jobOffer === 'string' ? jobOffer.substring(0, 100) + '...' : JSON.stringify(jobOffer).substring(0, 100) + '...',
      language: language || 'en'
    });
    
    // Extract job offer text from the request
    let jobOfferText = '';
    if (typeof jobOffer === 'string') {
      jobOfferText = jobOffer;
    } else if (jobOffer && typeof jobOffer === 'object') {
      // If jobOffer is an object, try to extract text from common fields
      jobOfferText = jobOffer.description || jobOffer.text || jobOffer.content || JSON.stringify(jobOffer);
    } else {
      throw new Error('Job offer text is required and must be a string or object with description');
    }
    
    console.log('📋 Extracted job offer text length:', jobOfferText.length);
    
    console.log('🎯 Starting CV tailoring process...');
    console.log('🔍 Input parameters:', {
      hasOriginalCV: !!cv,
      jobOfferLength: jobOfferText.length,
      targetLanguage: language || 'en',
      hasAdditionalRequirements: !!additionalRequirements
    });
    
    // Use the new advanced tailoring service
    const CVTailoringService = require('../services/ai/tailoring/index');
    const tailoringService = new CVTailoringService();
    
    const tailoredCV = await tailoringService.tailorCV(cv, jobOfferText, additionalRequirements, language || 'en');
    
    // DEBUGGING: Log the actual tailored results
    console.log('🔍 TAILORING DEBUG - Results Summary:');
    console.log('📝 Original vs Tailored Title:', {
      original: cv.personalInfo?.title || 'N/A',
      tailored: tailoredCV.personalInfo?.title || 'N/A'
    });
    console.log('📄 Summary changed:', {
      original_length: cv.summary?.length || 0,
      tailored_length: tailoredCV.summary?.length || 0,
      changed: cv.summary !== tailoredCV.summary
    });
    console.log('💼 Experience selection:', {
      original_count: cv.experience?.length || 0,
      tailored_count: tailoredCV.experience?.length || 0,
      first_experience_company: tailoredCV.experience?.[0]?.company || 'N/A'
    });
    console.log('🔧 Skills structure:', {
      original_categories: Object.keys(cv.skills || {}),
      tailored_categories: Object.keys(tailoredCV.skills || {}),
      has_unprofessional_categories: JSON.stringify(tailoredCV.skills || {}).toLowerCase().includes('less')
    });
    console.log('🎓 Education count:', {
      original: cv.education?.length || 0,
      tailored: tailoredCV.education?.length || 0
    });
    console.log('📜 Certifications selection:', {
      original: cv.certifications?.length || 0,
      tailored: tailoredCV.certifications?.length || 0
    });
    
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
    const { cv, jobOffer, additionalRequirements, language } = req.body;
    
    const result = await coverLetterService.generateCoverLetter(cv, jobOffer, additionalRequirements, language || 'en');
    
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
 * @route   POST /api/ai/download/cover-letter
 * @desc    Generate PDF for cover letter content (following CV PDF pattern)
 * @access  Public
 */
router.post('/download/cover-letter', async (req, res) => {
  try {
    console.log('🔄 Cover letter PDF generation request received');
    const { content, fileName } = req.body;
    
    if (!content) {
      console.log('❌ No cover letter content provided');
      return res.status(400).json({ error: 'Cover letter content is required' });
    }
    
    console.log('🔄 Generating cover letter PDF...');
    console.log('📄 Content length:', content?.length || 0);
    
    const pdfBuffer = await coverLetterService.generateCoverLetterPDF(content, fileName);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.log('❌ Cover letter PDF generation returned empty buffer');
      return res.status(500).json({ error: 'Cover letter PDF generation failed - empty buffer' });
    }
    
    console.log('✅ Cover letter PDF generated successfully, size:', pdfBuffer.length);
    
    // Set headers exactly like CV PDF generation
    const actualFileName = `${fileName || 'cover-letter'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${actualFileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Accept-Ranges', 'none'); // Disable range requests
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    console.log('📤 Sending cover letter PDF response...');
    res.end(pdfBuffer); // Use res.end() like CV PDF generation
    console.log('✅ Cover letter PDF response sent successfully');

  } catch (error) {
    console.error('❌ Cover letter PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/ai/quota-status
 * @desc    Get current AI service quota status
 * @access  Public
 */
router.get('/quota-status', async (req, res) => {
  try {
    console.log('📊 Checking AI service quota status...');
    
    // Get the AI service manager from any of our services
    const serviceManager = aiService.serviceManager || aiService.aiServiceManager;
    
    if (!serviceManager) {
      return res.status(500).json({
        success: false,
        message: 'AI service manager not available'
      });
    }

    const status = serviceManager.getServiceStatus();
    
    console.log('🔍 Raw service status data:', JSON.stringify(status, null, 2));
    
    // Calculate total usage with proper null checking
    const totalRequestsToday = status.reduce((sum, service) => sum + (service.dailyRequestCount || 0), 0);
    const totalDailyCapacity = status.reduce((sum, service) => sum + (service.maxRequestsPerDay || 0), 0);
    const usagePercentage = totalDailyCapacity > 0 ? Math.round((totalRequestsToday / totalDailyCapacity) * 100) : 0;
    
    res.json({
      success: true,
      message: 'AI service quota status retrieved',
      data: {
        services: status,
        summary: {
          totalServices: status.length,
          activeServices: status.filter(s => !s.isQuotaExceeded).length,
          exhaustedServices: status.filter(s => s.isQuotaExceeded).length,
          totalRequestsToday,
          totalDailyCapacity,
          usagePercentage: `${usagePercentage}%`,
          currentService: status.find(s => s.isCurrent)?.displayName || 'None'
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to get quota status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quota status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/reset-quota
 * @desc    Reset AI service quota status (for debugging)
 * @access  Public
 */
router.post('/reset-quota', async (req, res) => {
  try {
    console.log('🔄 Resetting AI service quota status...');
    
    // Get the AI service manager from any of our services
    const serviceManager = aiService.serviceManager || aiService.aiServiceManager;
    
    if (!serviceManager) {
      return res.status(500).json({
        success: false,
        message: 'AI service manager not available'
      });
    }

    serviceManager.resetAllQuotaStatus();
    
    res.json({
      success: true,
      message: 'AI service quota status reset successfully',
      data: {
        resetTime: new Date().toISOString(),
        servicesReset: serviceManager.services.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to reset quota status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset quota status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/test-keys
 * @desc    Test all API keys to see which ones are working
 * @access  Public
 */
router.post('/test-keys', async (req, res) => {
  try {
    console.log('🔧 Testing all API keys...');
    
    const serviceManager = aiService.serviceManager || aiService.aiServiceManager;
    
    if (!serviceManager) {
      return res.status(500).json({
        success: false,
        message: 'AI service manager not available'
      });
    }

    const results = [];
    
    // Test each service with a simple request
    for (let i = 0; i < serviceManager.services.length; i++) {
      const service = serviceManager.services[i];
      console.log(`🧪 Testing ${service.displayName}...`);
      
      try {
        // Make a minimal test request to conserve quota
        const testResult = await serviceManager.generateContent(
          'Hi', // Shortest possible prompt
          { 
            modelName: service.modelName, 
            temperature: 0,
            maxOutputTokens: 1 // Minimum possible output to save quota
          },
          false // isGeneration = false
        );
        
        results.push({
          service: service.displayName,
          keyIndex: i + 1,
          status: 'working',
          response: testResult.content?.substring(0, 50) || 'No response',
          dailyCount: service.dailyRequestCount,
          dailyLimit: service.maxRequestsPerDay,
          isQuotaExceeded: service.isQuotaExceeded
        });
        
        console.log(`✅ ${service.displayName} is working`);
        
      } catch (error) {
        results.push({
          service: service.displayName,
          keyIndex: i + 1,
          status: 'failed',
          error: error.message,
          dailyCount: service.dailyRequestCount,
          dailyLimit: service.maxRequestsPerDay,
          isQuotaExceeded: service.isQuotaExceeded,
          is429: error.message.includes('429') || error.status === 429
        });
        
        console.log(`❌ ${service.displayName} failed: ${error.message}`);
      }
      
      // Wait 0.5 seconds between tests to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const workingKeys = results.filter(r => r.status === 'working').length;
    const failedKeys = results.filter(r => r.status === 'failed').length;
    const quotaExceededKeys = results.filter(r => r.is429).length;
    
    console.log(`🏁 API Key Test Results: ${workingKeys} working, ${failedKeys} failed, ${quotaExceededKeys} quota exceeded`);
    
    res.json({
      success: true,
      summary: {
        total: results.length,
        working: workingKeys,
        failed: failedKeys,
        quotaExceeded: quotaExceededKeys
      },
      results
    });

  } catch (error) {
    console.error('❌ API key test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test API keys',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
