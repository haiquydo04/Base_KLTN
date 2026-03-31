import User from '../../models/User.js';
import AdminLog from '../../models/AdminLog.js';

/**
 * @desc    Lấy danh sách tài khoản người dùng
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build query: Lọc những người dùng thông thường (role: 'user')
    const query = { role: 'user' };

    // Thực hiện tìm kiếm
    const users = await User.find(query)
      .select('username createdAt isLocked status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Đếm tổng số tài khoản
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách User (Admin):', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách người dùng'
    });
  }
};

/**
 * @desc    Thay đổi trạng thái tài khoản (Khóa/Mở Khóa)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    // Tìm user theo ID
    const user = await User.findById(id);

    // Kiểm tra PB19: "Nếu tài khoản không tồn tại hoặc lỗi hệ thống, báo: Không thể thực hiện thao tác, vui lòng thử lại sau."
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không thể thực hiện thao tác, vui lòng thử lại sau.'
      });
    }

    // Toggle trạng thái isLocked
    user.isLocked = !user.isLocked;
    
    // Đồng bộ với trường status cho nhất quán
    user.status = user.isLocked ? 'banned' : 'active';

    // Lưu lại User
    await user.save();

    // PB19 Điều kiện ràng buộc: Ghi nhật ký hệ thống (Logging)
    const actionStr = user.isLocked ? 'LOCK_ACCOUNT' : 'UNLOCK_ACCOUNT';
    const descriptionStr = `Admin (ID: ${adminId}) đã ${user.isLocked ? 'khóa' : 'mở khóa'} tài khoản User (ID: ${user._id}, Username: ${user.username}).`;
    
    await AdminLog.logAction(adminId, actionStr, {
      targetId: user._id,
      description: descriptionStr,
      deviceInfo: req.headers['user-agent'] || 'Unknown Device'
    });

    // PB19: "Nếu cập nhật thành công, hệ thống lưu vào CSDL và thông báo: Cập nhật trạng thái tài khoản thành công."
    res.json({
      success: true,
      message: 'Cập nhật trạng thái tài khoản thành công.',
      data: {
        _id: user._id,
        username: user.username,
        isLocked: user.isLocked,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái User (Admin):', error);
    // PB19: "Nếu tài khoản không tồn tại hoặc lỗi hệ thống, báo: Không thể thực hiện thao tác, vui lòng thử lại sau."
    res.status(500).json({
      success: false,
      message: 'Không thể thực hiện thao tác, vui lòng thử lại sau.'
    });
  }
};
