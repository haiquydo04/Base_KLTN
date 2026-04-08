/**
 * Rate Limiter Middleware - Prevent spam messages
 * Limits: 5 messages per second per user
 */

import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';

// In-memory store (use Redis in production)
const messageRateLimit = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_MESSAGES_PER_WINDOW = 5;

export const messageRateLimiter = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.id;
    const now = Date.now();

    // Get user's message timestamps
    const userTimestamps = messageRateLimit.get(userId) || [];
    
    // Filter out old timestamps (older than window)
    const recentTimestamps = userTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

    if (recentTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many messages. Please slow down.',
        retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - recentTimestamps[0])) / 1000)
      });
    }

    // Add current timestamp
    recentTimestamps.push(now);
    messageRateLimit.set(userId, recentTimestamps);

    // Cleanup old entries periodically
    if (messageRateLimit.size > 10000) {
      for (const [key, timestamps] of messageRateLimit.entries()) {
        const filtered = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
        if (filtered.length === 0) {
          messageRateLimit.delete(key);
        } else {
          messageRateLimit.set(key, filtered);
        }
      }
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    next(error);
  }
};

export default { messageRateLimiter };