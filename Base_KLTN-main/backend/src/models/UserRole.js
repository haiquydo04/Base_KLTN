/**
 * UserRole Model - Schema mới
 * Lưu trữ mối quan hệ user - role
 */

import mongoose from 'mongoose';

const userRoleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
userRoleSchema.index({ roleId: 1 });

// Static: lấy roles của user
userRoleSchema.statics.getUserRoles = function(userId) {
  return this.find({ userId }).populate('roleId');
};

// Static: kiểm tra user có role không
userRoleSchema.statics.hasRole = async function(userId, roleName) {
  const roles = await this.find({ userId }).populate('roleId');
  return roles.some(r => r.roleId?.name === roleName);
};

export default mongoose.model('UserRole', userRoleSchema);
