/**
 * UserProfile Controller - Handle HTTP requests for profile management
 * PB06 - Personal Profile Management
 */

import {
  getProfileByUserId,
  createOrUpdateProfile,
  getProfileStats
} from '../services/userProfile.service.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/apiResponse.js';

/**
 * GET /api/profile
 * Get current user's profile
 * Requires authentication (JWT)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const profile = await getProfileByUserId(userId.toString());
    
    if (!profile) {
      return sendSuccess(res, {
        profile: null,
        message: 'Profile not found. Please create your profile.'
      });
    }

    return sendSuccess(res, {
      profile,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile
 * Create or update current user's profile
 * Requires authentication (JWT)
 * 
 * Body:
 * {
 *   fullName: string (required)
 *   gender: 'male' | 'female' | 'other' | ''
 *   dateOfBirth: ISO date string (required, age >= 18)
 *   bio: string
 *   preferences: {
 *     maxDistance: number (1-500 km)
 *     preferredAgeRange: { min: number, max: number }
 *     preferredGender: 'male' | 'female' | 'other' | 'all'
 *   }
 * }
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    // Validate required fields
    if (!profileData.fullName || profileData.fullName.trim() === '') {
      return sendValidationError(res, 'Full name is required and cannot be empty');
    }

    // Create or update profile
    const profile = await createOrUpdateProfile(userId.toString(), profileData);

    return sendSuccess(res, {
      profile,
      message: 'Profile saved successfully'
    }, 200);
  } catch (error) {
    // Handle validation errors
    if (error.message && (
      error.message.includes('must be at least 18') ||
      error.message.includes('minimum') ||
      error.message.includes('required') ||
      error.message.includes('cannot be empty') ||
      error.message.includes('cannot exceed') ||
      error.message.includes('must be one of') ||
      error.message.includes('Maximum age') ||
      error.message.includes('Date of birth')
    )) {
      return sendValidationError(res, error.message);
    }
    
    next(error);
  }
};

/**
 * GET /api/profile/stats
 * Get profile completion statistics
 * Requires authentication (JWT)
 */
export const getMyProfileStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const stats = await getProfileStats(userId.toString());

    return sendSuccess(res, {
      stats,
      message: 'Profile statistics retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyProfile,
  updateMyProfile,
  getMyProfileStats
};
