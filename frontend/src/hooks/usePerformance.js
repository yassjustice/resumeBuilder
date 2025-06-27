import { useState, useEffect, useCallback, useRef } from 'react';

// Performance metrics tracking
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    renderTime: 0,
    apiCalls: [],
    errors: [],
    memoryUsage: 0
  });

  const startTime = useRef(Date.now());
  const apiCallsRef = useRef([]);
  const errorsRef = useRef([]);

  // Track page load time
  useEffect(() => {
    const loadTime = Date.now() - startTime.current;
    setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
  }, []);

  // Track memory usage
  useEffect(() => {
    const trackMemory = () => {
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    trackMemory();
    const interval = setInterval(trackMemory, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const trackApiCall = useCallback((endpoint, duration, success = true, error = null) => {
    const call = {
      endpoint,
      duration,
      success,
      error,
      timestamp: Date.now()
    };

    apiCallsRef.current.push(call);
    setMetrics(prev => ({
      ...prev,
      apiCalls: [...prev.apiCalls, call].slice(-50) // Keep last 50 calls
    }));
  }, []);

  const trackError = useCallback((error, context = '') => {
    const errorEntry = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    errorsRef.current.push(errorEntry);
    setMetrics(prev => ({
      ...prev,
      errors: [...prev.errors, errorEntry].slice(-20) // Keep last 20 errors
    }));

    // Log to console for development
    console.error('🚨 Performance Monitor - Error tracked:', errorEntry);
  }, []);

  const getPerformanceReport = useCallback(() => {
    const avgApiTime = metrics.apiCalls.length > 0 
      ? metrics.apiCalls.reduce((acc, call) => acc + call.duration, 0) / metrics.apiCalls.length
      : 0;

    const errorRate = metrics.apiCalls.length > 0
      ? (metrics.apiCalls.filter(call => !call.success).length / metrics.apiCalls.length) * 100
      : 0;

    return {
      pageLoadTime: metrics.pageLoadTime,
      averageApiTime: Math.round(avgApiTime),
      totalApiCalls: metrics.apiCalls.length,
      errorRate: Math.round(errorRate * 100) / 100,
      totalErrors: metrics.errors.length,
      memoryUsage: metrics.memoryUsage,
      timestamp: Date.now()
    };
  }, [metrics]);

  return {
    metrics,
    trackApiCall,
    trackError,
    getPerformanceReport
  };
};

// Enhanced API hook with performance tracking
export const useApiWithTracking = () => {
  const { trackApiCall, trackError } = usePerformanceMonitor();

  const makeRequest = useCallback(async (apiCall, endpoint = 'unknown') => {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;
      trackApiCall(endpoint, duration, true);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      trackApiCall(endpoint, duration, false, error.message);
      trackError(error, `API call to ${endpoint}`);
      throw error;
    }
  }, [trackApiCall, trackError]);

  return { makeRequest };
};

// Component performance tracker
export const useComponentPerformance = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const { trackError } = usePerformanceMonitor();

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - lastRenderTime.current;
    lastRenderTime.current = Date.now();

    // Warn about excessive re-renders
    if (renderCount.current > 50) {
      console.warn(`⚠️ Component ${componentName} has rendered ${renderCount.current} times`);
    }

    // Warn about slow renders
    if (renderTime > 500) {
      console.warn(`⚠️ Component ${componentName} took ${renderTime}ms to render`);
    }
  });

  const trackComponentError = useCallback((error) => {
    trackError(error, `Component: ${componentName}`);
  }, [componentName, trackError]);

  return {
    renderCount: renderCount.current,
    trackComponentError
  };
};

// User interaction tracking
export const useUserAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    clicks: 0,
    timeOnPage: 0,
    interactions: []
  });

  const startTime = useRef(Date.now());

  useEffect(() => {
    const updateTimeOnPage = () => {
      setAnalytics(prev => ({
        ...prev,
        timeOnPage: Date.now() - startTime.current
      }));
    };

    const interval = setInterval(updateTimeOnPage, 1000);
    return () => clearInterval(interval);
  }, []);

  const trackClick = useCallback((element, context = '') => {
    const interaction = {
      type: 'click',
      element,
      context,
      timestamp: Date.now()
    };

    setAnalytics(prev => ({
      ...prev,
      clicks: prev.clicks + 1,
      interactions: [...prev.interactions, interaction].slice(-100)
    }));
  }, []);

  const trackFormSubmission = useCallback((formName, success, errorMessage = null) => {
    const interaction = {
      type: 'form_submission',
      formName,
      success,
      errorMessage,
      timestamp: Date.now()
    };

    setAnalytics(prev => ({
      ...prev,
      interactions: [...prev.interactions, interaction].slice(-100)
    }));
  }, []);

  const trackFeatureUsage = useCallback((feature, action, metadata = {}) => {
    const interaction = {
      type: 'feature_usage',
      feature,
      action,
      metadata,
      timestamp: Date.now()
    };

    setAnalytics(prev => ({
      ...prev,
      interactions: [...prev.interactions, interaction].slice(-100)
    }));
  }, []);

  return {
    analytics,
    trackClick,
    trackFormSubmission,
    trackFeatureUsage,
    getTimeOnPage: () => Date.now() - startTime.current
  };
};

export default {
  usePerformanceMonitor,
  useApiWithTracking,
  useComponentPerformance,
  useUserAnalytics
};
