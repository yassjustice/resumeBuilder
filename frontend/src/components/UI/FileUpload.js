import React from 'react';
import { motion } from 'framer-motion';

const FileUpload = ({ 
  onFileSelect, 
  acceptedTypes = '.pdf,.docx,.txt',
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  children,
  className = ''
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(fileType)) {
      alert('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      {children || (
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 cursor-pointer'
          }`}
        >
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Click to upload file
          </p>
          <p className="text-sm text-gray-600">
            Supports PDF, DOCX, and TXT files (max {Math.round(maxSize / (1024 * 1024))}MB)
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
