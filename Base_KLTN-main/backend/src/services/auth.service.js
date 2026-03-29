/**
 * Auth Service - Tách business logic khỏi controller
 */

import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
import { generateOTP, getOTPExpiry } from '../utils/generateOTP.js';
import { sendOTP } from '../utils/sendEmail.js';
import { validateUsername, validateEmail, validatePassword } from '../utils/validators.js';

export const registerUser = async ({ username, email, password, confirmPassword }) => {
  const trimmedUsername = username?.trim() || '';
  const trimmedEmail = email?.trim() || '';
  const trimmedPassword = password?.trim() || '';

  const usernameError = validateUsername(trimmedUsername);
  if (usernameError) return { error: usernameError, status: 400 };

  const emailError = validateEmail(trimmedEmail);
  if (emailError) return { error: emailError, status: 400 };

  const passwordError = validatePassword(trimmedPassword);
  if (passwordError) return { error: passwordError, status: 400 };

  if (trimmedPassword !== (confirmPassword || '').trim()) {
    return { error: 'Passwords do not match', status: 400 };
  }

  const existingUser = await User.findOne({
    $or: [
      { email: trimmedEmail.toLowerCase() },
      { username: trimmedUsername }
    ]
  });

  if (existingUser) {
    if (existingUser.email === trimmedEmail.toLowerCase()) {
      return { error: 'Email already registered', status: 400 };
    }
    return { error: 'Username already taken', status: 400 };
  }

  const passwordHash = await hashPassword(trimmedPassword);

  const user = await User.create({
    username: trimmedUsername,
    email: trimmedEmail.toLowerCase(),
    passwordHash,
    loginMethod: 'email',
    isEmailVerified: false,
    profileCompletion: 0
  });

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: '',
      age: null,
      gender: '',
      avatar: null,
      bio: '',
      location: '',
      interests: [],
      photos: [],
      profileCompletion: 0
    },
    token,
    profileCompletion: 0,
    needsOnboarding: true
  };
};

export const loginUser = async ({ email, password, username, facebookId, googleId }) => {
  let user;

  if (email || username) {
    user = await User.findOne({
      $or: [
        { email: (email || username).toLowerCase() },
        { username: email || username }
      ]
    }).select('+password +passwordHash');

    if (!user) return { error: 'Invalid credentials', status: 401 };

    const isMatch = await comparePassword(password, user.passwordHash || user.password);
    if (!isMatch) return { error: 'Invalid credentials', status: 401 };
  } else if (facebookId) {
    user = await User.findOne({ facebookId });
    if (!user) return { error: 'Facebook account not linked', status: 401 };
  } else if (googleId) {
    user = await User.findOne({ googleId });
    if (!user) return { error: 'Google account not linked', status: 401 };
  } else {
    return { error: 'Please provide credentials', status: 400 };
  }

  if (user.isLocked) {
    return { error: 'Account is locked. Please try again later.', status: 423 };
  }

  user.lastLogin = new Date();
  user.isOnline = true;
  user.failedAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  return { user: user.toJSON(), token };
};

export const getCurrentUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { error: 'User not found', status: 404 };
  return { user };
};

export const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.isOnline = false;
    await user.save({ validateBeforeSave: false });
  }
  return { success: true };
};

const generateSafeUsername = async (displayName, provider) => {
  const MAX_LENGTH = 30;
  const RANDOM_SUFFIX_LENGTH = 3;

  let baseUsername = (displayName || 'user')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  const maxBaseLength = MAX_LENGTH - RANDOM_SUFFIX_LENGTH - 1;
  if (baseUsername.length > maxBaseLength) {
    baseUsername = baseUsername.substring(0, maxBaseLength);
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSuffix = Math.random().toString(36).substring(2, 2 + RANDOM_SUFFIX_LENGTH);
    const candidateUsername = `${baseUsername}_${randomSuffix}`;
    const existingUser = await User.findOne({ username: candidateUsername });
    if (!existingUser) return candidateUsername;
  }

  const timestampSuffix = Date.now().toString().slice(-5);
  return baseUsername.substring(0, MAX_LENGTH - 6) + '_' + timestampSuffix;
};

const linkSocialAccount = async (user, profile, provider, photos) => {
  if (provider === 'google') user.googleId = profile.id;
  else if (provider === 'facebook') user.facebookId = profile.id;

  user.loginMethod = provider;
  user.isEmailVerified = true;
  if (photos?.[0]?.value && !user.avatar) user.avatar = photos[0].value;
  user.lastLogin = new Date();
  user.isOnline = true;
  await user.save({ validateBeforeSave: false });
  return user;
};

