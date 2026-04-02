/**
 * Message Model - Schema mới
 * Backward compatible với field "sender" thay vì "senderId"
 * và "mediaUrl" thay vì "image"
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // conversationId: optional cho schema mới
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  // matchId: cho backward compatible
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  // Schema mới: senderId
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Backward compatible: hỗ trợ "sender"
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  content: {
    type: String,
    required: function() { return !this.mediaUrl; },
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Schema mới: mediaUrl
  mediaUrl: {
    type: String,
    default: null
  },
  
  // Backward compatible: hỗ trợ "image"
  image: {
    type: String
  },
  
  // Schema mới: status thay vì isRead
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  },
  
  // Backward compatible: hỗ trợ "isRead"
  isRead: {
    type: Boolean,
    default: false
  },
  
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'system'],
    default: 'text'
  }
}, {
  timestamps: true,
  // Cho phép query theo matchId
  strict: false
});

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ matchId: 1, createdAt: -1 }); // Query by matchId
messageSchema.index({ senderId: 1 });
messageSchema.index({ 'senderId': 1, 'isRead': 1 }); // Unread messages

// Virtual: lấy sender ID (backward compatible)
messageSchema.virtual('senderField').get(function() {
  return this.senderId || this.sender;
});

// Pre-save: sync sender với senderId
messageSchema.pre('save', function(next) {
  if (this.senderId && !this.sender) {
    this.sender = this.senderId;
  }
  // Sync mediaUrl với image cho backward compatible
  if (this.mediaUrl && !this.image) {
    this.image = this.mediaUrl;
  }
  // Sync isRead với status
  if (this.isRead && this.status === 'sent') {
    this.status = 'seen';
  }
  next();
});

// Transform output
messageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Thêm sender để backward compatible
    if (doc.senderId) {
      ret.sender = doc.senderId;
    }
    // Thêm mediaUrl để backward compatible
    if (doc.image) {
      ret.mediaUrl = doc.image;
    }
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Message', messageSchema);
