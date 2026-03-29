/**
 * Link Social Account Controller - Thin layer, delegates to service
 */
import authService from '../../services/auth.service.js';

export const linkFacebook = async (req, res, next) => {
  try {
    const result = await authService.linkSocialAccountToUser(req.user._id, { facebookId: req.body.facebookId });
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, message: 'Facebook account linked successfully', user: result.user });
  } catch (error) {
    next(error);
  }
};

export const linkGoogle = async (req, res, next) => {
  try {
    const result = await authService.linkSocialAccountToUser(req.user._id, { googleId: req.body.googleId });
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, message: 'Google account linked successfully', user: result.user });
  } catch (error) {
    next(error);
  }
};

export default { linkFacebook, linkGoogle };
