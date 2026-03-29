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

    res.json({ 
      success: true, 
      token, 
      user 
    });
  } catch (error) {
    next(error);
  }
};
