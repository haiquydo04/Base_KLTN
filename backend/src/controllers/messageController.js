import Message from '../models/Message.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

export const getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

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
        message: 'Not authorized to view messages'
      });
    }

    const messages = await Message.find({ matchId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ matchId });

    await Message.updateMany(
      { matchId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true }
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
    const { content, image, messageType } = req.body;

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
        message: 'Not authorized to send messages'
      });
    }

    const message = await Message.create({
      matchId,
      sender: req.user._id,
      content,
      image,
      messageType: messageType || 'text'
    });

    await message.populate('sender', 'username avatar');

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
    const matches = await Match.find({
      users: req.user._id,
      isActive: true
    })
    .populate('users', 'username avatar isOnline lastSeen')
    .sort({ lastActivity: -1 });

    if (matches.length === 0) {
      return res.json({
        success: true,
        conversations: []
      });
    }

    const matchIds = matches.map(m => m._id);

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

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          matchId: { $in: matchIds },
          sender: { $ne: req.user._id },
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

    const senderIds = [...new Set(
      lastMessages
        .map(m => m.lastMessage?.sender)
        .filter(Boolean)
    )];

    const senders = await User.find({ _id: { $in: senderIds } })
      .select('username avatar')
      .lean();

    const senderMap = new Map(
      senders.map(s => [s._id.toString(), s])
    );

    const conversations = matches.map(match => {
      const otherUser = match.users.find(
        u => u._id.toString() !== req.user._id.toString()
      );

      const lastMessage = lastMessageMap.get(match._id.toString());
      if (lastMessage && senderMap.has(lastMessage.sender?.toString())) {
        lastMessage.sender = senderMap.get(lastMessage.sender.toString());
      }

      return {
        matchId: match._id,
        user: otherUser,
        lastMessage: lastMessage || null,
        unreadCount: unreadCountMap.get(match._id.toString()) || 0,
        lastActivity: match.lastActivity
      };
    });

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
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
        message: 'Not authorized'
      });
    }

    await Message.updateMany(
      { matchId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này chứa các controller xử lý các chức năng liên quan đến tin nhắn:
lấy tin nhắn theo match, gửi tin nhắn, lấy danh sáchvà đánh dấu tin nhắn conversations,
 đã đọc.

Các function chính:
- getMessages(): Lấy danh sách tin nhắn của một match với phân trang.
  Tự động đánh dấu tất cả tin nhắn chưa đọc là đã đọc.
- sendMessage(): Gửi tin nhắn mới, cập nhật lastActivity của match.
- getConversations(): Lấy danh sách tất cả các cuộc trò chuyện.
  Đã được tối ưu sử dụng MongoDB aggregation để tránh N+1 query.
- markAsRead(): Đánh dấu tất cả tin nhắn trong match là đã đọc.

Luồng hoạt động:
Client → GET/POST /api/messages/:matchId → Controller xử lý
→ Kiểm tra quyền (là thành viên của match) → Model (Message, Match)
→ MongoDB → Response

Ghi chú:
File này được sử dụng bởi messageRoutes.js.
getConversations sử dụng aggregation pipeline để lấy lastMessage và unreadCount
cho tất cả matches trong một query duy nhất thay vì N+1 queries.
*/
