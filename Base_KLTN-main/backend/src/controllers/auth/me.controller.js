/**
 * Get Current User Controller - Thin layer, delegates to service
 */
import authService from '../../services/auth.service.js';

export const getCurrentUser = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUserById(req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, user: result.user });
  } catch (error) {
    next(error);
  }
};

export default { getCurrentUser };
