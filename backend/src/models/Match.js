import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

matchSchema.index({ users: 1 });

matchSchema.statics.findMatch = function(userId1, userId2) {
  return this.findOne({
    users: { $all: [userId1, userId2] },
    isActive: true
  });
};

export default mongoose.model('Match', matchSchema);

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này định nghĩa schema Match cho MongoDB.
Quản lý mối quan hệ "like" giữa 2 users trong ứng dụng dating.
Khi 2 users like nhau, tạo thành match (đôi).

Các field chính:
- users: Array ObjectId references đến User model
- lastActivity: Thời gian hoạt động cuối (dùng để sort)
- isActive: Trạng thái match (false khi unmatch)

Indexes:
- users: Index để tìm kiếm match theo user

Các methods:
- findMatch(): Static method tìm match giữa 2 users

Luồng hoạt động:
User A like User B → Tạo Match → User B like User A → Thành match (users.length = 2)

Ghi chú:
File này được sử dụng bởi matchController.js và messageController.js.
Khi users.length >= 2 thì là mutual match (2 bên đều like nhau).
*/
