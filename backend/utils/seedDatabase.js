/**
 * Database Seeding Utility
 * Seeds the database with initial CV data and themes
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CV = require('../models/CV');
const Theme = require('../models/Theme');
const cvDataEn = require('./seedData');
const cvDataFr = require('./seedDataFr');

// Load environment variables
dotenv.config();

/**
 * Professional theme data based on ProjectDna.md
 */
const professionalTheme = {
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
    main: 'Georgia',
    headings: 'Georgia',
    body: 'Georgia'
  },
  spacing: {
    section: '12px',
    element: '8px',
    micro: '4px',
    large: '20px'
  },
  fontSizes: {
    name: '20pt',
    sectionHeader: '12pt',
    jobTitle: '11pt',
    body: '10pt',
    supporting: '9pt'
  },
  borderStyles: {
    section: 'solid',
    width: '1px',
    style: 'solid',
    color: '#2c3e50'
  },
  useCase: 'corporate',
  targetIndustries: ['Finance', 'Consulting', 'Government', 'Healthcare', 'Education'],
  isActive: true,
  isDefault: true,
  order: 1,
  createdBy: 'system'
};

/**
 * Connect to database
 */
const connectDB = async () => {  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-builder';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Clear existing data
 */
const clearData = async () => {
  try {
    await CV.deleteMany({});
    await Theme.deleteMany({});
    console.log('Cleared existing data');
  } catch (error) {
    console.error('Error clearing data:', error.message);
    throw error;
  }
};

/**
 * Seed themes
 */
const seedThemes = async () => {
  try {
    const theme = new Theme(professionalTheme);
    await theme.save();
    console.log('🎨 Professional theme seeded');
    return theme;
  } catch (error) {
    console.error('❌ Error seeding themes:', error.message);
    throw error;
  }
};

/**
 * Seed CV data
 */
const seedCVs = async () => {
  try {
    // Create English CV
    const cvEn = new CV({
      ...cvDataEn,
      language: 'en',
      theme: 'professional'
    });
    await cvEn.save();
    console.log('📄 English CV seeded');

    // Create French CV
    const cvFr = new CV({
      ...cvDataFr,
      language: 'fr',
      theme: 'professional'
    });
    await cvFr.save();
    console.log('📄 French CV seeded');

    return [cvEn, cvFr];
  } catch (error) {
    console.error('❌ Error seeding CVs:', error.message);
    throw error;
  }
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearData();
    
    // Seed themes
    await seedThemes();
    
    // Seed CVs
    const cvs = await seedCVs();
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Themes: 1`);
    console.log(`   - CVs: ${cvs.length}`);
    console.log(`   - English CV ID: ${cvs[0]._id}`);
    console.log(`   - French CV ID: ${cvs[1]._id}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔗 Database connection closed');
    
  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    process.exit(1);
  }
};

/**
 * Run seeding if called directly
 */
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  clearData,
  seedThemes,
  seedCVs,
  professionalTheme
};
