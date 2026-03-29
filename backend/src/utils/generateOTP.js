import config from '../config/index.js';

const OTP_LENGTH = 6;
const OTP_EXPIRE_MS = 5 * 60 * 1000; // 5 minutes

export const generateOTP = () => {
  if (config.nodeEnv === 'development') {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRE_MS);
};

export const isOTPExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

export default { generateOTP, getOTPExpiry, isOTPExpired };
