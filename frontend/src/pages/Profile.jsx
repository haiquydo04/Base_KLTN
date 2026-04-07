import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService, matchService } from '../services/api';
import Navbar from '../components/Navbar';

/**
 * Helper: Format location for display
 * Handles both string and GeoJSON object { type: 'Point', coordinates: [lng, lat] }
 */
const formatLocation = (location) => {
  if (!location) return null;
  
  // If it's a string, return as-is
  if (typeof location === 'string') {
    return location.trim() || null;
  }
  
  // If it's an object (GeoJSON format)
  if (typeof location === 'object') {
    // Handle locationText if available
    if (location.locationText) return location.locationText;
    
    // Handle coordinates [lng, lat]
    if (location.coordinates && Array.isArray(location.coordinates)) {
      // Usually we don't want to show coordinates to users
      // Return a formatted string or null
      const [lng, lat] = location.coordinates;
      // Don't expose raw coordinates - just return null or a placeholder
      return null;
    }
  }
  
  return null;
};

/**
 * Helper: Check if location is a non-empty string
 */
const hasLocation = (location) => {
  if (!location) return false;
  if (typeof location === 'string') return location.trim().length > 0;
  if (typeof location === 'object') {
    // Has locationText
    if (location.locationText) return true;
    // Has valid coordinates (not [0, 0])
    if (location.coordinates && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates;
      return lng !== 0 || lat !== 0;
    }
  }
  return false;
};

