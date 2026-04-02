/**
 * Interest Routes - PB07: Quản lý sở thích cá nhân
 * API endpoints cho việc quản lý tags và user interests
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getTags,
  getUserInterests,
  updateUserInterests,
  addUserInterest,
  removeUserInterest
} from '../controllers/interest/interest.controller.js';

const router = express.Router();

/**
 * @route   GET /api/tags
 * @desc    Lấy danh sách tag phổ biến
 * @access  Public (không cần đăng nhập)
 * @query    limit - Số lượng tag (default: 50)
 * @query    category - Lọc theo category
 * @query    search - Tìm kiếm theo tên
 */
router.get('/tags', getTags);

/**
 * @route   GET /api/users/interests
 * @desc    Lấy danh sách sở thích của user hiện tại
 * @access  Private (cần đăng nhập)
 */
router.get('/users/interests', authenticate, getUserInterests);

/**
 * @route   POST /api/users/interests
 * @desc    Cập nhật danh sách sở thích của user
 * @access  Private (cần đăng nhập)
 * @body    { tags: ["music", "travel", "cooking"] }
 */
router.post('/users/interests', authenticate, updateUserInterests);

/**
 * @route   POST /api/users/interests/add
 * @desc    Thêm một sở thích vào danh sách
 * @access  Private (cần đăng nhập)
 * @body    { tag: "music" }
 */
router.post('/users/interests/add', authenticate, addUserInterest);

/**
 * @route   DELETE /api/users/interests/:tagId
 * @desc    Xóa một sở thích khỏi danh sách
 * @access  Private (cần đăng nhập)
 * @param   tagId - ID của tag cần xóa
 */
router.delete('/users/interests/:tagId', authenticate, removeUserInterest);

export default router;
