/**
 * Discovery Service - Business logic for location-based user discovery
 */

import User from '../models/User.js';

/**
 * Get nearby users with filters
 * @param {string} userId - Current user ID
 * @param {Object} options - Search options
 * @returns {Array} Nearby users with distance
 */
export const getNearbyUsers = async (userId, options = {}) => {
  const {
    latitude,
    longitude,
    radius = 50000, // meters
    limit = 50
  } = options;

  const query = {
    _id: { $ne: userId },
    status: 'active',
    isFake: { $ne: true }
  };

  // Add location filter if coordinates provided
  if (latitude !== undefined && longitude !== undefined) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radius
      }
    };
  }

  const users = await User.find(query)
    .select('fullName age gender avatar photos bio interests locationText')
    .limit(limit);

  return users.map(user => formatUserForDiscovery(user, latitude, longitude));
};

/**
 * Format user document for discovery response
 */
const formatUserForDiscovery = (user, lat, lng) => {
  const userObj = user.toObject();
  
  let distance = null;
  if (lat !== undefined && lng !== undefined && user.location?.coordinates) {
    distance = calculateDistance(
      lat, lng,
      user.location.coordinates[1],
      user.location.coordinates[0]
    );
  }

  return {
    id: user._id,
    fullName: user.fullName,
    age: user.age,
    gender: user.gender,
    avatar: user.avatar,
    photos: user.photos || [],
    bio: user.bio,
    interests: user.interests || [],
    locationText: user.locationText,
    distance: distance ? parseFloat(distance.toFixed(1)) : null
  };
};

/**
 * Haversine formula to calculate distance between two points
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toRad = (deg) => deg * (Math.PI / 180);

export default {
  getNearbyUsers
};
