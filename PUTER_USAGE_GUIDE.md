# 🎯 Puter AI Service - Enhanced Usage Guide

## 🚀 Quick Start

The service is now enhanced with Technical Report optimizations and should handle the usage limit issues more intelligently.

## 🔧 Console Commands Available

Open your browser console and use these commands:

### 🧪 **Quick Fix for Usage Limits**
```javascript
// Enable test mode (doesn't count against quota)
window.puterAIService.setTestMode(true)

// Get quota guidance
window.puterAIService.getQuotaGuidance()
```

### 🔐 **Authentication Commands**
```javascript
// Debug authentication status
window.puterAIService.debugAuth()

// Manual sign-in
window.puterAIService.signIn()

// Check account access level
window.puterAIService.checkAccountStatus()

// Get personalized guidance
window.puterAIService.getUserGuidance()
```

### 🧪 **Testing Commands**
```javascript
// Test AI connection
window.puterAIService.testConnection()

// Test all models
window.puterAIService.testModels()

// Get quota solutions
window.puterAIService.getQuotaGuidance()
```

### ⚙️ **Configuration Commands**
```javascript
// List valid models
window.puterAIService.getValidModels()

// Refresh model list
window.puterAIService.updateValidModels()

// Get service status
window.puterAIService.getStatus()
```

## 🎯 Error Resolution

### Usage Limit Error
**Symptoms:** `Error 400 from delegate 'usage-limited-chat': Permission denied`

**Solutions:**
1. **Enable Test Mode** (Recommended for development):
   ```javascript
   window.puterAIService.setTestMode(true)
   ```

2. **Check Account Status:**
   ```javascript
   window.puterAIService.checkAccountStatus()
   ```

3. **Get Guidance:**
   ```javascript
   window.puterAIService.getQuotaGuidance()
   ```

### Invalid Model Error
**Symptoms:** `Field 'model' is invalid`

**Solutions:**
1. **Update Models:**
   ```javascript
   window.puterAIService.updateValidModels()
   ```

2. **Check Valid Models:**
   ```javascript
   window.puterAIService.getValidModels()
   ```

### Authentication Error
**Symptoms:** `Not authenticated` or `Permission denied`

**Solutions:**
1. **Manual Sign-in:**
   ```javascript
   window.puterAIService.signIn()
   ```

2. **Debug Authentication:**
   ```javascript
   window.puterAIService.debugAuth()
   ```

## 🔄 Current Status

Based on the logs, your service is:
- ✅ **Initialized properly**
- ✅ **Authentication working** (SunBirdHack user)
- ✅ **6 valid models loaded**
- ✅ **Enhanced error handling active**

## 🧪 Test Mode Benefits

When you enable test mode:
- ✅ **No quota consumption** - calls don't count against your limits
- ✅ **Simulated responses** - perfect for development
- ✅ **Same API interface** - seamless integration
- ✅ **Instant activation** - no restart required

## 💡 Recommendations

1. **For Development:** Always use test mode
   ```javascript
   window.puterAIService.setTestMode(true)
   ```

2. **For Production:** Use sparingly and consider upgrading
   ```javascript
   window.puterAIService.setTestMode(false)
   ```

3. **Monitor Usage:** Check account status regularly
   ```javascript
   window.puterAIService.checkAccountStatus()
   ```

## 🚨 Emergency Fallback

If all else fails, the system will automatically fall back to the backend extraction service, so users won't be completely blocked.

---

**✨ Enhanced with Technical Report optimizations**
**🎯 Ready for production use with intelligent quota management**
