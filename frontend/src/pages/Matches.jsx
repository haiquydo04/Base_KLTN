/**
 * Matches Page - Trang danh sách kết nối/match với backend API
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService, matchService } from '../services/api';
import Navbar from '../components/Navbar';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80';

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Fetch matches from backend
  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getMatches();
      const matchList = response.matches || response.data?.matches || [];
      setMatches(matchList);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Không thể tải danh sách kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Handle unmatch
  const handleUnmatch = async (matchId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn hủy kết nối này?')) return;

    try {
      await matchService.unmatch(matchId);
      setMatches(prev => prev.filter(m => m._id !== matchId));
    } catch (err) {
      console.error('Error unmatching:', err);
      setError('Không thể hủy kết nối');
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  // Get last message preview
  const getLastMessagePreview = (match) => {
    if (match.lastMessage) {
      const isMe = match.lastMessage.sender === user?._id || match.lastMessage.sender?._id === user?._id;
      return isMe ? `Bạn: ${match.lastMessage.content}` : match.lastMessage.content;
    }
    return 'Chưa có tin nhắn';
  };

  // Filter matches
  const filteredMatches = matches.filter(match => {
    if (!searchKeyword.trim()) return true;
    const otherUser = match.userId;
    const name = (otherUser?.fullName || otherUser?.username || '').toLowerCase();
    return name.includes(searchKeyword.toLowerCase());
  });

  // Empty state component
  const EmptyState = () => (
    <div className="bg-gray-800 rounded-3xl p-8 text-center">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Chưa có kết nối nào</h3>
      <p className="text-gray-400 mb-6">Hãy khám phá để tìm người phù hợp với bạn!</p>
      <Link
        to="/discover"
        className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all"
      >
        Khám phá ngay
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Kết nối</h1>
              <p className="text-gray-400 text-sm">{matches.length} kết nối</p>
            </div>
            <Link
              to="/discover"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Khám phá
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                <circle cx="11" cy="11" r="7" />
              </svg>
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm kết nối..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-pink-500 transition-colors"
            />
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
                Thử lại
              </button>
            </div>
          ) : filteredMatches.length === 0 ? (
            searchKeyword ? (
              <div className="bg-gray-800 rounded-3xl p-8 text-center">
                <p className="text-gray-400">Không tìm thấy kết nối nào</p>
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((match) => {
                const otherUser = match.userId;
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
                              {(otherUser?.fullName || otherUser?.username || '?').charAt(0).toUpperCase()}
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
                          {otherUser?.fullName || otherUser?.username || 'Unknown User'}
                        </h3>
                        {match.lastActivity && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(match.lastActivity)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${hasUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {getLastMessagePreview(match)}
                        </p>
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

                    {/* Match time badge */}
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <span className="text-xs text-gray-500">
                        {match.matchedAt ? formatTime(match.matchedAt) : ''}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleUnmatch(match._id, e)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        title="Hủy kết nối"
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
