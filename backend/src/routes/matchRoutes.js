import express from 'express';
import { likeUser } from '../controllers/match/likeUser.controller.js';
import { passUser } from '../controllers/match/passUser.controller.js';
import { superLikeUser } from '../controllers/match/superLikeUser.controller.js';
import { getLikes } from '../controllers/match/getLikes.controller.js';
import { getMutualLikes } from '../controllers/match/getMutualLikes.controller.js';
import { unmatch } from '../controllers/match/unmatch.controller.js';
import { getSwipeHistory } from '../controllers/match/getSwipeHistory.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/like', authenticate, likeUser);
router.post('/pass', authenticate, passUser);
router.post('/super', authenticate, superLikeUser);
router.get('/likes', authenticate, getLikes);
router.get('/mutual', authenticate, getMutualLikes);
router.get('/swipes', authenticate, getSwipeHistory);
router.delete('/:matchId', authenticate, unmatch);

export default router;
