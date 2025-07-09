/**
 * 🆓 Puter AI Integration Component
 * Streamlined frontend component that leverages the new streamlined service
 * which delegates to the robust backend modular system
 */

import React, { useState, useEffect, useCallback } from 'react';
import streamlinedPuterAIService from '../../services/puterAIService';

const PuterAIComponent = ({ 
  cvData, 
  jobDescription = '', 
  onCVEnhanced, 
  onCoverLetterGenerated,
  onJobAnalyzed 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);
  const [puterStatus, setPuterStatus] = useState('initializing');

  // Initialize Puter service
  useEffect(() => {
    const initializePuter = async () => {
      try {
        console.log('🚀 Initializing streamlined Puter service...');
        
        // Initialize the streamlined service
        await streamlinedPuterAIService.init();
        
        setIsInitialized(true);
        setPuterStatus('ready');
        console.log('✅ Streamlined Puter AI Component ready');

      } catch (err) {
        console.error('❌ Streamlined Puter initialization failed:', err);
        setError(`Puter initialization failed: ${err.message}`);
        setPuterStatus('error');
      }
    };

    initializePuter();
  }, [isInitialized]);

  // Enhanced CV processing
  const enhanceCV = useCallback(async () => {
    if (!isInitialized || !cvData) return;

    setProcessing(true);
    setCurrentOperation('cv_enhancement');
    setError(null);

    try {
      console.log('🆓 Starting CV enhancement with Puter.js...');
      
      const result = await streamlinedPuterAIService.enhanceCV(cvData, jobDescription);
      
      if (result.success) {
        setResults(prev => ({ ...prev, enhancedCV: result }));
        
        if (onCVEnhanced) {
          onCVEnhanced(result.backendResponse.enhancedCV);
        }
        
        console.log('✅ CV enhancement completed successfully');
      } else {
        throw new Error('CV enhancement failed');
      }
      
    } catch (err) {
      setError(`CV Enhancement Error: ${err.message}`);
      console.error('❌ CV enhancement failed:', err);
    } finally {
      setProcessing(false);
      setCurrentOperation(null);
    }
  }, [isInitialized, cvData, jobDescription, onCVEnhanced]);

  // Cover letter generation
  const generateCoverLetter = useCallback(async (companyInfo = '') => {
    if (!isInitialized || !cvData) return;

    setProcessing(true);
    setCurrentOperation('cover_letter');
    setError(null);

    try {
      console.log('🆓 Starting cover letter generation with Puter.js...');
      
      const result = await streamlinedPuterAIService.generateCoverLetter(
        cvData, 
        jobDescription, 
        companyInfo
      );
      
      if (result.success) {
        setResults(prev => ({ ...prev, coverLetter: result }));
        
        if (onCoverLetterGenerated) {
          onCoverLetterGenerated(result.backendResponse.coverLetter);
        }
        
        console.log('✅ Cover letter generation completed successfully');
      } else {
        throw new Error('Cover letter generation failed');
      }
      
    } catch (err) {
      setError(`Cover Letter Error: ${err.message}`);
      console.error('❌ Cover letter generation failed:', err);
    } finally {
      setProcessing(false);
      setCurrentOperation(null);
    }
  }, [isInitialized, cvData, jobDescription, onCoverLetterGenerated]);

  // Job matching analysis
  const analyzeJobMatch = useCallback(async () => {
    if (!isInitialized || !cvData || !jobDescription) return;

    setProcessing(true);
    setCurrentOperation('job_matching');
    setError(null);

    try {
      console.log('🆓 Starting job match analysis with Puter.js...');
      
      const result = await streamlinedPuterAIService.analyzeJobMatch(cvData, jobDescription);
      
      if (result.success) {
        setResults(prev => ({ ...prev, jobAnalysis: result }));
        
        if (onJobAnalyzed) {
          onJobAnalyzed(result.backendResponse.analysis);
        }
        
        console.log('✅ Job match analysis completed successfully');
      } else {
        throw new Error('Job match analysis failed');
      }
      
    } catch (err) {
      setError(`Job Analysis Error: ${err.message}`);
      console.error('❌ Job match analysis failed:', err);
    } finally {
      setProcessing(false);
      setCurrentOperation(null);
    }
  }, [isInitialized, cvData, jobDescription, onJobAnalyzed]);

  // Optimize skills
  const optimizeSkills = useCallback(async () => {
    if (!isInitialized || !cvData) return;

    setProcessing(true);
    setCurrentOperation('skill_optimization');
    setError(null);

    try {
      console.log('🆓 Starting skills optimization with Puter.js...');
      
      const prompt = `
Optimize the skills section for this CV based on the job description:

CV Skills: ${JSON.stringify(cvData.skills || [])}
Job Description: ${jobDescription}

Provide optimized skills categorized as:
1. Technical skills
2. Soft skills  
3. Industry-specific skills
4. Missing skills that should be added

Format as JSON with clear categories.
`;

      const result = await streamlinedPuterAIService.processWithBackend(
        prompt, 
        'skill_optimization', 
        { cvData, jobDescription }
      );
      
      if (result.success) {
        setResults(prev => ({ ...prev, optimizedSkills: result }));
        console.log('✅ Skills optimization completed successfully');
      } else {
        throw new Error('Skills optimization failed');
      }
      
    } catch (err) {
      setError(`Skills Optimization Error: ${err.message}`);
      console.error('❌ Skills optimization failed:', err);
    } finally {
      setProcessing(false);
      setCurrentOperation(null);
    }
  }, [isInitialized, cvData, jobDescription]);

  // Reset model selection (for retry logic)
  const resetModels = () => {
    streamlinedPuterAIService.reset();
    setError(null);
  };

  // Get current model info
  const getCurrentModelInfo = () => {
    return streamlinedPuterAIService.getStatus().currentModel;
  };

  return (
    <div className="puter-ai-component">
      {/* Status Display */}
      <div className="puter-status mb-4">
        <div className={`status-badge ${puterStatus}`}>
          <span className="status-icon">
            {puterStatus === 'ready' && '🆓'}
            {puterStatus === 'initializing' && '⏳'}
            {puterStatus === 'error' && '❌'}
          </span>
          <span className="status-text">
            Puter.js AI: {puterStatus.charAt(0).toUpperCase() + puterStatus.slice(1)}
          </span>
        </div>
        
        {isInitialized && (
          <div className="model-info">
            <small>
              Current Model: {getCurrentModelInfo().model} 
              ({getCurrentModelInfo().index + 1}/{getCurrentModelInfo().available})
            </small>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message mb-4">
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
            <button 
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={resetModels}
            >
              Reset & Retry
            </button>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="puter-controls">
        <div className="row g-2">
          <div className="col-md-6">
            <button
              className="btn btn-primary w-100"
              onClick={enhanceCV}
              disabled={!isInitialized || processing || !cvData}
            >
              {processing && currentOperation === 'cv_enhancement' ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Enhancing CV...
                </>
              ) : (
                <>🆓 Enhance CV with Puter.js</>
              )}
            </button>
          </div>

          <div className="col-md-6">
            <button
              className="btn btn-success w-100"
              onClick={() => generateCoverLetter()}
              disabled={!isInitialized || processing || !cvData}
            >
              {processing && currentOperation === 'cover_letter' ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Generating...
                </>
              ) : (
                <>🆓 Generate Cover Letter</>
              )}
            </button>
          </div>

          <div className="col-md-6">
            <button
              className="btn btn-info w-100"
              onClick={analyzeJobMatch}
              disabled={!isInitialized || processing || !cvData || !jobDescription}
            >
              {processing && currentOperation === 'job_matching' ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Analyzing...
                </>
              ) : (
                <>🆓 Analyze Job Match</>
              )}
            </button>
          </div>

          <div className="col-md-6">
            <button
              className="btn btn-warning w-100"
              onClick={optimizeSkills}
              disabled={!isInitialized || processing || !cvData}
            >
              {processing && currentOperation === 'skill_optimization' ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Optimizing...
                </>
              ) : (
                <>🆓 Optimize Skills</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <div className="puter-results mt-4">
          <h5>🆓 Puter.js Results</h5>
          
          {results.enhancedCV && (
            <div className="result-card mb-3">
              <div className="card">
                <div className="card-header">
                  <strong>✅ Enhanced CV</strong>
                  <small className="text-muted ms-2">
                    Model: {results.enhancedCV.puterData?.model}
                  </small>
                </div>
                <div className="card-body">
                  <p>CV successfully enhanced with Puter.js AI processing</p>
                  <p><strong>Backend Processing:</strong> Applied</p>
                  <p><strong>Compatibility Score:</strong> {results.enhancedCV.backendResponse?.enhancedCV?.compatibilityScore}%</p>
                </div>
              </div>
            </div>
          )}

          {results.coverLetter && (
            <div className="result-card mb-3">
              <div className="card">
                <div className="card-header">
                  <strong>✅ Cover Letter Generated</strong>
                  <small className="text-muted ms-2">
                    Model: {results.coverLetter.puterData?.model}
                  </small>
                </div>
                <div className="card-body">
                  <p>Professional cover letter generated successfully</p>
                  <p><strong>Word Count:</strong> {results.coverLetter.backendResponse?.coverLetter?.wordCount}</p>
                  <p><strong>Structure:</strong> {results.coverLetter.backendResponse?.coverLetter?.structure}</p>
                </div>
              </div>
            </div>
          )}

          {results.jobAnalysis && (
            <div className="result-card mb-3">
              <div className="card">
                <div className="card-header">
                  <strong>✅ Job Match Analysis</strong>
                  <small className="text-muted ms-2">
                    Model: {results.jobAnalysis.puterData?.model}
                  </small>
                </div>
                <div className="card-body">
                  <p><strong>Match Score:</strong> {results.jobAnalysis.backendResponse?.analysis?.matchScore}%</p>
                  <p><strong>Strengths:</strong> {results.jobAnalysis.backendResponse?.analysis?.strengths?.length || 0} identified</p>
                  <p><strong>Gaps:</strong> {results.jobAnalysis.backendResponse?.analysis?.gaps?.length || 0} identified</p>
                  <p><strong>Recommendations:</strong> {results.jobAnalysis.backendResponse?.analysis?.recommendations?.length || 0} provided</p>
                </div>
              </div>
            </div>
          )}

          {results.optimizedSkills && (
            <div className="result-card mb-3">
              <div className="card">
                <div className="card-header">
                  <strong>✅ Skills Optimized</strong>
                  <small className="text-muted ms-2">
                    Model: {results.optimizedSkills.puterData?.model}
                  </small>
                </div>
                <div className="card-body">
                  <p>Skills successfully categorized and optimized</p>
                  <p><strong>Backend Enhancement:</strong> Applied</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Panel */}
      <div className="puter-info mt-4">
        <div className="alert alert-info">
          <h6>🆓 Free Unlimited AI Processing</h6>
          <ul className="mb-0">
            <li>Powered by Puter.js - No API keys required</li>
            <li>Direct frontend AI processing with backend enhancement</li>
            <li>Multiple model fallback support</li>
            <li>Complex data processing pipeline</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PuterAIComponent;
