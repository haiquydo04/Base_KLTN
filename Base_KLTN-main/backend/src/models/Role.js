/**
 * Role Model - Schema mới
 * Lưu trữ vai trò của user
 */

import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    sparse: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index
roleSchema.index({ name: 1 });

// Static: get role by name
roleSchema.statics.getByName = function(name) {
  return this.findOne({ name });
};

export default mongoose.model('Role', roleSchema);
