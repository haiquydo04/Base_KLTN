/**
 * Mark As Read Controller - Thin layer, delegates to service
 */
import messageService from '../../services/message.service.js';
import { sendToMatch } from '../../socket/index.js';

export const markAsRead = async (req, res, next) => {
  try {
    const result = await messageService.markMessagesAsRead(req.params.matchId, req.user._id);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    // Emit to socket for realtime notification
    const io = req.app.get('io');
    if (io) {
      sendToMatch(io, req.params.matchId, 'messages_read', {
        matchId: req.params.matchId,
        reader: {
          _id: req.user._id,
          username: req.user.username
        }
      });
    }

    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export default { markAsRead };
