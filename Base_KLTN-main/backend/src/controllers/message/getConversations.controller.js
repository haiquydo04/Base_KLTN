/**
 * Get Conversations Controller - Thin layer, delegates to service
 */
import messageService from '../../services/message.service.js';

export const getConversations = async (req, res, next) => {
  try {
    const result = await messageService.getConversations(req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, conversations: result.conversations });
  } catch (error) {
    next(error);
  }
};

export default { getConversations };
