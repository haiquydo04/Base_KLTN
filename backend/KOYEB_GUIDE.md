# ===========================================
# KOYEB DEPLOYMENT GUIDE
# ===========================================
# Backend API deploy lên Koyeb
# Hướng dẫn chi tiết: https://www.koyeb.com/docs
# ===========================================

## Cách deploy:

### Cách 1: GitHub Repository (Khuyến nghị)

1. **Push code lên GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend API"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dating-app-backend.git
   git push -u origin main
   ```

2. **Tạo App trên Koyeb:**
   - Truy cập https://app.koyeb.com
   - Click "Create App"
   - Chọn "GitHub" provider
   - Kết nối repository `dating-app-backend`
   - Branch: `main`
   - Build Command: `npm install`
   - Run Command: `node src/index.js`
   
3. **Cấu hình Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://haiquydo2311:pKOo4Ilt0uCo9YQK@cluster0.h1h6jsj.mongodb.net/dating-app?retryWrites=true&w=majority
   JWT_SECRET=super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend.vercel.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend.koyeb.app/api/auth/google/callback
   CLOUDINARY_CLOUD_NAME=dypovuszy
   CLOUDINARY_API_KEY=165271557935533
   CLOUDINARY_API_SECRET=lbnFb_Leqi8qy2PF0tUzUqKTIaY
   MAX_FILE_SIZE=5242880
   ```

4. **Instance Type:** Nano (Free tier)

5. **Health Check:** `/api/health`

6. **Deploy!**


### Cách 2: Docker Image

1. Build image:
   ```bash
   docker build -t yourusername/dating-api .
   docker push yourusername/dating-api
   ```

2. Trên Koyeb chọn "Docker" provider thay vì GitHub


## Sau khi deploy thành công:

1. **Lấy URL backend:**
   - Koyeb sẽ cấp URL: `https://dating-app-api.your-region.koyeb.app`

2. **Cập nhật vercel.json:**
   ```json
   "destination": "https://dating-app-api.your-region.koyeb.app/api/:path*"
   ```

3. **Cập nhật Vercel Environment Variables:**
   - Vào Vercel Dashboard → Settings → Environment Variables
   - Thêm: `VITE_API_URL` = `https://dating-app-api.your-region.koyeb.app`

4. **Cập nhật Backend FRONTEND_URL:**
   - Thêm biến: `FRONTEND_URL` = `https://your-frontend.vercel.app`


## Lưu ý quan trọng:

1. **PORT:** Koyeb tự động gán PORT, code đã dùng `process.env.PORT`
2. **Health Check:** Endpoint `/api/health` đã có sẵn
3. **CORS:** Backend đã cấu hình CORS cho Vercel frontend
4. **Socket.IO:** Cần enable WebSocket trên Koyeb (mặc định đã bật)
5. **MongoDB:** Dùng MongoDB Atlas (đã có connection string)
