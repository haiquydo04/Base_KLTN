/**
 * Auth Controller - Cập nhật cho schema mới
 * Hỗ trợ: email, facebook, google login
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, age, gender, loginMethod } = req.body;

    // Kiểm tra user tồn tại
    const existingUser = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email?.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Tạo user mới với schema mới
    const userData = {
      username,
      email: email?.toLowerCase(),
      fullName,
      age,
      gender,
      loginMethod: loginMethod || 'email'
    };

    // Hash password nếu là email login
    if (userData.loginMethod === 'email' || !loginMethod) {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.default.genSalt(10);
      userData.passwordHash = await bcrypt.default.hash(password || 'defaultPassword123', salt);
    }

    const user = await User.create(userData);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
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

    let user = await User.findOne({ facebookId });

    if (!user) {
      // Tạo user mới nếu chưa có
      user = await User.create({
        facebookId,
        email: email?.toLowerCase(),
        username: username || `fb_${facebookId.substring(0, 15)}`,
        fullName,
        avatar,
        loginMethod: 'facebook',
        isEmailVerified: true
      });
    }

    user.lastLogin = new Date();
    user.isOnline = true;
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

// Social login - Google
export const googleLogin = async (req, res, next) => {
  try {
    const { googleId, email, username, fullName, avatar } = req.body;

    let user = await User.findOne({ googleId });

    if (!user) {
      // Tạo user mới nếu chưa có
      user = await User.create({
        googleId,
        email: email?.toLowerCase(),
        username: username || `gg_${googleId.substring(0, 15)}`,
        fullName,
        avatar,
        loginMethod: 'google',
        isEmailVerified: true
      });
    }

    user.lastLogin = new Date();
    user.isOnline = true;
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
