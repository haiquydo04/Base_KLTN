/**
 * Block Model - Quản lý danh sách chặn người dùng
 */

import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blockedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
blockSchema.index({ userId: 1, createdAt: -1 });
blockSchema.index({ blockedId: 1 });

// Prevent duplicate blocks
blockSchema.index({ userId: 1, blockedId: 1 }, { unique: true });

// Static method to check if user A blocked user B
blockSchema.statics.isBlocked = async function(userId, blockedId) {
  const block = await this.findOne({ userId, blockedId });
  return !!block;
};

// Static method to get all blocked users
blockSchema.statics.getBlockedUsers = async function(userId) {
  const blocks = await this.find({ userId })
    .populate('blockedId', 'username fullName avatar')
    .sort({ createdAt: -1 });
  return blocks;
};

// Static method to get blocked user IDs (for filtering)
blockSchema.statics.getBlockedUserIds = async function(userId) {
  const blocks = await this.find({ userId }).select('blockedId');
  return blocks.map(b => b.blockedId);
};

// Static method to unblock a user
blockSchema.statics.unblock = async function(userId, blockedId) {
  const result = await this.deleteOne({ userId, blockedId });
  return result.deletedCount > 0;
};

const Block = mongoose.model('Block', blockSchema);

export default Block;