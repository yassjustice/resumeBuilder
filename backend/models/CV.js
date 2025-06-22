/**
 * CV Data Model
 * MongoDB schema for CV documents with multilingual support
 */

const mongoose = require('mongoose');

// Personal Information Schema
const personalInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    phone: { type: String, trim: true },
    email: { 
      type: String, 
      required: true,
      trim: true,
      lowercase: true
    },
    location: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true }
  }
}, { _id: false });

// Experience Item Schema
const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  period: { type: String, required: true, trim: true },
  responsibilities: [{ type: String, trim: true }]
}, { _id: false });

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  technologies: [{ type: String, trim: true }],
  keyFeatures: [{ type: String, trim: true }]
}, { _id: false });

// Skills Schema
const skillsSchema = new mongoose.Schema({
  frontend: [{ type: String, trim: true }],
  backend: [{ type: String, trim: true }],
  databases: [{ type: String, trim: true }],
  cloud: [{ type: String, trim: true }],
  tools: [{ type: String, trim: true }],
  other: [{ type: String, trim: true }]
}, { _id: false });

// Education Schema
const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  period: { type: String, required: true, trim: true },
  details: { type: String, trim: true }
}, { _id: false });

// Certification Schema
const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true, trim: true },
  type: { type: String, trim: true },
  skills: { type: String, trim: true }
}, { _id: false });

// Additional Experience Schema
const additionalExperienceSchema = new mongoose.Schema({
  organization: { type: String, required: true, trim: true },
  period: { type: String, required: true, trim: true },
  details: { type: String, trim: true }
}, { _id: false });

// Language Schema
const languageSchema = new mongoose.Schema({
  language: { type: String, required: true, trim: true },
  level: { type: String, required: true, trim: true }
}, { _id: false });

// Main CV Schema
const cvSchema = new mongoose.Schema({
  // Metadata
  language: {
    type: String,
    enum: ['en', 'fr'],
    default: 'en',
    required: true
  },
  theme: {
    type: String,
    enum: ['professional', 'modern', 'minimal'],
    default: 'professional',
    required: true
  },
  
  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  
  // CV Content
  personalInfo: {
    type: personalInfoSchema,
    required: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: skillsSchema,
    required: true
  },
  experience: [experienceSchema],
  projects: [projectSchema],
  education: [educationSchema],
  certifications: [certificationSchema],
  additionalExperience: [additionalExperienceSchema],
  languages: [languageSchema],
  interests: [{ type: String, trim: true }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Metadata for tracking
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'cvs'
});

// Update the updatedAt field before saving
cvSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
cvSchema.index({ language: 1, theme: 1 });
cvSchema.index({ createdAt: -1 });
cvSchema.index({ userId: 1 });

const CV = mongoose.model('CV', cvSchema);

module.exports = CV;
