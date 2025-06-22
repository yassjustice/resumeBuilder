import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCV } from '../contexts/CVContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Textarea from '../components/UI/Textarea';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { api } from '../services/api';
import { categorizeSkillsArray, normalizeSkillsForUI } from '../utils/skillsCategorization';

export const CVBuilderPage = () => {
  const { cvData, updateCV, saveCV, extractCVFromFile, extractCVFromText, downloadCV, isLoading, error, clearError } = useCV();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'paste'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Separate download state
  const [lastDownloadTime, setLastDownloadTime] = useState(0); // Prevent rapid clicks
  const [uploadError, setUploadError] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: []
  });

  const steps = [
    { id: 0, title: 'Import CV', icon: '📁' },
    { id: 1, title: 'Personal Info', icon: '👤' },
    { id: 2, title: 'Experience', icon: '💼' },
    { id: 3, title: 'Education', icon: '🎓' },
    { id: 4, title: 'Skills', icon: '⚡' },
    { id: 5, title: 'Review', icon: '✅' }
  ];  useEffect(() => {
    if (cvData) {
      // Ensure no null values in the form data
      const sanitizedData = sanitizeFormData(cvData);
        // Normalize skills from object format to array format for UI
      if (sanitizedData.skills) {
        sanitizedData.skills = normalizeSkillsForUI(sanitizedData.skills);
      }
      
      setFormData(sanitizedData);
      // If CV exists, skip to personal info step
      setActiveStep(1);
    }
  }, [cvData]);// Helper function to ensure no null values
  const sanitizeFormData = (data) => {
    const sanitize = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return obj === null || obj === undefined ? '' : obj;
    };
    return sanitize(data);
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setUploadError('');
    clearError();

    try {
      const result = await extractCVFromFile(file);
      
      if (result.success) {
        setFormData(result.cv);
        setActiveStep(1); // Move to personal info step
      } else {
        setUploadError(result.error);
      }
    } catch (error) {
      console.error('❌ File processing error:', error);
      setUploadError(error.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };
  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) {
      setUploadError('Please paste your CV content');
      return;
    }

    setIsProcessing(true);
    setUploadError('');
    clearError();

    try {
      const result = await extractCVFromText(pastedText);
      
      if (result.success) {
        setFormData(result.cv);
        setActiveStep(1); // Move to personal info step
      } else {
        setUploadError(result.error);
      }
    } catch (error) {
      setUploadError(error.message || 'Failed to process CV text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      if (index !== null) {
        // Handle array fields
        if (!updated[section]) updated[section] = [];
        if (!updated[section][index]) updated[section][index] = {};
        updated[section][index][field] = value;
      } else if (section === 'personalInfo') {
        updated.personalInfo[field] = value;
      } else {
        updated[field] = value;
      }
      
      return updated;
    });
  };

  const addArrayItem = (section) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), getEmptyItem(section)]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const getEmptyItem = (section) => {
    switch (section) {
      case 'experience':
        return {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
          location: ''
        };
      case 'education':
        return {
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          grade: ''
        };      case 'skills':
        return { name: '' };
      case 'languages':
        return { name: '', level: 'Intermediate' };
      case 'certifications':
        return {
          name: '',
          issuer: '',
          date: '',
          url: ''
        };
      default:
        return {};
    }
  };  const handleSave = async () => {
    setIsProcessing(true);
    setUploadError('');
    try {      // Prepare data for backend - convert skills array back to categorized format
      const dataToSave = {
        ...formData,
        skills: categorizeSkillsArray(formData.skills)
      };
      
      const result = await saveCV(dataToSave);
      if (result.success) {
        // Show success and move to final step
        console.log('✅ CV saved successfully');
        setShowSuccess(true);
        setActiveStep(5); // Move to review/success step
        
        // Update the CV data in context - make sure it's the latest
        updateCV(dataToSave);
        
        // Optional: Auto-redirect after a delay
        setTimeout(() => {
          // You can uncomment this to auto-redirect to dashboard
          // navigate('/dashboard');
        }, 3000);
      } else {
        console.error('❌ Failed to save CV:', result.error);
        setUploadError(result.error || 'Failed to save CV');
      }
    } catch (error) {
      console.error('Failed to save CV:', error);
      setUploadError(error.message || 'Failed to save CV');
    } finally {
      setIsProcessing(false);
    }
  };const handleDownloadCV = async () => {
    const now = Date.now();
    
    // Prevent multiple calls with stronger guard - require 3 seconds between downloads
    if (isDownloading || (now - lastDownloadTime < 3000)) {
      console.log('⚠️ Download blocked - already in progress or too soon after last download');
      return;
    }
    
    setIsDownloading(true);
    setLastDownloadTime(now);
    setUploadError(''); // Clear any previous errors
      try {
      console.log('🚀 Starting single PDF download...');      // Prepare data for backend - convert skills array back to categorized format
      const dataToDownload = {
        ...formData,
        skills: categorizeSkillsArray(formData.skills)
      };
      
      const result = await downloadCV(dataToDownload, 'my-cv');
      if (!result.success) {
        setUploadError(result.error || 'Failed to download CV');
      } else {
        console.log('✅ PDF download completed successfully');
      }
    } catch (error) {
      console.error('❌ Failed to download CV:', error);
      setUploadError(error.message || 'Failed to download CV');
    } finally {
      // Keep download state for 2 seconds to prevent immediate re-clicks
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Import Your CV
              </h2>
              <p className="text-gray-600 mb-8">
                Upload your existing CV or paste the content to get started
              </p>
            </div>

            {/* Method Selection */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setUploadMethod('upload')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setUploadMethod('paste')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'paste'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Paste Text
              </button>
            </div>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            {uploadMethod === 'upload' ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="cv-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload your CV
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </p>
                </label>
                {isProcessing && (
                  <div className="mt-4">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm text-gray-600 mt-2">Processing your CV...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  label="Paste your CV content"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your CV content here..."
                  rows={12}
                  disabled={isProcessing}
                />
                <Button
                  onClick={handlePasteSubmit}
                  variant="primary"
                  disabled={isProcessing || !pastedText.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    'Process CV Content'
                  )}
                </Button>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={() => setActiveStep(1)}
                variant="outline"
              >
                Skip and Build from Scratch
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">            <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.personalInfo.firstName}
                onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.personalInfo.lastName}
                onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                required
              />
            </div>
            
            <Input
              label="Professional Title"
              value={formData.personalInfo.title}
              onChange={(e) => handleInputChange('personalInfo', 'title', e.target.value)}
              placeholder="e.g., Senior Software Engineer, Marketing Manager"
              className="mb-4"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                required
              />
              <Input
                label="Phone"
                value={formData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
              />
              <Input
                label="Location"
                value={formData.personalInfo.location}
                onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
              />
              <Input
                label="LinkedIn"
                value={formData.personalInfo.linkedin}
                onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
              />
            </div>
            
            <Textarea
              label="Professional Summary"
              value={formData.summary}
              onChange={(e) => handleInputChange(null, 'summary', e.target.value)}
              placeholder="Brief description of your professional background and goals..."
              rows={4}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
              <Button
                onClick={() => addArrayItem('experience')}
                variant="outline"
                size="sm"
              >
                Add Experience
              </Button>
            </div>
            
            {formData.experience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">Experience {index + 1}</h3>
                  <button
                    onClick={() => removeArrayItem('experience', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company"
                    value={exp.company}
                    onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                  />
                  <Input
                    label="Position"
                    value={exp.position}
                    onChange={(e) => handleInputChange('experience', 'position', e.target.value, index)}
                  />
                  <Input
                    label="Start Date"
                    type="date"
                    value={exp.startDate}
                    onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, index)}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={exp.endDate}
                    onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, index)}
                  />
                </div>
                
                <Textarea
                  label="Description"
                  value={exp.description}
                  onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                />
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Education</h2>
              <Button
                onClick={() => addArrayItem('education')}
                variant="outline"
                size="sm"
              >
                Add Education
              </Button>
            </div>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">Education {index + 1}</h3>
                  <button
                    onClick={() => removeArrayItem('education', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Institution"
                    value={edu.institution}
                    onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                  />
                  <Input
                    label="Degree"
                    value={edu.degree}
                    onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                  />
                  <Input
                    label="Field of Study"
                    value={edu.field}
                    onChange={(e) => handleInputChange('education', 'field', e.target.value, index)}
                  />
                  <Input
                    label="Grade/GPA"
                    value={edu.grade}
                    onChange={(e) => handleInputChange('education', 'grade', e.target.value, index)}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Skills & Languages</h2>
            
            {/* Skills Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                <Button
                  onClick={() => addArrayItem('skills')}
                  variant="outline"
                  size="sm"
                >
                  Add Skill
                </Button>
              </div>                <div className="space-y-2">
                {(Array.isArray(formData.skills) ? formData.skills : []).map((skill, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Input
                      placeholder="Skill name"
                      value={skill.name}
                      onChange={(e) => handleInputChange('skills', 'name', e.target.value, index)}
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeArrayItem('skills', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Languages</h3>
                <Button
                  onClick={() => addArrayItem('languages')}
                  variant="outline"
                  size="sm"
                >
                  Add Language
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.languages.map((language, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Input
                      placeholder="Language"
                      value={language.name}
                      onChange={(e) => handleInputChange('languages', 'name', e.target.value, index)}
                      className="flex-1"
                    />
                    <select
                      value={language.level}
                      onChange={(e) => handleInputChange('languages', 'level', e.target.value, index)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Native">Native</option>
                    </select>
                    <button
                      onClick={() => removeArrayItem('languages', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );      case 5:
        return (
          <div className="space-y-6">
            {/* Always show success message in step 5 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
            >
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-900 mb-4">Congratulations!</h2>
              <p className="text-xl text-green-700 mb-2">
                Your CV has been saved successfully!
              </p>
              <p className="text-green-600">
                Your professional CV is now ready to help you land your dream job.
              </p>
            </motion.div>

            {/* Error Message */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-center">{uploadError}</p>
              </div>
            )}
            
            {/* What's Next Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">📥</div>
                  <h4 className="font-medium text-blue-900 mb-1">Download Your CV</h4>
                  <p className="text-sm text-blue-700">Get a PDF copy of your CV</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-medium text-blue-900 mb-1">Apply for Jobs</h4>
                  <p className="text-sm text-blue-700">Tailor your CV for specific positions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-medium text-blue-900 mb-1">View Dashboard</h4>
                  <p className="text-sm text-blue-700">Manage your CV and applications</p>
                </div>
              </div>
            </motion.div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">CV Preview</h3>
              
              {/* Simple preview */}
              <div className="bg-white rounded p-4 border mb-6">
                <h4 className="font-bold text-lg">
                  {formData.personalInfo.firstName} {formData.personalInfo.lastName}
                </h4>
                <p className="text-gray-600 mb-2">{formData.personalInfo.email}</p>
                <p className="text-gray-600 mb-4">{formData.personalInfo.phone}</p>
                
                {formData.summary && (
                  <div className="mt-4">
                    <h5 className="font-medium">Summary</h5>
                    <p className="text-sm text-gray-700">{formData.summary}</p>
                  </div>
                )}
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Experience:</span> {formData.experience.length} position(s)
                  </div>
                  <div>
                    <span className="font-medium">Education:</span> {formData.education.length} degree(s)
                  </div>
                  <div>
                    <span className="font-medium">Skills:</span> {formData.skills.length} skill(s)
                  </div>
                  <div>
                    <span className="font-medium">Languages:</span> {formData.languages.length} language(s)
                  </div>
                </div>
              </div>              {/* Action buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleDownloadCV}
                  variant="primary"
                  disabled={isDownloading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isDownloading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Downloading PDF...</span>
                    </div>
                  ) : (
                    <>📄 Download CV</>
                  )}
                </Button>
                
                <Button
                  onClick={() => navigate('/job-application')}
                  variant="primary"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  🎯 Apply for Jobs
                </Button>
                  <Button
                  onClick={() => navigate('/dashboard', { state: { refreshCV: true } })}
                  variant="outline"
                  className="w-full"
                >
                  📊 Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    activeStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  <span className="text-sm">{step.icon}</span>
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    activeStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      activeStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          {renderStepContent()}
        </motion.div>        {/* Navigation */}
        {activeStep < 5 && (
          <div className="flex justify-between">
            <Button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              variant="outline"
              disabled={activeStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex space-x-4">
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleSave}
                  variant="primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving...</span>
                    </div>
                  ) : (
                    'Save CV'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  variant="primary"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Success Step Navigation */}
        {activeStep === 5 && (
          <div className="text-center">
            <Button
              onClick={() => setActiveStep(4)}
              variant="outline"
              className="mr-4"
            >
              ← Edit CV
            </Button>            <Button
              onClick={() => navigate('/dashboard', { state: { refreshCV: true } })}
              variant="primary"
            >
              Go to Dashboard →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVBuilderPage;
