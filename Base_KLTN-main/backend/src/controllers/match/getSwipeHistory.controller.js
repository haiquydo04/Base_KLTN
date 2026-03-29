/**
 * Get Swipe History Controller - Thin layer, delegates to service
 */
import matchService from '../../services/match.service.js';

export const getSwipeHistory = async (req, res, next) => {
  try {
    const result = await matchService.getSwipeHistory(req.user._id, { limit: 100 });
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, swipes: result.swipes });
  } catch (error) {
    next(error);
  }
};

export default { getSwipeHistory };
