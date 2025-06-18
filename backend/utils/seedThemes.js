/**
 * Theme Seeder
 * Seeds the database with predefined themes
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Theme = require('../models/Theme');

// Load environment variables
dotenv.config();

// Theme definitions
const themes = [
  {
    name: 'professional',
    displayName: 'Professional',
    description: 'Conservative design perfect for corporate environments and traditional industries',
    colors: {
      primary: '#2c3e50',
      secondary: '#333333',
      text: '#000000',
      background: '#ffffff',
      accent: '#2c3e50'
    },
    typography: {
      main: 'Georgia, serif',
      headings: 'Georgia, serif',
      body: 'Georgia, serif'
    },
    spacing: {
      section: '12px',
      element: '8px',
      micro: '4px'
    },
    fontSizes: {
      name: '20pt',
      sectionHeader: '12pt',
      jobTitle: '11pt',
      body: '10pt',
      supporting: '9pt'
    },
    useCase: 'corporate',
    borderStyle: 'solid',
    isDefault: true,
    isActive: true
  },
  {
    name: 'modern',
    displayName: 'Modern',
    description: 'Clean, contemporary design for tech companies, startups, and creative roles',
    colors: {
      primary: '#3498db',
      secondary: '#2980b9',
      text: '#2c3e50',
      background: '#ffffff',
      accent: '#e74c3c'
    },
    typography: {
      main: 'Roboto, sans-serif',
      headings: 'Roboto, sans-serif',
      body: 'Roboto, sans-serif'
    },
    spacing: {
      section: '16px',
      element: '10px',
      micro: '5px'
    },
    fontSizes: {
      name: '22pt',
      sectionHeader: '14pt',
      jobTitle: '12pt',
      body: '10pt',
      supporting: '9pt'
    },
    useCase: 'tech',
    borderStyle: 'accent',
    isDefault: false,
    isActive: true
  },
  {
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Minimalist design with generous whitespace for design-focused roles',
    colors: {
      primary: '#333333',
      secondary: '#666666',
      text: '#333333',
      background: '#ffffff',
      accent: '#999999'
    },
    typography: {
      main: 'Open Sans, sans-serif',
      headings: 'Open Sans, sans-serif',
      body: 'Open Sans, sans-serif'
    },
    spacing: {
      section: '20px',
      element: '12px',
      micro: '6px'
    },
    fontSizes: {
      name: '20pt',
      sectionHeader: '13pt',
      jobTitle: '11pt',
      body: '10pt',
      supporting: '9pt'
    },
    useCase: 'creative',
    borderStyle: 'subtle',
    isDefault: false,
    isActive: true
  }
];

// Seed database function
const seedThemes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-builder', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
    
    // Delete existing themes
    await Theme.deleteMany({});
    console.log('Existing themes deleted');
    
    // Insert new themes
    const result = await Theme.insertMany(themes);
    console.log(`${result.length} themes seeded successfully`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding themes:', err);
    process.exit(1);
  }
};

// Run the seeder
seedThemes();
