/**
 * Get User Matches Controller - Thin layer, delegates to service
 */
import userService from '../../services/user.service.js';

export const getUserMatches = async (req, res, next) => {
  try {
    const result = await userService.getUserMatches(req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, matches: result.matches });
  } catch (error) {
    next(error);
  }
};

export default { getUserMatches };
