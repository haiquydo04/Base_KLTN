import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService, matchService } from '../services/api';
import Navbar from '../components/Navbar';

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await userService.getMatches();
      setMatches(response.matches || []);
      setError('');
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleUnmatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to unmatch?')) return;

    try {
      await matchService.unmatch(matchId);
      setMatches(prev => prev.filter(m => m._id !== matchId));
    } catch (err) {
      console.error('Error unmatching:', err);
      setError('Failed to unmatch');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Matches</h1>
              <p className="text-gray-400 text-sm">{matches.length} new connections</p>
            </div>
            <Link
              to="/discover"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Discover
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : error ? (
            <div className="bg-gray-800 rounded-3xl p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchMatches}
                className="px-6 py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-gray-800 rounded-3xl p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Matches Yet</h3>
              <p className="text-gray-400 mb-6">Start swiping to find your perfect match!</p>
              <Link
                to="/discover"
                className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Start Discovering
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const otherUser = match.users?.find(u => u._id !== user?._id);
                const lastMessage = match.lastMessage;
                const hasUnread = match.unreadCount > 0;

                return (
                  <div
                    key={match._id}
                    className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-750 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/chat/${match._id}`)}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gray-700 overflow-hidden">
                        {otherUser?.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500">
                            <span className="text-2xl font-bold text-white">
                              {otherUser?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      {otherUser?.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-gray-800 rounded-full"></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-pink-400 transition-colors">
                          {otherUser?.fullName || otherUser?.username}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {lastMessage ? (
                          <p className={`text-sm truncate ${hasUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {lastMessage.sender?._id === user?._id && 'You: '}
                            {lastMessage.content}
                          </p>
                        ) : (
                          <span className="italic text-gray-500 text-sm">Say hello!</span>
                        )}
                        {hasUnread && (
                          <span className="flex-shrink-0 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-xs text-white">
                            {match.unreadCount}
                          </span>
                        )}
                      </div>
                      {otherUser?.location && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{otherUser.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleUnmatch(match._id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        title="Unmatch"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Matches;
