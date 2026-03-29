export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please provide a valid email';
  return null;
};

export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username cannot exceed 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateOTP = (otp) => {
  if (!otp || typeof otp !== 'string') return 'OTP is required';
  if (!/^\d{6}$/.test(otp)) return 'OTP must be 6 digits';
  return null;
};

export const validateGender = (gender) => {
  const validGenders = ['male', 'female', 'other', ''];
  if (gender && !validGenders.includes(gender)) return 'Invalid gender value';
  return null;
};

export default {
  validateEmail,
  validateUsername,
  validatePassword,
  validateOTP,
  validateGender
};
