/**
 * File Upload Middleware - Handle media uploads for chat
 * Supports: images (jpg, png, gif, webp)
 * Max size: 5MB (configurable via config.maxFileSize)
 */

import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import config from '../config/index.js';

// Configure Cloudinary if credentials available
if (config.cloudinary?.cloud_name) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
  });
}

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp'
];

// File filter for validation
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Storage configuration
let storage;

if (config.cloudinary?.cloud_name) {
  // Use Cloudinary storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'dating-app/messages',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
  });
} else {
  // Use local storage (fallback)
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(config.uploadPath, 'messages'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `msg-${uniqueSuffix}${ext}`);
    }
  });
}

// Multer upload configuration
export const uploadMessageMedia = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter
});

// Upload single image
export const uploadSingleImage = uploadMessageMedia.single('image');

// Error handler middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

export default { uploadMessageMedia, uploadSingleImage, handleUploadError };