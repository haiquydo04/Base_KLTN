/**
 * Send Message Controller - Thin layer, delegates to service
 */
import messageService from '../../services/message.service.js';
import { sendToMatch } from '../../socket/index.js';

export const sendMessage = async (req, res, next) => {
  try {
    const result = await messageService.sendMessage(req.params.matchId, req.user._id, req.body);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    // Emit to socket for realtime notification
    const io = req.app.get('io');
    if (io) {
      sendToMatch(io, req.params.matchId, 'receive_message', result.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result.message
    });
  } catch (error) {
    next(error);
  }
};

export default { sendMessage };
