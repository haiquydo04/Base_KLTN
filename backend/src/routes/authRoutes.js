import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';
import { register, login, getCurrentUser, logout, linkFacebook, linkGoogle } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT for social login
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// ============ SOCIAL AUTH ROUTES ============

// Google OAuth - Redirect to Google
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Google OAuth - Callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${config.frontendUrl}/login?error=google_auth_failed`,
    session: false
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const user = req.user;
    
    // Redirect to frontend with token
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}&provider=google`);
  }
);

// Facebook OAuth - Redirect to Facebook
router.get('/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    prompt: 'select_account'
  })
);

// Facebook OAuth - Callback
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${config.frontendUrl}/login?error=facebook_auth_failed`,
    session: false
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}&provider=facebook`);
  }
);

// ============ EXISTING ROUTES ============

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

// Link social accounts
router.post('/link-facebook', authenticate, linkFacebook);
router.post('/link-google', authenticate, linkGoogle);

export default router;
