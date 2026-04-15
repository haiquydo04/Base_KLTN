/**
 * Session Service - Business logic cho Quản trị phiên làm việc (PB23)
 */

import UserSession from '../models/UserSession.js';
import User from '../models/User.js';

/**
 * Lấy danh sách sessions với filter & pagination
 * Dùng cho Admin Dashboard: GET /api/admin/sessions
 */
export const getSessions = async ({
  page = 1,
  limit = 20,
  status = 'active',
  riskLevel,
  search,
  sortBy = 'loginAt',
  sortOrder = 'desc'
}) => {
  const filter = {};

  // Filter theo status
  if (status && status !== 'all') {
    filter.status = status;
  }

  // Filter theo risk level
  if (riskLevel && riskLevel !== 'all') {
    filter.riskLevel = riskLevel;
  }

  // Search theo userId (username) hoặc IP
  if (search) {
    const searchTrimmed = search.trim();

    // Kiểm tra nếu search trông như IP address
    const isIPSearch = /^[\d.]+$/.test(searchTrimmed);

    if (isIPSearch) {
      filter.ipAddress = { $regex: searchTrimmed, $options: 'i' };
    } else {
      // Tìm users matching search term
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: searchTrimmed, $options: 'i' } },
          { fullName: { $regex: searchTrimmed, $options: 'i' } },
          { email: { $regex: searchTrimmed, $options: 'i' } }
        ]
      }).select('_id').lean();

      if (matchingUsers.length > 0) {
        filter.userId = { $in: matchingUsers.map(u => u._id) };
      } else {
        // Không tìm thấy user nào → trả về rỗng
        return { sessions: [], total: 0, page, totalPages: 0 };
      }
    }
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [sessions, total] = await Promise.all([
    UserSession.find(filter)
      .populate('userId', 'username fullName avatar email')
      .populate('revokedBy', 'username fullName')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    UserSession.countDocuments(filter)
  ]);

  return {
    sessions,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Lấy thống kê sessions
 * Dùng cho header cards: Tổng trực tuyến, Số rủi ro cao
 */
export const getSessionStats = async () => {
  const [totalActive, totalSuspicious, totalHighRisk] = await Promise.all([
    UserSession.countDocuments({ status: 'active' }),
    UserSession.countDocuments({ status: 'active', riskLevel: 'suspicious' }),
    UserSession.countDocuments({ status: 'active', riskLevel: 'high_risk' })
  ]);

  return {
    totalActive,
    totalRisky: totalSuspicious + totalHighRisk,
    totalSuspicious,
    totalHighRisk
  };
};

/**
 * Kill (revoke) 1 session cụ thể
 * Trả về session info + userId để emit force_logout
 */
export const killSession = async (sessionId, adminId, reason) => {
  const session = await UserSession.findById(sessionId);

  if (!session) {
    return { error: 'Phiên làm việc không tồn tại', status: 404 };
  }

  if (session.status === 'revoked') {
    return { error: 'Phiên làm việc đã bị ngắt trước đó', status: 400 };
  }

  const revokedSession = await UserSession.revokeSession(sessionId, adminId, reason);

  return {
    session: revokedSession,
    userId: session.userId
  };
};

/**
 * Kill nhiều sessions cùng lúc (bulk)
 * Trả về danh sách userIds để emit force_logout
 */
export const bulkKillSessions = async (sessionIds, adminId, reason) => {
  if (!sessionIds || sessionIds.length === 0) {
    return { error: 'Vui lòng chọn ít nhất 1 phiên', status: 400 };
  }

  // Lấy userId từ các sessions trước khi revoke
  const sessions = await UserSession.find({
    _id: { $in: sessionIds },
    status: 'active'
  }).select('userId').lean();

  if (sessions.length === 0) {
    return { error: 'Không tìm thấy phiên hoạt động nào', status: 404 };
  }

  // Revoke tất cả
  await UserSession.updateMany(
    { _id: { $in: sessionIds }, status: 'active' },
    {
      status: 'revoked',
      revokedAt: new Date(),
      revokedBy: adminId,
      revokeReason: reason || 'Admin bulk kill sessions'
    }
  );

  // Lấy unique userIds để emit force_logout
  const userIds = [...new Set(sessions.map(s => s.userId.toString()))];

  return {
    revokedCount: sessions.length,
    userIds
  };
};

export default {
  getSessions,
  getSessionStats,
  killSession,
  bulkKillSessions
};
