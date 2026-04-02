/**
 * Tag Model - PB07: Quản lý sở thích cá nhân
 * Lưu trữ tags/interests
 */

import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Tag name must be at least 2 characters'],
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  },
  category: {
    type: String,
    default: 'general'
  },
  icon: {
    type: String,
    default: ''
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes - name has unique: true in schema, auto-creates index
// Additional indexes for querying
tagSchema.index({ category: 1 });
tagSchema.index({ usageCount: -1 });

// Static: find or create tag by name
tagSchema.statics.findOrCreateByName = async function(tagName) {
  const normalizedName = tagName.trim().toLowerCase();
  let tag = await this.findOne({ name: normalizedName });
  if (!tag) {
    tag = await this.create({ name: normalizedName });
  }
  return tag;
};

// Static: increment usage count
tagSchema.statics.incrementUsage = async function(tagIds) {
  await this.updateMany(
    { _id: { $in: tagIds } },
    { $inc: { usageCount: 1 } }
  );
};

// Static: decrement usage count
tagSchema.statics.decrementUsage = async function(tagIds) {
  await this.updateMany(
    { _id: { $in: tagIds } },
    { $inc: { usageCount: -1 } }
  );
};

export default mongoose.model('Tag', tagSchema);
