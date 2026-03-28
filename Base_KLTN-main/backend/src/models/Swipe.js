/**
 * Swipe Model - Schema mới (PB09)
 * Lưu trữ tương tác like/pass của user với profile khác
 */

import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema({
  swiperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  swipedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['like', 'pass'],
    required: true
  }
}, {
  timestamps: true
});

// Index: unique compound index để tránh duplicate swipe
swipeSchema.index({ swiperId: 1, swipedId: 1 }, { unique: true });
swipeSchema.index({ swiperId: 1 });
swipeSchema.index({ swipedId: 1 });

// Static: lấy swipe của user A với user B
swipeSchema.statics.findSwipe = function(swiperId, swipedId) {
  return this.findOne({
    swiperId,
    swipedId
  });
};

// Static: kiểm tra user A có like user B không
swipeSchema.statics.hasLiked = function(swiperId, swipedId) {
  return this.findOne({
    swiperId,
    swipedId,
    action: 'like'
  });
};

// Static: lấy danh sách user đã like
swipeSchema.statics.getLikedUsers = function(userId) {
  return this.find({
    swiperId: userId,
    action: 'like'
  }).populate('swipedId', '-password -passwordHash');
};

// Static: lấy danh sách user đã like mình
swipeSchema.statics.getUsersWhoLikedMe = function(userId) {
  return this.find({
    swipedId: userId,
    action: 'like'
  }).populate('swiperId', '-password -passwordHash');
};

// Static: kiểm tra mutual like
swipeSchema.statics.isMutualLike = async function(userId1, userId2) {
  const like1 = await this.findOne({
    swiperId: userId1,
    swipedId: userId2,
    action: 'like'
  });
  const like2 = await this.findOne({
    swiperId: userId2,
    swipedId: userId1,
    action: 'like'
  });
  return !!(like1 && like2);
};

export default mongoose.model('Swipe', swipeSchema);
