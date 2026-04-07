import User from '../../models/User.js';
import AdminLog from '../../models/AdminLog.js';

/**
 * @desc    Lấy danh sách tài khoản người dùng
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res) => {
  try {
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    const search = req.query.search || '';
    const { role, gender, status, startDate, endDate } = req.query;

    // Build query: Hỗ trợ tìm kiếm theo email, username, fullName
    const query = {};
    
    // Tìm kiếm text
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Các bộ lọc bổ sung
    if (role) query.role = role;
    if (gender) query.gender = gender;
    if (status) query.status = status;
    
    // Lọc theo khoảng thời gian tham gia
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
      // Clean up empty object if somehow datestrings are invalid
      if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
    }

    // Thực hiện tìm kiếm
    const users = await User.find(query)
      .select('username email fullName avatar role gender createdAt isLocked status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Đếm tổng số tài khoản
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
    console.log(`[toggleUserStatus] Request: adminId=${adminId}, targetId=${id}`);

    // Tìm user theo ID
    const user = await User.findById(id);

    if (!user) {
      console.log(`[toggleUserStatus] User not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Không thể thực hiện thao tác, vui lòng thử lại sau.'
      });
    }

    if (user.role === 'admin' && user._id.toString() === adminId.toString()) {
      console.log(`[toggleUserStatus] Cannot lock self admin`);
      return res.status(403).json({
        success: false,
        message: 'Bạn không thể tự khóa tài khoản của chính mình.'
      });
    }

    // Toggle trạng thái isLocked
    user.isLocked = !user.isLocked;
    
    // Đồng bộ với trường status cho nhất quán
    user.status = user.isLocked ? 'banned' : 'active';

    console.log(`[toggleUserStatus] Saving user with isLocked=${user.isLocked}, status=${user.status}`);
    // Lưu lại User using updateOne to bypass schema validations on other fields
    await User.updateOne({ _id: id }, { $set: { isLocked: user.isLocked, status: user.status } });
    console.log(`[toggleUserStatus] User saved successfully`);

    // PB19 Điều kiện ràng buộc: Ghi nhật ký hệ thống (Logging)
    const actionStr = user.isLocked ? 'LOCK_ACCOUNT' : 'UNLOCK_ACCOUNT';
    const descriptionStr = `Admin (ID: ${adminId}) đã ${user.isLocked ? 'khóa' : 'mở khóa'} tài khoản User (ID: ${user._id}, Username: ${user.username}).`;
    
    await AdminLog.logAction(adminId, actionStr, {
      targetId: user._id,
      description: descriptionStr,
      deviceInfo: req.headers['user-agent'] || 'Unknown Device'
    });
    console.log(`[toggleUserStatus] AdminLog saved`);

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
    res.status(500).json({
      success: false,
      message: 'Không thể thực hiện thao tác, vui lòng thử lại sau.'
    });
  }
};

/**
 * @desc    Cập nhật vai trò người dùng (user / premium / admin)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user._id;

    if (!['user', 'premium', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ.' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    if (user.role === 'admin' && user._id.toString() === adminId.toString()) {
      return res.status(403).json({ success: false, message: 'Bạn không thể tự hạ quyền của chính mình.' });
    }

    const oldRole = user.role;
    user.role = role;
    await User.updateOne({ _id: id }, { $set: { role: role } });

    const descriptionStr = `Admin (ID: ${adminId}) đã đổi quyền User (ID: ${user._id}, Username: ${user.username}) từ ${oldRole} sang ${role}.`;

    await AdminLog.logAction(adminId, 'UPDATE_USER_ROLE', {
      targetId: user._id,
      description: descriptionStr,
      deviceInfo: req.headers['user-agent'] || 'Unknown Device'
    });

    res.json({
      success: true,
      message: 'Cập nhật vai trò thành công.',
      data: {
        _id: user._id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò User (Admin):', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thực hiện thao tác, vui lòng thử lại sau.'
    });
  }
};
