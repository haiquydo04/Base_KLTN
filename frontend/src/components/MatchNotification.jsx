/**
 * Notification Component - Handles match and like notifications
 * Listens to Socket.IO events and displays popup notifications
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuthStore } from '../store/authStore';

/**
 * Like Notification - When someone likes you (but it's not mutual)
 */
const LikeNotification = ({ likeData, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!likeData) return null;

  const fromUser = likeData.from || likeData;

  const handleViewProfile = () => {
    onClose();
    if (fromUser?._id) {
      navigate(`/profile/${fromUser._id}`);
    }
  };

  const handleGoToDiscover = () => {
    onClose();
    navigate('/discover');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(251,113,133,0.06), rgba(167,139,250,0.06))'
          }}
        />

        <div className="relative text-center">
          {/* Emoji */}
          <div className="text-5xl mb-3">💖</div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Ai đó đã thích bạn!
          </h2>
          
          {/* Message */}
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-semibold text-gray-700">{fromUser?.username || fromUser?.fullName || 'Một người'}</span> đã thích hồ sơ của bạn
          </p>
          
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-pink-400 shadow-lg"
              style={{ boxShadow: '0 0 0 3px white, 0 0 0 5px #fb7185' }}
            >
              {fromUser?.avatar ? (
                <img src={fromUser.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {fromUser?.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {fromUser?.bio && (
            <p className="text-xs text-gray-400 mb-4 italic">
              "{fromUser.bio.slice(0, 50)}{fromUser.bio.length > 50 ? '...' : ''}"
            </p>
          )}
          
          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleViewProfile}
              className="w-full py-2.5 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              💕 Xem hồ sơ
            </button>
            <button
              onClick={handleGoToDiscover}
              className="w-full py-2 px-6 bg-gray-100 text-gray-600 font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              Tiếp tục khám phá
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

/**
 * Match Notification - When it's a mutual match
 */
const MatchNotification = ({ matchData, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!matchData) return null;

  const otherUser = matchData.matchedBy || matchData.user || matchData;

  const handleGoToChat = () => {
    onClose();
    if (matchData.matchId) {
      navigate(`/chat/${matchData.matchId}`);
    }
  };

  const handleGoToDiscover = () => {
    onClose();
    navigate('/discover');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(251,113,133,0.08), rgba(167,139,250,0.08))'
          }}
        />

        <div className="relative text-center">
          {/* Emoji */}
          <div className="text-6xl mb-4">💕</div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Kết đôi!
          </h2>
          
          {/* Message */}
          <p className="text-sm text-gray-500 mb-6">
            Bạn và <span className="font-semibold text-gray-700">{otherUser?.username || otherUser?.fullName || 'Ai đó'}</span> đã thích nhau!
          </p>
          
          {/* Avatars */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Current user */}
            <div 
              className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-pink-400 shadow-lg"
              style={{ boxShadow: '0 0 0 3px white, 0 0 0 5px #fb7185' }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Heart in middle */}
            <div className="text-2xl animate-pulse">❤️</div>
            
            {/* Other user */}
            <div 
              className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-400 shadow-lg"
              style={{ boxShadow: '0 0 0 3px white, 0 0 0 5px #c4b5fd' }}
            >
              {otherUser?.avatar ? (
                <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {otherUser?.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Bio/Message */}
          {otherUser?.bio && (
            <p className="text-xs text-gray-400 mb-6 italic">
              "{otherUser.bio.slice(0, 60)}{otherUser.bio.length > 60 ? '...' : ''}"
            </p>
          )}
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToChat}
              className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              style={{
                boxShadow: '0 6px 20px rgba(244, 63, 94, 0.35)'
              }}
            >
              💬 Nhắn tin ngay
            </button>
            <button
              onClick={handleGoToDiscover}
              className="w-full py-2 px-6 bg-gray-100 text-gray-600 font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              Tiếp tục khám phá
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { 
            opacity: 0; 
            transform: scale(0.8) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Hook to manage all notifications
 */
export const useMatchNotification = () => {
  const [matchNotification, setMatchNotification] = useState(null);
  const [likeNotification, setLikeNotification] = useState(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle mutual match
    const handleNewMatch = (data) => {
      setMatchNotification(data);
      // Clear like notification if any
      setLikeNotification(null);
      
      // Auto-close after 15 seconds if not interacted
      const timer = setTimeout(() => {
        setMatchNotification(null);
      }, 15000);
      
      return () => clearTimeout(timer);
    };

    // Handle non-mutual like (someone liked you)
    const handleNewLike = (data) => {
      // Only show like notification if not already showing a match
      if (!matchNotification) {
        setLikeNotification(data);
        
        // Auto-close after 8 seconds if not interacted
        const timer = setTimeout(() => {
          setLikeNotification(null);
        }, 8000);
        
        return () => clearTimeout(timer);
      }
    };

    socket.on('new_match', handleNewMatch);
    socket.on('new_like', handleNewLike);

    return () => {
      socket.off('new_match', handleNewMatch);
      socket.off('new_like', handleNewLike);
    };
  }, [socket, isConnected, matchNotification]);

  const closeMatchNotification = () => {
    setMatchNotification(null);
  };

  const closeLikeNotification = () => {
    setLikeNotification(null);
  };

  return { 
    matchNotification, 
    likeNotification,
    closeMatchNotification,
    closeLikeNotification
  };
};

/**
 * Provider that renders all notifications
 */
export const MatchNotificationProvider = ({ children }) => {
  const { matchNotification, likeNotification, closeMatchNotification, closeLikeNotification } = useMatchNotification();

  return (
    <>
      {children}
      {matchNotification && (
        <MatchNotification 
          matchData={matchNotification} 
          onClose={closeMatchNotification} 
        />
      )}
      {likeNotification && (
        <LikeNotification
          likeData={likeNotification}
          onClose={closeLikeNotification}
        />
      )}
    </>
  );
};

export default MatchNotification;
