/**
 * Verify OTP Controller - Thin layer, delegates to service
 */
import authService from '../../services/auth.service.js';

export const verifyOTP = async (req, res, next) => {
  try {
    const result = await authService.verifyPasswordResetOTP(req.body);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export default { verifyOTP };
