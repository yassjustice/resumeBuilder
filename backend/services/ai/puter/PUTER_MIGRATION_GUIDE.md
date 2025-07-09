# Puter System Migration Guide

## Overview

This guide helps you migrate from the legacy Puter system to the new modular Puter architecture v2.0. The migration ensures backward compatibility while providing access to enhanced features.

## Migration Strategy

### Phase 1: Preparation (Immediate)
1. **Assess Current Usage**
   - Identify all current Puter service usages
   - Document existing API endpoints
   - Review error handling patterns

2. **Setup New Routes**
   - The new modular routes are available at `/api/puter/v2/`
   - Legacy routes at `/api/ai/puter/` remain functional

3. **Install Dependencies**
   ```bash
   # No new dependencies required - fully backward compatible
   ```

### Phase 2: Gradual Migration (Recommended)

#### Step 1: Update Import Statements
**Before (Legacy):**
```javascript
const { puterServiceManager } = require('../services/ai/puter');
```

**After (New Modular):**
```javascript
const { puterModularService } = require('../services/ai/puter');
```

#### Step 2: Update API Calls
**Before (Legacy):**
```javascript
// Old endpoint
POST /api/ai/puter/extract-cv

// Old service usage
const result = await puterServiceManager.extractCV(puterData);
```

**After (New Modular):**
```javascript
// New endpoint
POST /api/puter/v2/extract-cv

// New service usage
const result = await puterModularService.extractCVFromPuterData(puterData, options);
```

#### Step 3: Enhanced Error Handling
**Before (Legacy):**
```javascript
try {
  const result = await puterServiceManager.extractCV(puterData);
  return result;
} catch (error) {
  console.error('Error:', error.message);
  throw error;
}
```

**After (New Modular):**
```javascript
try {
  const result = await puterModularService.extractCVFromPuterData(puterData, options);
  return result;
} catch (error) {
  // Enhanced error handling with recovery strategies
  const errorHandler = new PuterErrorHandler();
  const recoveryResult = await errorHandler.handleError(error, 'cv-extraction');
  
  if (recoveryResult.success) {
    return recoveryResult.data;
  }
  
  throw error;
}
```

#### Step 4: Performance Monitoring
**New Feature - Performance Tracking:**
```javascript
// Get enhanced metrics
const metrics = puterModularService.getEnhancedMetrics();

// Configure performance thresholds
puterModularService.configurePerformanceMonitoring({
  maxResponseTime: 30000,
  maxMemoryUsage: 1024 * 1024 * 1024,
  minSuccessRate: 0.95
});
```

### Phase 3: Full Migration (Long-term)

#### Complete Service Replacement
1. **Replace All Legacy Calls**
   ```javascript
   // Replace all instances of legacy services
   // Old: puterServiceManager, puterCVProcessingService, etc.
   // New: puterModularService
   ```

2. **Update Route Handlers**
   ```javascript
   // Update all route handlers to use v2 endpoints
   // Implement new error handling patterns
   // Add performance monitoring
   ```

3. **Remove Legacy Dependencies**
   ```javascript
   // Eventually remove legacy service imports
   // Keep only: puterModularService, engines, and utilities
   ```

## API Migration Reference

### CV Extraction
**Legacy:**
```javascript
POST /api/ai/puter/extract-cv
{
  "puterData": {...},
  "options": {...}
}
```

**New Modular:**
```javascript
POST /api/puter/v2/extract-cv
{
  "puterData": {...},
  "options": {...}
}
```

### CV Enhancement
**Legacy:**
```javascript
POST /api/ai/puter/enhance-cv
{
  "puterData": {...},
  "enhancements": {...}
}
```

**New Modular:**
```javascript
POST /api/puter/v2/enhance-cv
{
  "puterData": {...},
  "options": {
    "enhancement": {...}
  }
}
```

### CV Tailoring
**Legacy:**
```javascript
POST /api/ai/puter/tailor-cv
{
  "cvData": {...},
  "jobDescription": {...}
}
```

**New Modular:**
```javascript
POST /api/puter/v2/tailor-cv
{
  "cv": {...},
  "jobDescription": {...},
  "options": {...}
}
```

### Cover Letter Generation
**Legacy:**
```javascript
POST /api/ai/puter/generate-cover-letter
{
  "cvData": {...},
  "jobDescription": {...}
}
```

**New Modular:**
```javascript
POST /api/puter/v2/generate-cover-letter
{
  "cv": {...},
  "jobDescription": {...},
  "options": {...}
}
```

