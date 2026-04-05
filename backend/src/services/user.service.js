/**
 * User Service - Business logic cho user/profile
 */

import User from '../models/User.js';
import Match from '../models/Match.js';
import Swipe from '../models/Swipe.js';

const SAFE_FIELDS = [
  'fullName', 'age', 'gender', 'bio', 'interests', 'location',
  'occupation', 'education', 'height', 'drinking', 'smoking',
  'lookingFor', 'preferences', 'photos', 'dateOfBirth'
];

// ============================================
// 🛠️ Helper: Parse string thành object/array
// Safe parse - không crash nếu JSON.parse lỗi
// ============================================
const parseIfString = (value, fallback = null) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed;
    } catch (e) {
      // Nếu parse thất bại, return fallback
      console.warn('[parseIfString] Failed to parse:', value, '| Error:', e.message);
      return fallback;
    }
  }
  
  return value;
};

const buildUserQuery = (currentUser, excludeIds = []) => {
  // ============================================
  // 🐛 FIX: Không dùng $nin khi array rỗng
  // MongoDB: $nin: [] = match NOTHING!
  // ============================================
  const idFilter = {
    $ne: currentUser._id
  };
  
  // Chỉ thêm $nin khi có phần tử để exclude
  if (excludeIds.length > 0) {
    idFilter.$nin = excludeIds;
  }

  const query = {
    _id: idFilter,
    // ============================================
    // 🐛 FIX: Default age range rộng hơn
    // ============================================
    age: {
      $gte: currentUser.preferences?.minAge ?? 18,
      $lte: currentUser.preferences?.maxAge ?? 100
    }
  };

  // ============================================
  // 🐛 FIX: Chỉ filter gender khi có preference rõ ràng
  // ============================================
  if (currentUser.preferences?.gender && 
      currentUser.preferences.gender !== 'both' &&
      currentUser.preferences.gender !== '') {
    query.gender = currentUser.preferences.gender;
  }

  return query;
};

export const getAllUsers = async (userId, { page = 1, limit = 20 } = {}) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) return { error: 'User not found', status: 404 };

  const skip = (page - 1) * limit;
  const query = buildUserQuery(currentUser);

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

export const getUserById = async (targetUserId) => {
  const user = await User.findById(targetUserId).select('-password -passwordHash');
  if (!user) return { error: 'User not found', status: 404 };
  return { user };
};

export const updateUserProfile = async (userId, updates, file) => {
  const sanitized = {};
  
  SAFE_FIELDS.forEach(field => {
    if (updates[field] !== undefined) {
      let value = updates[field];
      
      // ============================================
      // 🛠️ FIX: Parse string thành đúng format
      // ============================================
      
      if (field === 'dateOfBirth') {
        // Frontend gửi dateOfBirth, tính age từ đó
        const dob = updates.dateOfBirth;
        if (dob) {
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          // Chỉ set age nếu hợp lệ (18-100)
          if (age >= 18 && age <= 100) {
            sanitized.age = age;
          }
          // Vẫn lưu dateOfBirth nếu model có field này
          sanitized.dateOfBirth = dob;
        }
        return; // Da xu ly rieng
      }
      
      if (field === 'location') {
        // Parse location string → GeoJSON object
        // Format: { type: "Point", coordinates: [lng, lat] }
        const parsed = parseIfString(value);
        if (parsed && typeof parsed === 'object') {
          // Đảm bảo đúng GeoJSON format
          if (parsed.type === 'Point' && Array.isArray(parsed.coordinates)) {
            value = {
              type: 'Point',
              coordinates: [
                parseFloat(parsed.coordinates[0]) || 0,
                parseFloat(parsed.coordinates[1]) || 0
              ]
            };
          } else {
            // Fallback: thử extract từ object thường { lng, lat }
            value = {
              type: 'Point',
              coordinates: [
                parseFloat(parsed.longitude || parsed.lng || parsed.x || 0),
                parseFloat(parsed.latitude || parsed.lat || parsed.y || 0)
              ]
            };
          }
        } else if (typeof value === 'string' && value.trim()) {
          // Frontend gửi locationText (string) thay vì GeoJSON
          // Lưu vào locationText thay vì location
          return; // Skip, sẽ xử lý riêng
        }
      } else if (field === 'interests') {
        // Parse interests string → array
        // Input có thể là: "[\"music\",\"travel\"]" hoặc ["music","travel"]
        const parsed = parseIfString(value, []);
        if (Array.isArray(parsed)) {
          value = parsed.filter(i => typeof i === 'string').map(i => i.trim());
        } else if (typeof parsed === 'string') {
          // Fallback: split by comma
          value = parsed.split(',').map(i => i.trim()).filter(i => i);
        } else {
          value = [];
        }
      } else if (field === 'preferences') {
        // Parse preferences string → object
        // Format: { minAge: 18, maxAge: 50, gender: "both" }
        value = parseIfString(value, {});
        if (!value || typeof value !== 'object') {
          value = {};
        }
      } else if (field === 'photos') {
        // Parse photos string → array
        const parsed = parseIfString(value, []);
        if (Array.isArray(parsed)) {
          value = parsed.filter(p => typeof p === 'string');
        } else {
          value = [];
        }
      }
      
      sanitized[field] = value;
    }
  });

  // ============================================
  // 🛠️ FIX: Xử lý locationText riêng (frontend gửi string)
  // ============================================
  if (updates.location && typeof updates.location === 'string') {
    sanitized.locationText = updates.location;
  }

  if (file) {
    sanitized.avatar = `/uploads/${file.filename}`;
  }

  console.log('[updateUserProfile] 💾 Sanitized data:');
  console.log('  - fullName:', sanitized.fullName);
  console.log('  - age:', sanitized.age);
  console.log('  - dateOfBirth:', sanitized.dateOfBirth);
  console.log('  - gender:', sanitized.gender);
  console.log('  - bio:', sanitized.bio);
  console.log('  - location:', JSON.stringify(sanitized.location));
  console.log('  - locationText:', sanitized.locationText);
  console.log('  - interests:', sanitized.interests);
  console.log('  - preferences:', JSON.stringify(sanitized.preferences));
  console.log('  - photos:', sanitized.photos?.length, 'photos');

  const user = await User.findByIdAndUpdate(
    userId,
    sanitized,
    { new: true, runValidators: true }
  );

  if (!user) return { error: 'User not found', status: 404 };

  user.profileCompletion = user.calculateProfileCompletion();
  await user.save();

  return { user };
};

