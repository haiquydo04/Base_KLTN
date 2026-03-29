/**
 * Logout Controller - Thin layer, delegates to service
 */
import authService from '../../services/auth.service.js';

export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.user._id);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export default { logout };
