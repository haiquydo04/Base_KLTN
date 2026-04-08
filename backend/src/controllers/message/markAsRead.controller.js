/**
 * Mark As Read Controller - Thin layer, delegates to service
 * Features:
 * - Real-time read receipt broadcast
 * - Includes readAt timestamp
 * - Notifies sender of read status
 */
import messageService from '../../services/message.service.js';
import { sendToMatch, sendToUser } from '../../socket/index.js';
import Match from '../../models/Match.js';

export const markAsRead = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;
    const readAt = new Date();

    const result = await messageService.markMessagesAsRead(matchId, userId);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    // Emit to socket for realtime notification
    const io = req.app.get('io');
    if (io) {
      // Broadcast to all users in the match room
      sendToMatch(io, matchId, 'messages_read', {
        matchId,
        reader: {
          _id: req.user._id,
          username: req.user.username,
          avatar: req.user.avatar
        },
        readAt: readAt.toISOString()
      });

      // Also notify the sender directly (for their unread count update)
      const match = await Match.findById(matchId);
      if (match) {
        const otherUserId = match.getOtherUser(userId);
        if (otherUserId) {
          sendToUser(io, otherUserId.toString(), 'unread_update', {
            matchId,
            increment: -1, // Decrement unread count
            readBy: {
              _id: req.user._id,
              username: req.user.username
            },
            readAt: readAt.toISOString()
          });
        }
      }
    }

    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export default { markAsRead };
