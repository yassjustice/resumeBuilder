import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCV } from '../contexts/CVContext';
import { useTailoredCV } from '../contexts/TailoredCVContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Textarea from '../components/UI/Textarea';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import TailoredCVPreview from '../components/TailoredCV/TailoredCVPreview';
import TailoredCVEditor from '../components/TailoredCV/TailoredCVEditor';
import { api } from '../services/api';

export const AdvancedJobApplicationPage = () => {
  const { cvData, loadUserCV } = useCV();
  const { 
    jobOffer,
    tailoredCV,
    coverLetter,
    isLoading,
    aiProcessing,
    error,
    extractJobOffer,
    generateTailoredCV,
    generateCoverLetter,
    updateTailoredCVSection,
    downloadTailoredCV,
    saveTailoredCV,
    clearAllData,
    clearError
  } = useTailoredCV();

  const [step, setStep] = useState(0);
  const [jobOfferMethod, setJobOfferMethod] = useState('paste');
  const [jobOfferText, setJobOfferText] = useState('');
  const [jobOfferFile, setJobOfferFile] = useState(null);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonView, setComparisonView] = useState('side-by-side'); // 'side-by-side' or 'overlay'
  const [aiStatus, setAiStatus] = useState('');

  const steps = [
    { id: 0, title: 'Job Offer', icon: '📋' },
    { id: 1, title: 'Requirements', icon: '📝' },
    { id: 2, title: 'Generate', icon: '🤖' },
    { id: 3, title: 'Review & Edit', icon: '✏️' },
    { id: 4, title: 'Download', icon: '📥' }
  ];

  useEffect(() => {
    // Load original CV when component mounts
    const initializePage = async () => {
      try {
        const result = await loadUserCV();
        if (!result.success || !result.cv) {
          setLocalError('Please create your CV first before applying for jobs.');
        } else {
          setLocalError('');
        }
      } catch (error) {
        console.error('Failed to load CV:', error);
        setLocalError('Failed to load your CV. Please try refreshing the page.');
      }
    };
    
    initializePage();
  }, [loadUserCV]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setLocalError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLocalError('File size must be less than 10MB');
      return;
    }

    setJobOfferFile(file);
    setLocalError('');
  };

  const processJobOffer = async () => {
    if (!cvData) {
      setLocalError('Please create your CV first before applying for jobs.');
      return;
    }
    
    if (!jobOfferText.trim() && !jobOfferFile) {
      setLocalError('Please provide a job offer either by pasting text or uploading a file');
      return;
    }

    setIsProcessing(true);
    setLocalError('');
    clearError();

    try {
      let extractedText;
      
      if (jobOfferMethod === 'upload' && jobOfferFile) {
        console.log('📁 Uploading and extracting job offer file...');
        const uploadResponse = await api.uploadFile(jobOfferFile);
        extractedText = uploadResponse.extractedText;
      } else {
        extractedText = jobOfferText;
      }

      console.log('🔍 Extracting job offer details...');
      const result = await extractJobOffer(extractedText);
      
      if (result.success) {
        console.log('✅ Job offer processed successfully');
        setStep(1);
      } else {
        setLocalError(result.error || 'Failed to process job offer');
      }
    } catch (error) {
      console.error('Error processing job offer:', error);
      setLocalError(error.message || 'Failed to process job offer');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateDocuments = async () => {
    if (!cvData || !jobOffer) {
      setLocalError('Missing CV or job offer data');
      return;
    }

    setIsProcessing(true);
    setLocalError('');
    clearError();

    try {
      console.log('🎯 Starting advanced CV tailoring and cover letter generation...');
      
      // Generate both tailored CV and cover letter
      const [cvResult, coverLetterResult] = await Promise.all([
        generateTailoredCV(cvData, jobOffer, additionalRequirements),
        generateCoverLetter(cvData, jobOffer, additionalRequirements)
      ]);

      if (!cvResult.success) {
        throw new Error(cvResult.error || 'Failed to generate tailored CV');
      }
      if (!coverLetterResult.success) {
        throw new Error(coverLetterResult.error || 'Failed to generate cover letter');
      }      console.log('✅ Documents generated successfully');
      setSuccessMessage('🎉 Your tailored CV and cover letter have been generated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
      setStep(3); // Move to review step
    } catch (err) {
      console.error('Document generation error:', err);
      setLocalError(err.message || 'Failed to generate documents');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDownload = async (type) => {
    try {
      setIsProcessing(true);
      
      if (type === 'cv') {
        const result = await downloadTailoredCV(`tailored-cv-${jobOffer?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'application'}`);
        if (!result.success) {
          setLocalError(result.error || 'Failed to download CV');
        } else {
          console.log('✅ CV downloaded successfully');
        }
      } else if (type === 'cover-letter') {
        if (!coverLetter) {
          setLocalError('No cover letter available for download');
          return;
        }
        
        try {
          const fileName = `cover-letter-${jobOffer?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'application'}`;
          const result = await api.downloadCoverLetter(coverLetter, fileName);
          if (result.success) {
            console.log('✅ Cover letter downloaded successfully');
          } else {
            setLocalError(result.error || 'Failed to download cover letter');
          }
        } catch (error) {
          console.error('Cover letter download error:', error);
          setLocalError('Failed to download cover letter');
        }
      }
    } catch (error) {
      setLocalError(error.message || 'Download failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const result = await saveTailoredCV(`Tailored CV - ${jobOffer?.title || 'Application'}`);
      if (!result.success) {
        setLocalError(result.error || 'Failed to save CV');
      } else {
        console.log('✅ Tailored CV saved to account');
        setSuccessMessage('Tailored CV saved successfully!');
      }
    } catch (error) {
      setLocalError(error.message || 'Save failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Job Offer Details
              </h2>
              <p className="text-gray-600 mb-8">
                Provide the job offer details to create a perfectly tailored CV
              </p>
            </div>

            {/* Method Selection */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setJobOfferMethod('paste')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  jobOfferMethod === 'paste'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Paste Text
              </button>
              <button
                onClick={() => setJobOfferMethod('upload')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  jobOfferMethod === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload File
              </button>
            </div>

            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{localError || error}</p>
              </div>
            )}

            {jobOfferMethod === 'paste' ? (
              <Textarea
                label="Paste Job Offer"
                value={jobOfferText}
                onChange={(e) => setJobOfferText(e.target.value)}
                placeholder="Paste the complete job offer, including requirements, responsibilities, and company information..."
                rows={12}
                disabled={isProcessing}
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="job-offer-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isProcessing}
                />
                <label htmlFor="job-offer-upload" className="cursor-pointer block">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload job offer
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </p>
                  {jobOfferFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {jobOfferFile.name}
                    </p>
                  )}
                </label>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={processJobOffer}
                variant="primary"
                disabled={isProcessing || (!jobOfferText.trim() && !jobOfferFile)}
                className="w-full max-w-md"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : (
                  'Analyze Job Offer'
                )}
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Job Analysis Results
              </h2>
              <p className="text-gray-600 mb-8">
                Review the extracted job details and add any additional requirements
              </p>
            </div>

            {jobOffer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-4">Extracted Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Position:</span>
                    <span className="ml-2 text-blue-700">{jobOffer.title || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Company:</span>
                    <span className="ml-2 text-blue-700">{jobOffer.company || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Location:</span>
                    <span className="ml-2 text-blue-700">{jobOffer.location || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Employment Type:</span>
                    <span className="ml-2 text-blue-700">{jobOffer.employmentType || 'Not specified'}</span>
                  </div>
                </div>
                
                {jobOffer.keySkills && jobOffer.keySkills.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-blue-800">Key Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobOffer.keySkills.slice(0, 10).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {jobOffer.keySkills.length > 10 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{jobOffer.keySkills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Textarea
              label="Additional Requirements (Optional)"
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Add any specific requirements or preferences for the tailored CV..."
              rows={4}
            />

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(0)}
                variant="outline"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                variant="primary"
              >
                Continue to Generation
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Generate Tailored Documents
              </h2>              <p className="text-gray-600 mb-8">
                Create a perfectly tailored CV and cover letter for this position
              </p>
            </div>

            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{localError || error}</p>
              </div>
            )}

            {/* AI Processing Status */}
            {(isProcessing || aiProcessing) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-blue-900 font-medium">AI Processing in Progress...</span>
                </div>
                
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center justify-center space-x-4">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Job Analysis
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      CV Analysis
                    </span>
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        isProcessing || aiProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'
                      }`}></span>
                      Optimization
                    </span>
                  </div>
                  
                  <div className="text-center text-xs text-blue-600 mt-3">
                    <p>⏳ This process may take 30-60 seconds due to AI rate limiting</p>
                    <p>✨ Our AI is carefully analyzing every detail of your CV for optimal results</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-4">🎯 What We'll Generate:</h3>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start">
                  <span className="font-medium mr-2">📄 Tailored CV:</span>
                  <span>Optimized professional title, enhanced summary, and keyword-rich content</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">💼 Experience:</span>
                  <span>Achievement-focused descriptions with quantified results</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">🎯 Skills:</span>
                  <span>Prioritized and categorized based on job requirements</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">📝 Cover Letter:</span>
                  <span>Personalized cover letter highlighting your best fit for the role</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                disabled={isProcessing || aiProcessing}
              >
                Back
              </Button>
              <Button
                onClick={generateDocuments}
                variant="primary"
                disabled={isProcessing || aiProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing || aiProcessing ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Generating...</span>
                  </div>
                ) : (
                  'Generate Documents'
                )}
              </Button>
            </div>
          </div>
        );      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Review & Edit Your Tailored CV
              </h2>              <p className="text-gray-600 mb-8">
                Review your tailored documents and make any necessary adjustments
              </p>
            </div>

            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{localError || error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {tailoredCV && (
              <div className="space-y-6">                {/* Control Panel */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => setPreviewMode(!previewMode)}
                        variant={previewMode ? "primary" : "outline"}
                        size="sm"
                      >
                        {previewMode ? '👁️ Preview Mode' : '👁️ Show Preview'}
                      </Button>
                      <Button
                        onClick={() => setEditMode(!editMode)}
                        variant={editMode ? "primary" : "outline"}
                        size="sm"
                      >
                        {editMode ? '✏️ Edit Mode' : '✏️ Edit CV'}
                      </Button>
                      <Button
                        onClick={() => setShowComparison(!showComparison)}
                        variant={showComparison ? "primary" : "outline"}
                        size="sm"
                      >
                        {showComparison ? '⚖️ Hide Comparison' : '⚖️ Compare Original'}
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSave}
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                      >
                        💾 Save to Account
                      </Button>
                      <Button
                        onClick={() => handleDownload('cv')}
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                      >
                        📥 Download CV
                      </Button>                      {coverLetter && (
                        <Button
                          onClick={() => handleDownload('cover-letter')}
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                        >
                          📄 Download Cover Letter
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Optimization Summary */}
                  {tailoredCV.metadata?.optimizationSummary && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <h4 className="font-medium text-green-900 mb-2">🎯 AI Optimization Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
                        {Object.entries(tailoredCV.metadata.optimizationSummary).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className="text-green-800 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>                {/* Comparison View */}
                {showComparison && cvData && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">⚖️ CV Comparison</h4>
                      <p className="text-sm text-yellow-800 mb-3">
                        Compare your original CV with the AI-optimized version to see the improvements.
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setComparisonView('side-by-side')}
                          variant={comparisonView === 'side-by-side' ? 'primary' : 'outline'}
                          size="sm"
                        >
                          Side by Side
                        </Button>
                        <Button
                          onClick={() => setComparisonView('overlay')}
                          variant={comparisonView === 'overlay' ? 'primary' : 'outline'}
                          size="sm"
                        >
                          Overlay View
                        </Button>
                      </div>
                    </div>

                    {comparisonView === 'side-by-side' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                            📋 Original CV
                          </h4>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                            <TailoredCVPreview cv={cvData} jobOffer={jobOffer} />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                            🎯 Tailored CV
                          </h4>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                            <TailoredCVPreview cv={tailoredCV} jobOffer={jobOffer} />
                          </div>
                        </div>
                      </div>
                    )}

                    {comparisonView === 'overlay' && (
                      <div className="space-y-4">
                        {/* Section-by-section comparison */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary Comparison</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h5 className="font-medium text-red-900 mb-2">Before (Original)</h5>
                              <p className="text-sm text-red-800">{cvData.summary || 'No summary available'}</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h5 className="font-medium text-green-900 mb-2">After (Tailored)</h5>
                              <p className="text-sm text-green-800">{tailoredCV.summary || 'No summary available'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills Comparison</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h5 className="font-medium text-red-900 mb-2">Before (Original)</h5>
                              <div className="text-sm text-red-800">
                                {cvData.skills && typeof cvData.skills === 'object' ? (
                                  Object.entries(cvData.skills).map(([category, skills]) => (
                                    <div key={category} className="mb-2">
                                      <strong>{category}:</strong> {Array.isArray(skills) ? skills.join(', ') : ''}
                                    </div>
                                  ))
                                ) : (
                                  <p>No skills data available</p>
                                )}
                              </div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h5 className="font-medium text-green-900 mb-2">After (Tailored)</h5>
                              <div className="text-sm text-green-800">
                                {tailoredCV.skills && typeof tailoredCV.skills === 'object' ? (
                                  Object.entries(tailoredCV.skills).map(([category, skills]) => (
                                    <div key={category} className="mb-2">
                                      <strong>{category}:</strong> {Array.isArray(skills) ? skills.join(', ') : ''}
                                    </div>
                                  ))
                                ) : (
                                  <p>No skills data available</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CV Preview */}
                {previewMode && !editMode && !showComparison && (
                  <TailoredCVPreview cv={tailoredCV} jobOffer={jobOffer} />
                )}

                {/* CV Editor */}
                {editMode && !previewMode && !showComparison && (
                  <TailoredCVEditor
                    cv={tailoredCV}
                    onSave={(updatedCV) => {
                      setEditMode(false);
                      console.log('✅ Tailored CV updated locally');
                    }}
                    onCancel={() => setEditMode(false)}
                  />
                )}

                {/* Both Preview and Edit Side by Side */}
                {previewMode && editMode && !showComparison && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Editor</h4>
                      <TailoredCVEditor
                        cv={tailoredCV}
                        onSave={(updatedCV) => {
                          console.log('✅ Tailored CV updated locally');
                        }}
                        onCancel={() => setEditMode(false)}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h4>
                      <TailoredCVPreview cv={tailoredCV} jobOffer={jobOffer} />
                    </div>
                  </div>
                )}

                {/* Default view - Summary cards */}
                {!previewMode && !editMode && !showComparison && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Summary Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">📝 Summary</h4>
                      <p className="text-sm text-blue-800 line-clamp-3">
                        {tailoredCV.summary}
                      </p>
                      <Button
                        onClick={() => setEditMode(true)}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-blue-600 border-blue-300"
                      >
                        Edit Summary
                      </Button>
                    </div>

                    {/* Experience Card */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">💼 Experience</h4>
                      <p className="text-sm text-green-800">
                        {tailoredCV.experience?.length || 0} positions optimized
                      </p>
                      {tailoredCV.metadata?.optimizationSummary?.experienceOptimized && (
                        <p className="text-xs text-green-600 mt-1">✓ AI-enhanced descriptions</p>
                      )}
                      <Button
                        onClick={() => setEditMode(true)}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-green-600 border-green-300"
                      >
                        Edit Experience
                      </Button>
                    </div>

                    {/* Skills Card */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">🎯 Skills</h4>
                      <p className="text-sm text-purple-800">
                        {Object.keys(tailoredCV.skills || {}).length} categories
                      </p>
                      {tailoredCV.metadata?.optimizationSummary?.skillsReorganized && (
                        <p className="text-xs text-purple-600 mt-1">✓ Prioritized for job match</p>
                      )}
                      <Button
                        onClick={() => setEditMode(true)}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-purple-600 border-purple-300"
                      >
                        Edit Skills
                      </Button>
                    </div>

                    {/* Projects Card */}
                    {tailoredCV.projects && tailoredCV.projects.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">🚀 Projects</h4>
                        <p className="text-sm text-orange-800">
                          {tailoredCV.projects.length} projects optimized
                        </p>
                        {tailoredCV.metadata?.optimizationSummary?.projectsOptimized && (
                          <p className="text-xs text-orange-600 mt-1">✓ Relevance-ranked</p>
                        )}
                        <Button
                          onClick={() => setEditMode(true)}
                          variant="outline"
                          size="sm"
                          className="mt-2 text-orange-600 border-orange-300"
                        >
                          Edit Projects
                        </Button>
                      </div>
                    )}

                    {/* Match Score Card */}
                    {tailoredCV.metadata?.matchScore && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">📊 Job Match</h4>
                        <div className="flex items-center">
                          <div className="w-16 h-4 bg-gray-200 rounded-full mr-3">
                            <div 
                              className="h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                              style={{ width: `${tailoredCV.metadata.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {tailoredCV.metadata.matchScore}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Tailored for: {tailoredCV.metadata.tailoredFor}
                        </p>
                      </div>
                    )}

                    {/* Cover Letter Card */}
                    {coverLetter && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 mb-2">📄 Cover Letter</h4>
                        <p className="text-sm text-indigo-800">
                          Personalized cover letter generated
                        </p>
                        <Button
                          onClick={() => handleDownload('cover-letter')}
                          variant="outline"
                          size="sm"
                          className="mt-2 text-indigo-600 border-indigo-300"
                        >
                          Preview & Download
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    disabled={isProcessing || aiProcessing}
                  >
                    Back to Generation
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    variant="primary"
                    disabled={isProcessing || aiProcessing}
                  >
                    Continue to Download
                  </Button>
                </div>
              </div>
            )}

            {!tailoredCV && !isProcessing && !aiProcessing && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tailored CV available</p>
                <Button
                  onClick={() => setStep(2)}
                  variant="primary"
                >
                  Generate CV First
                </Button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Download Your Documents
              </h2>
              <p className="text-gray-600 mb-8">
                Your tailored CV and cover letter are ready for download
              </p>
            </div>

            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{localError || error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tailored CV
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    ATS-optimized CV perfectly matched to the job requirements
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleDownload('cv')}
                      variant="primary"
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Downloading...</span>
                        </div>
                      ) : (
                        'Download CV PDF'
                      )}
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full"
                    >
                      Save to Account
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cover Letter
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Personalized cover letter highlighting your best qualities
                  </p>                  <Button
                    onClick={() => handleDownload('cover-letter')}
                    variant="primary"
                    disabled={isProcessing || !coverLetter}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Downloading...</span>
                      </div>
                    ) : !coverLetter ? (
                      'Cover Letter Not Available'
                    ) : (
                      'Download Cover Letter PDF'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => {
                  clearAllData();
                  setStep(0);
                  setJobOfferText('');
                  setJobOfferFile(null);
                  setAdditionalRequirements('');
                  setLocalError('');
                }}
                variant="outline"
                className="mr-4"
              >
                Start New Application
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Job Application
          </h1>
          <p className="text-gray-600">
            Create perfectly tailored CVs and cover letters for specific job applications
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div
                key={stepItem.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= stepItem.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  <span className="text-sm">{stepItem.icon}</span>
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step >= stepItem.id ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {stepItem.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step > stepItem.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          {renderStepContent()}
        </motion.div>
      </div>
    </div>
  );
};

// Simple CV Preview Component
const CVPreview = ({ cv }) => {
  if (!cv) return null;

  return (
    <div className="space-y-6 text-sm">
      {/* Personal Info */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {cv.personalInfo?.firstName} {cv.personalInfo?.lastName}
        </h1>
        <p className="text-lg text-gray-600 mt-1">{cv.personalInfo?.title}</p>
        <div className="text-gray-600 mt-2">
          {cv.personalInfo?.email} • {cv.personalInfo?.phone}
          {cv.personalInfo?.location && ` • ${cv.personalInfo.location}`}
        </div>
      </div>

      {/* Summary */}
      {cv.summary && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
          <p className="text-gray-700">{cv.summary}</p>
        </div>
      )}

      {/* Experience */}
      {cv.experience && cv.experience.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Experience</h2>
          {cv.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{exp.position}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                </div>
                <div className="text-gray-500 text-sm">
                  {exp.startDate} - {exp.endDate}
                </div>
              </div>
              <p className="text-gray-700 mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {cv.skills && Object.keys(cv.skills).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills</h2>
          {Object.entries(cv.skills).map(([category, skills]) => (
            <div key={category} className="mb-2">
              <span className="font-medium text-gray-900">{category}:</span>
              <span className="ml-2 text-gray-700">{skills.join(', ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple CV Editor Component  
const CVEditor = ({ cv, onUpdate }) => {
  if (!cv) return null;

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm">
        Full editing capabilities coming soon. For now, you can regenerate the CV with different requirements.
      </p>
      
      {/* Basic editing for summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Summary
        </label>
        <Textarea
          value={cv.summary || ''}
          onChange={(e) => onUpdate('summary', e.target.value)}
          rows={4}
          placeholder="Edit your professional summary..."
        />
      </div>
    </div>
  );
};

export default AdvancedJobApplicationPage;
