/**
 * AdminLog Model - Schema mới
 * Lưu trữ nhật ký hành động admin
 */

import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    default: ''
  },
  deviceInfo: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index
adminLogSchema.index({ adminId: 1 });
adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ action: 1 });

// Static: log hành động admin
adminLogSchema.statics.logAction = async function(adminId, action, options = {}) {
  return this.create({
    adminId,
    action,
    targetId: options.targetId,
    description: options.description || '',
    deviceInfo: options.deviceInfo || '',
    metadata: options.metadata || {}
  });
};

export default mongoose.model('AdminLog', adminLogSchema);
