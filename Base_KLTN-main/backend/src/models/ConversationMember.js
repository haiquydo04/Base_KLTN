/**
 * ConversationMember Model - Schema mới
 * Lưu trữ thông tin thành viên trong cuộc trò chuyện
 */

import mongoose from 'mongoose';

const conversationMemberSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'admin', 'owner'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  // Tin nhắn chưa đọc
  unreadCount: {
    type: Number,
    default: 0
  },
  // Tin nhắn đã xem lần cuối
  lastReadAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
conversationMemberSchema.index({ conversationId: 1, userId: 1 }, { unique: true });
conversationMemberSchema.index({ userId: 1 });

// Static: lấy conversation của user
conversationMemberSchema.statics.getUserConversations = function(userId) {
  return this.find({ userId })
    .populate('conversationId')
    .sort({ updatedAt: -1 });
};

export default mongoose.model('ConversationMember', conversationMemberSchema);