const ProfileCompletionCard = ({ profile, onEditClick }) => {
  const missingFields = useMemo(() => {
    const missing = [];
    
    if (!profile?.avatar || profile.avatar.trim() === '') {
      missing.push({ key: 'avatar', label: 'Add a profile photo', icon: '📷', points: 20 });
    }
    if (!profile?.bio || profile.bio.trim() === '') {
      missing.push({ key: 'bio', label: 'Write a bio', icon: '✍️', points: 10 });
    }
    if (!profile?.age) {
      missing.push({ key: 'age', label: 'Add your age', icon: '🎂', points: 10 });
    }
    // FIX: Use hasLocation helper for proper object/string check
    if (!hasLocation(profile?.location) && !profile?.locationText) {
      missing.push({ key: 'location', label: 'Add your location', icon: '📍', points: 10 });
    }
    if (!profile?.interests || profile.interests.length < 3) {
      const needed = profile?.interests ? 3 - profile.interests.length : 3;
      missing.push({ key: 'interests', label: `Add ${needed > 0 ? needed : ''} more interest${needed > 1 ? 's' : ''}`, icon: '❤️', points: 10 });
    }
    if (!profile?.photos || profile.photos.length < 2) {
      const needed = profile?.photos ? 2 - profile.photos.length : 2;
      missing.push({ key: 'photos', label: `Add ${needed > 0 ? needed : ''} photo${needed > 1 ? 's' : ''}`, icon: '🖼️', points: 20 });
    }
    if ((!profile?.occupation || profile.occupation.trim() === '') && (!profile?.education || profile.education.trim() === '')) {
      missing.push({ key: 'work', label: 'Add occupation or education', icon: '💼', points: 10 });
    }
    if (!profile?.gender || !profile?.lookingFor) {
      missing.push({ key: 'preferences', label: 'Set your preferences', icon: '⚙️', points: 10 });
    }
    return missing;
  }, [profile]);

  const completion = profile?.profileCompletion || 0;
  const getProgressColor = () => {
    if (completion >= 80) return 'from-green-400 to-green-500';
    if (completion >= 50) return 'from-yellow-400 to-orange-500';
    return 'from-pink-400 to-red-500';
  };

  const getMessage = () => {
    if (completion >= 100) return 'Your profile is complete!';
    if (completion >= 80) return 'Almost there! Just a few more details.';
    if (completion >= 50) return 'Keep going! Add more to get more matches.';
    return 'Complete your profile to get more matches!';
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Profile Strength</h3>
          <p className="text-gray-400 text-sm">{getMessage()}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-white">{completion}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500`}
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-400 text-sm mb-3">Complete these to improve your profile:</p>
          {missingFields.slice(0, 4).map((field, idx) => (
            <button
              key={field.key}
              onClick={() => onEditClick?.(field.key)}
              className="w-full flex items-center justify-between p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{field.icon}</span>
                <span className="text-gray-300 group-hover:text-white transition-colors">{field.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">+{field.points}%</span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {completion >= 100 && (
        <div className="flex items-center justify-center gap-2 text-green-400 mt-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Profile Complete!</span>
        </div>
      )}
    </div>
  );
};

const ProfileSection = ({ icon, title, value, editLink, missing }) => {
  // FIX: Ensure value is not an object before rendering
  const isValueObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isMissing = !value || isValueObject || (Array.isArray(value) && value.length === 0);

  // If value is an object, treat as missing
  const displayValue = isValueObject ? null : value;

  return (
    <div className={`p-4 rounded-2xl ${isMissing && missing ? 'bg-gray-800/50 border-2 border-dashed border-gray-700' : 'bg-gray-800'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            {isMissing ? (
              <p className="text-gray-500 text-sm">{missing || 'Not added yet'}</p>
            ) : Array.isArray(displayValue) ? (
              <p className="text-white font-medium">{displayValue.length} added</p>
            ) : (
              <p className="text-white font-medium">{displayValue}</p>
            )}
          </div>
        </div>
        {editLink && (
          <Link to={editLink} className="text-pink-400 hover:text-pink-300 text-sm font-medium">
            Edit
          </Link>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userId = id || currentUser?._id;

        if (!userId) {
          navigate('/login');
          return;
        }

        setIsOwnProfile(!id || id === currentUser?._id);

        const data = await userService.getUserById(userId);
        console.log('[Profile] Raw API response:', data);
        // FIX: Backend returns { success, user } - handle both formats
        const profileData = data?.user || data?.data?.user || data;
        if (!profileData?._id) {
          throw new Error('Invalid profile data received');
        }
        setProfile(profileData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, navigate]);

  const handleLike = async () => {
    try {
      const data = await matchService.likeUser(profile._id);
      console.log('[Profile] Like response:', data);
      if (data.matched) {
        alert(`It's a match! You can now chat with ${profile.username}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to like user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/discover" className="text-pink-400 hover:underline">
            Go back to discover
          </Link>
        </div>
      </div>
    );
  }

  // FIX: Calculate display values safely
  const displayLocation = formatLocation(profile?.location) || profile?.locationText || null;
  const hasValidLocation = displayLocation !== null;
  const displayAge = profile?.age ?? null;
  const displayInterests = Array.isArray(profile?.interests) ? profile.interests : [];
  const displayPhotos = Array.isArray(profile?.photos) ? profile.photos : [];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Profile Header */}
          <div className="relative mb-6">
            {/* Cover / Background */}
            <div className="h-40 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 overflow-hidden">
              {displayPhotos.length > 0 && (
                <img
                  src={displayPhotos[0]}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-50"
                />
              )}
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden shadow-xl">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white">
                        {profile?.username?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                {profile?.isOnline && (
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-gray-900"></div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-20 text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-bold text-white">
                {profile?.fullName || profile?.username || 'Unknown User'}
              </h1>
              {displayAge && (
                <span className="text-2xl text-gray-400">, {displayAge}</span>
              )}
            </div>
            <p className="text-gray-400">@{profile?.username || 'unknown'}</p>
            
            {/* FIX: Use hasValidLocation and displayLocation for safe rendering */}
            {hasValidLocation && (
              <div className="flex items-center justify-center gap-1 mt-1 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{displayLocation}</span>
              </div>
            )}
          </div>

          {/* Profile Completion (only for own profile) */}
          {isOwnProfile && (
            <ProfileCompletionCard profile={profile} />
          )}

          {/* Profile Sections */}
          <div className="space-y-3">
            {/* Basic Info */}
            <ProfileSection
              icon="👤"
              title="Basic Info"
              value={profile?.gender ? `${profile.gender}${profile?.lookingFor ? ` looking for ${profile.lookingFor}` : ''}` : null}
              editLink="/settings"
              missing="Set your preferences"
            />

            {/* Bio */}
            <ProfileSection
              icon="✍️"
              title="About Me"
              value={profile?.bio || null}
              editLink="/settings"
              missing="Write something about yourself"
            />

            {/* Work & Education */}
            <ProfileSection
              icon="💼"
              title="Work & Education"
              value={profile?.occupation || profile?.education || null}
              editLink="/settings"
              missing="Add your work or education"
            />

            {/* Photos */}
            <ProfileSection
              icon="🖼️"
              title="Photos"
              value={displayPhotos.length > 0 ? displayPhotos : null}
              editLink="/settings"
              missing="Add at least 2 photos"
            />

            {/* Interests */}
            <ProfileSection
              icon="❤️"
              title="Interests"
              value={displayInterests.length > 0 ? displayInterests.slice(0, 3) : null}
              editLink="/settings"
              missing="Add your interests"
            />

            {/* Lifestyle */}
            {(profile?.height || profile?.drinking || profile?.smoking) && (
              <ProfileSection
                icon="🌿"
                title="Lifestyle"
                value={[
                  profile.height ? `${profile.height}cm` : null,
                  profile.drinking ? `Drinks ${profile.drinking}` : null,
                  profile.smoking ? `Smokes ${profile.smoking}` : null
                ].filter(Boolean).join(' • ')}
                editLink="/settings"
              />
            )}

            {/* Looking For */}
            {profile?.lookingFor && (
              <ProfileSection
                icon="🎯"
                title="Looking For"
                value={profile.lookingFor.charAt(0).toUpperCase() + profile.lookingFor.slice(1)}
              />
            )}
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleLike}
                className="w-16 h-16 rounded-full bg-gray-800 border-2 border-pink-500 flex items-center justify-center hover:bg-pink-500 hover:border-pink-500 transition-all group"
              >
                <svg className="w-8 h-8 text-pink-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <Link
                to={`/chat/${profile?._id}`}
                className="flex-1 max-w-xs py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Send Message
              </Link>
            </div>
          )}

          {/* Member Since */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
