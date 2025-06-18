/**
 * CV Controller
 * Handles CV CRUD operations and PDF generation
 */

const CV = require('../models/CV');
const pdfService = require('../services/pdfService');
const { APIError } = require('../middleware/errorHandler');

/**
 * @desc    Get all CVs with pagination and filtering
 * @route   GET /api/cv
 * @access  Public
 */
const getAllCVs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, language, theme, sortBy = '-updatedAt' } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    if (language) filter.language = language;
    if (theme) filter.theme = theme;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const cvs = await CV.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await CV.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        cvs,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new CV
 * @route   POST /api/cv
 * @access  Public
 */
const createCV = async (req, res, next) => {
  try {
    const cvData = req.body;
    
    // Create new CV
    const cv = new CV(cvData);
    await cv.save();
    
    res.status(201).json({
      success: true,
      data: cv,
      message: 'CV created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a CV by ID
 * @route   GET /api/cv/:id
 * @access  Public
 */
const getCVById = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id).select('-__v');
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    res.json({
      success: true,
      data: cv
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a CV by ID
 * @route   PUT /api/cv/:id
 * @access  Public
 */
const updateCV = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    // Update CV with new data
    Object.assign(cv, req.body);
    cv.version += 1;
    await cv.save();
    
    res.json({
      success: true,
      data: cv,
      message: 'CV updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a CV by ID (soft delete)
 * @route   DELETE /api/cv/:id
 * @access  Public
 */
const deleteCV = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    // Soft delete
    cv.isActive = false;
    await cv.save();
    
    res.json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate PDF for a CV
 * @route   GET /api/cv/:id/pdf
 * @access  Public
 */
const generatePDF = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
      // Generate PDF using the PDF service
    const pdfBuffer = await pdfService.generateCVPDF(cv);
    
    // Set response headers for PDF download
    const fileName = `${cv.personalInfo.name.replace(/\s+/g, '_')}_CV.pdf`;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate PDF with custom options and layout control
 * @route   POST /api/cv/:id/pdf
 * @access  Public
 */
const generatePDFWithOptions = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    const options = {
      format: req.body.format || 'A4',
      includeHeaders: req.body.includeHeaders !== false,
      marginSize: req.body.marginSize || 'medium',
      autoOptimize: req.body.autoOptimize || false,
      layout: req.body.layout || {},
      theme: req.body.theme || pdfService.PROFESSIONAL_THEME
    };

    // Generate optimized PDF with layout analysis
    const result = await pdfService.generateOptimizedCVPDF(cv, options);
    
    const fileName = `${cv.personalInfo.name.replace(/\s+/g, '_')}_CV_Enhanced.pdf`;
    
    // Include layout suggestions in response headers for debugging
    if (result.layoutAnalysis.suggestions.length > 0) {
      res.set('X-Layout-Suggestions', JSON.stringify(result.layoutAnalysis.suggestions));
    }
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': result.pdfBuffer.length,
      'X-Layout-Optimized': result.layoutAnalysis.appliedOptimizations ? 'true' : 'false'
    });
    
    res.end(result.pdfBuffer, 'binary');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get CV preview data with layout analysis
 * @route   GET /api/cv/:id/preview
 * @access  Public
 */
const getCVPreview = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id).select('-__v');
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    // Get layout suggestions
    const layoutSuggestions = pdfService.getLayoutSuggestions(cv);
    
    // Format data for preview (could include theme-specific formatting)
    const previewData = {
      ...cv.toObject(),
      previewUrl: `/api/cv/${cv._id}/pdf`,
      lastGenerated: new Date().toISOString(),
      layoutAnalysis: {
        suggestions: layoutSuggestions,
        contentStats: {
          experienceCount: cv.experience?.length || 0,
          projectCount: cv.projects?.length || 0,
          skillCategoryCount: Object.keys(cv.skills || {}).length,
          summaryLength: cv.summary?.length || 0
        }
      }
    };
    
    res.json({
      success: true,
      data: previewData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate PDF with precise layout control (NEW)
 * @route   GET /api/cv/:id/pdf-precise
 * @access  Public
 */
const generatePrecisePDF = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    // Check if language parameter is provided in the query
    if (req.query.language && ['en', 'fr'].includes(req.query.language)) {
      // Temporarily override the CV language for PDF generation
      cv.language = req.query.language;
    }
      // Generate PDF with enhanced smart page breaks (All 3 tasks implemented)
    const pdfBuffer = await pdfService.generateEnhancedSmartPDF(cv, {
      pageBreakThreshold: 85,        // Task 1: Smart page breaks - increased threshold
      titleSectionConnection: true,  // Task 2: Title-section connection  
      twoColumnSkills: true,         // Task 3: Two-column skills layout
      sectionSpacing: 2,             // Small section spacing to prevent huge gaps
      elementSpacing: 2,             // Small element spacing to prevent huge gaps
      language: cv.language          // Use the language from CV data (which may have been overridden by query param)
    });
    
    const fileName = `${cv.personalInfo.name.replace(/\s+/g, '_')}_CV_Smart.pdf`;
      res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
      'X-Layout-Engine': 'Precise',
      'X-Spacing-Control': 'Granular',
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate PDF with layout optimization suggestions for a CV
 * @route   GET /api/cv/:id/layout-analysis
 * @access  Public
 */
const getLayoutAnalysis = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    // Get detailed layout analysis
    const suggestions = pdfService.getLayoutSuggestions(cv);
    const optimizationResult = pdfService.optimizeLayoutForContent(cv, {
      autoOptimize: false // Just analyze, don't modify
    });
    
    res.json({
      success: true,
      data: {
        suggestions,
        contentAnalysis: optimizationResult.suggestions,
        recommendations: {
          shouldOptimize: suggestions.length > 0,
          criticalIssues: suggestions.filter(s => s.type === 'content').length,
          minorIssues: suggestions.filter(s => s.type !== 'content').length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate PDF with precise layout control and custom options
 * @route   POST /api/cv/:id/pdf-precise
 * @access  Public
 */
const generatePrecisePDFWithOptions = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    // Check if language parameter is provided in the request
    if (req.body.language && ['en', 'fr'].includes(req.body.language)) {
      // Temporarily override the CV language for PDF generation
      cv.language = req.body.language;
    }
      const options = {
      format: req.body.format || 'A4',
      marginSize: req.body.marginSize || 'small',
      autoOptimize: req.body.autoOptimize || true,
      tightSpacing: req.body.tightSpacing || true,
      sectionSpacing: req.body.sectionSpacing || 2,
      elementSpacing: req.body.elementSpacing || 1,
      language: cv.language // Use the language from CV data (which may have been overridden)
    };

    // Generate precise PDF with granular control
    const pdfBuffer = await pdfService.generatePreciseCVPDF(cv, options);
    
    const fileName = `${cv.personalInfo.name.replace(/\s+/g, '_')}_CV_Precise.pdf`;
      res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
      'X-Layout-Engine': 'precise',
      'X-Spacing-Control': 'granular',
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update CV theme
 * @route   PATCH /api/cvs/:id/theme
 * @access  Public
 */
const updateCVTheme = async (req, res, next) => {
  try {
    const { theme } = req.body;
    
    // Validate theme
    if (!theme || !['professional', 'modern', 'minimal'].includes(theme)) {
      return next(new APIError('Invalid theme', 400));
    }
    
    // Find CV
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      return next(new APIError('CV not found', 404));
    }
    
    // Update theme
    cv.theme = theme;
    await cv.save();
    
    res.json({
      success: true,
      data: cv,
      message: 'CV theme updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate PDF for real-time preview (returns PDF as response body, not download)
 * @route   POST /api/cv/:id/pdf-preview
 * @access  Public
 */
const generatePDFPreview = async (req, res, next) => {
  try {
    const cvId = req.params.id;
    
    // Check if we have CV data in request body (for real-time preview without saving)
    let cvData;
    if (req.body.cvData) {
      // Use provided CV data for real-time preview
      cvData = req.body.cvData;
      
      // If cvId is not a valid ObjectId, generate one for temporary use
      if (!/^[0-9a-fA-F]{24}$/.test(cvId)) {
        const crypto = require('crypto');
        const hash = crypto.createHash('md5').update(cvId).digest('hex');
        cvData._id = hash.substring(0, 24);
      } else {
        cvData._id = cvId; // Use provided ID
      }
      
      // Ensure required fields for PDF generation
      cvData.personalInfo = cvData.personalInfo || { name: 'Preview User', title: 'Professional' };
      cvData.summary = cvData.summary || 'This is a preview CV.';
      cvData.experience = cvData.experience || [];
      cvData.education = cvData.education || [];
      cvData.skills = cvData.skills || {};
      cvData.language = cvData.language || 'en';
      
    } else {
      // Fetch CV from database only if it's a valid ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(cvId)) {
        const cv = await CV.findById(cvId);
        if (!cv || !cv.isActive) {
          return next(new APIError('CV not found', 404));
        }
        cvData = cv;
      } else {
        // For non-ObjectId IDs, create default CV data
        cvData = {
          _id: cvId,
          personalInfo: { name: 'Preview User', title: 'Professional' },
          summary: 'This is a preview CV generated for demonstration.',
          experience: [],
          education: [],
          skills: {},
          language: 'en'
        };
      }
    }
    
    // Get options from request body
    const options = {
      format: req.body.format || 'A4',
      marginSize: req.body.marginSize || 'small',
      autoOptimize: req.body.autoOptimize || true,
      tightSpacing: req.body.tightSpacing || true,
      sectionSpacing: req.body.sectionSpacing || 2,
      elementSpacing: req.body.elementSpacing || 2,
      language: req.body.language || cvData.language || 'en',
      pageBreakThreshold: req.body.pageBreakThreshold || 85,
      titleSectionConnection: req.body.titleSectionConnection !== false,
      twoColumnSkills: req.body.twoColumnSkills !== false
    };

    console.log('[Backend PDF Preview] Generating PDF for:', {
      cvId,
      hasData: !!cvData,
      personalInfoName: cvData?.personalInfo?.name
    });

    // Generate PDF for preview
    const pdfBuffer = await pdfService.generatePrecisePDF(cvData, options);
    
    // Return PDF as blob response for preview (not download)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'X-Generated-At': new Date().toISOString(),
      'X-Preview-Mode': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    console.log('[Backend PDF Preview] Sending PDF response:', {
      bufferSize: pdfBuffer.length,
      contentType: 'application/pdf'
    });
    
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error('[Backend PDF Preview] Error:', error);
    next(error);
  }
};

module.exports = {
  getAllCVs,
  createCV,
  getCVById,
  updateCV,
  deleteCV,
  generatePDF,  generatePDFWithOptions,
  generatePrecisePDF,
  generatePrecisePDFWithOptions,
  getCVPreview,
  getLayoutAnalysis,
  updateCVTheme,
  generatePDFPreview
};
