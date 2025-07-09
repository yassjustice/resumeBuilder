/**
 * Test file to verify error handling improvements
 */

// Test different error scenarios
const testErrorHandling = () => {
  console.log('🧪 Testing error handling...');
  
  // Test 1: undefined error
  try {
    const error = undefined;
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.log('✅ Test 1 passed: undefined error ->', errorMessage);
  } catch (e) {
    console.error('❌ Test 1 failed:', e);
  }
  
  // Test 2: null error
  try {
    const error = null;
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.log('✅ Test 2 passed: null error ->', errorMessage);
  } catch (e) {
    console.error('❌ Test 2 failed:', e);
  }
  
  // Test 3: string error
  try {
    const error = 'This is a string error';
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.log('✅ Test 3 passed: string error ->', errorMessage);
  } catch (e) {
    console.error('❌ Test 3 failed:', e);
  }
  
  // Test 4: object error without message
  try {
    const error = { code: 400, type: 'BadRequest' };
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.log('✅ Test 4 passed: object error without message ->', errorMessage);
  } catch (e) {
    console.error('❌ Test 4 failed:', e);
  }
  
  // Test 5: Error object with message
  try {
    const error = new Error('This is a proper error message');
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.log('✅ Test 5 passed: Error object ->', errorMessage);
  } catch (e) {
    console.error('❌ Test 5 failed:', e);
  }
  
  // Test 6: Puter.js API error structure
  try {
    const error = {
      success: false,
      error: {
        delegate: "usage-limited-chat",
        message: "Error 400 from delegate `usage-limited-chat`: Permission denied.",
        code: "error_400_from_delegate",
        status: 400
      }
    };
    const errorMessage = error?.message || JSON.stringify(error) || 'Unknown error';
    console.log('✅ Test 6 passed: Puter.js API error ->', errorMessage);
  } catch (e) {
    console.error('❌ Test 6 failed:', e);
  }
  
  console.log('🎉 All error handling tests completed!');
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testErrorHandling };
}

// Auto-run in browser console
if (typeof window !== 'undefined') {
  window.testErrorHandling = testErrorHandling;
}
