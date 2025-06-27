/**
 * File Processing Service - Handles file uploads and text extraction
 * Supports PDF, DOCX, TXT, and image files with OCR
 */
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const AIService = require('./aiService');

class FileProcessingService {
  constructor() {
    this.aiService = new AIService();
    this.setupMulter();
  }

  /**
   * Configure multer for file uploads
   */
  setupMulter() {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/jpg', 
          'image/png'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and image files are allowed.'));
        }
      }
    });
  }

  /**
   * Get multer upload middleware
   */
  getUploadMiddleware() {
    return this.upload.single('file');
  }

  /**
   * Process uploaded file and extract text
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} - Result with extracted text
   */
  async processFile(file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    console.log('✅ File uploaded successfully:', file.filename);
    const filePath = file.path;
    let extractedText = '';

    try {
      // Extract text based on file type
      if (file.mimetype === 'application/pdf') {
        extractedText = await this.processPDF(filePath);
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await this.processDOCX(filePath);
      } else if (file.mimetype === 'text/plain') {
        extractedText = await this.processTXT(filePath);
      } else if (file.mimetype.startsWith('image/')) {
        extractedText = await this.processImage(filePath, file.mimetype);
      }

      console.log('📝 Extracted text length:', extractedText.length);

      // Clean up uploaded file
      await fs.unlink(filePath);

      return {
        success: true,
        fileId: file.filename,
        extractedText: extractedText,
        message: 'File processed successfully'
      };

    } catch (error) {
      // Clean up file if it exists
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
      throw error;
    }
  }

  /**
   * Process PDF file
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} - Extracted text
   */
  async processPDF(filePath) {
    console.log('📄 Processing PDF file...');
    const dataBuffer = await fs.readFile(filePath);
    
    try {
      // First try to extract text using pdf-parse (for text-based PDFs)
      const pdfData = await pdfParse(dataBuffer);
      let extractedText = pdfData.text;
      
      // If no text extracted (likely image-based PDF), use Gemini Vision
      if (!extractedText || extractedText.trim().length < 50) {
        console.log('📸 PDF appears to be image-based, using Gemini Vision OCR...');
        extractedText = await this.aiService.extractTextFromImagePDF(dataBuffer);
      }
      
      return extractedText;
    } catch (pdfParseError) {
      console.log('⚠️ PDF parsing failed, trying Gemini Vision OCR...');
      return await this.aiService.extractTextFromImagePDF(dataBuffer);
    }
  }

  /**
   * Process DOCX file
   * @param {string} filePath - Path to DOCX file
   * @returns {Promise<string>} - Extracted text
   */
  async processDOCX(filePath) {
    console.log('📄 Processing DOCX file...');
    const dataBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  }

  /**
   * Process TXT file
   * @param {string} filePath - Path to TXT file
   * @returns {Promise<string>} - Extracted text
   */
  async processTXT(filePath) {
    console.log('📄 Processing TXT file...');
    return await fs.readFile(filePath, 'utf8');
  }

  /**
   * Process image file
   * @param {string} filePath - Path to image file
   * @param {string} mimeType - Image MIME type
   * @returns {Promise<string>} - Extracted text
   */
  async processImage(filePath, mimeType) {
    console.log('📸 Processing image file with Gemini Vision OCR...');
    const dataBuffer = await fs.readFile(filePath);
    return await this.aiService.extractTextFromImage(dataBuffer, mimeType);
  }
}

module.exports = FileProcessingService;
