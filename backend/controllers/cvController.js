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
    console.log('🔄 generatePrecisePDF: Starting PDF generation for ID:', req.params.id);
    console.log('🔄 Query params:', req.query);
    
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      console.log('❌ CV not found or inactive for ID:', req.params.id);
      return next(new APIError('CV not found', 404));
    }
    
    console.log('✅ CV found:', cv.personalInfo?.name || 'Unknown');
    
    // Check if language parameter is provided in the query
    if (req.query.language && ['en', 'fr'].includes(req.query.language)) {
      // Temporarily override the CV language for PDF generation
      cv.language = req.query.language;
      console.log('🌐 Language overridden to:', cv.language);
    }      // Generate PDF with enhanced smart page breaks (All 3 tasks implemented)
    console.log('🔄 Generating PDF with options...');
    const pdfBuffer = await pdfService.generateEnhancedSmartPDF(cv, {
      pageBreakThreshold: 85,        // Task 1: Smart page breaks - increased threshold
      titleSectionConnection: true,  // Task 2: Title-section connection  
      twoColumnSkills: true,         // Task 3: Two-column skills layout
      sectionSpacing: 2,             // Small section spacing to prevent huge gaps
      elementSpacing: 2,             // Small element spacing to prevent huge gaps
      language: cv.language          // Use the language from CV data (which may have been overridden by query param)
    });
    
    console.log('✅ PDF generated successfully. Buffer length:', pdfBuffer.length);
    
    const fileName = `${cv.personalInfo.name.replace(/\s+/g, '_')}_CV_Smart.pdf`;
      // Set headers optimized for PDF embedding and CORS
    // Use different headers for document route to avoid ad-blocker detection
    const headers = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=300',
      'X-Frame-Options': 'SAMEORIGIN', // Allow iframe embedding
      'Content-Security-Policy': 'frame-ancestors *', // Allow iframe from any origin
    };

    // Add special headers for document route to avoid detection
    if (req.isDocumentRoute) {
      headers['Content-Type'] = 'application/octet-stream';
      headers['X-Content-Type'] = 'application/pdf';
      headers['X-Document-Type'] = 'cv-document';
    }
    
    console.log('🔄 Setting headers:', headers);
    res.set(headers);
    
    console.log('🔄 Sending PDF response...');
    res.end(pdfBuffer, 'binary');
    console.log('✅ PDF response sent successfully');
  } catch (error) {
    console.error('❌ generatePrecisePDF error:', error);
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

/**
 * @desc    Generate PDF for iframe embedding (optimized for display)
 * @route   GET /api/cv/:id/pdf-viewer
 * @access  Public
 */
const generatePDFForViewer = async (req, res, next) => {
  try {
    console.log('🔄 generatePDFForViewer: Starting PDF generation for iframe embedding, ID:', req.params.id);
    console.log('🔄 Query params:', req.query);
    
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      console.log('❌ CV not found or inactive for ID:', req.params.id);
      return next(new APIError('CV not found', 404));
    }
    
    console.log('✅ CV found:', cv.personalInfo?.name || 'Unknown');
    
    // Check if language parameter is provided in the query
    if (req.query.language && ['en', 'fr'].includes(req.query.language)) {
      // Temporarily override the CV language for PDF generation
      cv.language = req.query.language;
      console.log('🌐 Language overridden to:', cv.language);
    }

    // Generate PDF with enhanced smart page breaks (All 3 tasks implemented)
    console.log('🔄 Generating PDF for iframe viewer...');
    const pdfBuffer = await pdfService.generateEnhancedSmartPDF(cv, {
      pageBreakThreshold: 85,        // Task 1: Smart page breaks - increased threshold
      titleSectionConnection: true,  // Task 2: Title-section connection  
      twoColumnSkills: true,         // Task 3: Two-column skills layout
      sectionSpacing: 2,             // Small section spacing to prevent huge gaps
      elementSpacing: 2,             // Small element spacing to prevent huge gaps
      language: cv.language          // Use the language from CV data (which may have been overridden by query param)
    });
    
    console.log('✅ PDF for iframe generated successfully. Buffer length:', pdfBuffer.length);
    
    const fileName = `${cv.personalInfo.name.replace(/\s+/g, '_')}_CV_Preview.pdf`;
      // Headers specifically optimized for iframe embedding
    const headers = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Frame-Options': 'ALLOWALL',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    console.log('🔄 Setting iframe-optimized headers:', headers);
    res.set(headers);
    
    console.log('🔄 Sending PDF response for iframe...');
    res.end(pdfBuffer, 'binary');
    console.log('✅ PDF iframe response sent successfully');
  } catch (error) {
    console.error('❌ generatePDFForViewer error:', error);
    next(error);
  }
};

