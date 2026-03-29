import express from 'express';
import { getMessages } from '../controllers/message/getMessages.controller.js';
import { sendMessage } from '../controllers/message/sendMessage.controller.js';
import { getConversations } from '../controllers/message/getConversations.controller.js';
import { markAsRead } from '../controllers/message/markAsRead.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/:matchId', authenticate, getMessages);
router.post('/:matchId', authenticate, sendMessage);
router.put('/:matchId/read', authenticate, markAsRead);

export default router;
