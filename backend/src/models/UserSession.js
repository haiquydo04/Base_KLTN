/**
 * UserSession Model - Quản trị phiên làm việc (PB23)
 * Lưu trữ thông tin session: token, IP, device, risk level
 * Hỗ trợ Admin kill session & force logout
 */

import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js';

const userSessionSchema = new mongoose.Schema({
  // ─── Liên kết User ───
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ─── Token Management ───
  // Lưu hash của JWT token (KHÔNG lưu plaintext để bảo mật)
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  // Token expiration (mirror từ JWT exp)
  tokenExpiresAt: {
    type: Date,
    required: true
  },

  // ─── Device & Network Info ───
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  // Parsed từ User-Agent
  deviceInfo: {
    browser: { type: String, default: 'Unknown' },
    browserVersion: { type: String, default: '' },
    os: { type: String, default: 'Unknown' },
    osVersion: { type: String, default: '' },
    device: { type: String, default: 'Desktop' },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    }
  },

  // ─── Session Status ───
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active',
    index: true
  },

  // ─── Risk Assessment ───
  riskLevel: {
    type: String,
    enum: ['normal', 'suspicious', 'high_risk'],
    default: 'normal',
    index: true
  },
  riskReasons: [{
    type: String
  }],

  // ─── Timestamps ───
  loginAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  revokeReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// ─── Indexes ───
userSessionSchema.index({ userId: 1, status: 1 });
userSessionSchema.index({ ipAddress: 1 });
userSessionSchema.index({ status: 1, riskLevel: 1 });
userSessionSchema.index({ loginAt: -1 });
// TTL Index: Tự động xóa session hết hạn sau 30 ngày (giữ lại để audit)
userSessionSchema.index({ tokenExpiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// ─── Helper: Hash token ───
userSessionSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ─── Helper: Parse IP từ request ───
userSessionSchema.statics.getIPFromRequest = function (req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || req.ip
    || 'unknown';
};

// ─── Helper: Parse device info từ User-Agent ───
userSessionSchema.statics.parseDeviceInfo = function (userAgentString) {
  const parser = new UAParser(userAgentString || '');
  const browserInfo = parser.getBrowser();
  const osInfo = parser.getOS();
  const deviceResult = parser.getDevice();

  return {
    browser: browserInfo.name || 'Unknown',
    browserVersion: browserInfo.version || '',
    os: osInfo.name || 'Unknown',
    osVersion: osInfo.version || '',
    device: deviceResult.model || (deviceResult.type === 'mobile' ? 'Mobile' : 'Desktop'),
    deviceType: deviceResult.type || 'desktop'
  };
};

// ─── Static: Tạo session mới khi user đăng nhập ───
userSessionSchema.statics.createSession = async function (userId, token, req) {
  const tokenHash = this.hashToken(token);

  // Decode JWT để lấy expiration
  const decoded = jwt.decode(token);
  const tokenExpiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // fallback 7 ngày

  const ipAddress = this.getIPFromRequest(req);
  const userAgentString = req.headers['user-agent'] || '';
  const deviceInfo = this.parseDeviceInfo(userAgentString);

  // Đánh giá rủi ro
  const risk = await this.assessRisk(userId, ipAddress, deviceInfo);

  return this.create({
    userId,
    tokenHash,
    tokenExpiresAt,
    ipAddress,
    userAgent: userAgentString,
    deviceInfo,
    status: 'active',
    riskLevel: risk.riskLevel,
    riskReasons: risk.riskReasons,
    loginAt: new Date(),
    lastActiveAt: new Date()
  });
};

// ─── Static: Đánh giá rủi ro session ───
userSessionSchema.statics.assessRisk = async function (userId, ipAddress, deviceInfo) {
  const reasons = [];
  let level = 'normal';

  // 1. Kiểm tra quá nhiều sessions active (>= 5)
  const activeCount = await this.countDocuments({ userId, status: 'active' });
  if (activeCount >= 5) {
    reasons.push(`Quá nhiều phiên hoạt động (${activeCount})`);
    level = 'suspicious';
  }

  // 2. Kiểm tra IP/Device mới (chưa từng đăng nhập từ IP + browser + OS này)
  const knownSession = await this.findOne({
    userId,
    ipAddress,
    'deviceInfo.browser': deviceInfo.browser,
    'deviceInfo.os': deviceInfo.os
  });
  if (!knownSession) {
    reasons.push('Thiết bị hoặc IP mới');
  }

  // 3. Kiểm tra IP nội bộ bất thường (ví dụ: IP từ dải đáng ngờ)
  // Có thể mở rộng thêm blacklist IP ở đây
  const suspiciousPatterns = ['103.21.144'];
  const isSuspiciousIP = suspiciousPatterns.some(pattern => ipAddress.startsWith(pattern));
  if (isSuspiciousIP) {
    reasons.push('IP từ vùng hạn chế');
    level = 'suspicious';
  }

  // Nếu có >= 2 lý do → high_risk
  if (reasons.length >= 2) level = 'high_risk';

  return { riskLevel: level, riskReasons: reasons };
};

// ─── Static: Revoke (Kill) 1 session ───
userSessionSchema.statics.revokeSession = async function (sessionId, adminId, reason) {
  return this.findByIdAndUpdate(sessionId, {
    status: 'revoked',
    revokedAt: new Date(),
    revokedBy: adminId,
    revokeReason: reason || 'Admin kill session'
  }, { new: true });
};

// ─── Static: Revoke tất cả sessions của 1 user ───
userSessionSchema.statics.revokeAllUserSessions = async function (userId, adminId, reason) {
  return this.updateMany(
    { userId, status: 'active' },
    {
      status: 'revoked',
      revokedAt: new Date(),
      revokedBy: adminId,
      revokeReason: reason || 'Admin kill all sessions'
    }
  );
};

// ─── Static: Kiểm tra token còn hợp lệ không ───
userSessionSchema.statics.isTokenValid = async function (token) {
  const tokenHash = this.hashToken(token);
  const session = await this.findOne({ tokenHash, status: 'active' });
  return !!session;
};

// ─── Static: Cập nhật lastActiveAt ───
userSessionSchema.statics.touchSession = async function (token) {
  const tokenHash = this.hashToken(token);
  return this.updateOne(
    { tokenHash, status: 'active' },
    { lastActiveAt: new Date() }
  );
};

// ─── Static: Revoke session theo token (dùng khi user tự logout) ───
userSessionSchema.statics.revokeByToken = async function (token) {
  const tokenHash = this.hashToken(token);
  return this.findOneAndUpdate(
    { tokenHash, status: 'active' },
    {
      status: 'revoked',
      revokedAt: new Date(),
      revokeReason: 'User logout'
    },
    { new: true }
  );
};

export default mongoose.model('UserSession', userSessionSchema);
