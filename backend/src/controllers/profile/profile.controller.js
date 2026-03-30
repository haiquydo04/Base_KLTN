/**
 * Profile Controller - Profile detail endpoint
 */

import mongoose from 'mongoose';
import { getFullProfile, getProfileById } from '../../services/profile.service.js';

/**
 * GET /api/v1/profiles/:userId/full
 * Get full profile detail with interaction state
 */
export const getProfileDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    // Cannot view own profile through this endpoint
    if (currentUserId && userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Use /me endpoint to view your own profile'
      });
    }

    // Get full profile
    const result = await getFullProfile(userId, currentUserId);

    if (result.error) {
      return res.status(result.status).json({ 
        success: false, 
        message: result.error 
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/profiles/:userId
 * Get basic profile info (public)
 */
export const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const result = await getProfileById(userId);

    if (result.error) {
      return res.status(result.status).json({ 
        success: false, 
        message: result.error 
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default { getProfileDetail, getProfile };
