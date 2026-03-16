import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import VideoSession from '../models/VideoSession.js';

let waitingUsers = [];

export const initializeSocket = (io) => {
  const authenticateSocket = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        next(new Error('Invalid token'));
      } else {
        next(new Error('Authentication failed'));
      }
    }
  };

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    socket.join(`user:${socket.user._id}`);

    User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      lastSeen: new Date()
    }, { new: true }).exec();

    socket.on('join_room', (matchId) => {
      if (!matchId) return;

      socket.join(`match:${matchId}`);
      console.log(`User ${socket.user.username} joined room: ${matchId}`);
    });

    socket.on('leave_room', (matchId) => {
      if (!matchId) return;

      socket.leave(`match:${matchId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { matchId, content, type } = data;

        if (!matchId || !content) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const match = await Match.findById(matchId);
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const isParticipant = match.users.some(
          userId => userId.toString() === socket.user._id.toString()
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        const message = await Message.create({
          matchId,
          sender: socket.user._id,
          content,
          messageType: type || 'text'
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar');

        match.lastActivity = new Date();
        await match.save();

        io.to(`match:${matchId}`).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Error in send_message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data) => {
      const { matchId } = data;
      if (!matchId) return;

      socket.to(`match:${matchId}`).emit('user_typing', {
        matchId,
        user: {
          _id: socket.user._id,
          username: socket.user.username
        }
      });
    });

    socket.on('stop_typing', (data) => {
      const { matchId } = data;
      if (!matchId) return;

      socket.to(`match:${matchId}`).emit('user_stop_typing', {
        matchId,
        userId: socket.user._id
      });
    });

    socket.on('message_read', async (data) => {
      const { matchId } = data;
      if (!matchId) return;

      try {
        const match = await Match.findById(matchId);
        if (!match) return;

        const isParticipant = match.users.some(
          userId => userId.toString() === socket.user._id.toString()
        );

        if (!isParticipant) return;

        await Message.updateMany(
          { matchId, sender: { $ne: socket.user._id }, isRead: false },
          { isRead: true }
        );

        socket.to(`match:${matchId}`).emit('messages_read', {
          matchId,
          reader: {
            _id: socket.user._id,
            username: socket.user.username
          }
        });
      } catch (error) {
        console.error('Error in message_read:', error);
      }
    });

    socket.on('call_user', (data) => {
      const { targetUserId, signalData, callType } = data;

      if (!targetUserId || !signalData) return;

      io.to(`user:${targetUserId}`).emit('incoming_call', {
        signal: signalData,
        caller: {
          _id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        callType
      });
    });

    socket.on('accept_call', (data) => {
      const { callerId, signalData } = data;

      if (!callerId || !signalData) return;

      io.to(`user:${callerId}`).emit('call_accepted', {
        signal: signalData,
        callee: {
          _id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        }
      });
    });

    socket.on('reject_call', (data) => {
      const { callerId } = data;

      if (!callerId) return;

      io.to(`user:${callerId}`).emit('call_rejected', {
        callee: {
          _id: socket.user._id,
          username: socket.user.username
        }
      });
    });

    socket.on('end_call', (data) => {
      const { targetUserId } = data;

      if (!targetUserId) return;

      io.to(`user:${targetUserId}`).emit('call_ended', {
        caller: {
          _id: socket.user._id,
          username: socket.user.username
        }
      });
    });

    // Random video chat events
    socket.on('find_random_partner', async () => {
      try {
        const currentUserId = socket.user._id.toString();
        
        // Remove user from waiting list if already there
        waitingUsers = waitingUsers.filter(id => id !== currentUserId);
        
        // Find a waiting user who is not the current user
        const partnerId = waitingUsers.find(id => id !== currentUserId);
        
        if (partnerId) {
          // Found a partner - create video session
          waitingUsers = waitingUsers.filter(id => id !== partnerId);
          
          const session = await VideoSession.create({
            participants: [currentUserId, partnerId],
            sessionType: 'random',
            status: 'connected',
            startedAt: new Date()
          });
          
          const partner = await User.findById(partnerId).select('username avatar');
          const currentUser = await User.findById(currentUserId).select('username avatar');
          
          // Notify both users
          io.to(`user:${partnerId}`).emit('random_partner_found', {
            sessionId: session._id,
            partner: currentUser,
            sessionType: 'random'
          });
          
          socket.emit('random_partner_found', {
            sessionId: session._id,
            partner: partner,
            sessionType: 'random'
          });
          
          console.log(`Random video session created: ${currentUserId} <-> ${partnerId}`);
        } else {
          // No partner found - add user to waiting list
          waitingUsers.push(currentUserId);
          socket.emit('waiting_for_partner');
          console.log(`User ${socket.user.username} is waiting for a partner`);
        }
      } catch (error) {
        console.error('Error in find_random_partner:', error);
        socket.emit('video_error', { message: 'Failed to find partner' });
      }
    });

    socket.on('cancel_find_partner', () => {
      const currentUserId = socket.user._id.toString();
      waitingUsers = waitingUsers.filter(id => id !== currentUserId);
      socket.emit('search_cancelled');
    });

    socket.on('next_random', async (data) => {
      try {
        const { sessionId } = data;
        const currentUserId = socket.user._id.toString();
        
        // End current session
        if (sessionId) {
          await VideoSession.findByIdAndUpdate(sessionId, {
            status: 'ended',
            endedAt: new Date()
          });
        }
        
        // Notify partner that current user left
        socket.to(`user:${currentUserId}`).emit('partner_left');
        
        // Find new partner
        socket.emit('finding_new_partner');
        
        // Small delay before finding new partner
        setTimeout(async () => {
          const partnerId = waitingUsers.find(id => id !== currentUserId);
          
          if (partnerId) {
            waitingUsers = waitingUsers.filter(id => id !== partnerId);
            
            const session = await VideoSession.create({
              participants: [currentUserId, partnerId],
              sessionType: 'random',
              status: 'connected',
              startedAt: new Date()
            });
            
            const partner = await User.findById(partnerId).select('username avatar');
            const currentUser = await User.findById(currentUserId).select('username avatar');
            
            io.to(`user:${partnerId}`).emit('random_partner_found', {
              sessionId: session._id,
              partner: currentUser,
              sessionType: 'random'
            });
            
            socket.emit('random_partner_found', {
              sessionId: session._id,
              partner: partner,
              sessionType: 'random'
            });
          } else {
            waitingUsers.push(currentUserId);
            socket.emit('waiting_for_partner');
          }
        }, 1000);
      } catch (error) {
        console.error('Error in next_random:', error);
        socket.emit('video_error', { message: 'Failed to find new partner' });
      }
    });

    socket.on('end_random_session', async (data) => {
      try {
        const { sessionId, partnerId } = data;
        
        if (sessionId) {
          const session = await VideoSession.findById(sessionId);
          if (session) {
            session.status = 'ended';
            session.endedAt = new Date();
            session.duration = Math.floor((new Date() - session.startedAt) / 1000);
            await session.save();
          }
        }
        
        // Notify partner
        if (partnerId) {
          io.to(`user:${partnerId}`).emit('partner_left');
        }
        
        // Remove from waiting list
        const currentUserId = socket.user._id.toString();
        waitingUsers = waitingUsers.filter(id => id !== currentUserId);
        
        socket.emit('session_ended');
      } catch (error) {
        console.error('Error in end_random_session:', error);
      }
    });

    // WebRTC signaling for video calls
    socket.on('webrtc_signal', (data) => {
      const { targetUserId, signal, type } = data;
      
      if (!targetUserId || !signal) return;
      
      io.to(`user:${targetUserId}`).emit('webrtc_signal', {
        signal,
        type,
        from: {
          _id: socket.user._id,
          username: socket.user.username
        }
      });
    });

    socket.on('disconnect', async (reason) => {
      console.log(`User disconnected: ${socket.user.username} (${reason})`);

      try {
        const currentUserId = socket.user._id.toString();
        
        // Remove from waiting list
        waitingUsers = waitingUsers.filter(id => id !== currentUserId);
        
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: false,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });

    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user?.username}:`, error);
    });
  });

  return io;
};