/**
 * @desc    Serve HTML page with embedded PDF for iframe viewing
 * @route   GET /api/cv/:id/pdf-embed
 * @access  Public
 */
const generatePDFEmbed = async (req, res, next) => {
  try {
    console.log('🔄 generatePDFEmbed: Creating HTML embed for PDF, ID:', req.params.id);
    
    const cv = await CV.findById(req.params.id);
    
    if (!cv || !cv.isActive) {
      console.log('❌ CV not found or inactive for ID:', req.params.id);
      return next(new APIError('CV not found', 404));
    }
    
    // Build PDF URL (use the working pdf-viewer endpoint)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdfUrl = `${baseUrl}/api/cvs/${req.params.id}/pdf-viewer?${req.url.split('?')[1] || ''}`;
      // Create HTML with embedded PDF (no header to avoid duplication)
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            height: 100vh;
            overflow: hidden;
        }
        
        .pdf-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: white;
        }
        
        .pdf-viewer {
            flex: 1;
            position: relative;
            background: #f8f9fa;
        }
        
        .pdf-embed {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .fallback-message {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #666;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .fallback-message h3 {
            margin-bottom: 10px;
            color: #333;
        }
        
        .fallback-message .btn {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <div class="pdf-viewer">
            <object 
                class="pdf-embed" 
                data="${pdfUrl}" 
                type="application/pdf"
                aria-label="PDF Preview">
                <embed 
                    class="pdf-embed" 
                    src="${pdfUrl}" 
                    type="application/pdf"
                    aria-label="PDF Preview" />
                <div class="fallback-message">
                    <h3>PDF Preview Not Available</h3>
                    <p>Your browser doesn't support inline PDF viewing.</p>
                    <a href="${pdfUrl}" target="_blank" class="btn">Open PDF</a>
                </div>
            </object>
        </div>
    </div>
    
    <script>
        console.log('PDF Embed page loaded successfully');
        console.log('PDF URL:', '${pdfUrl}');
        
        // Monitor PDF loading
        const object = document.querySelector('object');
        const embed = document.querySelector('embed');
        const fallback = document.querySelector('.fallback-message');
        
        // Show fallback after timeout if PDF doesn't load
        setTimeout(() => {
            if (!object.contentDocument && !embed.contentDocument) {
                console.warn('PDF may not have loaded properly');
                // Uncomment to show fallback: fallback.style.display = 'block';
            } else {
                console.log('PDF loaded successfully');
            }
        }, 3000);
    </script>
</body>
</html>`;

    console.log('🔄 Sending HTML embed response...');
    
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'ALLOWALL',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    
    res.send(htmlContent);
    console.log('✅ HTML embed response sent successfully');
    
  } catch (error) {
    console.error('❌ generatePDFEmbed error:', error);
    next(error);
  }
};

/**
 * @desc    Serve complete PDF viewer HTML page with embedded PDF
 * @route   GET /api/cv/:id/pdf-viewer
 * @access  Public
 */

/**
 * @desc    Get user's full CV
 * @route   GET /api/cvs/full
 * @access  Private
 */
const getUserFullCV = async (req, res, next) => {
  try {
    // For authenticated users, use user ID; for anonymous users, return the latest CV
    let cv;
    
    if (req.user && req.user.id) {
      // Authenticated user - find their specific CV
      cv = await CV.findOne({ userId: req.user.id, isActive: true })
        .select('-__v')
        .lean();
    } else {
      // Anonymous user - find the most recent CV (for testing)
      cv = await CV.findOne({ isActive: true })
        .sort({ createdAt: -1 })
        .select('-__v')
        .lean();
    }
    
    if (!cv) {
      return res.json({
        success: true,
        data: { cv: null },
        message: 'No CV found'
      });
    }
    
    res.json({
      success: true,
      data: { cv }
    });
  } catch (error) {
    next(new APIError('Failed to get user CV', 500, error.message));
  }
};

/**
 * @desc    Save/update user's full CV
 * @route   POST /api/cvs/full
 * @access  Public (temporarily for testing)
 */
const saveUserFullCV = async (req, res, next) => {
  try {
    const userId = req.user?.id || null; // Use null instead of string for anonymous
    const cvData = req.body;
    
    console.log('💾 Saving CV data:', JSON.stringify(cvData, null, 2));
    
    // Add user ID and default metadata
    const cvToSave = {
      ...cvData,
      isActive: true,
      updatedAt: new Date()
    };

    // Only add userId if we have a real user
    if (userId) {
      cvToSave.userId = userId;
    }
    
    // For anonymous users, try to find by a unique identifier or just create new
    let cv;
    if (userId) {
      cv = await CV.findOne({ userId, isActive: true });
    } else {
      // For anonymous users, always create a new CV
      cv = null;
    }
    
    if (cv) {
      // Update existing CV
      Object.assign(cv, cvToSave);
      await cv.save();
      console.log('✅ CV updated successfully');
    } else {
      // Create new CV
      cv = new CV(cvToSave);
      await cv.save();
      console.log('✅ CV created successfully');
    }
    
    res.json({
      success: true,
      data: { cv },
      message: cv.isNew ? 'CV created successfully' : 'CV updated successfully'
    });
  } catch (error) {
    console.error('❌ CV save error:', error);
    next(new APIError('Failed to save CV', 500, error.message));
  }
};

/**
 * @desc    Delete user's full CV
 * @route   DELETE /api/cvs/full
 * @access  Public (temporarily for testing)
 */
const deleteUserFullCV = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    
    console.log('🗑️ Deleting CV data for user:', userId);
    
    let result;
    if (userId) {
      // Delete user's CV
      result = await CV.deleteMany({ userId, isActive: true });
      console.log('✅ CV deletion completed for authenticated user:', result.deletedCount, 'records deleted');
    } else {
      // For anonymous users, delete all active CVs (since we can't distinguish between users)
      // This is for development/testing mode only
      console.log('⚠️ Anonymous deletion: Deleting all active CVs');
      result = await CV.deleteMany({ isActive: true });
      console.log('✅ CV deletion completed for anonymous mode:', result.deletedCount, 'records deleted');
    }
    
    res.json({
      success: true,
      message: `CV data cleared successfully${result.deletedCount > 0 ? ` (${result.deletedCount} records deleted)` : ''}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ CV deletion error:', error);
    next(new APIError('Failed to delete CV', 500, error.message));
  }
};

