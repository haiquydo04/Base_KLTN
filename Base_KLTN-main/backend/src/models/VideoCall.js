/**
 * VideoCall Model - Schema mới (PB10)
 * Lưu trữ thông tin cuộc gọi video giữa 2 user
 */

import mongoose from 'mongoose';

const videoCallSchema = new mongoose.Schema({
  callerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0 // seconds
  },
  matchRequested: {
    type: Boolean,
    default: false
  },
  matchAccepted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'connected', 'ended', 'missed', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
videoCallSchema.index({ callerId: 1 });
videoCallSchema.index({ receiverId: 1 });
videoCallSchema.index({ status: 1 });

// Pre-save: tính duration nếu có startedAt và endedAt
videoCallSchema.pre('save', function(next) {
  if (this.startedAt && this.endedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  next();
});

export default mongoose.model('VideoCall', videoCallSchema);
