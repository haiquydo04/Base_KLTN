import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String },

  facebookId: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  loginMethod: { type: String, enum: ['email', 'facebook', 'google'], required: true },

  fullName: String,

  role: { type: String, default: 'user' },

  lastLogin: Date,
  failedAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },

  // OTP
  otpCode: String,
  otpExpiresAt: Date,
  isEmailVerified: { type: Boolean, default: false },

  // KYC
  kycStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  isVerifiedProfile: { type: Boolean, default: false }

}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);

const TagSchema = new mongoose.Schema({
  name: { type: String, unique: true }
}, { timestamps: true });

export const Tag = mongoose.model('Tag', TagSchema);

const UserTagSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }
}, { timestamps: true });

export const UserTag = mongoose.model('UserTag', UserTagSchema);

const SavedFilterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  minAge: Number,
  maxAge: Number,
  gender: String,
  maxDistance: Number,
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
}, { timestamps: true });

export const SavedFilter = mongoose.model('SavedFilter', SavedFilterSchema);

const SwipeSchema = new mongoose.Schema({
  swiperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  swipedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, enum: ['like', 'pass'] }
}, { timestamps: true });

export const Swipe = mongoose.model('Swipe', SwipeSchema);

const MatchSchema = new mongoose.Schema({
  user1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

export const Match = mongoose.model('Match', MatchSchema);

const VideoCallSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startedAt: Date,
  endedAt: Date,
  matchRequested: { type: Boolean, default: false },
  matchAccepted: { type: Boolean, default: false }
}, { timestamps: true });

export const VideoCall = mongoose.model('VideoCall', VideoCallSchema);

const ConversationSchema = new mongoose.Schema({
  type: { type: String, default: 'private' }
}, { timestamps: true });

export const Conversation = mongoose.model('Conversation', ConversationSchema);

const ConversationMemberSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date, default: Date.now }
});

export const ConversationMember = mongoose.model('ConversationMember', ConversationMemberSchema);

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  mediaUrl: String,
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' }
}, { timestamps: true });

export const Message = mongoose.model('Message', MessageSchema);

const AdminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  deviceInfo: String
}, { timestamps: true });

export const AdminLog = mongoose.model('AdminLog', AdminLogSchema);

const RoleSchema = new mongoose.Schema({
  name: String,
  description: String
});

export const Role = mongoose.model('Role', RoleSchema);

const UserRoleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  assignedAt: { type: Date, default: Date.now }
});

export const UserRole = mongoose.model('UserRole', UserRoleSchema);