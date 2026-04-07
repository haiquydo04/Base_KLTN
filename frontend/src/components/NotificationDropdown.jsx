/**
 * NotificationDropdown Component - Glassmorphism dropdown with Tinder-like design
 * Modern UI with backdrop blur, smooth animations
 */

import { useNavigate } from 'react-router-dom';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ 
  notifications, 
  isOpen, 
  onClose, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClearAll 
}) => {
  const navigate = useNavigate();
  
  // Count unread
  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;
  const hasNotifications = notifications?.length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown Container - Glassmorphism */}
      <div 
        className="
          absolute right-0 top-full mt-3 w-[380px] max-h-[520px]
          bg-white/80 backdrop-blur-xl
          rounded-3xl overflow-hidden
          border border-white/50
          shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]
          z-50
        "
        style={{
          animation: 'dropdownSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header - Gradient Background */}
        <div className="
          relative px-5 py-4
          bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10
          border-b border-pink-100/50
        ">
          {/* Decorative gradient orb */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-rose-200/40 to-pink-200/40 rounded-full blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-800">
                  Thông báo
                </h3>
                {/* Decorative dot */}
                <div className="absolute -top-0.5 -right-2 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              </div>
              
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <span className="
                  px-2.5 py-1 
                  bg-gradient-to-r from-pink-500 to-rose-500
                  text-white text-xs font-bold rounded-full
                  shadow-lg shadow-pink-500/30
                ">
                  {unreadCount} mới
                </span>
              )}
            </div>
            
            {/* Actions */}
            {hasNotifications && (
              <div className="flex items-center gap-2">
                {/* Mark all read */}
                <button
                  onClick={onMarkAllAsRead}
                  className="
                    px-3 py-1.5 
                    text-xs font-medium text-pink-600 
                    hover:bg-pink-50 rounded-full
                    transition-all duration-200
                  "
                >
                  ✓ Đã đọc
                </button>
                
                {/* Clear all */}
                <button
                  onClick={onClearAll}
                  className="
                    px-3 py-1.5 
                    text-xs font-medium text-gray-400 
                    hover:text-gray-600 hover:bg-gray-100
                    rounded-full transition-all duration-200
                  "
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
          {/* Scrollbar styling */}
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              width: 4px;
            }
            .scrollbar-hide::-webkit-scrollbar-track {
              background: transparent;
            }
            .scrollbar-hide::-webkit-scrollbar-thumb {
              background: rgba(156, 163, 175, 0.3);
              border-radius: 10px;
            }
            .scrollbar-hide::-webkit-scrollbar-thumb:hover {
              background: rgba(156, 163, 175, 0.5);
            }
          `}</style>
          
          {!hasNotifications ? (
            /* Empty State */
            <div className="py-16 px-6 text-center">
              {/* Decorative icon */}
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🔔</span>
                </div>
              </div>
              
              <h4 className="text-gray-700 font-semibold mb-1">
                Chưa có thông báo nào
              </h4>
              <p className="text-gray-400 text-sm">
                Thích ai đó để nhận thông báo!
              </p>
              
              {/* Decorative elements */}
              <div className="flex justify-center gap-1 mt-4">
                <span className="text-pink-300">❤️</span>
                <span className="text-purple-300">💕</span>
                <span className="text-rose-300">💖</span>
              </div>
            </div>
          ) : (
            /* Notification Items */
            <div className="divide-y divide-gray-100/50">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasNotifications && (
          <div className="
            px-5 py-3 
            bg-gradient-to-r from-gray-50/80 to-white/80
            backdrop-blur-sm
            border-t border-gray-100/50
          ">
            <button
              onClick={() => {
                onClose();
                navigate('/messages');
              }}
              className="
                w-full py-2.5 px-4
                bg-gradient-to-r from-pink-500 to-rose-500
                text-white text-sm font-semibold rounded-full
                shadow-lg shadow-pink-500/30
                hover:shadow-xl hover:shadow-pink-500/40
                transition-all duration-300
                hover:scale-[1.02] active:scale-[0.98]
              "
            >
              💬 Xem tất cả tin nhắn
            </button>
          </div>
        )}

        {/* Bottom decorative border */}
        <div className="h-1 bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 opacity-60" />
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default NotificationDropdown;
