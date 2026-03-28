/**
 * Unmatch Controller - Thin layer, delegates to service
 */
import matchService from '../../services/match.service.js';

export const unmatch = async (req, res, next) => {
  try {
    const result = await matchService.unmatchUser(req.user._id, req.params.matchId);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export default { unmatch };
