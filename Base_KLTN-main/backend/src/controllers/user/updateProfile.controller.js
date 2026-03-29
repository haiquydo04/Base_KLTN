/**
 * Update Profile Controller - Thin layer, delegates to service
 */
import userService from '../../services/user.service.js';

export const updateProfile = async (req, res, next) => {
  try {
    const result = await userService.updateUserProfile(req.user._id, req.body, req.file);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, user: result.user });
  } catch (error) {
    next(error);
  }
};

export default { updateProfile };
