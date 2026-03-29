/**
 * Get Recommended Users Controller - Thin layer, delegates to service
 */
import userService from '../../services/user.service.js';

export const getRecommendedUsers = async (req, res, next) => {
  try {
    const result = await userService.getRecommendedUsers(req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, users: result.users });
  } catch (error) {
    next(error);
  }
};

export default { getRecommendedUsers };
