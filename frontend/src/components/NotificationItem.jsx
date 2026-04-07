/**
 * NotificationItem Component - Individual notification item with Tinder-like design
 * Glassmorphism style, modern UI
 */

import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  
  // Safe data extraction with optional chaining
  const type = notification?.type || 'system';
  const matchedBy = notification?.matchedBy || notification?.data?.matchedBy;
  const fromUser = notification?.from || notification?.data?.from;
  const sender = notification?.sender || notification?.data?.sender;
  const message = notification?.message || '';
  const content = notification?.content || '';
  const matchId = notification?.matchId || notification?.data?.matchId;
  const timestamp = notification?.timestamp ? new Date(notification.timestamp) : new Date();
  const isRead = notification?.read !== false;
  
  // Get user info based on type
  const getUser = () => {
    switch (type) {
      case 'match':
        return matchedBy || fromUser;
      case 'like':
        return fromUser;
      case 'message':
        return sender;
      default:
        return null;
    }
  };
  
  const user = getUser();
  const userName = user?.username || user?.fullName || 'Ai đó';
  const avatar = user?.avatar;
  
  // Format timestamp
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };
  
  // Get type-specific icon and color
  const getTypeConfig = () => {
    switch (type) {
      case 'match':
        return {
          icon: '💕',
          bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500',
          borderColor: 'border-pink-300',
          label: 'Tương hợp'
        };
      case 'like':
        return {
          icon: '❤️',
          bgColor: 'bg-gradient-to-br from-red-400 to-pink-500',
          borderColor: 'border-red-200',
          label: 'Thích'
        };
      case 'message':
        return {
          icon: '💬',
          bgColor: 'bg-gradient-to-br from-blue-400 to-indigo-500',
          borderColor: 'border-blue-200',
          label: 'Tin nhắn'
        };
      case 'ai':
        return {
          icon: '✨',
          bgColor: 'bg-gradient-to-br from-purple-400 to-violet-500',
          borderColor: 'border-purple-200',
          label: 'AI'
        };
      default:
        return {
          icon: '🔔',
          bgColor: 'bg-gradient-to-br from-gray-400 to-gray-500',
          borderColor: 'border-gray-200',
          label: 'Thông báo'
        };
    }
  };
  
  const typeConfig = getTypeConfig();
  
  // Get message based on type
  const getDisplayMessage = () => {
    switch (type) {
      case 'match':
        return `${userName} đã tương hợp với bạn`;
      case 'like':
        return `${userName} đã thích bạn`;
      case 'message':
        return content || `${userName} đã gửi tin nhắn`;
      case 'ai':
        return message || 'AI gợi ý cho bạn một điều mới!';
      default:
        return message || 'Bạn có thông báo mới';
    }
  };
  
  // Handle click based on type
  const handleClick = () => {
    onMarkAsRead?.(notification.id);
    
    switch (type) {
      case 'match':
        if (matchId) {
          navigate(`/chat/${matchId}`);
        } else if (user?._id) {
          navigate(`/profile/${user._id}`);
        }
        break;
      case 'like':
        if (user?._id) {
          navigate(`/profile/${user._id}`);
        }
        break;
      case 'message':
        if (matchId) {
          navigate(`/chat/${matchId}`);
        }
        break;
      case 'ai':
        navigate('/discover');
        break;
      default:
        break;
    }
  };
  
  // Handle send message (for match type)
  const handleSendMessage = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
    if (matchId) {
      navigate(`/chat/${matchId}`);
    }
  };
  
  // Handle view profile (for match type)
  const handleViewProfile = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
    if (user?._id) {
      navigate(`/profile/${user._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-4 cursor-pointer transition-all duration-200
        hover:bg-white/60 active:scale-[0.98]
        ${!isRead ? 'bg-gradient-to-r from-pink-50/30 to-purple-50/30' : ''}
        border-b border-gray-100/50 last:border-b-0
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with overlay icon */}
        <div className="relative flex-shrink-0 group">
          {/* Avatar */}
          <div 
            className={`
              w-12 h-12 rounded-full overflow-hidden 
              ring-2 ${typeConfig.borderColor} 
              shadow-lg transition-transform duration-200 
              group-hover:scale-105 group-hover:ring-4
            `}
            style={{ 
              boxShadow: isRead ? '' : `0 0 12px ${type === 'match' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full ${typeConfig.bgColor} flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Type Icon Overlay */}
          <div 
            className={`
              absolute -bottom-1 -right-1 w-6 h-6 
              ${typeConfig.bgColor}
              rounded-full flex items-center justify-center
              text-xs shadow-md border-2 border-white
              transition-transform duration-200 group-hover:scale-110
            `}
          >
            {typeConfig.icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Message */}
          <p className={`text-sm leading-snug ${isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
            {getDisplayMessage()}
          </p>
          
          {/* Time and Type */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-400">
              {formatTime(timestamp)}
            </span>
            <span className="text-gray-300">•</span>
            <span className={`text-xs ${typeConfig.bgColor} bg-clip-text text-transparent font-medium`}>
              {typeConfig.label}
            </span>
          </div>
          
          {/* Action Buttons for Match type */}
          {type === 'match' && !isRead && (
            <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleSendMessage}
                className="
                  flex-1 py-2 px-3 
                  bg-gradient-to-r from-pink-500 to-rose-500 
                  text-white text-xs font-semibold rounded-full
                  shadow-md hover:shadow-lg
                  transition-all duration-200
                  hover:scale-[1.02] active:scale-[0.98]
                "
              >
                💬 Gửi lời chào
              </button>
              <button
                onClick={handleViewProfile}
                className="
                  py-2 px-3 
                  bg-white/80 backdrop-blur-sm
                  text-gray-700 text-xs font-medium rounded-full
                  border border-gray-200
                  hover:bg-white hover:border-pink-300
                  transition-all duration-200
                "
              >
                👤 Hồ sơ
              </button>
            </div>
          )}
        </div>
        
        {/* Unread Indicator */}
        {!isRead && (
          <div className="flex-shrink-0 mt-2">
            <div className="w-2.5 h-2.5 bg-pink-500 rounded-full shadow-pink animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
