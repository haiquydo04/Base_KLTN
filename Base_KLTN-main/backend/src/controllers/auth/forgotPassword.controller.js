/**
 * Forgot Password Controller - Thin layer, delegates to service
 */
import authService from '../../services/auth.service.js';
import config from '../../config/index.js';

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.requestPasswordReset(req.body);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      message: result.message,
      ...(config.nodeEnv === 'development' && { _debug: 'Check server console for OTP' })
    });
  } catch (error) {
    next(error);
  }
};

export default { forgotPassword };
