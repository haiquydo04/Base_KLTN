# Deployment Configuration Guide

## 1. Backend - Koyeb Deployment

### Create .env File
Tạo file `backend/.env` với nội dung:

```bash
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dating-app

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d

# Frontend URLs (Development)
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Google OAuth (Development)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth (Development)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Create .env.production File (for Koyeb)
Tạo file `backend/.env.production` với nội dung:

```bash
# Server
NODE_ENV=production
PORT=5000

# MongoDB (Atlas hoặc Koyeb Managed MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dating-app

# JWT - BẮT BUỘC phải đặt giá trị thật (tối thiểu 32 ký tự)
JWT_SECRET=your-production-jwt-secret-must-be-random-64-chars
JWT_EXPIRE=7d

# Frontend URLs (Production)
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your-google-client-id-production
GOOGLE_CLIENT_SECRET=your-google-client-secret-production
GOOGLE_CALLBACK_URL=https://your-backend.koyeb.app/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Edit các giá trị thật:
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Random string (tối thiểu 32 ký tự)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `FRONTEND_URL`: Domain Vercel của frontend
- `CLOUDINARY_*`: Cloudinary credentials

## 2. Frontend - Vercel Deployment

### Create .env File (for local development)
Tạo file `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_MODE=development
```

### Create .env.production File (for Vercel)
Tạo file `frontend/.env.production`:

```bash
# Thay your-backend.koyeb.app bằng URL thật của backend Koyeb
VITE_API_URL=https://your-backend.koyeb.app
VITE_API_BASE_URL=https://your-backend.koyeb.app
VITE_SOCKET_URL=https://your-backend.koyeb.app
VITE_APP_MODE=production
```

### Environment Variables in Vercel Dashboard
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add the same variables from .env.production:
   - `VITE_API_URL` = Backend Koyeb URL
   - `VITE_API_BASE_URL` = Backend Koyeb URL
   - `VITE_SOCKET_URL` = Backend Koyeb URL
   - `VITE_APP_MODE` = production

## 3. Vercel.json Configuration
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.koyeb.app/api/:path*"
    },
    {
      "source": "/uploads/:path*",
      "destination": "https://your-backend.koyeb.app/uploads/:path*"
    },
    {
      "source": "/socket.io/:path*",
      "destination": "https://your-backend.koyeb.app/socket.io/:path*"
    }
  ]
}
```

## 4. Local Development

### Backend
```bash
cd backend
# Tạo .env từ nội dung bên trên
npm run dev
```

### Frontend
```bash
cd frontend
# Tạo .env từ nội dung bên trên
npm run dev
```

## 5. Koyeb Deployment (koyeb.yaml)

File `backend/koyeb.yaml` đã được tạo sẵn. Deploy bằng:
```bash
# Koyeb CLI
koyeb app create -f backend/koyeb.yaml

# Hoặc dùng dashboard Koyeb
# 1. Create new App
# 2. Connect GitHub repo
# 3. Set build command: npm install
# 4. Set run command: npm start
# 5. Add Environment Variables từ .env.production
```

## 6. Key Environment Variables Summary

| Variable | Development | Production |
|----------|-------------|------------|
| NODE_ENV | development | production |
| PORT | 5000 | 5000 |
| MONGODB_URI | mongodb://localhost:27017/... | MongoDB Atlas URI |
| FRONTEND_URL | http://localhost:5173 | https://your-app.vercel.app |
| ALLOWED_ORIGINS | http://localhost:5173 | https://your-app.vercel.app |
| VITE_API_URL | http://localhost:5000 | https://your-backend.koyeb.app |
| VITE_SOCKET_URL | http://localhost:5000 | https://your-backend.koyeb.app |

## 7. Troubleshooting

### Lỗi CORS
- Kiểm tra `ALLOWED_ORIGINS` trong backend/.env có chứa frontend URL
- Frontend URL phải khớp chính xác (bao gồm https://)

### Lỗi Cookie/Session
- Trong development: `secure=false`, `sameSite='lax'`
- Trong production: `secure=true`, `sameSite='none'` (cần HTTPS)

### Lỗi kết nối API
- Kiểm tra VITE_API_URL đúng format
- Kiểm tra backend đang chạy
- Kiểm tra CORS configuration
