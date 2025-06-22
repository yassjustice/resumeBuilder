import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCV } from '../contexts/CVContext';
import Button from '../components/UI/Button';
import Textarea from '../components/UI/Textarea';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { api } from '../services/api';

export const JobApplicationPage = () => {
  const { 
    cvData, 
    loadUserCV,
    generateJobSpecificCV, 
    generateCoverLetter, 
    isLoading, 
    aiProcessing, 
    error: cvError, 
    clearError 
  } = useCV();
  const [step, setStep] = useState(0);
  const [jobOfferMethod, setJobOfferMethod] = useState('paste'); // 'paste' or 'upload'
  const [jobOfferText, setJobOfferText] = useState('');
  const [jobOfferFile, setJobOfferFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const steps = [
    { id: 0, title: 'Job Offer', icon: '📋' },
    { id: 1, title: 'Requirements', icon: '📝' },
    { id: 2, title: 'Generate', icon: '🤖' },
    { id: 3, title: 'Download', icon: '📥' }
  ];  useEffect(() => {
    // Load CV data when component mounts
    const initializePage = async () => {
      try {
        const result = await loadUserCV();
        if (!result.success || !result.cv) {
          setError('Please create your CV first before applying for jobs.');
        } else {
          // Clear any previous error if CV is found
          setError('');
        }
      } catch (error) {
        console.error('Failed to load CV:', error);
        setError('Failed to load your CV. Please try refreshing the page.');
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
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setJobOfferFile(file);
    setError('');
  };  const processJobOffer = async () => {
    if (!cvData) {
      setError('Please create your CV first before applying for jobs.');
      return;
    }
    
    if (!jobOfferText.trim() && !jobOfferFile) {
      setError('Please provide a job offer either by pasting text or uploading a file');
      return;
    }

    setIsProcessing(true);
    setError('');
    clearError();

    try {
      let extractedText;
      
      if (jobOfferMethod === 'upload' && jobOfferFile) {
        // Upload file and extract text
        const uploadResponse = await api.uploadFile(jobOfferFile);
        extractedText = uploadResponse.extractedText;
      } else {
        extractedText = jobOfferText;
      }

      if (!extractedText) {
        throw new Error('No text could be extracted from the job offer');
      }

      // Extract job offer data using AI
      const jobOfferData = await api.extractJobOfferFromText(extractedText);

      // Store job offer data for next step
      setResults({ jobOffer: jobOfferData, jobOfferText: extractedText });
      setStep(1);
    } catch (err) {
      setError(err.message || 'Failed to process job offer');
    } finally {
      setIsProcessing(false);
    }
  };
  const generateDocuments = async () => {
    if (!cvData || !results?.jobOfferText) {
      setError('Missing CV or job offer data');
      return;
    }

    setIsProcessing(true);
    setError('');
    clearError();

    try {
      // Generate both CV and cover letter using context methods
      const [cvResult, coverLetterResult] = await Promise.all([
        generateJobSpecificCV(results.jobOfferText),
        generateCoverLetter(results.jobOfferText)
      ]);

      if (!cvResult.success) {
        throw new Error(cvResult.error || 'Failed to generate tailored CV');
      }
      if (!coverLetterResult.success) {
        throw new Error(coverLetterResult.error || 'Failed to generate cover letter');
      }

      setResults(prev => ({
        ...prev,
        tailoredCV: cvResult.cv,
        coverLetter: coverLetterResult.coverLetter
      }));
      
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to generate documents');
    } finally {
      setIsProcessing(false);
    }
  };  const [isDownloading, setIsDownloading] = useState(false);

  const downloadDocument = async (type) => {
    if (isDownloading) return; // Prevent multiple simultaneous downloads
    
    try {
      setIsDownloading(true);
      setError('');
      
      const fileName = `${type}_${new Date().toISOString().split('T')[0]}`;
      
      if (type === 'cv' && results.tailoredCV) {
        const response = await api.generatePDF(results.tailoredCV);
        
        // Create blob and download
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (type === 'cover-letter' && results.coverLetter) {
        // For cover letter, pass the content string directly
        const blob = await api.downloadCoverLetter(results.coverLetter, fileName);
        
        // Create download link - blob is already ready
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError(`No ${type} data available to download`);
      }
    } catch (err) {
      console.error(`Download error for ${type}:`, err);
      setError(`Failed to download ${type}: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Add Job Offer
              </h2>
              <p className="text-gray-600 mb-8">
                Provide the job offer details to tailor your CV and generate a cover letter
              </p>
            </div>            {!cvData && !isLoading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      CV Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You need to create your CV first before applying for jobs.{' '}
                        <a href="/cv-builder" className="font-medium underline">
                          Create your CV here
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}            {cvData && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex justify-between items-start">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        CV Ready
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          Your CV is ready! You can now tailor it for specific job applications.
                        </p>
                        {cvData.personalInfo && (
                          <p className="mt-1 font-medium">
                            {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={loadUserCV}
                    disabled={isLoading}
                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                    title="Refresh CV data"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="text-center mb-6">
                <LoadingSpinner />
                <p className="mt-2 text-gray-600">Loading your CV...</p>
              </div>
            )}

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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {jobOfferMethod === 'paste' ? (
              <div className="space-y-4">
                <Textarea
                  label="Job Offer Details"
                  value={jobOfferText}
                  onChange={(e) => setJobOfferText(e.target.value)}
                  placeholder="Paste the job description, requirements, and any other relevant information here..."
                  rows={12}
                  disabled={isProcessing}
                />
              </div>
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
                <label
                  htmlFor="job-offer-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload job offer
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </p>
                  {jobOfferFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ {jobOfferFile.name}
                    </p>
                  )}
                </label>
              </div>
            )}

            <Button
              onClick={processJobOffer}
              variant="primary"
              disabled={isProcessing || !cvData || (!jobOfferText.trim() && !jobOfferFile)}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Processing job offer...</span>
                </div>
              ) : (
                'Process Job Offer'
              )}
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Additional Requirements
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Job Offer Processed Successfully
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      The job offer has been analyzed. You can add any additional requirements or preferences below.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {results?.jobOffer && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Extracted Job Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {results.jobOffer.title && (
                    <p><strong>Position:</strong> {results.jobOffer.title}</p>
                  )}
                  {results.jobOffer.company && (
                    <p><strong>Company:</strong> {results.jobOffer.company}</p>
                  )}
                  {results.jobOffer.location && (
                    <p><strong>Location:</strong> {results.jobOffer.location}</p>
                  )}
                  {results.jobOffer.keySkills && (
                    <p><strong>Key Skills:</strong> {results.jobOffer.keySkills.join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            <Textarea
              label="Additional Requirements (Optional)"
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Add any specific requirements, preferences, or additional information that should be considered when tailoring your CV and generating the cover letter..."
              rows={6}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">💡 Pro Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mention specific achievements you want to highlight</li>
                  <li>Include any relevant certifications or projects</li>
                  <li>Specify the tone you want for your cover letter (formal, creative, etc.)</li>
                  <li>Add any company-specific information you know</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Generate Tailored Documents
              </h2>
              <p className="text-gray-600 mb-8">
                Our AI will now create a tailored CV and cover letter based on the job requirements
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-600 rounded-full text-white mr-3">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">AI-Powered Customization</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>✅ Analyze job requirements and match them with your skills</p>
                <p>✅ Highlight relevant experiences and achievements</p>
                <p>✅ Optimize keywords for ATS compatibility</p>
                <p>✅ Generate a compelling, personalized cover letter</p>
                <p>✅ Maintain professional formatting and structure</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              onClick={generateDocuments}
              variant="primary"
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Generating documents...</span>
                </div>
              ) : (
                'Generate Tailored CV & Cover Letter'
              )}
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Documents Are Ready! 🎉
              </h2>
              <p className="text-gray-600 mb-8">
                Download your tailored CV and cover letter below
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tailored CV */}
              <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tailored CV</h3>
                    <p className="text-sm text-gray-600">Customized for this position</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-700 mb-6">
                  <p>✅ Keywords optimized for ATS</p>
                  <p>✅ Relevant skills highlighted</p>
                  <p>✅ Experience prioritized by relevance</p>
                  <p>✅ Professional formatting maintained</p>
                </div>
                  <Button
                  onClick={() => downloadDocument('cv')}
                  variant="primary"
                  className="w-full"
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Downloading...' : 'Download CV'}
                </Button>
              </div>

              {/* Cover Letter */}
              <div className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
                    <p className="text-sm text-gray-600">Personalized for this application</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-700 mb-6">
                  <p>✅ Company-specific messaging</p>
                  <p>✅ Role-relevant achievements</p>
                  <p>✅ Professional tone and structure</p>
                  <p>✅ Compelling call-to-action</p>
                </div>
                  <Button
                  onClick={() => downloadDocument('cover-letter')}
                  variant="primary"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Downloading...' : 'Download Cover Letter'}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">
                Ready to apply for another position?
              </p>
              <Button
                onClick={() => {
                  setStep(0);
                  setJobOfferText('');
                  setJobOfferFile(null);
                  setResults(null);
                  setAdditionalRequirements('');
                  setError('');
                }}
                variant="outline"
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
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        {step < 3 && step > 0 && (
          <div className="flex justify-between">
            <Button
              onClick={() => setStep(Math.max(0, step - 1))}
              variant="outline"
              disabled={step === 0}
            >
              Previous
            </Button>
            
            {step === 1 && (
              <Button
                onClick={() => setStep(2)}
                variant="primary"
              >
                Continue to Generate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationPage;
