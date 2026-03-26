/**
 * UserTag Model - Schema mới
 * Lưu trữ mối quan hệ user - tag
 */

import mongoose from 'mongoose';

const userTagSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true
  }
}, {
  timestamps: true
});

// Index
userTagSchema.index({ userId: 1, tagId: 1 }, { unique: true });
userTagSchema.index({ tagId: 1 });

// Static: lấy tags của user
userTagSchema.statics.getUserTags = function(userId) {
  return this.find({ userId }).populate('tagId');
};

// Static: lấy users theo tag
userTagSchema.statics.getUsersByTag = function(tagId) {
  return this.find({ tagId }).populate('userId');
};

export default mongoose.model('UserTag', userTagSchema);
