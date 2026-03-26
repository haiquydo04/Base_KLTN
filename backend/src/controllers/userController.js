/**
 * User Controller - Cập nhật cho schema mới
 * Sử dụng Swipe model cho recommendations
 */

import User from '../models/User.js';
import Match from '../models/Match.js';
import Swipe from '../models/Swipe.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const query = {
      _id: { $ne: req.user._id },
      age: { 
        $gte: currentUser.preferences?.minAge || 18, 
        $lte: currentUser.preferences?.maxAge || 100 
      }
    };

    if (currentUser.preferences?.gender && currentUser.preferences.gender !== 'both') {
      query.gender = currentUser.preferences.gender;
    }

    const users = await User.find(query)
      .select('-password -passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'fullName', 'age', 'gender', 'bio', 'interests', 'location',
      'occupation', 'education', 'height', 'drinking', 'smoking',
      'lookingFor', 'preferences', 'photos'
    ];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    // Recalculate profile completion
    user.profileCompletion = user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getUserMatches = async (req, res, next) => {
  try {
    const matches = await Match.findUserMatches(req.user._id);

    const matchesWithOtherUser = matches.map(match => {
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

export const getRecommendedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Lấy danh sách user đã swipe (cả like và pass)
    const swipedByMe = await Swipe.find({ swiperId: req.user._id }).select('swipedId');
    const swipedUserIds = swipedByMe.map(s => s.swipedId);
    
    // Lấy danh sách user đã match
    const myMatches = await Match.findUserMatches(req.user._id);
    const matchedUserIds = myMatches.map(m => m.user1Id?.toString() === req.user._id.toString() ? m.user2Id : m.user1Id);
    
    const excludeIds = [...new Set([
      req.user._id.toString(),
      ...swipedUserIds.map(id => id.toString()),
      ...matchedUserIds.map(id => id?.toString()).filter(Boolean)
    ])];

    const query = {
      _id: { $nin: excludeIds },
      age: { 
        $gte: currentUser.preferences?.minAge || 18, 
        $lte: currentUser.preferences?.maxAge || 100 
      }
    };

    if (currentUser.preferences?.gender && currentUser.preferences.gender !== 'both') {
      query.gender = currentUser.preferences.gender;
    }

    const users = await User.find(query)
      .select('-password -passwordHash')
      .sort({ isFake: 1, fakeScore: 1, createdAt: -1 }) // Ưu tiên user thật
      .limit(20);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách user đã like (sử dụng Swipe model)
export const getLikedUsers = async (req, res, next) => {
  try {
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

// Lấy danh sách user đã like mình
export const getUsersWhoLikedMe = async (req, res, next) => {
  try {
    const likedBySwipes = await Swipe.getUsersWhoLikedMe(req.user._id);
    
    const usersWhoLikedMe = likedBySwipes
      .map(swipe => swipe.swiperId)
      .filter(Boolean);

    res.json({
      success: true,
      users: usersWhoLikedMe
    });
  } catch (error) {
    next(error);
  }
};
