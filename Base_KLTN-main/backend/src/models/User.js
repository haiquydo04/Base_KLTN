/**
 * User Model - Schema mới
 * Hỗ trợ: passwordHash, loginMethod, facebookId, googleId
 * Backward compatible với field "password"
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Thông tin đăng nhập
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  // Schema mới: passwordHash
  passwordHash: {
    type: String,
    select: false // Mặc định không select password
  },
  
  // Backward compatible: hỗ trợ cả "password" (sẽ được migrate)
  password: {
    type: String,
    select: false
  },
  
  // Social login
  facebookId: {
    type: String,
    sparse: true,
    default: null
  },
  googleId: {
    type: String,
    sparse: true,
    default: null
  },
  loginMethod: {
    type: String,
    enum: ['email', 'facebook', 'google'],
    default: 'email'
  },
  
  // Thông tin cá nhân
  fullName: {
    type: String,
    trim: true,
    maxlength: [50, 'Full name cannot exceed 50 characters']
  },
  age: {
    type: Number,
    min: [18, 'You must be at least 18 years old'],
    max: [100, 'Age cannot exceed 100']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  photos: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  location: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    min: [100, 'Height must be at least 100cm'],
    max: [250, 'Height cannot exceed 250cm']
  },
  drinking: {
    type: String,
    enum: ['never', 'sometimes', 'often', ''],
    default: ''
  },
  smoking: {
    type: String,
    enum: ['never', 'sometimes', 'often', ''],
    default: ''
  },
  lookingFor: {
    type: String,
    enum: ['relationship', 'friendship', 'casual', ''],
    default: ''
  },
  
  // Preferences
  preferences: {
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
    }
  },
  
  // Trạng thái online
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Role & Security
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastLogin: {
    type: Date
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  
  // OTP & Verification
  otpCode: String,
  otpExpiresAt: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Password Reset OTP (separate from email verification)
  resetOTP: {
    type: String,
    default: null
  },
  resetOtpExpire: {
    type: Date,
    default: null
  },
  
  // KYC
  kycStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified'
  },
  isVerifiedProfile: {
    type: Boolean,
    default: false
  },
  
  // Fake account detection (từ schema cũ)
  isFake: {
    type: Boolean,
    default: false
  },
  fakeScore: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'banned', 'inactive'],
    default: 'active'
  },
  
  // Profile completion (computed)
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ username: 'text' });
userSchema.index({ email: 1 });
userSchema.index({ facebookId: 1 });
userSchema.index({ googleId: 1 });

// Virtual field để backward compatibility
userSchema.virtual('password_field').get(function() {
  return this.passwordHash || this.password;
});

// Method so sánh password
userSchema.methods.matchPassword = async function(enteredPassword) {
  const hashToCompare = this.passwordHash || this.password;
  if (!hashToCompare) return false;
  return await bcrypt.compare(enteredPassword, hashToCompare);
};

// Transform output - loại bỏ password
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordHash;
  return obj;
};

// Tính profile completion
userSchema.methods.calculateProfileCompletion = function() {
  const user = this;
  let score = 0;

  if (user.avatar && user.avatar.trim() !== '') score += 20;
  if (user.bio && user.bio.trim() !== '') score += 10;
  if (user.age) score += 10;
  if (user.location && user.location.trim() !== '') score += 10;
  if (user.interests && user.interests.length > 0) score += 10;
  if (user.photos && user.photos.length >= 2) score += 20;
  if (user.occupation && user.occupation.trim() !== '') score += 10;
  if (user.education && user.education.trim() !== '') score += 10;
  if (user.gender && user.lookingFor) score += 10;

  return Math.min(score, 100);
};

// Pre-save: hash password và tính profile completion
userSchema.pre('save', async function(next) {
  // Hash password mới
  if (this.isModified('password') || (this.isModified('passwordHash') && this.passwordHash && !this.passwordHash.startsWith('$2'))) {
    const salt = await bcrypt.genSalt(10);
    // Hỗ trợ cả password và passwordHash
    const pass = this.passwordHash || this.password;
    if (pass && !pass.startsWith('$2')) {
      this.passwordHash = await bcrypt.hash(pass, salt);
    }
  }
  
  // Tính profile completion
  if (!this.profileCompletion || this.profileCompletion === 0) {
    this.profileCompletion = this.calculateProfileCompletion();
  }
  
  next();
});

// Static method: tìm user bằng email hoặc username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password +passwordHash');
};

// Static method: tìm user bằng social ID
userSchema.statics.findByFacebookId = function(facebookId) {
  return this.findOne({ facebookId });
};

userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

export default mongoose.model('User', userSchema);
