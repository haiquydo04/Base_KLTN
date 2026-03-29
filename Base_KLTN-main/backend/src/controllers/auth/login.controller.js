/**
 * Login Controller - Thin layer, delegates to service
 */
import authService from '../../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, token: result.token, user: result.user });
  } catch (error) {
    next(error);
  }
};

export default { login };
