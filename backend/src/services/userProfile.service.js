/**
 * UserProfile Service - Business logic for profile management
 * PB06 - Personal Profile Management
 */

import UserProfile from '../models/UserProfile.js';
import { validateProfileUpdate, calculateAge } from '../utils/profileValidator.js';

/**
 * Get user profile by userId
 * @param {string} userId - User ID
 * @returns {Object|null} Profile data or null if not found
 */
export const getProfileByUserId = async (userId) => {
  const profile = await UserProfile.findByUserId(userId);
  
  if (!profile) {
    return null;
  }
  
  return formatProfileResponse(profile);
};

/**
 * Create or update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to save
 * @returns {Object} Created/updated profile
 */
export const createOrUpdateProfile = async (userId, profileData) => {
  // Validate input data
  const validatedData = await validateProfileUpdate(profileData);
  
  // Check if profile exists
  let profile = await UserProfile.findByUserId(userId);
  
  if (profile) {
    // Update existing profile
    profile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          fullName: validatedData.fullName,
          gender: validatedData.gender,
          dateOfBirth: validatedData.dateOfBirth,
          bio: validatedData.bio,
          avatar: validatedData.avatar,
          photos: validatedData.photos,
          preferences: validatedData.preferences
        }
      },
      { new: true, runValidators: true }
    );
  } else {
    // Create new profile
    profile = new UserProfile({
      userId,
      fullName: validatedData.fullName,
      gender: validatedData.gender,
      dateOfBirth: validatedData.dateOfBirth,
      bio: validatedData.bio,
      avatar: validatedData.avatar,
      photos: validatedData.photos,
      preferences: validatedData.preferences
    });
    
    await profile.save();
  }
  
  return formatProfileResponse(profile);
};

/**
 * Update specific fields of profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Fields to update
 * @returns {Object|null} Updated profile or null
 */
export const partialUpdateProfile = async (userId, updateData) => {
  // Get existing profile
  const existingProfile = await UserProfile.findByUserId(userId);
  
  if (!existingProfile) {
    return null;
  }
  
  // Merge with existing data
  const mergedData = {
    fullName: updateData.fullName ?? existingProfile.fullName,
    gender: updateData.gender ?? existingProfile.gender,
    dateOfBirth: updateData.dateOfBirth ?? existingProfile.dateOfBirth,
    bio: updateData.bio ?? existingProfile.bio,
    avatar: updateData.avatar ?? existingProfile.avatar,
    photos: updateData.photos ?? existingProfile.photos,
    preferences: {
      maxDistance: updateData.preferences?.maxDistance ?? existingProfile.preferences.maxDistance,
      preferredAgeRange: {
        min: updateData.preferences?.preferredAgeRange?.min ?? existingProfile.preferences.preferredAgeRange.min,
        max: updateData.preferences?.preferredAgeRange?.max ?? existingProfile.preferences.preferredAgeRange.max
      },
      preferredGender: updateData.preferences?.preferredGender ?? existingProfile.preferences.preferredGender
    }
  };
  
  // Validate merged data
  const validatedData = await validateProfileUpdate(mergedData);
  
  // Update profile
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: validatedData },
    { new: true, runValidators: true }
  );
  
  return formatProfileResponse(updatedProfile);
};

/**
 * Delete user profile
 * @param {string} userId - User ID
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteProfile = async (userId) => {
  const result = await UserProfile.deleteOne({ userId });
  return result.deletedCount > 0;
};

/**
 * Check if profile exists for user
 * @param {string} userId - User ID
 * @returns {boolean} True if exists
 */
export const profileExists = async (userId) => {
  const count = await UserProfile.countDocuments({ userId });
  return count > 0;
};

/**
 * Format profile response for API
 * @param {Object} profile - Raw profile document
 * @returns {Object} Formatted profile
 */
const formatProfileResponse = (profile) => {
  if (!profile) return null;
  
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    fullName: profile.fullName,
    gender: profile.gender,
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : null,
    age: profile.age,
    bio: profile.bio,
    avatar: profile.avatar,
    photos: profile.photos || [],
    preferences: {
      maxDistance: profile.preferences?.maxDistance || 50,
      preferredAgeRange: {
        min: profile.preferences?.preferredAgeRange?.min || 18,
        max: profile.preferences?.preferredAgeRange?.max || 50
      },
      preferredGender: profile.preferences?.preferredGender || 'all'
    },
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
};

/**
 * Get profile statistics for a user
 * @param {string} userId - User ID
 * @returns {Object} Profile statistics
 */
export const getProfileStats = async (userId) => {
  const profile = await UserProfile.findByUserId(userId);
  
  if (!profile) {
    return {
      hasProfile: false,
      completionPercentage: 0,
      fieldsCompleted: []
    };
  }
  
  const fieldsCompleted = [];
  let completionPercentage = 0;
  
  if (profile.fullName && profile.fullName.trim() !== '') {
    fieldsCompleted.push('fullName');
    completionPercentage += 20;
  }
  
  if (profile.gender && profile.gender !== '') {
    fieldsCompleted.push('gender');
    completionPercentage += 10;
  }
  
  if (profile.dateOfBirth) {
    fieldsCompleted.push('dateOfBirth');
    completionPercentage += 15;
  }
  
  if (profile.bio && profile.bio.trim() !== '') {
    fieldsCompleted.push('bio');
    completionPercentage += 10;
  }
  
  if (profile.avatar && profile.avatar.trim() !== '') {
    fieldsCompleted.push('avatar');
    completionPercentage += 15;
  }
  
  if (profile.photos && profile.photos.length > 0) {
    fieldsCompleted.push('photos');
    completionPercentage += 15;
  }
  
  if (profile.preferences && 
      profile.preferences.preferredAgeRange && 
      profile.preferences.preferredGender) {
    fieldsCompleted.push('preferences');
    completionPercentage += 15;
  }
  
  return {
    hasProfile: true,
    completionPercentage: Math.min(completionPercentage, 100),
    fieldsCompleted,
    totalFields: 7
  };
};

export default {
  getProfileByUserId,
  createOrUpdateProfile,
  partialUpdateProfile,
  deleteProfile,
  profileExists,
  getProfileStats
};
