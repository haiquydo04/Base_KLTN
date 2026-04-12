import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// ===========================================
// FRONTEND URLS - Hỗ trợ nhiều origins
// ===========================================
const getAllowedOrigins = () => {
  const origins = [];

  // Development origins
  if (!isProduction) {
    origins.push('http://localhost:5173');
    origins.push('http://127.0.0.1:5173');
  }

  // Production origins - thêm tất cả frontend domains của bạn
  if (process.env.ALLOWED_ORIGINS) {
    origins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
  }

  // Fallback
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  return origins;
};

const ALLOWED_ORIGINS = getAllowedOrigins();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ===========================================
// COOKIE CONFIG - Tự động secure khi production
// ===========================================
const getCookieConfig = () => ({
  name: 'dating-session',
  keys: [process.env.JWT_SECRET || 'dev-secret-key'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: isProduction,          // Chỉ bật secure khi production (HTTPS)
  sameSite: isProduction ? 'none' : 'lax', // 'none' cần secure=true, 'lax' cho dev
  httpOnly: true,
  domain: isProduction ? undefined : undefined // Để mặc định cho local
});

export default {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,

  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // URLs
  frontendUrl: FRONTEND_URL,
  allowedOrigins: ALLOWED_ORIGINS,

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
  uploadPath: process.env.UPLOAD_PATH || './uploads',

  // Cookie
  cookie: getCookieConfig(),

  // Google OAuth
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    profileFields: ['id', 'displayName', 'emails', 'photos']
  },

  // Facebook OAuth
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails', 'photos']
  },

  // Cloudinary
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  }
};
