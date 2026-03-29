/**
 * Get Liked Users Controller - Thin layer, delegates to service
 */
import matchService from '../../services/match.service.js';

export const getLikes = async (req, res, next) => {
  try {
    const result = await matchService.getLikedUsers(req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, users: result.users });
  } catch (error) {
    next(error);
  }
};

export default { getLikes };
