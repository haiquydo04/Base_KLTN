/**
 * Message Controller - Cập nhật cho schema mới
 * Backward compatible: hỗ trợ cả matchId và conversationId
 */

import Message from '../models/Message.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import ConversationMember from '../models/ConversationMember.js';

export const getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Kiểm tra quyền truy cập qua Match
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Kiểm tra user có trong match
    if (!match.hasUser(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages'
      });
    }

    // Lấy messages theo matchId (backward compatible)
    // Hoặc theo conversationId nếu có
    let conversationId = null;
    if (match.conversationId) {
      conversationId = match.conversationId;
    }

    const query = conversationId
      ? { conversationId }
      : { matchId }; // fallback to matchId

    const messages = await Message.find(query)
      .populate('sender senderId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(query);

    // Đánh dấu đã đọc
    await Message.updateMany(
      { ...query, sender: { $ne: req.user._id }, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true, status: 'seen' }
    );

    res.json({
      success: true,
      messages: messages.reverse(),
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

export const sendMessage = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { content, image, mediaUrl, messageType } = req.body;

    // Kiểm tra match tồn tại
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Kiểm tra user có trong match
    if (!match.hasUser(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages'
      });
    }

    // Tạo message mới
    const messageData = {
      senderId: req.user._id,
      sender: req.user._id, // backward compatible
      content,
      messageType: messageType || 'text',
      isRead: false,
      status: 'sent'
    };

    // Hỗ trợ cả image và mediaUrl
    if (image || mediaUrl) {
      messageData.image = image || mediaUrl;
      messageData.mediaUrl = mediaUrl || image;
      messageData.messageType = 'image';
    }

    // Nếu match có conversationId thì dùng conversationId
    if (match.conversationId) {
      messageData.conversationId = match.conversationId;
    } else {
      messageData.matchId = match._id; // backward compatible
    }

    const message = await Message.create(messageData);
    await message.populate('sender senderId', 'username avatar');

    // Cập nhật lastActivity của match
    match.lastActivity = new Date();
    await match.save();

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    // Lấy tất cả match của user
    const matches = await Match.findUserMatches(req.user._id);

    if (matches.length === 0) {
      return res.json({
        success: true,
        conversations: []
      });
    }

    const matchIds = matches.map(m => m._id);

    // Lấy last message cho mỗi match
    const lastMessages = await Message.aggregate([
      { $match: { matchId: { $in: matchIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$matchId',
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    const lastMessageMap = new Map(
      lastMessages.map(m => [m._id.toString(), m.lastMessage])
    );

    // Đếm unread messages
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          matchId: { $in: matchIds },
          sender: { $ne: req.user._id },
          senderId: { $ne: req.user._id },
          isRead: false
        }
      },
      {
        $group: {
          _id: '$matchId',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadCountMap = new Map(
      unreadCounts.map(u => [u._id.toString(), u.count])
    );

    // Lấy thông tin sender của last messages
    const senderIds = [...new Set(
      lastMessages
        .map(m => m.lastMessage?.senderId || m.lastMessage?.sender)
        .filter(Boolean)
        .map(id => id.toString())
    )];

    const senders = await User.find({ _id: { $in: senderIds } })
      .select('username avatar')
      .lean();

    const senderMap = new Map(
      senders.map(s => [s._id.toString(), s])
    );

    // Build conversation list
    const conversations = matches.map(match => {
      const otherUserId = match.getOtherUser(req.user._id);
      const lastMessage = lastMessageMap.get(match._id.toString());

      if (lastMessage && senderMap.has((lastMessage.senderId || lastMessage.sender)?.toString())) {
        lastMessage.sender = senderMap.get((lastMessage.senderId || lastMessage.sender).toString());
      }

      return {
        matchId: match._id,
        userId: otherUserId,
        lastMessage: lastMessage || null,
        unreadCount: unreadCountMap.get(match._id.toString()) || 0,
        lastActivity: match.lastActivity,
        matchedAt: match.matchedAt || match.createdAt
      };
    });

    // Populate user info
    const populatedConversations = await Match.populate(conversations, {
      path: 'userId',
      select: 'username avatar isOnline lastSeen -password -passwordHash'
    });

    res.json({
      success: true,
      conversations: populatedConversations
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { matchId } = req.params;

    // Kiểm tra match tồn tại
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Kiểm tra user có trong match
    if (!match.hasUser(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await Message.updateMany(
      { matchId, sender: { $ne: req.user._id }, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true, status: 'seen' }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};
