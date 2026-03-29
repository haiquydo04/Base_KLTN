/**
 * Conversation Model - Schema mới
 * Lưu trữ thông tin cuộc trò chuyện
 */

import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  // Thông tin bổ sung cho group
  name: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  // Cuộc trò chuyện liên quan đến match
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    default: null
  }
}, {
  timestamps: true
});

// Index
conversationSchema.index({ type: 1 });
conversationSchema.index({ matchId: 1 });

export default mongoose.model('Conversation', conversationSchema);
