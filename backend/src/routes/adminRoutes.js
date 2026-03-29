import express from 'express';
import { adminLogin } from '../controllers/admin/adminAuth.controller.js';
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

export default router;
