/**
 * Discovery Routes
 * Location-based user discovery
 */

import express from 'express';
import { updateLocation, discoverUsers } from '../controllers/discovery/discovery.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Update user's location
router.post('/update-location', updateLocation);

// Get nearby users for discovery
router.get('/discovery', discoverUsers);

export default router;
