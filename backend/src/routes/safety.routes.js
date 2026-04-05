/**
 * Safety Routes - Report và Block APIs
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createReport,
  createBlock,
  getBlockedUsers,
  unblockUser,
  getReportReasons
} from '../controllers/safety/safety.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/report
 * @desc    Gửi báo cáo người dùng vi phạm
 * @access  Private
 * @body    { targetId, reason, description?, evidence? }
 */
router.post('/report', createReport);

/**
 * @route   GET /api/report/reasons
 * @desc    Lấy danh sách lý do báo cáo
 * @access  Public
 */
router.get('/report/reasons', getReportReasons);

/**
 * @route   POST /api/block
 * @desc    Chặn một người dùng
 * @access  Private
 * @body    { targetId, reason? }
 */
router.post('/block', createBlock);

/**
 * @route   GET /api/block
 * @desc    Lấy danh sách người dùng đã chặn
 * @access  Private
 */
router.get('/block', getBlockedUsers);

/**
 * @route   DELETE /api/block/:targetId
 * @desc    Bỏ chặn một người dùng
 * @access  Private
 * @param   targetId - ID của user cần bỏ chặn
 */
router.delete('/block/:targetId', unblockUser);

export default router;