/**
 * Tag Model - Schema mới
 * Lưu trữ tags/interests
 */

import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    sparse: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['interest', 'occupation', 'location', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['active', 'hidden'],
    default: 'active'
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index
tagSchema.index({ name: 1 });

export default mongoose.model('Tag', tagSchema);