## New Features Available

### 1. Enhanced Authentication
- Brutal authentication with comprehensive validation
- Security threat detection
- Response integrity checks

### 2. Advanced Performance Monitoring
- Real-time metrics collection
- Performance threshold monitoring
- Health status reporting

### 3. Sophisticated Error Handling
- Error classification and categorization
- Recovery strategies (retry, fallback, graceful degradation)
- Circuit breaker pattern implementation

### 4. Modular Architecture
- Independent engine components
- Specialized tailoring engines
- Utility classes for common operations

### 5. Advanced Analytics
- Job analysis engine
- CV-job matching algorithms
- Confidence scoring

## Frontend Integration

### Update Frontend Service Calls
**Before:**
```javascript
// Legacy frontend service
const response = await fetch('/api/ai/puter/extract-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ puterData })
});
```

**After:**
```javascript
// New modular frontend service
const response = await fetch('/api/puter/v2/extract-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    puterData, 
    options: {
      language: 'en',
      format: 'json',
      strict: true
    }
  })
});
```

### Enhanced Response Handling
**New Response Format:**
```javascript
{
  "success": true,
  "operation": "extract-cv",
  "data": {
    "extracted": true,
    "confidence": 0.95,
    "cv": {...},
    "metadata": {...}
  },
  "metadata": {
    "processingTime": 1250,
    "engine": "request",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Testing Strategy

### Unit Tests
```javascript
// Test new modular services
const PuterModularService = require('./PuterModularService');

describe('PuterModularService Migration', () => {
  test('should maintain backward compatibility', async () => {
    const service = new PuterModularService();
    const result = await service.extractCVFromPuterData(legacyData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
```

### Integration Tests
```javascript
// Test API endpoint compatibility
describe('API Migration', () => {
  test('legacy endpoint still works', async () => {
    const response = await request(app)
      .post('/api/ai/puter/extract-cv')
      .send(testData);
    
    expect(response.status).toBe(200);
  });
  
  test('new modular endpoint works', async () => {
    const response = await request(app)
      .post('/api/puter/v2/extract-cv')
      .send(testData);
    
    expect(response.status).toBe(200);
    expect(response.body.metadata).toBeDefined();
  });
});
```

## Rollback Plan

### If Issues Occur
1. **Immediate Rollback**
   - Switch back to legacy endpoints
   - Use legacy service imports
   - Disable new modular routes

2. **Gradual Rollback**
   - Identify problematic endpoints
   - Roll back specific services
   - Maintain working functionality

3. **Configuration Rollback**
   ```javascript
   // Disable new features
   const service = new PuterModularService();
   service.updateConfig({
     enablePerformanceMonitoring: false,
     enableMetrics: false,
     brutalMode: false
   });
   ```

## Best Practices

### 1. Migration Checklist
- [ ] Test new endpoints in development
- [ ] Update error handling patterns
- [ ] Implement performance monitoring
- [ ] Update frontend service calls
- [ ] Add comprehensive testing
- [ ] Document changes

### 2. Performance Optimization
- Use performance monitoring to identify bottlenecks
- Configure appropriate thresholds
- Implement caching where appropriate
- Monitor memory usage

### 3. Error Handling
- Implement recovery strategies
- Use circuit breaker for critical failures
- Log errors with proper categorization
- Provide fallback data when possible

### 4. Monitoring
- Set up alerts for performance degradation
- Monitor success rates
- Track response times
- Review error statistics regularly

## Support and Troubleshooting

### Common Issues
1. **Import Errors**
   - Ensure correct import paths
   - Check service availability

2. **API Compatibility**
   - Verify endpoint paths
   - Check request format

3. **Performance Issues**
   - Review performance metrics
   - Adjust thresholds
   - Check memory usage

### Getting Help
- Check the comprehensive documentation
- Review error logs with classifications
- Use performance monitoring data
- Consult the integration guide

## Timeline Recommendations

### Week 1-2: Preparation
- Study new architecture
- Set up development environment
- Begin unit testing

### Week 3-4: Development Migration
- Migrate development endpoints
- Update service calls
- Implement error handling

### Week 5-6: Testing
- Comprehensive testing
- Performance validation
- User acceptance testing

### Week 7-8: Production Migration
- Gradual production rollout
- Monitor performance
- Address issues

### Week 9+: Optimization
- Performance tuning
- Feature enhancement
- Legacy cleanup

This migration strategy ensures smooth transition while maintaining system stability and providing access to enhanced features.
