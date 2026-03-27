/**
 * Auth Controller - Cập nhật cho schema mới
 * Hỗ trợ: email, facebook, google login
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

/**
 * Generate a safe username from displayName
 * - Remove spaces
 * - Convert to lowercase
 * - Remove special characters (keep only alphanumeric)
 * - Limit to 30 characters max
 * - Append random number if needed to ensure uniqueness
 */
const generateSafeUsername = async (displayName, provider) => {
  const MAX_LENGTH = 30;
  const RANDOM_SUFFIX_LENGTH = 3;
  
  // Generate base username from displayName
  let baseUsername = (displayName || 'user')
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
  
  // Truncate if too long to make room for random suffix
  const maxBaseLength = MAX_LENGTH - RANDOM_SUFFIX_LENGTH - 1; // -1 for the underscore
  if (baseUsername.length > maxBaseLength) {
    baseUsername = baseUsername.substring(0, maxBaseLength);
  }
  
  // Generate unique username with random suffix
  const generateWithSuffix = (base, suffix) => {
    return `${base}_${suffix}`;
  };
  
  // Try to find a unique username (max 10 attempts)
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSuffix = Math.random().toString(36).substring(2, 2 + RANDOM_SUFFIX_LENGTH);
    const candidateUsername = generateWithSuffix(baseUsername, randomSuffix);
    
    // Check if username exists
    const existingUser = await User.findOne({ username: candidateUsername });
    if (!existingUser) {
      return candidateUsername;
    }
  }
  
  // Fallback: use timestamp-based suffix (still within limits)
  const timestampSuffix = Date.now().toString().slice(-5);
  const fallbackUsername = baseUsername.substring(0, MAX_LENGTH - 6) + '_' + timestampSuffix;
  return fallbackUsername;
};

// ============== VALIDATION HELPERS ==============

const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 30) {
    return 'Username cannot exceed 30 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please provide a valid email';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

const validateGender = (gender) => {
  const validGenders = ['male', 'female', 'other', ''];
  if (gender && !validGenders.includes(gender)) {
    return 'Invalid gender value';
  }
  return null;
};

// ============== QUICK REGISTER (4 FIELDS ONLY) ==============

export const register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    console.log('=== REGISTER DEBUG ===');
    console.log('req.body:', req.body);
    console.log('username:', username);
    console.log('email:', email);
    console.log('password:', password);
    console.log('confirmPassword:', confirmPassword);

    // ========== REQUIRED VALIDATION (4 FIELDS) ==========
    
    // Trim all string fields to avoid whitespace issues
    const trimmedUsername = username?.trim() || '';
    const trimmedEmail = email?.trim() || '';
    const trimmedPassword = password?.trim() || '';
    const trimmedConfirmPassword = confirmPassword?.trim() || '';

    // Username validation (REQUIRED)
    const usernameError = validateUsername(trimmedUsername);
    if (usernameError) {
      return res.status(400).json({
        success: false,
        message: usernameError
      });
    }

    // Email validation (REQUIRED)
    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      return res.status(400).json({
        success: false,
        message: emailError
      });
    }

    // Password validation (REQUIRED)
    const passwordError = validatePassword(trimmedPassword);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError
      });
    }

    // Confirm password validation (REQUIRED)
    if (trimmedPassword !== trimmedConfirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // ========== CHECK DUPLICATES ==========
    
    const existingUser = await User.findOne({
      $or: [
        { email: trimmedEmail.toLowerCase() },
        { username: trimmedUsername }
      ]
    });

    if (existingUser) {
      if (existingUser.email === trimmedEmail.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // ========== HASH PASSWORD ==========
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(trimmedPassword, salt);

    // ========== CREATE USER (MINIMAL INFO) ==========
    const userData = {
      username: trimmedUsername,
      email: trimmedEmail.toLowerCase(),
      passwordHash,
      // Các fields khác sẽ được bổ sung ở Onboarding
      loginMethod: 'email',
      isEmailVerified: false,
      profileCompletion: 0
    };

    const user = await User.create(userData);

    // ========== GENERATE TOKEN ==========
    const token = generateToken(user._id);

    // ========== RESPONSE ==========
    const userResponse = {
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
    };

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: userResponse,
      profileCompletion: 0,
      needsOnboarding: true
    });

  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, username, facebookId, googleId } = req.body;
    const bcrypt = await import('bcryptjs');

    let user;

    // Login bằng email hoặc username
    if (email || username) {
      user = await User.findOne({
        $or: [
          { email: (email || username).toLowerCase() },
          { username: email || username }
        ]
      }).select('+password +passwordHash');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Kiểm tra password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }
    // Login bằng Facebook
    else if (facebookId) {
      user = await User.findOne({ facebookId });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Facebook account not linked'
        });
      }
    }
    // Login bằng Google
    else if (googleId) {
      user = await User.findOne({ googleId });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Google account not linked'
        });
      }
    }
    else {
      return res.status(400).json({
        success: false,
        message: 'Please provide credentials'
      });
    }

    // Kiểm tra account locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked. Please try again later.'
      });
    }

    // Cập nhật lastLogin và isOnline
    user.lastLogin = new Date();
    user.isOnline = true;
    user.failedAttempts = 0;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Social login - Facebook
