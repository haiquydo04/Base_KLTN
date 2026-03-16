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
    const { username, email, password, fullName, age, gender } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      fullName,
      age,
      gender
    });

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
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
      user.lastSeen = new Date();
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

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này chứa các controller xử lý authentication:
đăng ký, đăng nhập, lấy thông tin user hiện tại, đăng xuất.

Các function chính:
- register(): Đăng ký user mới, tạo JWT token
- login(): Đăng nhập, xác thực password, tạo JWT token, cập nhật isOnline
- getCurrentUser(): Lấy thông tin user hiện tại (từ req.user đã được auth middleware verify)
- logout(): Đăng xuất, cập nhật isOnline = false

Luồng hoạt động:
Client → POST /api/auth/register hoặc /api/auth/login
→ Controller xử lý logic → Model (User) → MongoDB
→ Tạo JWT token → Response với token và user info

Ghi chú:
File này được sử dụng bởi authRoutes.js.
Middleware auth (src/middleware/auth.js) được dùng cho getCurrentUser và logout.
JWT token có thời hạn config.jwtExpire (mặc định 7 ngày).
*/
