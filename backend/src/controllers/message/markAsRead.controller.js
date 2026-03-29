/**
 * Mark As Read Controller - Thin layer, delegates to service
 */
import messageService from '../../services/message.service.js';

export const markAsRead = async (req, res, next) => {
  try {
    const result = await messageService.markMessagesAsRead(req.params.matchId, req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export default { markAsRead };
