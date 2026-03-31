/**
 * UserProfile Routes - RESTful API for profile management
 * PB06 - Personal Profile Management
 * 
 * Base path: /api/profile
 * All routes require authentication (JWT)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMyProfile,
  updateMyProfile,
  getMyProfileStats
} from '../controllers/userProfile/userProfile.controller.js';

const router = Router();

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private (requires JWT)
 * @returns {Object} Profile data or null if not created
 * 
 * @example Response (success):
 * {
 *   success: true,
 *   data: {
 *     profile: { ... },
 *     message: 'Profile retrieved successfully'
 *   }
 * }
 */
router.get('/', authenticate, getMyProfile);

/**
 * @route   PUT /api/profile
 * @desc    Create or update current user's profile
 * @access  Private (requires JWT)
 * @body    {Object} Profile data (see below)
 * @returns {Object} Updated profile
 * 
 * @body Example:
 * {
 *   "fullName": "John Doe",
 *   "gender": "male",
 *   "dateOfBirth": "1995-05-15",
 *   "bio": "Hello, I'm John!",
 *   "preferences": {
 *     "maxDistance": 50,
 *     "preferredAgeRange": { "min": 20, "max": 35 },
 *     "preferredGender": "female"
 *   }
 * }
 * 
 * @validation:
 * - fullName: required, string, max 100 chars
 * - dateOfBirth: required, valid ISO date, age >= 18
 * - gender: optional, one of 'male', 'female', 'other', ''
 * - bio: optional, string, max 1000 chars
 * - preferences.maxDistance: optional, number, 1-500 km
 * - preferences.preferredAgeRange.min: optional, number, 18-100
 * - preferences.preferredAgeRange.max: optional, number, 18-100
 * - preferences.preferredGender: optional, one of 'male', 'female', 'other', 'all'
 * 
 * @example Response (success):
 * {
 *   success: true,
 *   data: {
 *     profile: { ... },
 *     message: 'Profile saved successfully'
 *   }
 * }
 */
router.put('/', authenticate, updateMyProfile);

/**
 * @route   GET /api/profile/stats
 * @desc    Get profile completion statistics
 * @access  Private (requires JWT)
 * @returns {Object} Profile completion stats
 * 
 * @example Response:
 * {
 *   success: true,
 *   data: {
 *     stats: {
 *       hasProfile: true,
 *       completionPercentage: 85,
 *       fieldsCompleted: ['fullName', 'gender', 'dateOfBirth', ...],
 *       totalFields: 7
 *     }
 *   }
 * }
 */
router.get('/stats', authenticate, getMyProfileStats);

export default router;
