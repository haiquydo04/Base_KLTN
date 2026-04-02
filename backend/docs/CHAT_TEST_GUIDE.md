# Chat Realtime Module - Test Guide

## Cấu trúc API

### 1. REST API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| GET | `/api/messages/conversations` | Lấy danh sách cuộc trò chuyện | Required |
| GET | `/api/messages/:matchId` | Lấy tin nhắn trong cuộc trò chuyện | Required |
| POST | `/api/messages/:matchId` | Gửi tin nhắn mới | Required |
| PUT | `/api/messages/:matchId/read` | Đánh dấu đã đọc | Required |

### 2. Socket.IO Events

#### Client → Server
- `join_room` - Tham gia phòng chat (matchId)
- `leave_room` - Rời phòng chat (matchId)
- `send_message` - Gửi tin nhắn realtime
- `typing` - Đang nhập tin nhắn
- `stop_typing` - Ngừng nhập tin nhắn
- `message_read` - Đánh dấu đã đọc

#### Server → Client
- `receive_message` - Nhận tin nhắn mới
- `user_typing` - Người khác đang nhập
- `user_stop_typing` - Người khác ngừng nhập
- `messages_read` - Tin nhắn đã được đọc

---

## Test với cURL

### 1. Lấy Conversations

```bash
curl -X GET "http://localhost:5000/api/messages/conversations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "matchId": "...",
      "userId": { "_id": "...", "username": "...", "avatar": "..." },
      "lastMessage": { "content": "...", "createdAt": "..." },
      "unreadCount": 2,
      "lastActivity": "..."
    }
  ],
  "total": 5
}
```

### 2. Lấy Messages

```bash
curl -X GET "http://localhost:5000/api/messages/MATCH_ID?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "content": "Hello!",
      "sender": "...",
      "messageType": "text",
      "status": "seen",
      "isRead": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### 3. Gửi Message

```bash
curl -X POST "http://localhost:5000/api/messages/MATCH_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, how are you?"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "...",
    "content": "Hello, how are you?",
    "sender": "...",
    "messageType": "text",
    "status": "sent",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Đánh dấu đã đọc

```bash
curl -X PUT "http://localhost:5000/api/messages/MATCH_ID/read" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## Test với Socket.IO (JavaScript)

### Kết nối Socket

```javascript
// Client-side Socket.IO connection
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Tham gia phòng chat

```javascript
// Join chat room
const matchId = 'MATCH_ID';
socket.emit('join_room', matchId);

// Leave chat room
socket.emit('leave_room', matchId);
```

### Gửi tin nhắn realtime

```javascript
socket.emit('send_message', {
  matchId: 'MATCH_ID',
  content: 'Hello via Socket!',
  type: 'text'
});

// Listen for confirmation
socket.on('receive_message', (message) => {
  console.log('New message received:', message);
  // Update UI here
});

// Listen for errors
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

### Typing indicator

```javascript
// Notify I'm typing
socket.emit('typing', { matchId: 'MATCH_ID' });

// Notify stopped typing
socket.emit('stop_typing', { matchId: 'MATCH_ID' });

// Listen for other's typing
socket.on('user_typing', (data) => {
  console.log(`${data.user.username} is typing...`);
});

socket.on('user_stop_typing', (data) => {
  console.log(`${data.userId} stopped typing`);
});
```

### Đánh dấu đã đọc

```javascript
// Mark messages as read
socket.emit('message_read', { matchId: 'MATCH_ID' });

// Listen for read receipt
socket.on('messages_read', (data) => {
  console.log(`${data.reader.username} read your messages`);
});
```

---

## Test tự động với Node.js

```javascript
// test-chat.js - Automated test script
import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = 'YOUR_JWT_TOKEN';
const OTHER_TOKEN = 'OTHER_USER_JWT_TOKEN';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
});

