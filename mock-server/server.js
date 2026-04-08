import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ============================================
// MOCK DATA
// ============================================

const mockUsers = [
  {
    _id: 'user1',
    username: 'minh_love',
    email: 'minh@example.com',
    fullName: 'Nguyễn Minh',
    avatar: 'https://i.pravatar.cc/150?img=1',
    photos: [
      'https://i.pravatar.cc/400?img=1',
      'https://i.pravatar.cc/400?img=2',
      'https://i.pravatar.cc/400?img=3'
    ],
    bio: 'Yêu AI và công nghệ 💕',
    age: 25,
    gender: 'male',
    interests: ['Công nghệ', 'Âm nhạc', 'Du lịch'],
    location: { lat: 10.8231, lng: 106.6297, locationText: 'TP. Hồ Chí Minh' },
    preferences: { minAge: 20, maxAge: 30, maxDistance: 50 },
    aiScore: 92,
    isOnline: true,
    createdAt: new Date()
  },
  {
    _id: 'user2',
    username: 'linh_rose',
    email: 'linh@example.com',
    fullName: 'Trần Linh',
    avatar: 'https://i.pravatar.cc/150?img=5',
    photos: [
      'https://i.pravatar.cc/400?img=5',
      'https://i.pravatar.cc/400?img=6',
      'https://i.pravatar.cc/400?img=7'
    ],
    bio: 'Tìm kiếm tình yêu chân thành ❤️',
    age: 23,
    gender: 'female',
    interests: ['Nghệ thuật', 'Đọc sách', 'Yoga'],
    location: { lat: 10.8231, lng: 106.6297, locationText: 'TP. Hồ Chí Minh' },
    preferences: { minAge: 22, maxAge: 28, maxDistance: 30 },
    aiScore: 88,
    isOnline: false,
    createdAt: new Date()
  },
  {
    _id: 'user3',
    username: 'tuấn_star',
    email: 'tuan@example.com',
    fullName: 'Lê Tuấn',
    avatar: 'https://i.pravatar.cc/150?img=3',
    photos: [
      'https://i.pravatar.cc/400?img=3',
      'https://i.pravatar.cc/400?img=8',
      'https://i.pravatar.cc/400?img=9'
    ],
    bio: 'Người lạnh lùng nhưng ấm áp bên trong ❄️🔥',
    age: 27,
    gender: 'male',
    interests: ['Thể thao', 'Game', 'Phim ảnh'],
    location: { lat: 21.0285, lng: 105.8542, locationText: 'Hà Nội' },
    preferences: { minAge: 20, maxAge: 26, maxDistance: 100 },
    aiScore: 85,
    isOnline: true,
    createdAt: new Date()
  },
  {
    _id: 'user4',
    username: 'huyền_moon',
    email: 'huyen@example.com',
    fullName: 'Phạm Huyền',
    avatar: 'https://i.pravatar.cc/150?img=9',
    photos: [
      'https://i.pravatar.cc/400?img=9',
      'https://i.pravatar.cc/400?img=10',
      'https://i.pravatar.cc/400?img=11'
    ],
    bio: 'Sống là để yêu thương 💫',
    age: 24,
    gender: 'female',
    interests: ['Âm nhạc', 'Nấu ăn', 'Photography'],
    location: { lat: 10.8231, lng: 106.6297, locationText: 'TP. Hồ Chí Minh' },
    preferences: { minAge: 24, maxAge: 32, maxDistance: 40 },
    aiScore: 90,
    isOnline: true,
    createdAt: new Date()
  },
  {
    _id: 'user5',
    username: 'khoa_tech',
    email: 'khoa@example.com',
    fullName: 'Đặng Khoa',
    avatar: 'https://i.pravatar.cc/150?img=12',
    photos: [
      'https://i.pravatar.cc/400?img=12',
      'https://i.pravatar.cc/400?img=13',
      'https://i.pravatar.cc/400?img=14'
    ],
    bio: 'Developer by day, musician by night 🎸',
    age: 26,
    gender: 'male',
    interests: ['Lập trình', 'Âm nhạc', 'Coffee'],
    location: { lat: 10.8231, lng: 106.6297, locationText: 'TP. Hồ Chí Minh' },
    preferences: { minAge: 21, maxAge: 27, maxDistance: 50 },
    aiScore: 87,
    isOnline: false,
    createdAt: new Date()
  }
];

const mockConversations = [
  {
    _id: 'conv1',
    users: [
      { _id: 'currentUser', username: 'you', avatar: 'https://i.pravatar.cc/150?img=20' },
      { _id: 'user2', username: 'linh_rose', avatar: 'https://i.pravatar.cc/150?img=5' }
    ],
    lastMessage: {
      content: 'Rất vui được trò chuyện với bạn!',
      sender: 'user2',
      createdAt: new Date(Date.now() - 3600000)
    },
    unreadCount: 1,
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    _id: 'conv2',
    users: [
      { _id: 'currentUser', username: 'you', avatar: 'https://i.pravatar.cc/150?img=20' },
      { _id: 'user4', username: 'huyền_moon', avatar: 'https://i.pravatar.cc/150?img=9' }
    ],
    lastMessage: {
      content: 'Hẹn gặp bạn cuối tuần nha! 😊',
      sender: 'currentUser',
      createdAt: new Date(Date.now() - 7200000)
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 172800000)
  }
];

