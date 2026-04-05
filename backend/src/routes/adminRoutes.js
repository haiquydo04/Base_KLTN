import express from 'express';
import { adminLogin } from '../controllers/admin/adminAuth.controller.js';
import { getUsers, toggleUserStatus, updateUserRole } from '../controllers/admin/adminUserController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Route: POST /api/admin/login
// Mục đích: Xác thực Admin
router.post('/login', adminLogin);

// Route: GET /api/admin/me
// Mục đích: Kiểm tra session và trả về thông tin Admin
// Yêu cầu: Header Authorization: Bearer <token>
router.get('/me', authenticate, authorizeAdmin, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Route: GET /api/admin/users
// Mục đích: Lấy danh sách tài khoản người dùng
// Yêu cầu: Header Authorization: Bearer <token>, Role: admin
router.get('/users', authenticate, authorizeAdmin, getUsers);

// Route: PUT /api/admin/users/:id/status
// Mục đích: Khóa/mở khóa tài khoản người dùng
// Yêu cầu: Header Authorization: Bearer <token>, Role: admin
router.put('/users/:id/status', authenticate, authorizeAdmin, toggleUserStatus);

// Route: PUT /api/admin/users/:id/role
// Mục đích: Cập nhật chức vụ (role)
// Yêu cầu: Header Authorization: Bearer <token>, Role: admin
router.put('/users/:id/role', authenticate, authorizeAdmin, updateUserRole);

// --- Route Quản lý Danh mục (PB20) ---
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/admin/adminCategoryController.js';

router.get('/categories', authenticate, authorizeAdmin, getCategories);
router.post('/categories', authenticate, authorizeAdmin, addCategory);
router.put('/categories/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/categories/:id', authenticate, authorizeAdmin, deleteCategory);
router.put('/categories/:id/status', authenticate, authorizeAdmin, toggleCategoryStatus);

// --- Route Dashboard (PB18) ---
import {
  getDashboardStats,
  getUserGrowth,
  getGenderDistribution,
  getRecentUsers
} from '../controllers/admin/adminDashboardController.js';

router.get('/dashboard/stats', authenticate, authorizeAdmin, getDashboardStats);
router.get('/dashboard/growth', authenticate, authorizeAdmin, getUserGrowth);
router.get('/dashboard/gender', authenticate, authorizeAdmin, getGenderDistribution);
router.get('/dashboard/recent-users', authenticate, authorizeAdmin, getRecentUsers);

export default router;
