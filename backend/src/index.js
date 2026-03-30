import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cookieSession from 'cookie-session';

import config from './config/index.js';
import passport from './config/passport.js';
import { authRoutes, userRoutes, matchRoutes, messageRoutes, adminRoutes } from './routes/index.js';
import profileRoutes from './routes/profileRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { initializeSocket } from './socket/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie session for OAuth
app.use(cookieSession({
  name: 'dating-session',
  keys: [config.jwtSecret],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/v1/profiles', profileRoutes);

app.use(notFound);
app.use(errorHandler);

initializeSocket(io);

const startServer = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    httpServer.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

startServer();

export { app, httpServer, io };
/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này là entry point chính của ứng dụng Express.
Khởi tạo server, kết nối database, cấu hình middleware và routes.

Cấu hình chính:
- Express app và HTTP server
- Socket.io server với CORS configuration
- Kết nối MongoDB qua Mongoose
- Static files cho uploads
- API routes và error handling

Middleware được sử dụng:
- cors: Cho phép cross-origin requests từ frontend
- express.json(): Parse JSON body
- express.urlencoded(): Parse URL encoded body
- express.static(): Serve static files từ /uploads

Routes:
- /api/auth: Authentication (login, register, logout)
- /api/users: User management
- /api/match: Match/Like functionality
- /api/messages: Chat/Messages

Luồng hoạt động:
Start Server → Connect MongoDB → Initialize Socket → Listen on Port

Ghi chú:
File này được chạy bằng lệnh: npm start hoặc node src/index.js
Health check endpoint: GET /api/health
Socket.io được khởi tạo sau khi app sẵn sàng để handle connections.
*/

