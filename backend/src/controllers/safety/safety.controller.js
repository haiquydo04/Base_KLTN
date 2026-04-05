/**
 * Safety Controller - Report và Block APIs
 * Endpoint: POST /report, POST /block, GET /blocks, DELETE /block/:id
 */

import Report from '../../models/Report.js';
import Block from '../../models/Block.js';
import User from '../../models/User.js';

/**
 * POST /api/report
 * Gửi báo cáo người dùng vi phạm
 * Body: { targetId, reason, description?, evidence? }
 */
export const createReport = async (req, res, next) => {
  try {
    const reporterId = req.user._id;
    const { targetId, reason, description, evidence } = req.body;

    console.log('[Safety] Create report:', { reporterId, targetId, reason });

    // Validate input
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required'
      });
    }

    // Validate reason enum
    const validReasons = ['fake_profile', 'inappropriate_content', 'harassment', 'spam', 'scam', 'underage', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report reason'
      });
    }

    // Check if target exists
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Cannot report yourself
    if (reporterId.toString() === targetId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report yourself'
      });
    }

    // Create report
    const report = new Report({
      reporterId,
      targetId,
      reason,
      description: description || '',
      evidence: evidence || []
    });

    await report.save();

    console.log('[Safety] Report created:', report._id);

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        reportId: report._id,
        reason: Report.getReasonLabel(reason)
      }
    });
  } catch (error) {
    // Handle duplicate report error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this user'
      });
    }
    console.error('[Safety] Report error:', error);
    next(error);
  }
};

/**
 * POST /api/block
 * Chặn một người dùng
 * Body: { targetId, reason? }
 */
export const createBlock = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { targetId, reason } = req.body;

    console.log('[Safety] Create block:', { userId, targetId });

    // Validate input
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    // Check if target exists
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Cannot block yourself
    if (userId.toString() === targetId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself'
      });
    }

    // Check if already blocked
    const existingBlock = await Block.findOne({ userId, blockedId: targetId });
    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: 'User is already blocked'
      });
    }

    // Create block
    const block = new Block({
      userId,
      blockedId: targetId,
      reason: reason || ''
    });

    await block.save();

    console.log('[Safety] Block created:', block._id);

    return res.status(201).json({
      success: true,
      message: 'User blocked successfully',
      data: {
        blockId: block._id,
        blockedUser: {
          id: targetUser._id,
          username: targetUser.username,
          fullName: targetUser.fullName
        }
      }
    });
  } catch (error) {
    console.error('[Safety] Block error:', error);
    next(error);
  }
};

/**
 * GET /api/block
 * Lấy danh sách người dùng đã chặn
 */
export const getBlockedUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log('[Safety] Get blocked users:', userId);

    const blocks = await Block.find({ userId })
      .populate('blockedId', 'username fullName avatar')
      .sort({ createdAt: -1 });

    const blockedUsers = blocks
      .filter(b => b.blockedId) // Filter out deleted users
      .map(b => ({
        blockId: b._id,
        userId: b.blockedId._id,
        username: b.blockedId.username,
        fullName: b.blockedId.fullName,
        avatar: b.blockedId.avatar,
        blockedAt: b.createdAt,
        reason: b.reason
      }));

    return res.json({
      success: true,
      data: blockedUsers,
      total: blockedUsers.length
    });
  } catch (error) {
    console.error('[Safety] Get blocked users error:', error);
    next(error);
  }
};

/**
 * DELETE /api/block/:targetId
 * Bỏ chặn một người dùng
 */
export const unblockUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { targetId } = req.params;

    console.log('[Safety] Unblock user:', { userId, targetId });

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    const result = await Block.deleteOne({ userId, blockedId: targetId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      });
    }

    console.log('[Safety] User unblocked:', targetId);

    return res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('[Safety] Unblock error:', error);
    next(error);
  }
};

/**
 * GET /api/report/reasons
 * Lấy danh sách lý do báo cáo
 */
export const getReportReasons = async (req, res) => {
  const reasons = [
    { value: 'fake_profile', label: 'Fake Profile', description: 'Profile belongs to someone else or is fake' },
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Profile contains inappropriate photos or content' },
    { value: 'harassment', label: 'Harassment', description: 'This person is harassing or threatening me' },
    { value: 'spam', label: 'Spam', description: 'This profile is sending spam messages' },
    { value: 'scam', label: 'Scam', description: 'This person is trying to scam me' },
    { value: 'underage', label: 'Underage User', description: 'This user appears to be under 18' },
    { value: 'other', label: 'Other', description: 'Other reason not listed above' }
  ];

  return res.json({
    success: true,
    data: reasons
  });
};

export default {
  createReport,
  createBlock,
  getBlockedUsers,
  unblockUser,
  getReportReasons
};