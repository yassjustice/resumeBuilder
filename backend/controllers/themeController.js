/**
 * Theme Controller
 * Handles theme-related API requests
 */
const Theme = require('../models/Theme');
const { validationResult } = require('express-validator');

/**
 * Get all themes
 * @route GET /api/themes
 * @access Public
 */
exports.getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find({ isActive: true }).sort('displayName');
    res.json(themes);
  } catch (err) {
    console.error('Error fetching themes:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get theme by ID
 * @route GET /api/themes/:id
 * @access Public
 */
exports.getThemeById = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.json(theme);
  } catch (err) {
    console.error('Error fetching theme:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create new theme
 * @route POST /api/themes
 * @access Admin
 */
exports.createTheme = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Check if theme name already exists
    const existingTheme = await Theme.findOne({ name: req.body.name.toLowerCase() });
    if (existingTheme) {
      return res.status(400).json({ message: 'Theme name already exists' });
    }
    
    // Create new theme
    const theme = new Theme({
      name: req.body.name.toLowerCase(),
      displayName: req.body.displayName,
      description: req.body.description,
      colors: req.body.colors,
      typography: req.body.typography,
      spacing: req.body.spacing,
      fontSizes: req.body.fontSizes,
      useCase: req.body.useCase,
      borderStyle: req.body.borderStyle,
      isDefault: req.body.isDefault || false,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    
    await theme.save();
    res.status(201).json(theme);
  } catch (err) {
    console.error('Error creating theme:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update theme
 * @route PUT /api/themes/:id
 * @access Admin
 */
exports.updateTheme = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Check if theme exists
    let theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Check for name conflicts if name is being changed
    if (req.body.name && req.body.name.toLowerCase() !== theme.name) {
      const existingTheme = await Theme.findOne({ name: req.body.name.toLowerCase() });
      if (existingTheme) {
        return res.status(400).json({ message: 'Theme name already exists' });
      }
    }
    
    // Update fields
    const updateFields = {};
    
    if (req.body.name) updateFields.name = req.body.name.toLowerCase();
    if (req.body.displayName) updateFields.displayName = req.body.displayName;
    if (req.body.description) updateFields.description = req.body.description;
    if (req.body.colors) updateFields.colors = req.body.colors;
    if (req.body.typography) updateFields.typography = req.body.typography;
    if (req.body.spacing) updateFields.spacing = req.body.spacing;
    if (req.body.fontSizes) updateFields.fontSizes = req.body.fontSizes;
    if (req.body.useCase) updateFields.useCase = req.body.useCase;
    if (req.body.borderStyle) updateFields.borderStyle = req.body.borderStyle;
    if (req.body.isDefault !== undefined) updateFields.isDefault = req.body.isDefault;
    if (req.body.isActive !== undefined) updateFields.isActive = req.body.isActive;
    
    // Update theme
    theme = await Theme.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json(theme);
  } catch (err) {
    console.error('Error updating theme:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete theme
 * @route DELETE /api/themes/:id
 * @access Admin
 */
exports.deleteTheme = async (req, res) => {
  try {
    // Check if theme exists
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Prevent deletion of default theme
    if (theme.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default theme' });
    }
    
    await theme.remove();
    res.json({ message: 'Theme removed' });
  } catch (err) {
    console.error('Error deleting theme:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};