/**
 * Profile Service - Xử lý logic cho profile detail
 */

import User from '../models/User.js';
import Swipe from '../models/Swipe.js';
import Match from '../models/Match.js';

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Parse location to coordinates
 * Supports:
 * - GeoJSON format: { type: 'Point', coordinates: [lng, lat] }
 * - JSON string: '{"lat": 10.5, "lng": 105.6}'
 * - Comma-separated: "10.5,105.6"
 */
const parseLocation = (location) => {
  if (!location) return null;

  try {
    // GeoJSON format (our current schema)
    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
      return {
        lat: location.coordinates[1], // GeoJSON: [lng, lat]
        lng: location.coordinates[0]
      };
    }

    // Handle string input
    const locationStr = typeof location === 'string' ? location : JSON.stringify(location);

    // Try JSON format
    const parsed = JSON.parse(locationStr);
    if (parsed.lat && parsed.lng) {
      return { lat: parsed.lat, lng: parsed.lng };
    }
    if (parsed.latitude && parsed.longitude) {
      return { lat: parsed.latitude, lng: parsed.longitude };
    }
  } catch {
    // Try comma-separated format
    try {
      const parts = locationStr.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return null;
};

/**
 * Get full profile detail for a user
 * @param {string} targetUserId - ID of user to fetch profile
 * @param {string} currentUserId - ID of current logged-in user
 * @returns {Object} Full profile data
 */
export const getFullProfile = async (targetUserId, currentUserId) => {
  // 1. Fetch target user profile
  const user = await User.findById(targetUserId);
  
  if (!user) {
    return { error: 'User not found', status: 404 };
  }
  
  if (user.status !== 'active') {
    return { error: 'User profile is not available', status: 404 };
  }
  
  // 2. Parallel fetch: Swipe info, Match info (optimized queries)
  const [swipe, match, currentUser] = await Promise.all([
    // Check if current user has swiped on target user
    Swipe.findOne({
      swiperId: currentUserId,
      swipedId: targetUserId
    }),
    // Check if they have a match
    Match.findMatch(currentUserId, targetUserId),
    // Get current user's location for distance calculation
    User.findById(currentUserId).select('location')
  ]);
  
  // 3. Build images array (main photo first)
  const images = [];
  
  // Add avatar as main photo if exists
  if (user.avatar) {
    images.push({
      url: user.avatar,
      is_main: true
    });
  }
  
  // Add photos (excluding avatar to avoid duplicate)
  if (user.photos && user.photos.length > 0) {
    const otherPhotos = user.photos.filter(p => p !== user.avatar);
    otherPhotos.forEach(photo => {
      images.push({
        url: photo,
        is_main: false
      });
    });
  }
  
  // 4. Build profile response
  const profile = {
    id: user._id.toString(),
    full_name: user.fullName || user.username,
    age: user.age || null,
    bio: user.bio || '',
    job_title: user.occupation || '',
    gender: user.gender || '',
    is_verified: user.isVerifiedProfile || false,
    last_active: user.lastSeen?.toISOString() || null,
    images,
    interests: user.interests || []
  };
  
  // 5. Calculate location & distance
  let location = null;
  const targetLocation = parseLocation(user.location);
  const currentLocation = parseLocation(currentUser?.location);
  
  if (targetLocation) {
    location = {
      lat: targetLocation.lat,
      lng: targetLocation.lng
    };
    
    if (currentLocation) {
      location.distance_km = calculateDistance(
        currentLocation.lat, currentLocation.lng,
        targetLocation.lat, targetLocation.lng
      );
    } else {
      location.distance_km = null;
    }
  }
  
  // 6. Interaction state
  const interaction = {
    is_liked: swipe?.action === 'like',
    is_super_liked: false, // Super like not implemented yet
    is_matched: !!match,
    is_blocked: false // Block not implemented yet
  };
  
  // 7. AI Analysis (not implemented - return null)
  const ai_analysis = null;
  
  return {
    profile,
    location,
    interaction,
    ai_analysis
  };
};

/**
 * Get profile by ID (public info only, no interaction state)
 * @param {string} userId 
 * @returns {Object} Basic profile data
 */
export const getProfileById = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user || user.status !== 'active') {
    return { error: 'User not found', status: 404 };
  }
  
  // Build images array
  const images = [];
  
  if (user.avatar) {
    images.push({ url: user.avatar, is_main: true });
  }
  
  if (user.photos && user.photos.length > 0) {
    const otherPhotos = user.photos.filter(p => p !== user.avatar);
    otherPhotos.forEach(photo => {
      images.push({ url: photo, is_main: false });
    });
  }
  
  return {
    id: user._id.toString(),
    full_name: user.fullName || user.username,
    age: user.age || null,
    bio: user.bio || '',
    job_title: user.occupation || '',
    gender: user.gender || '',
    is_verified: user.isVerifiedProfile || false,
    last_active: user.lastSeen?.toISOString() || null,
    images,
    interests: user.interests || []
  };
};
