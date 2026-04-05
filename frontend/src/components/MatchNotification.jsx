/**
 * Notification Component - Hiển thị thông báo match mới
 * Lắng nghe Socket.IO events và hiển thị popup notification
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuthStore } from '../store/authStore';

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

  const handleGoToMatches = () => {
    onClose();
    navigate('/matches');
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
              onClick={handleGoToMatches}
              className="w-full py-2 px-6 bg-gray-100 text-gray-600 font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              Xem tất cả kết nối
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

export const useMatchNotification = () => {
  const [matchNotification, setMatchNotification] = useState(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMatch = (data) => {
      console.log('[Notification] Received new_match event:', data);
      setMatchNotification(data);
      
      // Auto-close after 10 seconds if not interacted
      const timer = setTimeout(() => {
        setMatchNotification(null);
      }, 10000);
      
      return () => clearTimeout(timer);
    };

    socket.on('new_match', handleNewMatch);

    return () => {
      socket.off('new_match', handleNewMatch);
    };
  }, [socket, isConnected]);

  const closeNotification = () => {
    setMatchNotification(null);
  };

  return { matchNotification, closeNotification };
};

export const MatchNotificationProvider = ({ children }) => {
  const { matchNotification, closeNotification } = useMatchNotification();

  return (
    <>
      {children}
      {matchNotification && (
        <MatchNotification 
          matchData={matchNotification} 
          onClose={closeNotification} 
        />
      )}
    </>
  );
};

export default MatchNotification;
