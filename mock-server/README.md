# 🎭 LoveAI Mock Server

Mock backend server để test frontend trước khi có backend thật.

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies
```bash
cd mock-server
npm install
```

### 2. Chạy server
```bash
npm start
# Hoặc chạy với watch mode:
npm run dev
```

Server sẽ chạy tại `http://localhost:3001`

### 3. Cấu hình Frontend

Thêm file `.env` trong thư mục `frontend/`:
```env
VITE_API_URL=http://localhost:3001
```

### 4. Test các tính năng

- **Đăng nhập**: Email bất kỳ + password (tối thiểu 6 ký tự)
- **Đăng ký**: Username + Email + Password
- **Discover**: Mock 5 users với avatar từ pravatar.cc
- **Matches**: 2 mock conversations
- **Messages**: Tin nhắn mock cho mỗi conversation
- **Like/SuperLike**: 50-80% chance match (random)

## 📡 API Endpoints Mocked

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/google` | OAuth Google (mock) |
| GET | `/api/auth/facebook` | OAuth Facebook (mock) |

### Users
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/users/recommendations` | Lấy danh sách gợi ý |
| GET | `/api/users/:userId` | Lấy thông tin user |
| PUT | `/api/users/profile` | Cập nhật profile |
| GET | `/api/users/matches` | Lấy danh sách matches |

### Matches
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/matches/like/:userId` | Thích user |
| POST | `/api/matches/super-like/:userId` | Super like |
| POST | `/api/matches/pass/:userId` | Bỏ qua user |
| DELETE | `/api/matches/:matchId` | Hủy kết nối |

### Messages
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/messages/:matchId` | Lấy tin nhắn |
| POST | `/api/messages/:matchId` | Gửi tin nhắn |
| POST | `/api/messages/:matchId/read` | Đánh dấu đã đọc |

### Upload
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/upload/avatar` | Upload avatar |
| POST | `/api/upload/media` | Upload media |

## 📝 Lưu ý

- Mock server **không ảnh hưởng** đến backend thật
- Dữ liệu sẽ reset khi restart server
- Token sẽ hết hạn khi server restart
- Phù hợp để test UI và flow trước khi deploy Vercel

## 🎯 Deploy Vercel Test

1. **Vercel Dashboard** → Import project
2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-mock-server.vercel.app
   ```
3. **Deploy!**

Hoặc deploy mock server lên Vercel trước:
```bash
cd mock-server
vercel --prod
```

Sau đó lấy URL mock server vào `VITE_API_URL` cho frontend.
