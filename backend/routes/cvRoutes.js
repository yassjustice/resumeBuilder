/**
 * CV Routes - CLEANED UP
 * Only the essential routes for CV operations and the pdf-precise route
 */

const express = require('express');
const router = express.Router();

// Import controllers
const cvController = require('../controllers/cvController');

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

module.exports = router;
