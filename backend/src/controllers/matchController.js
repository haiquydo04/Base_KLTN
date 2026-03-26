/**
 * Match Controller - Cập nhật cho schema mới (PB09)
 * Sử dụng Swipe model để lưu tương tác like/pass
 */

import User from '../models/User.js';
import Match from '../models/Match.js';
import Swipe from '../models/Swipe.js';

export const likeUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot like yourself'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Tạo swipe record
    await Swipe.findOneAndUpdate(
      { swiperId: currentUserId, swipedId: userId },
      { swiperId: currentUserId, swipedId: userId, action: 'like' },
      { upsert: true, new: true }
    );

    // Kiểm tra mutual like
    const mutualLike = await Swipe.isMutualLike(currentUserId, userId);

    if (mutualLike) {
      // Tạo match nếu chưa có
      let match = await Match.findMatch(currentUserId, userId);

      if (!match) {
        match = await Match.create({
          user1Id: currentUserId,
          user2Id: userId,
          matchedAt: new Date()
        });
        await match.populate('user1Id user2Id', '-password -passwordHash');
      } else {
        match.isActive = true;
        match.matchedAt = new Date();
        await match.save();
      }

      return res.json({
        success: true,
        matched: true,
        match,
        message: 'You have a new match!'
      });
    }

    res.json({
      success: true,
      matched: false,
      message: 'User liked successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const passUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Tạo swipe record với action = pass
    await Swipe.findOneAndUpdate(
      { swiperId: currentUserId, swipedId: userId },
      { swiperId: currentUserId, swipedId: userId, action: 'pass' },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'User passed'
    });
  } catch (error) {
    next(error);
  }
};

export const getLikes = async (req, res, next) => {
  try {
    // Lấy danh sách user đã like (dùng Swipe)
    const likedSwipes = await Swipe.getLikedUsers(req.user._id);

    const likedUsers = likedSwipes
      .map(swipe => swipe.swipedId)
      .filter(Boolean);

    res.json({
      success: true,
      users: likedUsers
    });
  } catch (error) {
    next(error);
  }
};

export const getMutualLikes = async (req, res, next) => {
  try {
    // Lấy tất cả match của user (2 chiều đều like nhau)
    const matches = await Match.findUserMatches(req.user._id);

    const mutualMatches = matches.filter(match => match.isActive !== false);

    const matchesWithOtherUser = mutualMatches.map(match => {
      const otherUserId = match.getOtherUser(req.user._id);
      return {
        _id: match._id,
        matchId: match._id,
        userId: otherUserId,
        matchedAt: match.matchedAt || match.createdAt,
        lastActivity: match.lastActivity,
        createdAt: match.createdAt
      };
    });

    // Populate user info
    const populatedMatches = await Match.populate(matchesWithOtherUser, {
      path: 'userId',
      select: '-password -passwordHash'
    });

    res.json({
      success: true,
      matches: populatedMatches
    });
  } catch (error) {
    next(error);
  }
};

export const unmatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Kiểm tra user có trong match không
    if (!match.hasUser(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unmatch'
      });
    }

    match.isActive = false;
    await match.save();

    res.json({
      success: true,
      message: 'Unmatched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get swipe history (PB09)
export const getSwipeHistory = async (req, res, next) => {
  try {
    const swipes = await Swipe.find({ swiperId: req.user._id })
      .populate('swipedId', '-password -passwordHash')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      swipes
    });
  } catch (error) {
    next(error);
  }
};
