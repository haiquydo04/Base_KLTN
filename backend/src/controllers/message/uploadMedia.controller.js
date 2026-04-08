/**
 * Upload Media Controller - Handle image uploads for chat messages
 */

import path from 'path';
import fs from 'fs';
import config from '../../config/index.js';

// Ensure upload directory exists
const ensureUploadDir = () => {
  const uploadDir = path.join(config.uploadPath, 'messages');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

export const uploadMessageImage = async (req, res, next) => {
  try {
    ensureUploadDir();
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Build URL based on storage type
    let mediaUrl;
    
    if (req.file.path.startsWith('http')) {
      // Cloudinary returns full URL
      mediaUrl = req.file.path;
    } else {
      // Local storage - build URL
      mediaUrl = `/uploads/messages/${req.file.filename}`;
    }

    return res.json({
      success: true,
      mediaUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    next(error);
  }
};

export default { uploadMessageImage };