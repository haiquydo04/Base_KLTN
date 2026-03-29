/**
 * Get Messages Controller - Thin layer, delegates to service
 */
import messageService from '../../services/message.service.js';

export const getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await messageService.getMessages(req.params.matchId, req.user._id, { page, limit });
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, messages: result.messages, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export default { getMessages };
