import express from 'express';
import { 
  likeUser, 
  passUser, 
  getLikes, 
  getMutualLikes,
  unmatch,
  getSwipeHistory
} from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/like', authenticate, likeUser);
router.post('/pass', authenticate, passUser);
router.get('/likes', authenticate, getLikes);
router.get('/mutual', authenticate, getMutualLikes);
router.get('/swipes', authenticate, getSwipeHistory);
router.delete('/:matchId', authenticate, unmatch);

export default router;
