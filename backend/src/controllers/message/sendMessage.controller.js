/**
 * Send Message Controller - Thin layer, delegates to service
 * Features:
 * - Message validation (non-empty, max 1000 chars)
 * - Real-time broadcast via Socket.IO
 * - Read receipt notifications
 */
import messageService from '../../services/message.service.js';
import { sendToMatch, sendToUser } from '../../socket/index.js';
import Match from '../../models/Match.js';

// Message validation constants
const MAX_MESSAGE_LENGTH = 1000;
const MIN_MESSAGE_LENGTH = 1;

export const sendMessage = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;
    const { content, image, mediaUrl, messageType } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    
    // Check for empty message (only whitespace)
    const trimmedContent = content?.trim() || '';
    
    if (!trimmedContent && !image && !mediaUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message cannot be empty' 
      });
    }

    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ 
        success: false, 
        message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` 
      });
    }

    // Check for only whitespace
    if (trimmedContent.length > 0 && !/[^\s]/.test(trimmedContent)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message cannot be only whitespace' 
      });
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    const result = await messageService.sendMessage(matchId, userId, {
      content: trimmedContent,
      image,
      mediaUrl,
      messageType: messageType || 'text'
    });

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const message = result.message;

    // ============================================
    // REAL-TIME BROADCAST
    // ============================================
    const io = req.app.get('io');
    if (io) {
      // Broadcast to all users in the match room
      sendToMatch(io, matchId, 'receive_message', message);
      
      // Get other user to send unread notification
      const match = await Match.findById(matchId);
      if (match) {
        const otherUserId = match.getOtherUser(userId);
        if (otherUserId) {
          // Send unread count update
          sendToUser(io, otherUserId.toString(), 'unread_update', {
            matchId,
            increment: 1,
            lastMessage: message
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('[SendMessage] Error:', error);
    next(error);
  }
};

export default { sendMessage };
