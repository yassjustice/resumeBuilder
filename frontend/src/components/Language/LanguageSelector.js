import React, { useState, useEffect } from 'react';
import { Globe, Check, ArrowRight, FileText, Briefcase, Mail } from 'lucide-react';

/**
 * LanguageSelector Component
 * Displays language choice options after CV/job offer extraction
 */
const LanguageSelector = ({
  detectedLanguage = null,
  availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' }
  ],
  extractedData = null,
  dataType = 'cv',
  onLanguageSelect,
  onSkip,
  isLoading = false
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(detectedLanguage?.code || 'en');
  const [showConfidence, setShowConfidence] = useState(false);

  // Auto-select detected language with high confidence
  useEffect(() => {
    if (detectedLanguage?.confidence === 'high') {
      setSelectedLanguage(detectedLanguage.code);
    }
  }, [detectedLanguage]);

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = () => {
    if (onLanguageSelect) {
      onLanguageSelect(selectedLanguage);
    }
  };

  const handleSkipLanguageSelection = () => {
    if (onSkip) {
      onSkip(extractedData);
    }
  };

  const getDataTypeIcon = () => {
    switch (dataType) {
      case 'cv':
        return <FileText className="w-6 h-6" />;
      case 'jobOffer':
        return <Briefcase className="w-6 h-6" />;
      case 'coverLetter':
        return <Mail className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'cv':
        return 'CV Creation';
      case 'jobOffer':
        return 'Job Matching & Tailored CV';
      case 'coverLetter':
        return 'Cover Letter Generation';
      default:
        return 'Document Processing';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full mr-3">
            {getDataTypeIcon()}
          </div>
          <Globe className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Language
        </h2>
        <p className="text-gray-600">
          Data extracted successfully for {getDataTypeLabel()}. 
          Please select your preferred language for the best experience.
        </p>
      </div>

      {/* Language Detection Info */}
      {detectedLanguage && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-800 font-medium">
                Detected Language: {detectedLanguage.nativeName}
              </span>
              <button
                onClick={() => setShowConfidence(!showConfidence)}
                className={`ml-2 px-2 py-1 text-xs rounded-full ${getConfidenceColor(detectedLanguage.confidence)}`}
              >
                {detectedLanguage.confidence} confidence
              </button>
            </div>
            {detectedLanguage.confidence === 'high' && (
              <Check className="w-5 h-5 text-green-600" />
            )}
          </div>
          {showConfidence && (
            <p className="text-sm text-blue-700 mt-2">
              Based on the content analysis, we detected {detectedLanguage.name} with {detectedLanguage.confidence} confidence.
            </p>
          )}
        </div>
      )}

      {/* Language Options */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Language:
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {availableLanguages.map((language) => (
            <label
              key={language.code}
              className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-blue-300 ${
                selectedLanguage === language.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="language"
                value={language.code}
                checked={selectedLanguage === language.code}
                onChange={() => handleLanguageChange(language.code)}
                className="sr-only"
              />
              
              <div className="flex items-center flex-1">
                <span className="text-3xl mr-4">{language.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {language.name}
                    </span>
                    <span className="ml-2 text-gray-500">
                      ({language.nativeName})
                    </span>
                    {language.direction === 'rtl' && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        RTL
                      </span>
                    )}
                  </div>
                  {language.code === detectedLanguage?.code && (
                    <span className="text-sm text-blue-600 font-medium">
                      Detected
                    </span>
                  )}
                </div>
              </div>
              
              {selectedLanguage === language.code && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Preview Info */}
      {extractedData && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Extracted Data Preview:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {dataType === 'cv' && (
              <>
                <p><strong>Name:</strong> {extractedData.personalInfo?.name || 'N/A'}</p>
                <p><strong>Title:</strong> {extractedData.personalInfo?.title || 'N/A'}</p>
                {extractedData.experience?.length > 0 && (
                  <p><strong>Experience:</strong> {extractedData.experience.length} entries</p>
                )}
                {extractedData.skills && Object.keys(extractedData.skills).length > 0 && (
                  <p><strong>Skills:</strong> {Object.keys(extractedData.skills).length} categories</p>
                )}
              </>
            )}
            {dataType === 'jobOffer' && (
              <>
                <p><strong>Position:</strong> {extractedData.title || 'N/A'}</p>
                <p><strong>Company:</strong> {extractedData.company || 'N/A'}</p>
                {extractedData.requirements?.length > 0 && (
                  <p><strong>Requirements:</strong> {extractedData.requirements.length} items</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleContinue}
          disabled={isLoading || !selectedLanguage}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Continue in {availableLanguages.find(l => l.code === selectedLanguage)?.name}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
        
        <button
          onClick={handleSkipLanguageSelection}
          disabled={isLoading}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Skip & Use Default
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Your selection will optimize the content generation and user interface for the chosen language.
        </p>
      </div>
    </div>
  );
};

export default LanguageSelector;
