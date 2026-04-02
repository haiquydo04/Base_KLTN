/**
 * UserTag Model - PB07: Quản lý sở thích cá nhân
 * Lưu trữ mối quan hệ user - tag
 */

import mongoose from 'mongoose';

const userTagSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: [true, 'Tag ID is required']
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate user-tag pairs
userTagSchema.index({ userId: 1, tagId: 1 }, { unique: true });
userTagSchema.index({ tagId: 1 });

// Static: get all tags for a user
userTagSchema.statics.getUserTags = function(userId) {
  return this.find({ userId })
    .populate({
      path: 'tagId',
      select: 'name category icon'
    })
    .then(results => results.map(r => r.tagId).filter(Boolean));
};

// Static: set user's tags (replace all)
userTagSchema.statics.setUserTags = async function(userId, tagIds) {
  // Remove all existing tags for user
  await this.deleteMany({ userId });

  // Create new user-tag relationships
  const userTags = tagIds.map(tagId => ({
    userId,
    tagId
  }));

  if (userTags.length > 0) {
    await this.insertMany(userTags, { ordered: false });
  }
};

// Static: check if user has a specific tag
userTagSchema.statics.userHasTag = async function(userId, tagId) {
  const exists = await this.findOne({ userId, tagId });
  return !!exists;
};

export default mongoose.model('UserTag', userTagSchema);
