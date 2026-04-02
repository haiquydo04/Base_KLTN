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

/**
 * Generate a safe username from displayName
 * - Remove spaces
 * - Convert to lowercase
 * - Remove special characters (keep only alphanumeric)
 * - Limit to 30 characters max
 * - Append random number if needed to ensure uniqueness
 */
const generateSafeUsername = async (displayName, provider) => {
  const MAX_LENGTH = 30;
  const RANDOM_SUFFIX_LENGTH = 3;
  
  // Generate base username from displayName
  let baseUsername = displayName
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
  
  // Truncate if too long to make room for random suffix
  const maxBaseLength = MAX_LENGTH - RANDOM_SUFFIX_LENGTH - 1; // -1 for the underscore
  if (baseUsername.length > maxBaseLength) {
    baseUsername = baseUsername.substring(0, maxBaseLength);
  }
  
  // Generate unique username with random suffix
  const generateWithSuffix = (base, suffix) => {
    return `${base}_${suffix}`;
  };
  
  // Try to find a unique username (max 10 attempts)
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSuffix = Math.random().toString(36).substring(2, 2 + RANDOM_SUFFIX_LENGTH);
    const candidateUsername = generateWithSuffix(baseUsername, randomSuffix);
    
    // Check if username exists
    const existingUser = await User.findOne({ username: candidateUsername });
    if (!existingUser) {
      return candidateUsername;
    }
  }
  
  // Fallback: use timestamp-based suffix (still within limits)
  const timestampSuffix = Date.now().toString().slice(-5);
  const fallbackUsername = baseUsername.substring(0, MAX_LENGTH - 6) + '_' + timestampSuffix;
  return fallbackUsername;
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

// Helper to update user with social login info
const linkSocialAccount = async (user, profile, provider, photos) => {
  if (provider === 'google') {
    user.googleId = profile.id;
  } else if (provider === 'facebook') {
    user.facebookId = profile.id;
  }
  user.loginMethod = provider;
  user.isEmailVerified = true;
  if (photos?.[0]?.value && !user.avatar) {
    user.avatar = photos[0].value;
  }
  user.lastLogin = new Date();
  user.isOnline = true;
  await user.save({ validateBeforeSave: false });
  return user;
};

// Google Strategy - chỉ khởi tạo nếu có credentials
if (config.google?.clientID && config.google?.clientSecret) {
  console.log('🔑 Google OAuth Config:', {
    clientID: config.google.clientID.substring(0, 20) + '...',
    callbackURL: config.google.callbackURL
  });

  passport.use('google', new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    proxy: true
  }, async (accessToken, refreshToken, params, profile, done) => {
    console.log('🔵 Google OAuth Callback received');
    console.log('   Profile ID:', profile?.id);
    console.log('   Display Name:', profile?.displayName);
    console.log('   Has Email:', !!profile?.emails?.[0]?.value);
    console.log('   Email:', profile?.emails?.[0]?.value);

    try {
      // Guard against missing profile
      if (!profile || !profile.id) {
        console.error('❌ Google OAuth Error: Missing profile or profile ID');
        return done(new Error('Invalid Google profile: missing ID'), null);
      }

      // Guard against invalid email (Google should always provide email with 'email' scope)
      if (!profile.emails || !profile.emails[0]?.value) {
        console.error('❌ Google OAuth Error: No email in profile. Check Google Cloud Console scope settings.');
        return done(new Error('Google profile missing email. Please ensure "email" scope is enabled in Google Cloud Console.'), null);
      }

      const email = profile.emails[0].value;
      const photoUrl = profile.photos?.[0]?.value;

      // Check if user already linked with this Google ID
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        console.log('   Found existing user by Google ID:', existingUser.username);
        existingUser.lastLogin = new Date();
        existingUser.isOnline = true;
        existingUser.failedAttempts = 0;
        await existingUser.save({ validateBeforeSave: false });
        return done(null, existingUser);
      }

      // Check if user exists with same email
      if (email) {
        const userByEmail = await User.findOne({ email: email.toLowerCase() });
        if (userByEmail) {
          console.log('   Found existing user by email, linking Google ID...');
          await linkSocialAccount(userByEmail, profile, 'google', profile.photos);
          return done(null, userByEmail);
        }
      }

      // Create new user with safe username
      const safeUsername = await generateSafeUsername(
        profile.displayName || email || 'user',
        'google'
      );

      console.log('   Creating new user with username:', safeUsername);

      // Create user - location will use default values [0, 0]
      const newUser = new User({
        googleId: profile.id,
        email: email.toLowerCase(),
        username: safeUsername,
        fullName: profile.displayName || '',
        avatar: photoUrl || '',
        loginMethod: 'google',
        isEmailVerified: true,
        passwordHash: 'SOCIAL_LOGIN_' + Date.now()
        // location uses default: { type: 'Point', coordinates: [0, 0] }
      });

      await newUser.save({ validateBeforeSave: false });

      console.log('✅ New user created successfully:', newUser.username);
      done(null, newUser);
    } catch (error) {
      console.error('❌ Google OAuth Error:', {
        message: error.message,
        code: error.code,
        name: error.name,
        errors: error.errors
      });
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
      // Check if user already linked with this Facebook ID
      const existingUser = await User.findOne({ facebookId: profile.id });
      if (existingUser) {
        existingUser.lastLogin = new Date();
        existingUser.isOnline = true;
        existingUser.failedAttempts = 0;
        await existingUser.save({ validateBeforeSave: false });
        return done(null, existingUser);
      }

      const email = profile.emails?.[0]?.value;
      
      // Check if user exists with same email
      if (email) {
        const userByEmail = await User.findOne({ email: email.toLowerCase() });
        if (userByEmail) {
          await linkSocialAccount(userByEmail, profile, 'facebook', profile.photos);
          return done(null, userByEmail);
        }
      }

      // Create new user with safe username
      const safeUsername = await generateSafeUsername(
        profile.displayName || profile.emails?.[0]?.value || 'user',
        'facebook'
      );

      const newUser = await User.create({
        facebookId: profile.id,
        email: email?.toLowerCase(),
        username: safeUsername,
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
