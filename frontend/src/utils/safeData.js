/**
 * Safe Data Access Utilities
 * Prevents crashes when data is undefined/null/missing
 */

/**
 * Safe getter for user data
 * Returns default values instead of crashing
 */
export function safeUser(user) {
  if (!user) {
    return {
      _id: null,
      username: 'Unknown',
      fullName: 'Unknown User',
      age: null,
      gender: '',
      avatar: null,
      bio: '',
      location: null,
      locationText: '',
      interests: [],
      photos: [],
      occupation: '',
      education: '',
      lookingFor: '',
      preferences: {
        minAge: 18,
        maxAge: 50,
        gender: 'both'
      },
      profileCompletion: 0
    };
  }

  return {
    ...user,
    username: user.username || 'Unknown',
    fullName: user.fullName || user.username || 'Unknown User',
    age: user.age || null,
    gender: user.gender || '',
    bio: user.bio || '',
    avatar: user.avatar || null,
    location: user.location || null,
    locationText: user.locationText || '',
    interests: Array.isArray(user.interests) ? user.interests : [],
    photos: Array.isArray(user.photos) ? user.photos : [],
    occupation: user.occupation || '',
    education: user.education || '',
    lookingFor: user.lookingFor || '',
    preferences: user.preferences || { minAge: 18, maxAge: 50, gender: 'both' },
    profileCompletion: user.profileCompletion || 0,
    isOnline: user.isOnline || false
  };
}

/**
 * Format location for display
 * Handles both string and GeoJSON object { type: 'Point', coordinates: [lng, lat] }
 * Returns displayable string or null
 */
export function formatLocation(location) {
  if (!location) return null;
  
  // If it's a string, return as-is
  if (typeof location === 'string') {
    return location.trim() || null;
  }
  
  // If it's an object (GeoJSON format)
  if (typeof location === 'object') {
    // Handle locationText if available
    if (location.locationText) return location.locationText;
    
    // Don't expose raw coordinates to users
    // Return null instead of coordinates.join(", ")
    return null;
  }
  
  return null;
}

/**
 * Check if user has a valid location
 */
export function hasLocation(location) {
  if (!location) return false;
  
  if (typeof location === 'string') {
    return location.trim().length > 0;
  }
  
  if (typeof location === 'object') {
    if (location.locationText) return true;
    if (location.coordinates && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates;
      return lng !== 0 || lat !== 0;
    }
  }
  
  return false;
}

/**
 * Format age for display
 * Returns "N/A" if age is not available
 */
export function formatAge(age) {
  if (age === null || age === undefined || age === '') {
    return null;
  }
  const numAge = Number(age);
  if (isNaN(numAge) || numAge < 1) {
    return null;
  }
  return numAge;
}

/**
 * Format gender for display
 */
export function formatGender(gender) {
  if (!gender) return '';
  const g = gender.toLowerCase();
  if (g === 'male') return 'Nam';
  if (g === 'female') return 'Nữ';
  if (g === 'other') return 'Khác';
  return gender;
}

/**
 * Format interests for display
 * Returns empty array if not available
 */
export function formatInterests(interests) {
  if (!interests || !Array.isArray(interests) || interests.length === 0) {
    return [];
  }
  return interests.filter(i => typeof i === 'string' && i.trim());
}

/**
 * Get display name for user
 */
export function getDisplayName(user) {
  if (!user) return 'Unknown User';
  return user.fullName || user.username || 'Unknown User';
}

/**
 * Get avatar URL or null
 */
export function getAvatarUrl(user) {
  if (user?.avatar && typeof user.avatar === 'string' && user.avatar.trim()) {
    return user.avatar;
  }
  return null;
}

/**
 * Safe array length
 */
export function getArrayLength(arr) {
  if (!arr || !Array.isArray(arr)) return 0;
  return arr.length;
}

/**
 * Get matching preference description
 */
export function formatLookingFor(lookingFor) {
  if (!lookingFor) return '';
  const lf = lookingFor.toLowerCase();
  if (lf === 'relationship') return 'Hẹn hò';
  if (lf === 'friendship') return 'Kết bạn';
  if (lf === 'casual') return 'Gặp gỡ';
  return lookingFor;
}

/**
 * Check if value is safe to render (not an object)
 * Returns true if value is primitive or array
 */
export function isRenderable(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return true;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return true;
  return false;
}

/**
 * Get safe value for rendering in JSX
 * Returns null if value is an object (not safe to render)
 */
export function getSafeValue(value, fallback = null) {
  if (!isRenderable(value)) {
    return fallback;
  }
  return value;
}

/**
 * Get safe profile for display
 * This is the main function to use in components
 */
export function getSafeProfile(profile) {
  const safe = safeUser(profile);
  
  return {
    ...safe,
    // Formatted display values
    displayAge: formatAge(safe.age),
    displayGender: formatGender(safe.gender),
    displayName: getDisplayName(safe),
    displayInterests: formatInterests(safe.interests),
    displayLookingFor: formatLookingFor(safe.lookingFor),
    // Location helpers
    displayLocation: formatLocation(safe.location) || safe.locationText || null,
    hasLocation: hasLocation(safe.location) || !!safe.locationText,
    // Avatar helpers
    hasAvatar: !!safe.avatar,
    avatarInitial: (safe.fullName || safe.username || '?').charAt(0).toUpperCase(),
    // Completion helpers
    hasInterests: safe.interests.length > 0,
    hasPhotos: safe.photos.length > 0,
    hasBio: !!safe.bio,
    hasAge: safe.age !== null,
    hasLocation: hasLocation(safe.location),
    // Profile completion
    completion: safe.profileCompletion,
    isIncomplete: safe.profileCompletion < 50
  };
}

export default {
  safeUser,
  formatLocation,
  hasLocation,
  formatAge,
  formatGender,
  formatInterests,
  getDisplayName,
  getAvatarUrl,
  getArrayLength,
  formatLookingFor,
  isRenderable,
  getSafeValue,
  getSafeProfile
};
