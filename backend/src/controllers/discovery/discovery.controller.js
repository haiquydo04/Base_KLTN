/**
 * Location & Discovery Controller
 * Handles location updates and nearby user discovery
 */

import User from '../../models/User.js';
import { sendSuccess, sendError, sendValidationError } from '../../utils/apiResponse.js';

/**
 * POST /api/update-location
 * Update current user's location
 * Body: { latitude: number, longitude: number, locationText?: string }
 */
export const updateLocation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { latitude, longitude, locationText } = req.body;

    // Handle case where user denies location permission
    if (latitude === undefined || longitude === undefined ||
        latitude === null || longitude === null) {
      return sendSuccess(res, {
        hasLocation: false,
        message: 'Location not provided. You can continue browsing without distance info.'
      });
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return sendValidationError(res, 'Latitude and longitude must be valid numbers');
    }

    if (latitude < -90 || latitude > 90) {
      return sendValidationError(res, 'Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      return sendValidationError(res, 'Longitude must be between -180 and 180');
    }

    // IMPORTANT: MongoDB cannot create 'coordinates' inside a string field
    // First check if location exists and is a string, then $unset it
    const userDoc = await User.findById(userId).select('location').lean();
    const locationUpdate = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    if (locationText) {
      locationUpdate.locationText = locationText;
    }

    // Use aggregation pipeline update ($set with full object) to avoid
    // "Cannot create field 'coordinates'" error when location was a string
    if (userDoc.location && typeof userDoc.location === 'string') {
      // Old string location exists - need to replace entire object
      // Use $set with full location object
      const updateObj = {
        location: locationUpdate
      };
      if (locationText) {
        updateObj.locationText = locationText;
      }
      await User.collection.updateOne(
        { _id: userId },
        { $set: updateObj }
      );
    } else {
      // Normal case - use dot notation for nested update
      const updateObj = {
        'location.type': 'Point',
        'location.coordinates': [longitude, latitude]
      };
      if (locationText) {
        updateObj.locationText = locationText;
      }
      await User.collection.updateOne(
        { _id: userId },
        { $set: updateObj }
      );
    }

    return sendSuccess(res, {
      hasLocation: true,
      location: {
        latitude,
        longitude,
        locationText: locationText || null
      },
      message: 'Location updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/discovery
 * Get nearby users based on location and preferences
 * Query: ?lat=&lng=&radius= (radius in meters, default 50000 = 50km)
 */
export const discoverUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { lat, lng, radius } = req.query;

    // Parse parameters
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseInt(radius) || 50000; // Default 50km in meters

    // Build query filter
    const query = {
      _id: { $ne: userId }, // Exclude current user
      status: 'active',
      isFake: { $ne: true }
    };

    // Only add location filter if coordinates provided AND valid (not default [0,0])
    if (!isNaN(latitude) && !isNaN(longitude) && (latitude !== 0 || longitude !== 0)) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: searchRadius // meters
        }
      };
    }

    // Get current user's preferences
    const currentUser = await User.findById(userId).select('preferences gender age');

    // Apply gender preference filter
    if (currentUser?.preferences?.gender && currentUser.preferences.gender !== 'both') {
      const genderMap = {
        male: ['male'],
        female: ['female'],
        both: ['male', 'female', 'other']
      };
      query.gender = { $in: genderMap[currentUser.preferences.gender] || ['male', 'female', 'other'] };
    }

    // Apply age preference filter
    if (currentUser?.preferences) {
      const minAge = currentUser.preferences.minAge || 18;
      const maxAge = currentUser.preferences.maxAge || 50;
      query.age = { $gte: minAge, $lte: maxAge };
    }

    // Execute query
    const users = await User.find(query)
      .select('fullName age gender avatar photos bio interests locationText')
      .limit(50);

    // Format response with distance
    const usersWithDistance = users.map(user => {
      const userObj = user.toObject();
      
      // Calculate distance if coordinates available
      let distance = null;
      if (!isNaN(latitude) && !isNaN(longitude) && user.location?.coordinates) {
        distance = calculateDistance(
          latitude, longitude,
          user.location.coordinates[1], // latitude from GeoJSON
          user.location.coordinates[0]  // longitude from GeoJSON
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
        distance: distance ? parseFloat(distance.toFixed(1)) : null // km
      };
    });

    // Sort by distance if location provided
    if (!isNaN(latitude) && !isNaN(longitude)) {
      usersWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    return sendSuccess(res, {
      users: usersWithDistance,
      total: usersWithDistance.length,
      hasLocation: !isNaN(latitude) && !isNaN(longitude),
      searchRadius: searchRadius / 1000 // Convert to km for response
    });

  } catch (error) {
    // Handle geospatial query errors gracefully
    if (error.code === 167) {
      return sendError(res, 'Invalid location coordinates provided', 400);
    }
    next(error);
  }
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

export default {
  updateLocation,
  discoverUsers
};
