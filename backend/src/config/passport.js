import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from './index.js';

// Debug: Log giá trị config
console.log('📋 Passport config loaded:');
console.log('   Google clientID:', config.google?.clientID ? 'SET ✓' : 'MISSING ✗');
console.log('   Google clientSecret:', config.google?.clientSecret ? 'SET ✓' : 'MISSING ✗');
console.log('   Google callbackURL:', config.google?.callbackURL);
console.log('   Facebook clientID:', config.facebook?.clientID ? 'SET ✓' : 'MISSING ✗');
console.log('   Facebook clientSecret:', config.facebook?.clientSecret ? 'SET ✓' : 'MISSING ✗');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy - chỉ khởi tạo nếu có credentials
if (config.google?.clientID && config.google?.clientSecret) {
  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        existingUser.lastLogin = new Date();
        existingUser.isOnline = true;
        existingUser.failedAttempts = 0;
        await existingUser.save({ validateBeforeSave: false });
        return done(null, existingUser);
      }

      const email = profile.emails?.[0]?.value;
      let userByEmail = null;
      if (email) {
        userByEmail = await User.findOne({ email: email.toLowerCase() });
      }

      if (userByEmail) {
        userByEmail.googleId = profile.id;
        userByEmail.loginMethod = 'google';
        userByEmail.isEmailVerified = true;
        if (!userByEmail.avatar && profile.photos?.[0]?.value) {
          userByEmail.avatar = profile.photos[0].value;
        }
        userByEmail.lastLogin = new Date();
        userByEmail.isOnline = true;
        await userByEmail.save({ validateBeforeSave: false });
        return done(null, userByEmail);
      }

      const newUser = await User.create({
        googleId: profile.id,
        email: email?.toLowerCase(),
        username: `gg_${profile.id.substring(0, 15)}_${Date.now()}`,
        fullName: profile.displayName,
        avatar: profile.photos?.[0]?.value || '',
        loginMethod: 'google',
        isEmailVerified: true,
        passwordHash: 'SOCIAL_LOGIN_' + Date.now()
      });

      newUser.lastLogin = new Date();
      newUser.isOnline = true;
      await newUser.save({ validateBeforeSave: false });

      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
  console.log('   Google Strategy: INITIALIZED ✓\n');
} else {
  console.log('   Google Strategy: SKIPPED (no credentials)\n');
}

// Facebook Strategy - chỉ khởi tạo nếu có credentials
if (config.facebook?.clientID && config.facebook?.clientSecret) {
  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: ['id', 'displayName', 'emails', 'photos'],
    enableProof: true,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ facebookId: profile.id });

      if (existingUser) {
        existingUser.lastLogin = new Date();
        existingUser.isOnline = true;
        existingUser.failedAttempts = 0;
        await existingUser.save({ validateBeforeSave: false });
        return done(null, existingUser);
      }

      const email = profile.emails?.[0]?.value;
      let userByEmail = null;
      if (email) {
        userByEmail = await User.findOne({ email: email.toLowerCase() });
      }

      if (userByEmail) {
        userByEmail.facebookId = profile.id;
        userByEmail.loginMethod = 'facebook';
        userByEmail.isEmailVerified = true;
        if (!userByEmail.avatar && profile.photos?.[0]?.value) {
          userByEmail.avatar = profile.photos[0].value;
        }
        userByEmail.lastLogin = new Date();
        userByEmail.isOnline = true;
        await userByEmail.save({ validateBeforeSave: false });
        return done(null, userByEmail);
      }

      const newUser = await User.create({
        facebookId: profile.id,
        email: email?.toLowerCase(),
        username: `fb_${profile.id.substring(0, 15)}_${Date.now()}`,
        fullName: profile.displayName,
        avatar: profile.photos?.[0]?.value || '',
        loginMethod: 'facebook',
        isEmailVerified: true,
        passwordHash: 'SOCIAL_LOGIN_' + Date.now()
      });

      newUser.lastLogin = new Date();
      newUser.isOnline = true;
      await newUser.save({ validateBeforeSave: false });

      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
  console.log('   Facebook Strategy: INITIALIZED ✓');
} else {
  console.log('   Facebook Strategy: SKIPPED (no credentials)');
}

export default passport;