export const sendToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const sendToMatch = (io, matchId, event, data) => {
  io.to(`match:${matchId}`).emit(event, data);
};

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này dùng để khởi tạo và quản lý Socket.io cho ứng dụng dating app.
Xử lý các kết nối realtime giữa người dùng bao gồm: chat, typing indicator,
đánh dấu đã đọc, và cuộc gọi video/voice.

Các function chính:
- initializeSocket(io): Khởi tạo socket với middleware xác thực JWT
- authenticateSocket: Middleware xác thực người dùng qua JWT token
- sendToUser(): Hỗ trợ gửi message đến user cụ thể (dùng trong controller)
- sendToMatch(): Hỗ trợ gửi message đến room match (dùng trong controller)

Các socket events:
- connection: Khi user kết nối
- disconnect: Khi user ngắt kết nối
- join_room: User tham gia phòng chat
- leave_room: User rời phòng chat
- send_message: Gửi tin nhắn
- typing/stop_typing: Typing indicator
- message_read: Đánh dấu đã đọc
- call_user/accept_call/reject_call/end_call: Cuộc gọi

Luồng hoạt động:
Client (Socket) → Xác thực JWT → Lưu user vào socket → Xử lý events

Ghi chú:
File này được sử dụng bởi src/index.js để khởi tạo socket server.
Các controller có thể import sendToUser/sendToMatch để gửi notification.
*/
