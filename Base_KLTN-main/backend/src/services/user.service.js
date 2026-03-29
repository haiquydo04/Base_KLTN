/**
 * User Service - Business logic cho user/profile
 */

import User from '../models/User.js';
import Match from '../models/Match.js';
import Swipe from '../models/Swipe.js';

const SAFE_FIELDS = [
  'fullName', 'age', 'gender', 'bio', 'interests', 'location',
  'occupation', 'education', 'height', 'drinking', 'smoking',
  'lookingFor', 'preferences', 'photos'
];

const buildUserQuery = (currentUser, extraExcludeIds = []) => {
  const query = {
    _id: { $ne: currentUser._id, $nin: extraExcludeIds },
    age: {
      $gte: currentUser.preferences?.minAge || 18,
      $lte: currentUser.preferences?.maxAge || 100
    }
  };

  if (currentUser.preferences?.gender && currentUser.preferences.gender !== 'both') {
    query.gender = currentUser.preferences.gender;
  }

  return query;
};

export const getAllUsers = async (userId, { page = 1, limit = 20 } = {}) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) return { error: 'User not found', status: 404 };

  const skip = (page - 1) * limit;
  const query = buildUserQuery(currentUser);

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

export const getUserById = async (targetUserId) => {
  const user = await User.findById(targetUserId).select('-password -passwordHash');
  if (!user) return { error: 'User not found', status: 404 };
  return { user };
};

export const updateUserProfile = async (userId, updates, file) => {
  const sanitized = {};
  SAFE_FIELDS.forEach(field => {
    if (updates[field] !== undefined) sanitized[field] = updates[field];
  });

  if (file) {
    sanitized.avatar = `/uploads/${file.filename}`;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    sanitized,
    { new: true, runValidators: true }
  );

  if (!user) return { error: 'User not found', status: 404 };

  user.profileCompletion = user.calculateProfileCompletion();
  await user.save();

  return { user };
};

export const getUserMatches = async (userId) => {
  const matches = await Match.findUserMatches(userId);

  const formattedMatches = matches.map(match => {
    const otherUserId = match.getOtherUser(userId);
    return {
      _id: match._id,
      matchId: match._id,
      userId: otherUserId,
      matchedAt: match.matchedAt || match.createdAt,
      lastActivity: match.lastActivity,
      createdAt: match.createdAt
    };
  });

  const populatedMatches = await Match.populate(formattedMatches, {
    path: 'userId',
    select: '-password -passwordHash'
  });

  return { matches: populatedMatches };
};

export const getRecommendedUsers = async (userId) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) return { error: 'User not found', status: 404 };

  const swipedByMe = await Swipe.find({ swiperId: userId }).select('swipedId');
  const swipedUserIds = swipedByMe.map(s => s.swipedId);

  const myMatches = await Match.findUserMatches(userId);
  const matchedUserIds = myMatches.map(m =>
    m.user1Id?.toString() === userId.toString() ? m.user2Id : m.user1Id
  );

  const excludeIds = [...new Set([
    userId.toString(),
    ...swipedUserIds.map(id => id.toString()),
    ...matchedUserIds.map(id => id?.toString()).filter(Boolean)
  ])];

  const query = buildUserQuery(currentUser, excludeIds);

  const users = await User.find(query)
    .select('-password -passwordHash')
    .sort({ isFake: 1, fakeScore: 1, createdAt: -1 })
    .limit(20);

  return { users };
};

export default {
  getAllUsers,
  getUserById,
  updateUserProfile,
  getUserMatches,
  getRecommendedUsers
};
