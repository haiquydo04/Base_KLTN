/**
 * Discovery Component - Location-based user discovery
 * Shows nearby users based on geolocation
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getCurrentLocation } from '../services/locationService';
import api from '../services/api';

const Discovery = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(50000); // Default 50km in meters
  const [locationDenied, setLocationDenied] = useState(false);

  // Request location and fetch users
  const requestLocationAndFetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Request browser geolocation
      const location = await getCurrentLocation();

      if (location) {
        setHasLocation(true);
        setLocationDenied(false);

        // Step 2: Update location on server
        await api.post('/update-location', {
          latitude: location.latitude,
          longitude: location.longitude
        });

        // Step 3: Fetch nearby users
        await fetchNearbyUsers(location.latitude, location.longitude, radius);
      } else {
        setHasLocation(false);
        setLocationDenied(true);
        setUsers([]);
      }
    } catch (err) {
      setError('Failed to load nearby users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [radius]);

  // Fetch nearby users from API
  const fetchNearbyUsers = async (lat, lng, searchRadius) => {
    try {
      const response = await api.get('/discovery', {
        params: { lat, lng, radius: searchRadius }
      });

      setUsers(response.data?.users || []);
    } catch (err) {
      console.error('Error fetching nearby users:', err);
      throw err;
    }
  };

  // Handle radius change
  const handleRadiusChange = async (newRadius) => {
    setRadius(newRadius);

    // Re-fetch with new radius if we have location
    if (hasLocation) {
      const location = await getCurrentLocation();
      if (location) {
        setLoading(true);
        await fetchNearbyUsers(location.latitude, location.longitude, newRadius);
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    requestLocationAndFetchUsers();
  }, []);

  // Re-fetch when radius changes
  useEffect(() => {
    // Radius change is handled in handleRadiusChange
  }, [radius]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tìm người dùng gần bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={requestLocationAndFetchUsers}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Khám phá</h1>
          
          {/* Location Status */}
          {hasLocation ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Đã bật vị trí</span>
            </div>
          ) : locationDenied ? (
            <div className="mt-2 text-sm text-gray-500">
              Bạn có thể duyệt app mà không cần thông tin khoảng cách
            </div>
          ) : null}

          {/* Radius Selector */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">Bán kính:</span>
            <select
              value={radius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value={10000}>10 km</option>
              <option value={25000}>25 km</option>
              <option value={50000}>50 km</option>
              <option value={100000}>100 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {locationDenied ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Chia sẻ vị trí để khám phá người gần bạn
            </h2>
            <p className="text-gray-500 mb-4">
              Bật định vị để xem khoảng cách và tìm người phù hợp
            </p>
            <button
              onClick={requestLocationAndFetchUsers}
              className="px-6 py-2 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
            >
              Bật định vị
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy người dùng nào gần bạn</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* User Card */}
                <div className="relative">
                  <img
                    src={user.avatar || '/images/default-avatar.png'}
                    alt={user.fullName}
                    className="w-full h-48 object-cover"
                  />
                  {user.distance !== null && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {user.distance} km
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">
                    {user.fullName}, {user.age}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {user.locationText || 'Vị trí không xác định'}
                  </p>
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {user.interests?.slice(0, 3).map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;
