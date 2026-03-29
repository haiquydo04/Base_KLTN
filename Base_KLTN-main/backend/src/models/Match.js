/**
 * Match Model - Schema mới
 * Sử dụng user1Id, user2Id thay vì users array
 * Backward compatible với code cũ sử dụng users
 */

import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  // Schema mới: user1Id và user2Id
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Backward compatible: hỗ trợ users array
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  matchedAt: {
    type: Date,
    default: Date.now
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
matchSchema.index({ users: 1 });
matchSchema.index({ lastActivity: -1 });

// Virtual để lấy danh sách user IDs
matchSchema.virtual('userIds').get(function() {
  if (this.user1Id && this.user2Id) {
    return [this.user1Id, this.user2Id];
  }
  return this.users || [];
});

// Pre-save: sync users array với user1Id, user2Id
matchSchema.pre('save', function(next) {
  if (this.user1Id && this.user2Id) {
    // Đảm bảo user1Id < user2Id để query consistent
    if (this.user1Id.toString() > this.user2Id.toString()) {
      const temp = this.user1Id;
      this.user1Id = this.user2Id;
      this.user2Id = temp;
    }
    
    // Cập nhật users array để backward compatible
    if (!this.users || this.users.length === 0) {
      this.users = [this.user1Id, this.user2Id];
    }
  }
  next();
});

// Static method: tìm match giữa 2 user
matchSchema.statics.findMatch = function(userId1, userId2) {
  const id1 = userId1.toString();
  const id2 = userId2.toString();
  
  // Tìm match với user1Id < user2Id
  const [smallerId, largerId] = id1 < id2 ? [id1, id2] : [id2, id1];
  
  return this.findOne({
    user1Id: new mongoose.Types.ObjectId(smallerId),
    user2Id: new mongoose.Types.ObjectId(largerId),
    isActive: true
  });
};

// Static method: tìm tất cả match của một user
matchSchema.statics.findUserMatches = function(userId) {
  return this.find({
    $or: [
      { user1Id: userId },
      { user2Id: userId }
    ],
    isActive: true
  }).populate('user1Id user2Id', '-password -passwordHash');
};

// Kiểm tra user có trong match không
matchSchema.methods.hasUser = function(userId) {
  const id = userId.toString();
  return (
    this.user1Id?.toString() === id ||
    this.user2Id?.toString() === id ||
    this.users?.some(u => u.toString() === id)
  );
};

// Lấy user kia trong match
matchSchema.methods.getOtherUser = function(userId) {
  const id = userId.toString();
  if (this.user1Id?.toString() === id) return this.user2Id;
  if (this.user2Id?.toString() === id) return this.user1Id;
  return null;
};

// Transform output
matchSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Thêm users array để backward compatible
    if (doc.user1Id && doc.user2Id) {
      ret.users = [doc.user1Id, doc.user2Id];
    }
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Match', matchSchema);
