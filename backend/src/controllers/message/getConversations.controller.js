/**
 * Get Conversations Controller - Thin layer, delegates to service
 */
import messageService from '../../services/message.service.js';

export const getConversations = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 50
    const result = await messageService.getConversations(req.user._id, { limit });

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      data: result.conversations,
      total: result.conversations.length
    });
  } catch (error) {
    next(error);
  }
};

export default { getConversations };
