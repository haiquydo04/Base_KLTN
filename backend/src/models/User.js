import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
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
    enum: ['male', 'female', 'other']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
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
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
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
      enum: ['male', 'female', 'both'],
      default: 'both'
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isFake: {
    type: Boolean,
    default: false
  },
  fakeScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

userSchema.index({ username: 'text' });
userSchema.index({ email: 1 });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

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

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  this.profileCompletion = this.calculateProfileCompletion();
  next();
});

userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.$set) {
    update.$set.profileCompletion = calculateProfileCompletionFromObject(update.$set);
  }
  next();
});

function calculateProfileCompletionFromObject(user) {
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
}

export default mongoose.model('User', userSchema);

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này định nghĩa schema User cho MongoDB sử dụng Mongoose.
Lưu trữ thông tin người dùng bao gồm: thông tin cá nhân, preferences,
trạng thái online/offline, và các trường cho fake account detection.

Các field chính:
- username, email, password: Thông tin đăng nhập
- fullName, age, gender, bio, avatar: Thông tin profile
- interests: Mảng string lưu sở thích
- location: Địa điểm
- preferences: Object chứa preferences tìm kiếm (minAge, maxAge, gender)
- isOnline, lastSeen: Trạng thái hoạt động
- isFake, fakeScore: Trường cho fake account detection (AI scoring)

Các methods:
- matchPassword(): So sánh password với hash
- toJSON(): Loại bỏ password khi convert sang JSON

Indexes:
- username: text index cho tìm kiếm
- email: unique index

Luồng hoạt động:
Controller → Model → MongoDB → Response

Ghi chú:
File này được sử dụng bởi tất cả các controllers (auth, user, match, message, socket).
Pre-save middleware tự động hash password khi tạo/cập nhật user.
*/
