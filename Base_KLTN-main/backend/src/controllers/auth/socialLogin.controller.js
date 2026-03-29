/**
 * Social Login Controller - Google & Facebook
 */
import authService from '../../services/auth.service.js';

export const facebookLogin = async (req, res, next) => {
  try {
    const result = await authService.socialLogin({ ...req.body, facebookId: req.body.facebookId });
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, token: result.token, user: result.user });
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

export const googleLogin = async (req, res, next) => {
  try {
    const result = await authService.socialLogin({ ...req.body, googleId: req.body.googleId });
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, token: result.token, user: result.user });
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

export default { facebookLogin, googleLogin };
