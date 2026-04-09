import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

import { register } from '../controllers/auth/register.controller.js';
import { login } from '../controllers/auth/login.controller.js';
import { getCurrentUser } from '../controllers/auth/me.controller.js';
import { logout } from '../controllers/auth/logout.controller.js';
import { linkFacebook, linkGoogle } from '../controllers/auth/linkSocial.controller.js';
import { forgotPassword } from '../controllers/auth/forgotPassword.controller.js';
import { verifyOTP } from '../controllers/auth/verifyOTP.controller.js';
import { resetPassword } from '../controllers/auth/resetPassword.controller.js';
import { googleLogin } from '../controllers/auth/googleLogin.controller.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// ============ SOCIAL AUTH ROUTES ============

router.get('/google',
  (req, res, next) => {
    console.log('🔵 Google OAuth started, callbackURL:', config.google?.callbackURL);
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('🔵 Google callback received');
    console.log('   Query params:', req.query);
    console.log('   Error param:', req.query.error);
    console.log('   Error description:', req.query.error_description);
    
    if (req.query.error) {
      const errorMessages = {
        'access_denied': 'You denied access to the application',
        'unauthorized_client': 'The client is not authorized to request this code',
        'invalid_client': 'Client authentication failed',
        'invalid_scope': 'The requested scope is invalid',
        'server_error': 'Google server error, please try again',
        'temporarily_unavailable': 'Google is temporarily unavailable, please try again'
      };
      const message = errorMessages[req.query.error] || req.query.error_description || 'OAuth error';
      console.error('❌ Google OAuth error:', message);
      return res.redirect(`${config.frontendUrl}/#/login?error=${encodeURIComponent(message)}`);
    }
    next();
  },
  (req, res, next) => {
    passport.authenticate('google', {
      failureRedirect: `${config.frontendUrl}/#/login?error=google_auth_failed`,
      failureFlash: true,
      session: false
    })(req, res, (err) => {
      if (err) {
        console.error('❌ Passport authenticate error:', err.message);
        return res.redirect(`${config.frontendUrl}/#/login?error=${encodeURIComponent(err.message)}`);
      }
      next();
    });
  },
  (req, res) => {
    console.log('✅ Google auth success');
    console.log('   User:', req.user?.username, req.user?._id);
    
    if (!req.user) {
      console.error('❌ Google auth failed: No user in request');
      return res.redirect(`${config.frontendUrl}/#/login?error=no_user`);
    }

    try {
      const token = generateToken(req.user._id);
      console.log('   JWT token generated');
      res.redirect(`${config.frontendUrl}/#/auth/callback?token=${token}&provider=google`);
    } catch (error) {
      console.error('❌ Error generating token:', error.message);
      res.redirect(`${config.frontendUrl}/#/login?error=token_generation_failed`);
    }
  }
);

router.get('/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    prompt: 'select_account'
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${config.frontendUrl}/#/login?error=facebook_auth_failed`,
    session: false
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${config.frontendUrl}/#/auth/callback?token=${token}&provider=facebook`);
  }
);

// ============ EMAIL AUTH ROUTES ============

router.post('/register', register);
router.post('/register-json', register);
router.post('/login', login);

// ============ GOOGLE OAUTH (Token-based) ============

router.post('/google-login', googleLogin);

// ============ PROTECTED ROUTES ============

router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

router.post('/link-facebook', authenticate, linkFacebook);
router.post('/link-google', authenticate, linkGoogle);

// Password Reset Routes (OTP)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
