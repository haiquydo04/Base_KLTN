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
    default: 'general'
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
