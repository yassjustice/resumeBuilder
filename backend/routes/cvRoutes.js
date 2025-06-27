/**
 * CV Routes - CLEANED UP
 * Only the essential routes for CV operations and the pdf-precise route
 */

const express = require('express');
const router = express.Router();

// Import controllers
const cvController = require('../controllers/cvController');
const { authenticateToken } = require('../middleware/validation');

// Import validation middleware
const { 
  validateCV, 
  validateCVId, 
  validateCVIdForPreview,
  validatePDFRequest 
} = require('../middleware/validation');

/**
 * @route   GET /api/cv
 * @desc    Get all CVs with pagination
 * @access  Public
 */
router.get('/', cvController.getAllCVs);

/**
 * @route   GET /api/cvs/full
 * @desc    Get user's full CV
 * @access  Public (temporarily for testing)
 */
router.get('/full', cvController.getUserFullCV);

/**
 * @route   POST /api/cvs/full
 * @desc    Save/update user's full CV
 * @access  Public (temporarily for testing)
 */
router.post('/full', cvController.saveUserFullCV);

/**
 * @route   DELETE /api/cvs/full
 * @desc    Delete user's full CV
 * @access  Public (temporarily for testing)
 */
router.delete('/full', cvController.deleteUserFullCV);

/**
 * @route   POST /api/cvs/generate-pdf
 * @desc    Generate PDF from CV data (without saving)
 * @access  Public
 */
router.post('/generate-pdf', cvController.generatePDFFromData);

/**
 * @route   POST /api/cv
 * @desc    Create a new CV
 * @access  Public
 */
router.post('/', validateCV, cvController.createCV);

/**
 * @route   GET /api/cv/:id
 * @desc    Get a specific CV by ID
 * @access  Public
 */
router.get('/:id', validateCVId, cvController.getCVById);

/**
 * @route   PUT /api/cv/:id
 * @desc    Update a CV by ID
 * @access  Public
 */
router.put('/:id', validateCVId, validateCV, cvController.updateCV);

/**
 * @route   DELETE /api/cv/:id
 * @desc    Delete a CV by ID
 * @access  Public
 */
router.delete('/:id', validateCVId, cvController.deleteCV);

/**
 * @route   GET /api/cv/:id/pdf-precise
 * @desc    Generate PDF with enhanced smart page breaks (ALL 3 TASKS)
 * @access  Public
 */
router.get('/:id/pdf-precise', validateCVId, cvController.generatePrecisePDF);

/**
 * @route   OPTIONS /api/cv/:id/pdf-precise
 * @desc    Handle CORS preflight for PDF requests
 * @access  Public
 */
router.options('/:id/pdf-precise', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  res.sendStatus(200);
});

/**
 * @route   POST /api/cv/:id/pdf-precise
 * @desc    Generate PDF with enhanced smart page breaks and custom options
 * @access  Public
 */
router.post('/:id/pdf-precise', validatePDFRequest, cvController.generatePrecisePDFWithOptions);

/**
 * @route   POST /api/cv/:id/pdf-preview
 * @desc    Generate PDF for real-time preview (returns PDF blob, not download)
 * @access  Public
 */
router.post('/:id/pdf-preview', validateCVIdForPreview, cvController.generatePDFPreview);

/**
 * @route   PATCH /api/cv/:id/theme
 * @desc    Update CV theme
 * @access  Public
 */
router.patch('/:id/theme', validateCVId, cvController.updateCVTheme);

/**
 * @route   GET /api/cv/:id/document
 * @desc    Serve PDF with ad-blocker friendly URL (alternative to pdf-precise)
 * @access  Public
 */
router.get('/:id/document', validateCVId, (req, res, next) => {
  // Use the same controller but with different headers to avoid ad-blocker detection
  req.isDocumentRoute = true;
  cvController.generatePrecisePDF(req, res, next);
});

/**
 * @route   GET /api/cv/:id/pdf-viewer
 * @desc    Generate PDF optimized for iframe embedding
 * @access  Public
 */
router.get('/:id/pdf-viewer', validateCVId, cvController.generatePDFForViewer);

/**
 * @route   GET /api/cv/:id/pdf-embed
 * @desc    Serve HTML page with embedded PDF for iframe viewing
 * @access  Public
 */
router.get('/:id/pdf-embed', validateCVId, cvController.generatePDFEmbed);

module.exports = router;
