import User from '../models/User.js';
import Match from '../models/Match.js';

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

    const existingMatch = await Match.findMatch(currentUserId, userId);
    
    if (existingMatch) {
      if (!existingMatch.users.includes(currentUserId)) {
        existingMatch.users.push(currentUserId);
        await existingMatch.save();
      }
      
      return res.json({
        success: true,
        matched: true,
        match: existingMatch,
        message: 'You have a new match!'
      });
    }

    const newMatch = await Match.create({
      users: [currentUserId, userId]
    });

    await newMatch.populate('users', '-password');

    res.status(201).json({
      success: true,
      matched: false,
      match: newMatch,
      message: 'User liked successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const passUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

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
    const matches = await Match.find({
      users: req.user._id
    }).populate('users', '-password');

    const likedUsers = matches
      .filter(match => match.users.length >= 1)
      .map(match => {
        const otherUser = match.users.find(
          user => user._id.toString() !== req.user._id.toString()
        );
        return otherUser;
      })
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
    const matches = await Match.find({
      users: req.user._id,
      isActive: true
    }).populate('users', '-password');

    const mutualMatches = matches.filter(match => match.users.length === 2);

    const matchesWithOtherUser = mutualMatches.map(match => {
      const otherUser = match.users.find(
        user => user._id.toString() !== req.user._id.toString()
      );
      return {
        _id: match._id,
        user: otherUser,
        lastActivity: match.lastActivity,
        createdAt: match.createdAt
      };
    });

    res.json({
      success: true,
      matches: matchesWithOtherUser
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

    if (!match.users.includes(req.user._id)) {
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

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này chứa các controller xử lý các chức năng liên quan đến match (đôi):
like user, pass user (bỏ qua), lấy danh sách user đã like,
lấy danh sách mutual matches (2 người đều like nhau), và unmatch.

Các function chính:
- likeUser(): Xử lý like một user.
  - Nếu user đã like mình trước đó → tạo mutual match (matched: true)
  - Nếu chưa → tạo match mới (matched: false)
- passUser(): Xử lý khi user bỏ qua một profile (hiện tại chỉ trả về success)
- getLikes(): Lấy danh sách tất cả user mà current user đã like
- getMutualLikes(): Lấy danh sách mutual matches (những người đã match với mình)
- unmatch(): Hủy match với một user (đặt isActive = false)

Luồng hoạt động:
Client → POST /api/match/like → Controller xử lý
→ Kiểm tra user tồn tại → Kiểm tra match đã tồn tại chưa
→ Tạo/Cập nhật Match → Response

Ghi chú:
File này được sử dụng bởi matchRoutes.js.
likeUser kiểm tra 2 chiều: A like B tạo match, sau đó B like A tạo mutual match.
getMutualLikes lọc các match có users.length === 2 (2 người).
*/
