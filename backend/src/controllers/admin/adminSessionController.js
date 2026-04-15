/**
 * Admin Session Controller - Quản trị phiên làm việc (PB23)
 * 
 * Endpoints:
 * - GET    /api/admin/sessions       → Danh sách sessions (có filter, pagination)
 * - GET    /api/admin/sessions/stats  → Thống kê (tổng online, rủi ro)
 * - POST   /api/admin/sessions/:id/kill      → Kill 1 session
 * - POST   /api/admin/sessions/bulk-kill     → Kill nhiều sessions
 */

import sessionService from '../../services/session.service.js';
import AdminLog from '../../models/AdminLog.js';

/**
 * GET /api/admin/sessions
 * Lấy danh sách sessions với filter & pagination
 * 
 * Query params:
 *  - page (default: 1)
 *  - limit (default: 20)
 *  - status: 'active' | 'revoked' | 'expired' | 'all' (default: 'active')
 *  - riskLevel: 'normal' | 'suspicious' | 'high_risk' | 'all'
 *  - search: tìm theo username, fullName, email hoặc IP
 *  - sortBy: 'loginAt' | 'lastActiveAt' | 'ipAddress' (default: 'loginAt')
 *  - sortOrder: 'asc' | 'desc' (default: 'desc')
 */
export const getSessions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      riskLevel,
      search,
      sortBy = 'loginAt',
      sortOrder = 'desc'
    } = req.query;

    const result = await sessionService.getSessions({
      page: Number(page),
      limit: Number(limit),
      status,
      riskLevel,
      search,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result.sessions,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit: Number(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/sessions/stats
 * Lấy thống kê tổng quan sessions
 */
export const getSessionStats = async (req, res, next) => {
  try {
    const stats = await sessionService.getSessionStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/sessions/:id/kill
 * Kill 1 session cụ thể
 * 
 * Body (optional):
 *  - reason: lý do ngắt kết nối
 */
export const killSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const adminId = req.user._id;

    const result = await sessionService.killSession(id, adminId, reason);

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error
      });
    }

    // Ghi AdminLog
    await AdminLog.logAction(adminId, 'session_killed', {
      targetId: result.userId,
      description: `Ngắt kết nối phiên làm việc: ${id}`,
      deviceInfo: req.headers['user-agent'] || 'Unknown Device',
      metadata: {
        ip: req.ip,
        sessionId: id,
        reason: reason || 'Admin kill session'
      }
    });

    // Emit force_logout qua Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${result.userId}`).emit('force_logout', {
        reason: reason || 'Phiên làm việc đã bị ngắt bởi quản trị viên',
        sessionId: id
      });
    }

    res.json({
      success: true,
      message: 'Đã ngắt kết nối phiên làm việc'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/sessions/bulk-kill
 * Kill nhiều sessions cùng lúc
 * 
 * Body:
 *  - sessionIds: string[] — mảng ID sessions cần kill
 *  - reason: lý do ngắt kết nối (optional)
 */
export const bulkKillSessions = async (req, res, next) => {
  try {
    const { sessionIds, reason } = req.body || {};
    const adminId = req.user._id;

    const result = await sessionService.bulkKillSessions(sessionIds, adminId, reason);

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error
      });
    }

    // Ghi AdminLog
    await AdminLog.logAction(adminId, 'sessions_bulk_killed', {
      description: `Ngắt kết nối hàng loạt ${result.revokedCount} phiên làm việc`,
      deviceInfo: req.headers['user-agent'] || 'Unknown Device',
      metadata: {
        ip: req.ip,
        sessionIds,
        revokedCount: result.revokedCount,
        reason: reason || 'Admin bulk kill sessions'
      }
    });

    // Emit force_logout cho tất cả users bị ảnh hưởng
    const io = req.app.get('io');
    if (io) {
      result.userIds.forEach(userId => {
        io.to(`user:${userId}`).emit('force_logout', {
          reason: reason || 'Phiên làm việc đã bị ngắt bởi quản trị viên'
        });
      });
    }

    res.json({
      success: true,
      message: `Đã ngắt kết nối ${result.revokedCount} phiên làm việc`,
      revokedCount: result.revokedCount
    });
  } catch (error) {
    next(error);
  }
};
