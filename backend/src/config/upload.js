import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import config from './index.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary?.cloud_name || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: config.cloudinary?.api_key || process.env.CLOUDINARY_API_KEY,
  api_secret: config.cloudinary?.api_secret || process.env.CLOUDINARY_API_SECRET
});

// Export for use elsewhere
export { cloudinary };

// Cloudinary storage for multer
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dating-app/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => {
      return `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
  }
});

export const uploadCloudinary = multer({ 
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Fallback: local storage if Cloudinary not configured
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'), false);
};

export const uploadLocal = multer({
  storage: localStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const upload = (() => {
  const hasCloudinary = config.cloudinary?.cloud_name && config.cloudinary?.api_key;
  return hasCloudinary ? uploadCloudinary : uploadLocal;
})();

export default { cloudinary, upload, uploadCloudinary, uploadLocal };
