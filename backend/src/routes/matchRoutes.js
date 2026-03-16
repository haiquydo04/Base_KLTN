import express from 'express';
import { 
  likeUser, 
  passUser, 
  getLikes, 
  getMutualLikes,
  unmatch 
} from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/like', authenticate, likeUser);
router.post('/pass', authenticate, passUser);
router.get('/likes', authenticate, getLikes);
router.get('/mutual', authenticate, getMutualLikes);
router.delete('/:matchId', authenticate, unmatch);

export default router;
