import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Type, Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/Language/LanguageSelector';
import LoadingSpinner from '../components/UI/LoadingSpinner';

/**
 * Enhanced CV Builder with Language Detection
 * Integrates language selection into the CV building workflow
 */
const EnhancedCVBuilder = ({ onCVExtracted, onLanguageSelected }) => {
  const {
    extractCVWithLanguageDetection,
    processFileWithLanguageDetection,
    applyCVLanguage,
    isLoading,
    error,
    clearError
  } = useLanguage();

  const [currentStep, setCurrentStep] = useState('input'); // 'input', 'language', 'result'
  const [inputMethod, setInputMethod] = useState('upload'); // 'upload' or 'paste'
  const [pastedText, setPastedText] = useState('');
  const [languageData, setLanguageData] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    clearError();
    setProcessingStatus('Processing uploaded file...');

    try {
      const result = await processFileWithLanguageDetection(file);
      
      if (result.requiresLanguageChoice) {
        setLanguageData(result.languageData);
        setCurrentStep('language');
      } else {
        setExtractedData(result.data);
        setCurrentStep('result');
        if (onCVExtracted) {
          onCVExtracted(result.data);
        }
      }
    } catch (error) {
      console.error('File processing error:', error);
      setProcessingStatus('');
    }
  };

  const handleTextExtraction = async () => {
    if (!pastedText.trim()) {
      return;
    }

    clearError();
    setProcessingStatus('Extracting CV data from text...');

    try {
      const result = await extractCVWithLanguageDetection(pastedText);
      
      if (result.requiresLanguageChoice) {
        setLanguageData(result.languageData);
        setCurrentStep('language');
      } else {
        setExtractedData(result.data);
        setCurrentStep('result');
        if (onCVExtracted) {
          onCVExtracted(result.data);
        }
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      setProcessingStatus('');
    }
  };

  const handleLanguageSelection = async (selectedLanguage, cvData) => {
    setProcessingStatus(`Applying ${selectedLanguage} language formatting...`);

    try {
      const result = await applyCVLanguage(cvData, ['all']);
      
      setExtractedData(result.cv);
      setCurrentStep('result');
      
      if (onLanguageSelected) {
        onLanguageSelected(selectedLanguage, result.cv);
      }
      if (onCVExtracted) {
        onCVExtracted(result.cv);
      }
    } catch (error) {
      console.error('Language application error:', error);
      setProcessingStatus('');
    }
  };

  const handleSkipLanguageSelection = (cvData) => {
    setExtractedData(cvData);
    setCurrentStep('result');
    
    if (onCVExtracted) {
      onCVExtracted(cvData);
    }
  };

  const resetBuilder = () => {
    setCurrentStep('input');
    setInputMethod('upload');
    setPastedText('');
    setLanguageData(null);
    setExtractedData(null);
    setProcessingStatus('');
    clearError();
  };

  const renderInputStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full mr-3">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <Globe className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered CV Builder
        </h2>
        <p className="text-gray-600 text-lg">
          Upload your CV or paste the text to get started. Our AI will extract your information and detect the best language for your profile.
        </p>
      </div>

      {/* Input Method Selector */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <button
            onClick={() => setInputMethod('upload')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              inputMethod === 'upload'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Upload className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Upload File</span>
          </button>
          <button
            onClick={() => setInputMethod('paste')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              inputMethod === 'paste'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Type className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Paste Text</span>
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg border p-6">
        {inputMethod === 'upload' ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Upload Your CV</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Choose a PDF, Word document, or image file
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                className="hidden"
                id="cv-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="cv-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
              >
                Choose File
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Paste Your CV Text</h3>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your CV content here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                {pastedText.length} characters
              </p>
              <button
                onClick={handleTextExtraction}
                disabled={!pastedText.trim() || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                Extract CV Data
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {(isLoading || processingStatus) && (
        <div className="mt-6 text-center">
          <LoadingSpinner size="sm" />
          <p className="text-gray-600 mt-2">
            {processingStatus || 'Processing...'}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderLanguageStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="mb-6">
        <button
          onClick={() => setCurrentStep('input')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Input
        </button>
      </div>

      <LanguageSelector
        detectedLanguage={languageData?.detectedLanguage}
        availableLanguages={languageData?.availableLanguages || []}
        extractedData={languageData?.extractedData}
        dataType={languageData?.dataType}
        onLanguageSelect={handleLanguageSelection}
        onSkip={handleSkipLanguageSelection}
        isLoading={isLoading}
      />

      {/* Processing Status */}
      {processingStatus && (
        <div className="mt-6 text-center">
          <LoadingSpinner size="sm" />
          <p className="text-gray-600 mt-2">{processingStatus}</p>
        </div>
      )}
    </motion.div>
  );

  const renderResultStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          CV Data Extracted Successfully!
        </h2>
        <p className="text-gray-600">
          Your CV information has been processed and is ready for editing.
        </p>
      </div>

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-white rounded-lg shadow-lg border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Extracted Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong> {extractedData.personalInfo?.name || 'N/A'}
            </div>
            <div>
              <strong>Title:</strong> {extractedData.personalInfo?.title || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {extractedData.personalInfo?.email || 'N/A'}
            </div>
            <div>
              <strong>Phone:</strong> {extractedData.personalInfo?.phone || 'N/A'}
            </div>
            {extractedData.experience?.length > 0 && (
              <div className="md:col-span-2">
                <strong>Experience:</strong> {extractedData.experience.length} entries
              </div>
            )}
            {extractedData.skills && Object.keys(extractedData.skills).length > 0 && (
              <div className="md:col-span-2">
                <strong>Skills:</strong> {Object.keys(extractedData.skills).length} categories
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={resetBuilder}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Extract Another CV
        </button>
        <button
          onClick={() => window.location.href = '/cv-builder'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          Continue to Editor
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AnimatePresence mode="wait">
        {currentStep === 'input' && renderInputStep()}
        {currentStep === 'language' && renderLanguageStep()}
        {currentStep === 'result' && renderResultStep()}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedCVBuilder;
