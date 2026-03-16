import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() { return !this.image; },
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  image: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text'
  }
}, {
  timestamps: true
});

messageSchema.index({ matchId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export default mongoose.model('Message', messageSchema);

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này định nghĩa schema Message cho MongoDB.
Lưu trữ tin nhắn trong các cuộc trò chuyện (matches).

Các field chính:
- matchId: Reference đến Match model
- sender: Reference đến User model (người gửi)
- content: Nội dung tin nhắn (text)
- image: URL hình ảnh (optional)
- isRead: Trạng thái đã đọc/chưa đọc
- messageType: Loại message (text, image, system)

Indexes:
- matchId + createdAt: compound index cho pagination và sort
- sender: Index cho tìm kiếm theo người gửi

Luồng hoạt động:
User gửi tin nhắn → Lưu vào MongoDB → Socket emit cho recipient

Ghi chú:
File này được sử dụng bởi messageController.js và socket/index.js.
Khi messageType là 'system' thì là tin nhắn hệ thống (vd: "User A và User B đã match")
*/
