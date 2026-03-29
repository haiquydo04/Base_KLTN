/**
 * Pass User Controller - Thin layer, delegates to service
 */
import matchService from '../../services/match.service.js';

export const passUser = async (req, res, next) => {
  try {
    const result = await matchService.passUser(req.user._id, req.body.userId);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export default { passUser };
