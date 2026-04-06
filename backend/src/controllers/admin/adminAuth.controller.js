import User from '../../models/User.js';
import AdminLog from '../../models/AdminLog.js';
import authService from '../../services/auth.service.js';

export const adminLogin = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    const result = await authService.loginUser({ username: identifier, email: identifier, password });

    if (result.error) {
      // 4.1 Kiểm tra tài khoản: Nếu sai Username hoặc Password -> "Thông tin đăng nhập không chính xác"
      
      // Khách hàng yêu cầu giữ nguyên AdminLog. AdminLog bắt buộc adminId là ObjectId.
      // Do đó, ta chỉ log thất bại nếu username/email đó có tồn tại trong hệ thống.
      const existingUser = await User.findByEmailOrUsername(identifier);
      if (existingUser) {
        await AdminLog.logAction(existingUser._id, 'admin_login_failed', {
          description: 'Sai mật khẩu khi cố gắng đăng nhập Admin',
          deviceInfo,
          metadata: { ip: req.ip, identifier }
        });
      }

      return res.status(401).json({ 
        success: false, 
        message: 'Thông tin đăng nhập không chính xác' 
      });
    }

    const { user, token } = result;

    // 4.2 Kiểm tra quyền hạn: Nếu đúng tài khoản nhưng không có quyền Admin
    if (user.role !== 'admin') {
      await AdminLog.logAction(user._id, 'admin_login_forbidden', {
        description: 'Đăng nhập thành công nhưng tài khoản không có quyền Admin',
        deviceInfo,
        metadata: { ip: req.ip }
      });

      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền truy cập vào khu vực này' 
      });
    }

    // Đăng nhập thành công
    await AdminLog.logAction(user._id, 'admin_login_success', {
      description: 'Đăng nhập vào hệ thống quản trị thành công',
      deviceInfo,
      metadata: { ip: req.ip }
    });

    const { _id, username: userUsername, email: userEmail, fullName, role, avatar, status, lastLogin } = user;
    res.json({ 
      success: true, 
      token, 
      user: { _id, username: userUsername, email: userEmail, fullName, role, avatar, status, lastLogin }
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req, res, next) => {
  try {
    // 1. Ghi log sự kiện đăng xuất
    await AdminLog.logAction(req.user._id, 'admin_logout_success', {
      description: 'Đăng xuất khỏi hệ thống quản trị',
      deviceInfo: req.headers['user-agent'] || 'Unknown Device',
      metadata: { ip: req.ip }
    });

    // 2. Gọi service xử lý logic logout (cập nhật isOnline: false)
    await authService.logoutUser(req.user._id);

    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (error) {
    next(error);
  }
};

export const adminForgotPassword = async (req, res, next) => {
  try {
    const result = await authService.requestPasswordReset(req.body);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    // Ghi log yêu cầu reset mật khẩu
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      await AdminLog.logAction(user._id, 'admin_password_reset_request', {
        description: 'Yêu cầu mã OTP khôi phục mật khẩu Admin',
        metadata: { ip: req.ip, email: req.body.email }
      });
    }

    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const adminVerifyOTP = async (req, res, next) => {
  try {
    const result = await authService.verifyPasswordResetOTP(req.body);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const adminResetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetUserPassword(req.body);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    // Ghi log đổi mật khẩu thành công
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      await AdminLog.logAction(user._id, 'admin_password_reset_success', {
        description: 'Đặt lại mật khẩu Admin thành công qua OTP',
        metadata: { ip: req.ip }
      });
    }

    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};
