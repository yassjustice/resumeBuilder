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