const mockMessages = {
  conv1: [
    { _id: 'm1', sender: { _id: 'user2', username: 'linh_rose' }, content: 'Chào bạn! Mình thấy profile của bạn rất thú vị 👋', type: 'text', status: 'seen', createdAt: new Date(Date.now() - 7200000) },
    { _id: 'm2', sender: { _id: 'currentUser', username: 'you' }, content: 'Cảm ơn bạn! Mình cũng nghĩ bạn rất dễ thương 😊', type: 'text', status: 'seen', createdAt: new Date(Date.now() - 7000000) },
    { _id: 'm3', sender: { _id: 'user2', username: 'linh_rose' }, content: 'Bạn thích làm gì trong thời gian rảnh?', type: 'text', status: 'seen', createdAt: new Date(Date.now() - 6800000) },
    { _id: 'm4', sender: { _id: 'currentUser', username: 'you' }, content: 'Mình thích đọc sách và nghe nhạc. Còn bạn?', type: 'text', status: 'seen', createdAt: new Date(Date.now() - 6600000) },
    { _id: 'm5', sender: { _id: 'user2', username: 'linh_rose' }, content: 'Mình thích nấu ăn và chụp ảnh 📸', type: 'text', status: 'seen', createdAt: new Date(Date.now() - 6400000) },
    { _id: 'm6', sender: { _id: 'user2', username: 'linh_rose' }, content: 'Rất vui được trò chuyện với bạn!', type: 'text', status: 'delivered', createdAt: new Date(Date.now() - 3600000) }
  ],
  conv2: [
    { _id: 'm7', sender: { _id: 'user4', username: 'huyền_moon' }, content: 'Hey! Khám phá xong chưa? 😄', type: 'text', status: 'seen', createdAt: new Date(Date.now() - 86400000) },
    { _id: 'm8', sender: { _id: 'currentUser', username: 'you' }, content: 'Rất thú vị! Bạn có muốn trò chuyện không?', type: 'text', status: 'seen', createdAt: new Date(Date.now() - 86000000) },
    { _id: 'm9', sender: { _id: 'user4', username: 'huyền_moon' }, content: 'Được chứ! Mình cũng đang tìm người để trò chuyện 💕', type: 'text', status: 'seen', createdAt: new Date(Date.now() - 85000000) },
    { _id: 'm10', sender: { _id: 'currentUser', username: 'you' }, content: 'Hẹn gặp bạn cuối tuần nha! 😊', type: 'text', status: 'read', createdAt: new Date(Date.now() - 7200000) }
  ]
};

// Token store (simple mock)
const validTokens = new Set();
const tokenUsers = new Map();

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateToken = () => `mock_token_${Math.random().toString(36).substring(2, 15)}`;
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.user = tokenUsers.get(token);
  next();
};

