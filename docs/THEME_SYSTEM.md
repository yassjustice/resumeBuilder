# Theme System Documentation

The CV Builder application features a comprehensive theme system that allows users to customize the visual appearance of their CVs. This document explains the theme architecture, components, and implementation details.

## Theme Architecture

The theme system is built around three core themes, each designed for specific professional contexts:

### Professional Theme
- **Primary Color**: `#2c3e50` (Deep Blue-Gray)
- **Typography**: Georgia serif
- **Border Style**: Solid lines
- **Use Case**: Corporate environments, traditional industries

### Modern Theme
- **Primary Color**: `#3498db` (Bright Blue)
- **Typography**: Roboto
- **Border Style**: Accent lines
- **Use Case**: Tech companies, startups, creative roles

### Minimal Theme
- **Primary Color**: `#333333` (Charcoal)
- **Typography**: Open Sans
- **Border Style**: Subtle gray lines
- **Use Case**: Design-focused roles, minimalist preferences

## Theme Components

### Frontend Components

1. **ThemeSelector**: Visual component that allows users to select a theme
   - Located at: `frontend/src/components/themes/ThemeSelector.js`
   - Provides visual preview of each theme
   - Handles theme selection events

2. **ThemeContext**: Context provider for theme management
   - Located at: `frontend/src/context/ThemeContext.js`
   - Provides theme data across the application
   - Handles theme switching and persistence

3. **usePDFTheme**: Custom hook for PDF theme integration
   - Located at: `frontend/src/hooks/usePDFTheme.js`
   - Connects selected theme to PDF generation options

### Backend Components

1. **Theme Model**: MongoDB schema for theme data
   - Located at: `backend/models/Theme.js`
   - Defines theme properties and validation

2. **Theme Controller**: API handlers for theme operations
   - Located at: `backend/controllers/themeController.js`
   - Provides CRUD operations for themes

3. **Theme Seeder**: Database initialization for themes
   - Located at: `backend/utils/seedThemes.js`
   - Populates database with predefined themes

## Theme Integration

The theme system integrates with several key application features:

### CV Editor Integration
- Theme selector in the Theme tab of the CV Editor
- Real-time updates to the CV preview when theme changes
- Theme information saved with CV data

### PDF Generation Integration
- Theme colors, typography, and spacing applied to generated PDFs
- Theme-specific styling for headers, sections, and content

### API Integration
- Theme data available through API endpoints
- Theme updates handled through dedicated endpoints

## Theme Customization

While the application provides three built-in themes, the architecture supports extension:

### Adding New Themes
1. Add theme definition to `ThemeContext.js`
2. Add theme to the database seeder
3. Update theme validation in the backend

### Customizing Existing Themes
1. Modify theme properties in `ThemeContext.js`
2. Update theme in the database
3. Ensure PDF generation respects new theme properties

## Implementation Details

### Theme Storage
- Themes are stored in MongoDB with the Theme model
- User theme preferences are stored in localStorage
- Selected theme for each CV is stored with the CV data

### Theme Application
- Themes are applied using styled-components
- PDF styling is generated dynamically based on the selected theme
- Theme changes trigger real-time updates to the UI and PDF preview