export const facebookLogin = async (req, res, next) => {
  try {
    const { facebookId, email, username, fullName, avatar } = req.body;

    if (!facebookId) {
      return res.status(400).json({
        success: false,
        message: 'Facebook ID is required'
      });
    }

    let user = await User.findOne({ facebookId });

    if (!user) {
      // Check if email already exists
      if (email) {
        const existingByEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingByEmail) {
          existingByEmail.facebookId = facebookId;
          existingByEmail.loginMethod = 'facebook';
          existingByEmail.isEmailVerified = true;
          if (avatar && !existingByEmail.avatar) {
            existingByEmail.avatar = avatar;
          }
          existingByEmail.lastLogin = new Date();
          existingByEmail.isOnline = true;
          await existingByEmail.save({ validateBeforeSave: false });
          user = existingByEmail;
        }
      }

      // Create new user only if not found by email
      if (!user) {
        const safeUsername = username || await generateSafeUsername(fullName || email || facebookId, 'facebook');
        
        user = await User.create({
          facebookId,
          email: email?.toLowerCase(),
          username: safeUsername,
          fullName: fullName || '',
          avatar: avatar || '',
          loginMethod: 'facebook',
          isEmailVerified: true,
          passwordHash: 'SOCIAL_LOGIN_' + Date.now()
        });
      }
    }

    user.lastLogin = new Date();
    user.isOnline = true;
    user.failedAttempts = 0;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    next(error);
  }
};

// Social login - Google
export const googleLogin = async (req, res, next) => {
  try {
    const { googleId, email, username, fullName, avatar } = req.body;

    if (!googleId) {
      return res.status(400).json({
        success: false,
        message: 'Google ID is required'
      });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if email already exists
      if (email) {
        const existingByEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingByEmail) {
          existingByEmail.googleId = googleId;
          existingByEmail.loginMethod = 'google';
          existingByEmail.isEmailVerified = true;
          if (avatar && !existingByEmail.avatar) {
            existingByEmail.avatar = avatar;
          }
          existingByEmail.lastLogin = new Date();
          existingByEmail.isOnline = true;
          await existingByEmail.save({ validateBeforeSave: false });
          user = existingByEmail;
        }
      }

      // Create new user only if not found by email
      if (!user) {
        const safeUsername = username || await generateSafeUsername(fullName || email || googleId, 'google');
        
        user = await User.create({
          googleId,
          email: email?.toLowerCase(),
          username: safeUsername,
          fullName: fullName || '',
          avatar: avatar || '',
          loginMethod: 'google',
          isEmailVerified: true,
          passwordHash: 'SOCIAL_LOGIN_' + Date.now()
        });
      }
    }

    user.lastLogin = new Date();
    user.isOnline = true;
    user.failedAttempts = 0;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.isOnline = false;
      await user.save({ validateBeforeSave: false });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Link social account
export const linkFacebook = async (req, res, next) => {
  try {
    const { facebookId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Kiểm tra facebookId đã được link chưa
    const existingUser = await User.findOne({ facebookId });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Facebook account already linked to another user'
      });
    }

    user.facebookId = facebookId;
    user.loginMethod = 'facebook';
    await user.save();

    res.json({
      success: true,
      message: 'Facebook account linked successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

export const linkGoogle = async (req, res, next) => {
  try {
    const { googleId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Kiểm tra googleId đã được link chưa
    const existingUser = await User.findOne({ googleId });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Google account already linked to another user'
      });
    }

    user.googleId = googleId;
    user.loginMethod = 'google';
    await user.save();

    res.json({
      success: true,
      message: 'Google account linked successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
