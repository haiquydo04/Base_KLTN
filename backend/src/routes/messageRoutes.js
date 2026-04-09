import express from 'express';
import { getMessages } from '../controllers/message/getMessages.controller.js';
import { sendMessage } from '../controllers/message/sendMessage.controller.js';
import { getConversations } from '../controllers/message/getConversations.controller.js';
import { markAsRead } from '../controllers/message/markAsRead.controller.js';
import { uploadMessageImage } from '../controllers/message/uploadMedia.controller.js';
import { authenticate } from '../middleware/auth.js';
import { messageRateLimiter } from '../middleware/rateLimiter.js';
import { uploadSingleImage, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Conversation list
router.get('/conversations', authenticate, getConversations);

// Message history with pagination
router.get('/:matchId', authenticate, getMessages);

// Send message (with rate limiting)
router.post('/:matchId', authenticate, messageRateLimiter, sendMessage);

// Mark messages as read
router.put('/:matchId/read', authenticate, markAsRead);

// Upload media (image)
router.post(
  '/:matchId/media',
  authenticate,
  messageRateLimiter,
  uploadSingleImage,
  handleUploadError,
  uploadMessageImage
);

export default router;
