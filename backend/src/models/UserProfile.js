/**
 * UserProfile Model - Quản lý hồ sơ cá nhân và tiêu chí tìm kiếm
 * PB06 - Personal Profile Management
 */

import mongoose from 'mongoose';

const preferredAgeRangeSchema = new mongoose.Schema({
  min: {
    type: Number,
    min: [18, 'Minimum age must be at least 18'],
    max: [100, 'Maximum age cannot exceed 100'],
    default: 18
  },
  max: {
    type: Number,
    min: [18, 'Minimum age must be at least 18'],
    max: [100, 'Maximum age cannot exceed 100'],
    default: 50
  }
}, { _id: false });

const preferencesSchema = new mongoose.Schema({
  maxDistance: {
    type: Number,
    min: [1, 'Maximum distance must be at least 1 km'],
    max: [500, 'Maximum distance cannot exceed 500 km'],
    default: 50
  },
  preferredAgeRange: {
    type: preferredAgeRangeSchema,
    default: () => ({ min: 18, max: 50 })
  },
  preferredGender: {
    type: String,
    enum: ['male', 'female', 'other', 'all'],
    default: 'all'
  }
}, { _id: false });

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    default: ''
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },
  avatar: {
    type: String,
    default: ''
  },
  photos: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
userProfileSchema.index({ userId: 1 });

// Virtual field: calculate age from dateOfBirth
userProfileSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to validate preferred age range
userProfileSchema.methods.validateAgeRange = function() {
  const { min, max } = this.preferences.preferredAgeRange;
  return min <= max;
};

// Static method: find profile by userId
userProfileSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

// Transform output
userProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
