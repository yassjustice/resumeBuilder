/**
 * AI Provider Management Routes
 * Handles provider selection, toggling, and status monitoring
 */
const express = require('express');
const router = express.Router();
const AIServiceManager = require('../services/ai/aiServiceManager');

/**
 * Get current AI provider status and available providers
 */
router.get('/provider/status', async (req, res) => {
  try {
    const aiManager = AIServiceManager.getInstance();
    const providerInfo = aiManager.getCurrentProviderInfo();
    
    res.json({
      success: true,
      currentProvider: providerInfo,
      availableModels: await getAvailableModels(),
      serviceStats: getServiceStatistics(aiManager)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get provider status',
      details: error.message
    });
  }
});

/**
 * Toggle between AI providers (if enabled)
 */
router.post('/provider/toggle', async (req, res) => {
  try {
    const aiManager = AIServiceManager.getInstance();
    const result = aiManager.toggleProvider();
    
    if (result) {
      const newProviderInfo = aiManager.getCurrentProviderInfo();
      res.json({
        success: true,
        message: `Successfully switched to ${newProviderInfo.provider}`,
        newProvider: newProviderInfo
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Provider toggle failed or is disabled'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle provider',
      details: error.message
    });
  }
});

/**
 * Set preferred AI provider
 */
router.post('/provider/set', async (req, res) => {
  try {
    const { provider } = req.body;
    
    if (!provider || !['gemini', 'huggingface'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider. Must be "gemini" or "huggingface"'
      });
    }
    
    const aiManager = AIServiceManager.getInstance();
    
    // Find available service with the requested provider
    const targetServices = aiManager.services.filter(s => 
      s.provider === provider && 
      aiManager.isServiceAvailable(s)
    );

    if (targetServices.length === 0) {
      return res.status(400).json({
        success: false,
        error: `No available ${provider} services found`
      });
    }

    // Switch to first available service of the target provider
    const targetServiceIndex = aiManager.services.findIndex(s => s.id === targetServices[0].id);
    aiManager.currentServiceIndex = targetServiceIndex;
    
    const newProviderInfo = aiManager.getCurrentProviderInfo();
    
    res.json({
      success: true,
      message: `Successfully switched to ${provider}`,
      newProvider: newProviderInfo
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to set provider',
      details: error.message
    });
  }
});

/**
 * Test AI provider connectivity
 */
router.post('/provider/test', async (req, res) => {
  try {
    const { provider } = req.body;
    const aiManager = AIServiceManager.getInstance();
    
    // If specific provider requested, test that; otherwise test current
    let testResult;
    if (provider) {
      // Find and test specific provider
      const targetService = aiManager.services.find(s => 
        s.provider === provider && 
        aiManager.isServiceAvailable(s)
      );
      
      if (!targetService) {
        return res.status(400).json({
          success: false,
          error: `No available ${provider} services to test`
        });
      }
      
      testResult = await testSpecificService(targetService);
    } else {
      // Test current service
      testResult = await aiManager.generateContent("Hello, test connectivity", false);
    }
    
    res.json({
      success: true,
      message: 'AI provider connectivity test successful',
      testResult: testResult
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'AI provider connectivity test failed',
      details: error.message
    });
  }
});

/**
 * Get comprehensive AI service statistics
 */
router.get('/statistics', (req, res) => {
  try {
    const aiManager = AIServiceManager.getInstance();
    const stats = getServiceStatistics(aiManager);
    
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get service statistics',
      details: error.message
    });
  }
});

/**
 * Helper function to get available models info
 */
async function getAvailableModels() {
  const models = {
    gemini: {
      primary: 'gemini-1.5-flash-latest',
      fallbacks: ['gemini-1.5-flash', 'gemini-1.5-pro-latest'],
      features: ['Text generation', 'Vision OCR', 'JSON parsing'],
      tier: 'Free (50 requests/day per key)'
    },
    huggingface: {
      primary: 'mistralai/Mistral-7B-Instruct-v0.1',
      fallbacks: [
        'microsoft/DialoGPT-medium',
        'google/flan-t5-large',
        'meta-llama/Llama-2-7b-chat-hf'
      ],
      features: ['Text generation', 'Instruction following', 'Chat completion'],
      tier: 'Free (1000 requests/day)'
    }
  };
  
  return models;
}

/**
 * Helper function to get service statistics
 */
function getServiceStatistics(aiManager) {
  const services = aiManager.services;
  
  const stats = {
    totalServices: services.length,
    providerBreakdown: {},
    currentService: aiManager.getCurrentProviderInfo(),
    quotaStatus: {},
    performance: {
      totalRequestsToday: 0,
      averageResponseTime: 'N/A',
      successRate: 'N/A'
    }
  };
  
  // Provider breakdown
  services.forEach(service => {
    if (!stats.providerBreakdown[service.provider]) {
      stats.providerBreakdown[service.provider] = 0;
    }
    stats.providerBreakdown[service.provider]++;
  });
  
  // Quota status by provider
  ['gemini', 'huggingface'].forEach(provider => {
    const providerServices = services.filter(s => s.provider === provider);
    if (providerServices.length > 0) {
      const totalDaily = providerServices.reduce((sum, s) => sum + s.dailyRequestCount, 0);
      const totalDailyLimit = providerServices.reduce((sum, s) => sum + s.maxRequestsPerDay, 0);
      const availableServices = providerServices.filter(s => aiManager.isServiceAvailable(s)).length;
      
      stats.quotaStatus[provider] = {
        dailyUsage: `${totalDaily}/${totalDailyLimit}`,
        availableServices: `${availableServices}/${providerServices.length}`,
        status: availableServices > 0 ? 'Available' : 'Exhausted'
      };
    }
  });
  
  // Calculate total requests today
  stats.performance.totalRequestsToday = services.reduce((sum, s) => sum + s.dailyRequestCount, 0);
  
  return stats;
}

/**
 * Test specific service connectivity
 */
async function testSpecificService(service) {
  try {
    const testPrompt = "Respond with 'OK' if you can process this message.";
    
    if (service.provider === 'gemini') {
      const result = await service.modelInstance.generateContent(testPrompt);
      const response = await result.response;
      return {
        provider: service.provider,
        model: service.model,
        response: response.text(),
        latency: 'N/A'
      };
    } else if (service.provider === 'huggingface') {
      const startTime = Date.now();
      const response = await service.modelInstance.textGeneration({
        model: service.model,
        inputs: testPrompt,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.1
        }
      });
      const latency = Date.now() - startTime;
      
      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (response.generated_text) {
        responseText = response.generated_text;
      }
      
      return {
        provider: service.provider,
        model: service.model,
        response: responseText,
        latency: `${latency}ms`
      };
    }
    
    throw new Error(`Unsupported provider: ${service.provider}`);
    
  } catch (error) {
    throw new Error(`Service test failed: ${error.message}`);
  }
}

module.exports = router;