// ============================================
// AUTH ROUTES
// ============================================

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { email, username, password } = req.body;
  
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' });
  }
  
  const token = generateToken();
  validTokens.add(token);
  
  const newUser = {
    _id: generateId(),
    email,
    username,
    fullName: username,
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    bio: '',
    interests: [],
    age: 25,
    gender: 'male',
    createdAt: new Date()
  };
  
  tokenUsers.set(token, newUser);
  
  res.json({
    success: true,
    token,
    user: newUser
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  }
  
  const token = generateToken();
  validTokens.add(token);
  
  const mockUser = {
    _id: 'currentUser',
    email: email,
    username: email.split('@')[0],
    fullName: 'Test User',
    avatar: 'https://i.pravatar.cc/150?img=20',
    bio: 'Đây là tài khoản test',
    interests: ['Công nghệ', 'Âm nhạc'],
    age: 25,
    gender: 'male',
    createdAt: new Date()
  };
  
  tokenUsers.set(token, mockUser);
  
  res.json({
    success: true,
    token,
    user: mockUser
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  validTokens.delete(token);
  tokenUsers.delete(token);
  res.json({ success: true });
});

// Google OAuth (mock redirect)
app.get('/api/auth/google', (req, res) => {
  res.redirect('/auth/callback?token=mock_google_token');
});

// Facebook OAuth (mock redirect)
app.get('/api/auth/facebook', (req, res) => {
  res.redirect('/auth/callback?token=mock_facebook_token');
});

// ============================================
// USER ROUTES
// ============================================

// GET /api/users/recommendations
app.get('/api/users/recommendations', authMiddleware, (req, res) => {
  const { refresh } = req.query;
  
  // Simulate AI matching delay
  setTimeout(() => {
    res.json({
      success: true,
      users: mockUsers,
      message: 'AI đã phân tích và đề xuất những người phù hợp nhất'
    });
  }, 500);
});

// GET /api/users/:userId
app.get('/api/users/:userId', authMiddleware, (req, res) => {
  const user = mockUsers.find(u => u._id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
  
  res.json({ user });
});

// PUT /api/users/profile
app.put('/api/users/profile', authMiddleware, (req, res) => {
  const updates = req.body;
  const updatedUser = { ...req.user, ...updates };
  tokenUsers.set(req.headers.authorization?.replace('Bearer ', ''), updatedUser);
  
  res.json({
    success: true,
    user: updatedUser
  });
});

// GET /api/users/matches
app.get('/api/users/matches', authMiddleware, (req, res) => {
  res.json({
    success: true,
    matches: mockConversations
  });
});

// ============================================
// MATCH ROUTES
// ============================================

// POST /api/matches/like/:userId
app.post('/api/matches/like/:userId', authMiddleware, (req, res) => {
  const { userId } = req.params;
  const likedUser = mockUsers.find(u => u._id === userId);
  
  if (!likedUser) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
  
  // 50% chance of match
  const isMatch = Math.random() > 0.5;
  
  res.json({
    success: true,
    matched: isMatch,
    message: isMatch ? 'Chúc mừng! Đây là một pair! 🎉' : 'Đã thích thành công',
    matchId: isMatch ? `conv_${userId}` : null
  });
});

// POST /api/matches/super-like/:userId
app.post('/api/matches/super-like/:userId', authMiddleware, (req, res) => {
  const { userId } = req.params;
  const likedUser = mockUsers.find(u => u._id === userId);
  
  if (!likedUser) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
  
  // 80% chance of super match
  const isSuperMatch = Math.random() > 0.2;
  
  res.json({
    success: true,
    matched: isSuperMatch,
    isSuperMatch,
    message: isSuperMatch ? 'Wow! Super Match! 💖' : 'Super like đã được gửi',
    matchId: isSuperMatch ? `conv_${userId}` : null
  });
});

// POST /api/matches/pass/:userId
app.post('/api/matches/pass/:userId', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Đã bỏ qua người dùng này'
  });
});

// DELETE /api/matches/:matchId
app.delete('/api/matches/:matchId', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Đã hủy kết nối'
  });
});

// ============================================
// MESSAGE ROUTES
// ============================================

// GET /api/messages/:matchId
app.get('/api/messages/:matchId', authMiddleware, (req, res) => {
  const { matchId } = req.params;
  const { page = 1 } = req.query;
  
  const messages = mockMessages[matchId] || [];
  const pageSize = 50;
  const start = (page - 1) * pageSize;
  const paginatedMessages = messages.slice(start, start + pageSize);
  
  res.json({
    success: true,
    messages: paginatedMessages,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(messages.length / pageSize),
      hasMore: start + pageSize < messages.length
    }
  });
});

// POST /api/messages/:matchId
app.post('/api/messages/:matchId', authMiddleware, (req, res) => {
  const { matchId } = req.params;
  const { content, type = 'text' } = req.body;
  
  if (!content?.trim()) {
    return res.status(400).json({ message: 'Nội dung tin nhắn không được trống' });
  }
  
  const newMessage = {
    _id: generateId(),
    sender: { _id: req.user._id, username: req.user.username },
    content,
    type,
    status: 'sent',
    createdAt: new Date()
  };
  
  if (!mockMessages[matchId]) {
    mockMessages[matchId] = [];
  }
  mockMessages[matchId].push(newMessage);
  
  res.json({
    success: true,
    data: newMessage
  });
});

// POST /api/messages/:matchId/read
app.post('/api/messages/:matchId/read', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Đã đánh dấu đã đọc'
  });
});

// ============================================
// DISCOVERY ROUTES
// ============================================

// GET /api/discovery
app.get('/api/discovery', authMiddleware, (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  
  res.json({
    success: true,
    users: mockUsers,
    total: mockUsers.length
  });
});

// ============================================
// INTERESTS ROUTES
// ============================================

// PUT /api/interests
app.put('/api/interests', authMiddleware, (req, res) => {
  const { interests } = req.body;
  
  res.json({
    success: true,
    message: 'Đã cập nhật sở thích'
  });
});

// ============================================
// UPLOAD ROUTES (Mock)
// ============================================

// POST /api/upload/avatar
app.post('/api/upload/avatar', authMiddleware, (req, res) => {
  res.json({
    success: true,
    url: 'https://i.pravatar.cc/150?img=25'
  });
});

// POST /api/upload/media
app.post('/api/upload/media', authMiddleware, (req, res) => {
  res.json({
    success: true,
    url: 'https://i.pravatar.cc/400?img=30'
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'mock'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🎭 Mock Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📍 Mode: Mock (không ảnh hưởng backend thật)`);
  console.log(`\nCác endpoint mock:`);
  console.log(`  Auth: /api/auth/login, /api/auth/register`);
  console.log(`  Users: /api/users/recommendations, /api/users/:id`);
  console.log(`  Matches: /api/matches/like/:id, /api/matches/super-like/:id`);
  console.log(`  Messages: /api/messages/:matchId`);
});
