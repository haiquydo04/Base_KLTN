/**
 * Send Message Controller - Thin layer, delegates to service
 */
import messageService from '../../services/message.service.js';

export const sendMessage = async (req, res, next) => {
  try {
    const result = await messageService.sendMessage(req.params.matchId, req.user._id, req.body);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.status(201).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export default { sendMessage };