async function testChatAPI() {
  console.log('=== Testing Chat API ===\n');

  // 1. Get conversations
  console.log('1. Getting conversations...');
  const convRes = await api.get('/api/messages/conversations');
  console.log('   Conversations:', convRes.data.conversations?.length || 0);

  if (convRes.data.conversations?.length > 0) {
    const matchId = convRes.data.conversations[0].matchId;

    // 2. Get messages
    console.log('\n2. Getting messages...');
    const msgRes = await api.get(`/api/messages/${matchId}`);
    console.log('   Messages:', msgRes.data.data?.length || 0);

    // 3. Send message
    console.log('\n3. Sending message...');
    const sendRes = await api.post(`/api/messages/${matchId}`, {
      content: 'Test message from automated script'
    });
    console.log('   Send result:', sendRes.data.success);

    // 4. Mark as read
    console.log('\n4. Marking as read...');
    const readRes = await api.put(`/api/messages/${matchId}/read`);
    console.log('   Read result:', readRes.data.success);
  }
}

async function testSocketIO() {
  console.log('\n=== Testing Socket.IO ===\n');

  const socket = io(BASE_URL, {
    auth: { token: TEST_TOKEN }
  });

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('1. Socket connected:', socket.id);

      // Join room
      const matchId = 'TEST_MATCH_ID';
      socket.emit('join_room', matchId);
      console.log('2. Joined room:', matchId);

      // Send message via socket
      socket.emit('send_message', {
        matchId,
        content: 'Socket message test',
        type: 'text'
      });

      // Listen for response
      socket.on('receive_message', (msg) => {
        console.log('3. Received message:', msg.content);
      });

      // Typing indicator
      socket.emit('typing', { matchId });
      console.log('4. Sent typing event');

      // Disconnect after test
      setTimeout(() => {
        socket.emit('leave_room', matchId);
        socket.disconnect();
        console.log('5. Disconnected');
        resolve();
      }, 2000);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      resolve();
    });
  });
}

// Run tests
(async () => {
  try {
    await testChatAPI();
    await testSocketIO();
    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
})();
```

---

## Checklist Test

### API Tests
- [ ] GET /api/messages/conversations - Trả về danh sách cuộc trò chuyện
- [ ] GET /api/messages/:matchId - Trả về tin nhắn với pagination
- [ ] POST /api/messages/:matchId - Tạo tin nhắn mới
- [ ] PUT /api/messages/:matchId/read - Cập nhật trạng thái đã đọc
- [ ] Response có success: true/false đúng
- [ ] HTTP status code đúng (200, 201, 400, 401, 403, 404)
- [ ] Không có lỗi xác thực (unauthorized access)

### Socket.IO Tests
- [ ] Kết nối với JWT token hợp lệ
- [ ] Từ chối kết nối với token không hợp lệ
- [ ] join_room tham gia đúng phòng
- [ ] leave_room rời khỏi phòng
- [ ] send_message gửi và broadcast đúng
- [ ] receive_message nhận tin nhắn realtime
- [ ] typing/stop_typing hoạt động
- [ ] message_read cập nhật trạng thái
- [ ] messages_read thông báo cho người gửi
- [ ] disconnect cập nhật online status

### Edge Cases
- [ ] Gửi message khi không có match
- [ ] Gửi message với nội dung rỗng
- [ ] Gửi message quá 1000 ký tự
- [ ] Lấy messages với page không tồn tại
- [ ] Socket disconnect đột ngột
- [ ] Reconnect sau khi disconnect

---

## Common Issues

### 1. Socket không kết nối được
```javascript
// Kiểm tra CORS config ở server
io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### 2. Message không broadcast
- Kiểm tra user đã join_room chưa
- Kiểm tra match.users có đúng user id không

### 3. Không nhận được realtime message
- Kiểm tra client đã lắng nghe event đúng chưa
- Kiểm tra socket đang connected

### 4. Token hết hạn
- Implement token refresh
- Xử lý reconnect với token mới
