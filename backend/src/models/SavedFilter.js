/**
 * SavedFilter Model - Schema mới
 * Lưu trữ bộ lọc đã lưu của user
 */

import mongoose from 'mongoose';

const savedFilterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  minAge: {
    type: Number,
    default: 18
  },
  maxAge: {
    type: Number,
    default: 50
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'both', ''],
    default: 'both'
  },
  maxDistance: {
    type: Number,
    default: 50 // km
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }]
}, {
  timestamps: true
});

// Index
savedFilterSchema.index({ userId: 1 });

export default mongoose.model('SavedFilter', savedFilterSchema);