export const socialLogin = async ({ facebookId, googleId, email, username, fullName, avatar }) => {
  let user;
  let provider = facebookId ? 'facebook' : 'google';
  let profileId = facebookId || googleId;

  user = await User.findOne({ [provider === 'google' ? 'googleId' : 'facebookId']: profileId });

  if (!user && email) {
    const existingByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingByEmail) {
      if (provider === 'google') existingByEmail.googleId = googleId;
      else existingByEmail.facebookId = facebookId;
      existingByEmail.loginMethod = provider;
      existingByEmail.isEmailVerified = true;
      if (avatar && !existingByEmail.avatar) existingByEmail.avatar = avatar;
      existingByEmail.lastLogin = new Date();
      existingByEmail.isOnline = true;
      await existingByEmail.save({ validateBeforeSave: false });
      user = existingByEmail;
    }
  }

  if (!user) {
    const safeUsername = username || await generateSafeUsername(fullName || email || profileId, provider);
    user = await User.create({
      [provider === 'google' ? 'googleId' : 'facebookId']: profileId,
      email: email?.toLowerCase(),
      username: safeUsername,
      fullName: fullName || '',
      avatar: avatar || '',
      loginMethod: provider,
      isEmailVerified: true,
      passwordHash: 'SOCIAL_LOGIN_' + Date.now()
    });
  }

  user.lastLogin = new Date();
  user.isOnline = true;
  user.failedAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  return { user: user.toJSON(), token };
};

export const linkSocialAccountToUser = async (userId, { facebookId, googleId }) => {
  const user = await User.findById(userId);
  if (!user) return { error: 'User not found', status: 404 };

  const provider = facebookId ? 'facebook' : 'google';
  const field = facebookId ? 'facebookId' : 'googleId';
  const idValue = facebookId || googleId;

  const existingUser = await User.findOne({ [field]: idValue });
  if (existingUser && existingUser._id.toString() !== user._id.toString()) {
    return { error: `${provider} account already linked to another user`, status: 400 };
  }

  if (provider === 'google') user.googleId = googleId;
  else user.facebookId = facebookId;
  user.loginMethod = provider;
  await user.save();

  return { user: user.toJSON() };
};

export const requestPasswordReset = async ({ email }) => {
  const trimmedEmail = email?.trim()?.toLowerCase();
  if (!trimmedEmail) return { error: 'Email is required', status: 400 };

  const user = await User.findOne({ email: trimmedEmail });
  if (!user) {
    return { message: 'If your email is registered, you will receive an OTP code' };
  }

  if (user.loginMethod === 'facebook' || user.loginMethod === 'google') {
    return {
      error: `This account uses ${user.loginMethod} login. Please use ${user.loginMethod} to sign in.`,
      status: 400
    };
  }

  const otp = generateOTP();
  const otpExpire = getOTPExpiry();

  user.resetOTP = otp;
  user.resetOtpExpire = otpExpire;
  await user.save({ validateBeforeSave: false });

  await sendOTP(trimmedEmail, otp);

  return { message: 'If your email is registered, you will receive an OTP code' };
};

export const verifyPasswordResetOTP = async ({ email, otp }) => {
  const trimmedEmail = email?.trim()?.toLowerCase();
  const trimmedOTP = otp?.trim();

  if (!trimmedEmail || !trimmedOTP) {
    return { error: 'Email and OTP are required', status: 400 };
  }

  const user = await User.findOne({ email: trimmedEmail });
  if (!user) return { error: 'Invalid email or OTP', status: 400 };

  if (!user.resetOTP || !user.resetOtpExpire) {
    return { error: 'No OTP requested. Please request a new OTP.', status: 400 };
  }

  if (new Date() > new Date(user.resetOtpExpire)) {
    return { error: 'OTP has expired. Please request a new OTP.', status: 400 };
  }

  if (user.resetOTP !== trimmedOTP) {
    return { error: 'Invalid OTP. Please try again.', status: 400 };
  }

  return { message: 'OTP verified successfully' };
};

export const resetUserPassword = async ({ email, otp, newPassword }) => {
  const trimmedEmail = email?.trim()?.toLowerCase();
  const trimmedOTP = otp?.trim();
  const trimmedPassword = newPassword?.trim();

  if (!trimmedEmail || !trimmedOTP || !trimmedPassword) {
    return { error: 'Email, OTP, and new password are required', status: 400 };
  }

  if (trimmedPassword.length < 6) {
    return { error: 'Password must be at least 6 characters', status: 400 };
  }

  const user = await User.findOne({ email: trimmedEmail }).select('+password +passwordHash');
  if (!user) return { error: 'Invalid email or OTP', status: 400 };

  if (!user.resetOTP || !user.resetOtpExpire) {
    return { error: 'No OTP requested. Please request a new OTP.', status: 400 };
  }

  if (new Date() > new Date(user.resetOtpExpire)) {
    return { error: 'OTP has expired. Please request a new OTP.', status: 400 };
  }

  if (user.resetOTP !== trimmedOTP) {
    return { error: 'Invalid OTP. Please try again.', status: 400 };
  }

  user.passwordHash = await hashPassword(trimmedPassword);
  user.resetOTP = undefined;
  user.resetOtpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  return { message: 'Password has been reset successfully. You can now login with your new password.' };
};

export default {
  registerUser,
  loginUser,
  getCurrentUserById,
  logoutUser,
  socialLogin,
  linkSocialAccountToUser,
  requestPasswordReset,
  verifyPasswordResetOTP,
  resetUserPassword
};