export const getUserMatches = async (userId) => {
  const matches = await Match.findUserMatches(userId);

  const formattedMatches = matches.map(match => {
    const otherUserId = match.getOtherUser(userId);
    return {
      _id: match._id,
      matchId: match._id,
      userId: otherUserId,
      matchedAt: match.matchedAt || match.createdAt,
      lastActivity: match.lastActivity,
      createdAt: match.createdAt
    };
  });

  const populatedMatches = await Match.populate(formattedMatches, {
    path: 'userId',
    select: '-password -passwordHash'
  });

  return { matches: populatedMatches };
};

export const getRecommendedUsers = async (userId, options = {}) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) return { error: 'User not found', status: 404 };

  // ============================================
  // 🐛 DEBUG: Log user data để debug
  // ============================================
  console.log('===========================================');
  console.log('[getRecommendedUsers] 🔍 DEBUG USER DATA:');
  console.log('  userId:', userId);
  console.log('  username:', currentUser.username);
  console.log('  email:', currentUser.email);
  console.log('  loginMethod:', currentUser.loginMethod);
  console.log('  gender:', currentUser.gender, '(type:', typeof currentUser.gender, ')');
  console.log('  age:', currentUser.age);
  console.log('  interests:', currentUser.interests);
  console.log('  preferences:', currentUser.preferences);
  console.log('  status:', currentUser.status);
  console.log('===========================================');

  // Pagination defaults
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(options.limit) || 20));
  const skip = (page - 1) * limit;

  // ============================================
  // 🐛 FIX: Query swipe và match
  // ============================================
  const [swipedByMe, myMatches, totalUsers] = await Promise.all([
    Swipe.find({ swiperId: userId }).select('swipedId'),
    Match.findUserMatches(userId),
    User.countDocuments({}) // Count ALL users
  ]);

  const swipedUserIds = swipedByMe.map(s => s.swipedId?.toString()).filter(Boolean);
  const matchedUserIds = myMatches.map(m => {
    if (m.user1Id?.toString() === userId.toString()) {
      return m.user2Id?.toString();
    }
    return m.user1Id?.toString();
  }).filter(Boolean);

  console.log('[getRecommendedUsers] 📊 Stats:');
  console.log('  - Total users in DB:', totalUsers);
  console.log('  - Users swiped by me:', swipedUserIds.length);
  console.log('  - My matches:', matchedUserIds.length);

  // ============================================
  // 🐛 FIX: Logic excludeIds - đảm bảo tất cả là string
  // ============================================
  let excludeIds = [userId.toString()]; // Luôn loại chính mình

  if (!options.refresh) {
    // Không refresh: loại cả swipe + match
    excludeIds = [...excludeIds, ...matchedUserIds, ...swipedUserIds];
  } else {
    // Refresh: chỉ loại chính mình + match (để thấy lại users đã pass)
    excludeIds = [...excludeIds, ...matchedUserIds];
  }

  // Ensure all IDs are strings (prevent object→string serialization)
  excludeIds = excludeIds
    .map(id => id?.toString?.() || String(id))
    .filter(id => id && id.length === 24); // Valid ObjectId length

  // Remove duplicates
  excludeIds = [...new Set(excludeIds)];

  console.log('[getRecommendedUsers] 🚫 Exclude IDs:', excludeIds.length);
  console.log('  (excluding self +', options.refresh ? 'matches' : 'matches + swipes', ')');

  // Build query
  const query = buildUserQuery(currentUser, excludeIds);

  console.log('[getRecommendedUsers] 🔍 Final Query:', JSON.stringify(query, null, 2));

  // Get total count for pagination
  const availableCount = await User.countDocuments(query);

  const users = await User.find(query)
    .select('-password -passwordHash')
    .sort({ isFake: 1, fakeScore: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(availableCount / limit);
  const hasMore = page < totalPages;

  console.log('[getRecommendedUsers] ✅ Results:', users.length, 'users');
  console.log('  (page', page, 'of', totalPages, '| available:', availableCount, ')');
  console.log('===========================================\n');

  return {
    users,
    pagination: {
      page,
      limit,
      total: availableCount,
      totalPages,
      hasMore,
      nextCursor: users.length > 0 ? users[users.length - 1]._id.toString() : null
    }
  };
};

export default {
  getAllUsers,
  getUserById,
  updateUserProfile,
  getUserMatches,
  getRecommendedUsers
};
