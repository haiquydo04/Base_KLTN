# ===========================================
# ENV SETUP GUIDE - Hướng dẫn cài đặt biến môi trường
# ===========================================

## FRONTEND (.env)

### Development (frontend/.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Production - Vercel Environment Variables
```
VITE_API_URL=https://your-backend-api.onrender.com
```

---

## BACKEND (.env)

### Development (backend/.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dating-app
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Production - Koyeb Environment Variables
```
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dating-app
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

---

## CÁCH COPY

### Frontend:
```bash
cd frontend
copy .env.example .env
```

### Backend:
```bash
cd backend
copy .env.example .env
```

---

## LƯU Ý QUAN TRỌNG

1. **KHÔNG bao gồm file .env trong git commit**
2. **Production secrets**: Thêm vào Vercel/Koyeb Dashboard
3. **JWT Secret**: Bắt buộc phải thay đổi ở production
4. **OAuth URLs**: Callback URLs phải khớp với production domain
