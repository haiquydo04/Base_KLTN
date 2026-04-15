import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserSession from '../models/UserSession.js';
import config from '../config/index.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);

      // ★ Kiểm tra session có bị revoke chưa (PB23 - Kill Session)
      const isSessionValid = await UserSession.isTokenValid(token);
      if (!isSessionValid) {
        return res.status(401).json({
          success: false,
          message: 'Session has been revoked',
          code: 'SESSION_REVOKED'
        });
      }

      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Cập nhật lastActiveAt (không cần await, fire-and-forget)
      UserSession.touchSession(token).catch(() => {});

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = await User.findById(decoded.id);
      } catch (error) {
        // Token invalid, continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập vào khu vực này'
    });
  }
};

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này chứa middleware xác thực người dùng qua JWT token.
Sử dụng cho tất cả các routes cần đăng nhập.

Các function chính:
- authenticate(): Middleware bắt buộc. Xác thực JWT token từ header.
  Nếu token hợp lệ, gán thông tin user vào req.user.
- optionalAuth(): Middleware tùy chọn. Cho phép truy cập có hoặc không có token.
  Nếu có token hợp lệ thì gán user, không thì vẫn cho qua.

Cách hoạt động:
1. Lấy token từ header "Authorization: Bearer <token>"
2. Verify token bằng jwtSecret
3. Tìm user trong database theo id trong token
4. Gán user vào req.user

Luồng hoạt động:
Request → Check Header → Verify JWT → Find User → Attach to req → Next()

Ghi chú:
File này được sử dụng bởi tất cả các routes (auth, user, match, message).
Middleware authenticate được áp dụng cho các route cần bảo vệ.
Token có thời hạn config.jwtExpire (mặc định 7 ngày).
*/
