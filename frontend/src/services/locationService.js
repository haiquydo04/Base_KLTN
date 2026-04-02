/**
 * Location Service - Handle geolocation for discovery feature
 */

const LOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000 // Cache location for 5 minutes
};

/**
 * Request user's current location
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('User denied location permission');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('Location information unavailable');
            break;
          case error.TIMEOUT:
            console.log('Location request timed out');
            break;
          default:
            console.log('Unknown location error');
        }
        resolve(null);
      },
      LOCATION_OPTIONS
    );
  });
};

/**
 * Watch user's location for updates
 * @param {Function} onSuccess - Callback when location updates
 * @param {Function} onError - Callback on error
 * @returns {number} Watch ID to clear later
 */
export const watchLocation = (onSuccess, onError) => {
  if (!navigator.geolocation) {
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    (error) => {
      onError?.(error);
    },
    LOCATION_OPTIONS
  );
};

/**
 * Stop watching location
 * @param {number} watchId - Watch ID from watchLocation
 */
export const clearLocationWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Update user location on backend
 * @param {Object} api - Axios instance or fetch wrapper
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} locationText - Optional display name
 */
export const updateLocationOnServer = async (api, latitude, longitude, locationText = null) => {
  try {
    const response = await api.post('/api/update-location', {
      latitude,
      longitude,
      locationText
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update location:', error);
    throw error;
  }
};

/**
 * Fetch nearby users
 * @param {Object} api - Axios instance or fetch wrapper
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radius - Search radius in meters
 */
export const fetchNearbyUsers = async (api, latitude, longitude, radius = 50000) => {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius.toString()
    });
    
    const response = await api.get(`/api/discovery?${params}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch nearby users:', error);
    throw error;
  }
};

export default {
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
  updateLocationOnServer,
  fetchNearbyUsers
};
