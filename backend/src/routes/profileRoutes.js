/**
 * Profile Routes - API v1
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getProfileDetail, getProfile } from '../controllers/profile/profile.controller.js';
import { getProfileStats } from '../controllers/profile/profileStats.controller.js';

const router = Router();

/**
 * GET /api/profile/stats
 * Get profile completion stats (requires auth)
 */
router.get('/stats', authenticate, getProfileStats);

/**
 * GET /api/v1/profiles/:userId/full
 * Get full profile detail with interaction state (requires auth)
 */
router.get('/:userId/full', authenticate, getProfileDetail);

/**
 * GET /api/v1/profiles/:userId
 * Get basic profile info (public)
 */
router.get('/:userId', authenticate, getProfile);

export default router;
