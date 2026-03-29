/**
 * Get Mutual Likes Controller - Thin layer, delegates to service
 */
import matchService from '../../services/match.service.js';

export const getMutualLikes = async (req, res, next) => {
  try {
    const result = await matchService.getMutualMatches(req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, matches: result.matches });
  } catch (error) {
    next(error);
  }
};

export default { getMutualLikes };
