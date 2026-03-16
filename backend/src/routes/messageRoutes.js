import express from 'express';
import { 
  getMessages, 
  sendMessage, 
  getConversations,
  markAsRead 
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/:matchId', authenticate, getMessages);
router.post('/:matchId', authenticate, sendMessage);
router.put('/:matchId/read', authenticate, markAsRead);

export default router;
