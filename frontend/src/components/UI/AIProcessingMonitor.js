import React from 'react';
import { motion } from 'framer-motion';

const AIProcessingMonitor = ({ isProcessing, currentStep, completedSteps }) => {
  const steps = [
    { id: 'analysis', title: 'Job Analysis', icon: '🔍', description: 'Analyzing job requirements' },
    { id: 'comparison', title: 'CV Analysis', icon: '📊', description: 'Comparing CV with job needs' },
    { id: 'optimization', title: 'Optimization', icon: '🎯', description: 'Optimizing CV sections' },
    { id: 'generation', title: 'Generation', icon: '✨', description: 'Generating final documents' }
  ];

  if (!isProcessing && (!completedSteps || completedSteps.length === 0)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-blue-900 font-semibold text-lg">AI Processing in Progress</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps?.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0.5 }}
              animate={{ 
                opacity: isCompleted ? 1 : isCurrent ? 0.8 : 0.5,
                scale: isCurrent ? 1.05 : 1
              }}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-100 border-green-300' 
                  : isCurrent 
                    ? 'bg-blue-100 border-blue-300 shadow-md' 
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-center">
                <div className={`text-2xl mb-2 ${isCurrent ? 'animate-pulse' : ''}`}>
                  {isCompleted ? '✅' : step.icon}
                </div>
                <h4 className={`font-medium mb-1 ${
                  isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-xs ${
                  isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {isCompleted ? 'Completed' : isCurrent ? step.description : 'Pending'}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(completedSteps?.length || 0) * 25}%` 
            }}
          ></div>
        </div>
        
        <div className="text-sm text-blue-700">
          <p className="font-medium">
            {completedSteps?.length || 0} of {steps.length} steps completed
          </p>
          <p className="text-xs text-blue-600 mt-1">
            ⏳ AI processing may take 30-60 seconds due to rate limiting
          </p>
          <p className="text-xs text-blue-500">
            ✨ Our AI is carefully analyzing every detail for optimal results
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AIProcessingMonitor;
