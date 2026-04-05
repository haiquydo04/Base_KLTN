/**
 * Match Service - Business logic cho like/pass/match
 */

import User from '../models/User.js';
import Match from '../models/Match.js';
import Swipe from '../models/Swipe.js';

export const likeUser = async (swiperId, targetUserId) => {
  if (swiperId.toString() === targetUserId.toString()) {
    return { error: 'You cannot like yourself', status: 400 };
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return { error: 'User not found', status: 404 };

  await Swipe.findOneAndUpdate(
    { swiperId, swipedId: targetUserId },
    { swiperId, swipedId: targetUserId, action: 'like' },
    { upsert: true, new: true }
  );

  const mutualLike = await Swipe.isMutualLike(swiperId, targetUserId);

  if (mutualLike) {
    let match = await Match.findMatch(swiperId, targetUserId);

    if (!match) {
      match = await Match.create({
        user1Id: swiperId,
        user2Id: targetUserId,
        matchedAt: new Date()
      });
      await match.populate('user1Id user2Id', '-password -passwordHash');
    } else {
      match.isActive = true;
      match.matchedAt = new Date();
      await match.save();
    }

    return { matched: true, match, message: 'You have a new match!' };
  }

  return { matched: false, message: 'User liked successfully' };
};

export const passUser = async (swiperId, targetUserId) => {
  // ============================================
  // 🛠️ FIX: Thêm validation - kiểm tra user tồn tại
  // ============================================
  if (swiperId.toString() === targetUserId.toString()) {
    return { error: 'You cannot pass yourself', status: 400 };
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return { error: 'User not found', status: 404 };

  await Swipe.findOneAndUpdate(
    { swiperId, swipedId: targetUserId },
    { swiperId, swipedId: targetUserId, action: 'pass' },
    { upsert: true, new: true }
  );

  return { message: 'User passed' };
};

export const getLikedUsers = async (userId) => {
  const likedSwipes = await Swipe.getLikedUsers(userId);
  const likedUsers = likedSwipes
    .map(swipe => swipe.swipedId)
    .filter(Boolean);

  return { users: likedUsers };
};

export const getMutualMatches = async (userId) => {
  const matches = await Match.findUserMatches(userId);
  const mutualMatches = matches.filter(match => match.isActive !== false);

  const formattedMatches = mutualMatches.map(match => {
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

export const unmatchUser = async (userId, matchId) => {
  const match = await Match.findById(matchId);
  if (!match) return { error: 'Match not found', status: 404 };

  if (!match.hasUser(userId)) {
    return { error: 'Not authorized to unmatch', status: 403 };
  }

  match.isActive = false;
  await match.save();

  return { message: 'Unmatched successfully' };
};

export const getSwipeHistory = async (userId, { limit = 100 } = {}) => {
  const swipes = await Swipe.find({ swiperId: userId })
    .populate('swipedId', '-password -passwordHash')
    .sort({ createdAt: -1 })
    .limit(limit);

  return { swipes };
};

export default {
  likeUser,
  passUser,
  getLikedUsers,
  getMutualMatches,
  unmatchUser,
  getSwipeHistory
};
