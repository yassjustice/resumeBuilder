/**
 * Theme Routes
 * API routes for theme management
 */
const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { validateTheme } = require('../middleware/validation');

// GET /api/themes - Get all themes
router.get('/', themeController.getAllThemes);

// GET /api/themes/:id - Get theme by ID
router.get('/:id', themeController.getThemeById);

// POST /api/themes - Create new theme (admin only)
router.post('/', validateTheme, themeController.createTheme);

// PUT /api/themes/:id - Update theme (admin only)
router.put('/:id', validateTheme, themeController.updateTheme);

// DELETE /api/themes/:id - Delete theme (admin only)
router.delete('/:id', themeController.deleteTheme);

module.exports = router;