/**
 * @desc    Generate PDF from CV data without saving
 * @route   POST /api/cvs/generate-pdf
 * @access  Public
 */
const generatePDFFromData = async (req, res, next) => {
  try {
    console.log('🔄 PDF generation request received');
    console.log('📋 Request method:', req.method);
    console.log('📋 Request headers:', req.headers);
    console.log('📋 Request body keys:', Object.keys(req.body));
      const cvData = req.body.cvData || req.body;
    const options = req.body.options || {};
    
    console.log('📋 Extracted cvData type:', typeof cvData);
    console.log('📋 Extracted cvData keys:', Object.keys(cvData || {}));
    console.log('📋 cvData.personalInfo:', cvData?.personalInfo);
    
    if (!cvData) {
      console.log('❌ No CV data provided');
      console.log('📋 Request body:', req.body);
      return res.status(400).json({ error: 'CV data is required' });
    }
      console.log('📋 CV data received for:', cvData.personalInfo?.name || `${cvData.personalInfo?.firstName} ${cvData.personalInfo?.lastName}`);
    
    // Validate essential CV data - check for either name or firstName
    if (!cvData.personalInfo || (!cvData.personalInfo.name && !cvData.personalInfo.firstName)) {
      console.log('❌ Invalid CV data - missing personal info');
      console.log('📋 Available personalInfo:', cvData.personalInfo);
      return res.status(400).json({ error: 'Invalid CV data - personal info required' });
    }
    
    // Generate PDF using the existing service (single call)
    console.log('🔄 Generating PDF...');
    const pdfBuffer = await pdfService.generatePDF(cvData, options);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.log('❌ PDF generation returned empty buffer');
      return res.status(500).json({ error: 'PDF generation failed - empty buffer' });
    }
    
    console.log('✅ PDF generated successfully, size:', pdfBuffer.length);
      // Set headers for PDF download - disable range requests
    const fileName = cvData.personalInfo?.name 
      ? `${cvData.personalInfo.name.replace(/\s+/g, '_')}_CV.pdf`
      : 'CV.pdf';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Accept-Ranges', 'none'); // Disable range requests
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    console.log('📤 Sending PDF response...');
    res.end(pdfBuffer); // Use res.end() instead of res.send() for binary data
    console.log('✅ PDF response sent successfully');
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {  getAllCVs,
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
  generatePDFPreview,
  generatePDFForViewer,
  generatePDFEmbed,
  getUserFullCV,
  saveUserFullCV,
  deleteUserFullCV,
  generatePDFFromData
};
