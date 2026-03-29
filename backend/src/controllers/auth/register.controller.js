/**
 * Register Controller - Thin layer, delegates to service
 */
import authService from '../../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.status(201).json({ success: true, message: 'Đăng ký thành công', ...result });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] || 'Validation error' });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    next(error);
  }
};

export default { register };
