import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService, matchService } from '../services/api';
import Navbar from '../components/Navbar';

const SwipeCard = ({ profile, onSwipeLeft, onSwipeRight, isTop }) => {
  const cardRef = useRef(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTouchStart = (e) => {
    if (!isTop || isAnimating) return;
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleMouseDown = (e) => {
    if (!isTop || isAnimating) return;
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isTop) return;
    const touch = e.touches[0];
    setCurrentPos({
      x: touch.clientX - startPos.x,
      y: touch.clientY - startPos.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isTop) return;
    setCurrentPos({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleEnd = useCallback(() => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);

    const threshold = 100;
    if (currentPos.x > threshold) {
      setIsAnimating(true);
      setCurrentPos({ x: 500, y: currentPos.y });
      setTimeout(() => onSwipeRight(profile), 300);
    } else if (currentPos.x < -threshold) {
      setIsAnimating(true);
      setCurrentPos({ x: -500, y: currentPos.y });
      setTimeout(() => onSwipeLeft(profile), 300);
    } else {
      setCurrentPos({ x: 0, y: 0 });
    }
  }, [isDragging, currentPos, isTop, onSwipeLeft, onSwipeRight, profile]);

  useEffect(() => {
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mouseup', handleEnd);
    return () => {
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [handleEnd]);

  const rotation = currentPos.x * 0.05;
  const opacity = isDragging ? 1 : 1;
  const likeOpacity = currentPos.x > 50 ? Math.min(currentPos.x / 150, 1) : 0;
  const nopeOpacity = currentPos.x < -50 ? Math.min(-currentPos.x / 150, 1) : 0;

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      style={{
        transform: `translate(${currentPos.x}px, ${currentPos.y}px) rotate(${rotation}deg)`,
        transition: isAnimating ? 'transform 0.3s ease-out' : 'none',
        touchAction: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      {/* Like/Nope Labels */}
      {isTop && (
        <>
          <div
            className="absolute top-8 left-4 px-4 py-2 border-4 rounded-lg text-2xl font-bold z-20"
            style={{
              borderColor: '#10B981',
              color: '#10B981',
              opacity: likeOpacity,
              transform: `scale(${likeOpacity}) rotate(-10deg)`,
              transition: 'opacity 0.1s, transform 0.1s'
            }}
          >
            LIKE
          </div>
          <div
            className="absolute top-8 right-4 px-4 py-2 border-4 rounded-lg text-2xl font-bold z-20"
            style={{
              borderColor: '#EF4444',
              color: '#EF4444',
              opacity: nopeOpacity,
              transform: `scale(${nopeOpacity}) rotate(10deg)`,
              transition: 'opacity 0.1s, transform 0.1s'
            }}
          >
            NOPE
          </div>
        </>
      )}

      {/* Card Content */}
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Profile Image */}
        <div className="relative h-[75%] bg-gray-200">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400">
              <span className="text-8xl font-bold text-white/80">
                {profile.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold">
              {profile.fullName || profile.username}
            </h2>
            {profile.age && (
              <span className="text-2xl font-medium">{profile.age}</span>
            )}
          </div>

          {profile.location && (
            <div className="flex items-center gap-1 mt-1 text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{profile.location}</span>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.interests.slice(0, 4).map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="mt-3 text-white/70 text-sm line-clamp-2">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Profile Completion Badge */}
        {profile.profileCompletion !== undefined && profile.profileCompletion < 100 && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white text-xs">{profile.profileCompletion}% complete</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Discover = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchNotification, setMatchNotification] = useState(null);
  const [loadedMore, setLoadedMore] = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getRecommendedUsers();
      setProfiles(response.users || []);
      setError('');
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSwipeRight = async (profile) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      const response = await matchService.likeUser(profile._id);

      if (response.isMatch) {
        setMatchNotification({
          matchedUser: profile,
          message: "It's a match! Start chatting?"
        });
      }

      removeTopCard(profile._id);
    } catch (err) {
      console.error('Error liking user:', err);
      setError('Failed to like user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSwipeLeft = async (profile) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      await matchService.passUser(profile._id);
      removeTopCard(profile._id);
    } catch (err) {
      console.error('Error passing user:', err);
      setError('Failed to pass user');
    } finally {
      setActionLoading(false);
    }
  };

  const removeTopCard = (profileId) => {
    setProfiles(prev => prev.filter(p => p._id !== profileId));
  };

  const closeMatchNotification = () => {
    setMatchNotification(null);
  };

  const startChat = () => {
    closeMatchNotification();
    navigate('/matches');
  };

  const loadMore = async () => {
    if (loadedMore) return;
    setLoadedMore(true);
    await fetchProfiles();
  };

  const currentProfile = profiles[0];
  const nextProfile = profiles[1];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="pt-20 pb-4 px-4">
        <div className="max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white">Discover</h1>
            <p className="text-gray-400 text-sm">Find your perfect match</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : error ? (
            <div className="bg-gray-800 rounded-3xl p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchProfiles}
                className="px-6 py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-gray-800 rounded-3xl p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No More Profiles</h3>
              <p className="text-gray-400 mb-4">Check back later for more matches!</p>
              <Link
                to="/matches"
                className="inline-block px-6 py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                View Your Matches
              </Link>
            </div>
          ) : (
            <>
              {/* Card Stack */}
              <div className="relative h-[500px]">
                {/* Next Card (behind) */}
                {nextProfile && (
                  <div className="absolute inset-0 scale-95 translate-y-4">
                    <SwipeCard
                      profile={nextProfile}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      isTop={false}
                    />
                  </div>
                )}

                {/* Current Card (top) */}
                {currentProfile && (
                  <SwipeCard
                    profile={currentProfile}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    isTop={true}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center items-center gap-6 mt-6">
                {/* Pass Button */}
                <button
                  onClick={() => handleSwipeLeft(currentProfile)}
                  disabled={actionLoading || !currentProfile}
                  className="w-16 h-16 rounded-full bg-gray-800 border-4 border-red-500 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Like Button */}
                <button
                  onClick={() => handleSwipeRight(currentProfile)}
                  disabled={actionLoading || !currentProfile}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center hover:from-pink-600 hover:to-purple-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {/* Super Like Button (placeholder) */}
                <button
                  disabled={actionLoading || !currentProfile}
                  className="w-16 h-16 rounded-full bg-gray-800 border-4 border-blue-500 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>

              {/* Load More Button */}
              {profiles.length <= 2 && !loadedMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={loadMore}
                    className="text-gray-400 hover:text-white text-sm underline"
                  >
                    Load more profiles
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Match Notification Modal */}
      {matchNotification && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-8 max-w-sm w-full text-center transform animate-scale-in">
            {/* Confetti Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF69B4', '#00BFFF', '#FF4500'][i % 4],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="w-32 h-32 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-6xl">&#128150;</span>
              </div>

              <h2 className="text-4xl font-bold text-white mb-2">It's a Match!</h2>
              <p className="text-white/80 mb-2">
                You and {matchNotification.matchedUser?.fullName || matchNotification.matchedUser?.username} liked each other!
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <img
                  src={user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'}
                  alt="You"
                  className="w-16 h-16 rounded-full border-4 border-white"
                />
                <img
                  src={matchNotification.matchedUser?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'}
                  alt={matchNotification.matchedUser?.username}
                  className="w-16 h-16 rounded-full border-4 border-white"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={startChat}
                  className="w-full py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
                >
                  Send a Message
                </button>
                <button
                  onClick={closeMatchNotification}
                  className="w-full py-3 text-white/80 hover:text-white font-medium"
                >
                  Keep Swiping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.5;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Discover;
