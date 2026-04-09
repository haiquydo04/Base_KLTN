/**
 * NotificationBell Component - Real-time notifications with Socket.IO
 * Modern UI with glassmorphism design (Tinder-like)
 */

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuthStore } from '../store/authStore';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const dropdownRef = useRef(null);

  // Socket listener for all notifications
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle new match notification
    const handleNewMatch = (data) => {
      // Ensure data is valid object
      if (!data || typeof data !== 'object') return;
      
      const notification = {
        id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'match',
        data: data,
        matchedBy: data.matchedBy || data.from,
        matchId: data.matchId || data.match?._id,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev].slice(0, 20));
      setHasNewNotification(true);
      
      // Play notification sound
      playNotificationSound();
      
      // Clear new notification indicator after 3 seconds
      setTimeout(() => setHasNewNotification(false), 3000);
    };

    // Handle new like notification (non-mutual)
    const handleNewLike = (data) => {
      if (!data || typeof data !== 'object') return;
      
      const notification = {
        id: `like-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'like',
        data: data,
        from: data.from,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev].slice(0, 20));
      setHasNewNotification(true);
      playNotificationSound();
      
      setTimeout(() => setHasNewNotification(false), 3000);
    };

    // Handle new message notification
    const handleNewMessage = (data) => {
      if (!data || typeof data !== 'object') return;
      
      // Don't show notification if message is from current user
      const senderId = data.sender?._id || data.senderId;
      if (senderId === user?._id) return;
      
      const notification = {
        id: `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'message',
        data: data,
        sender: data.sender,
        matchId: data.matchId || data.conversationId,
        content: typeof data.content === 'string' ? data.content : '',
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev].slice(0, 20));
    };

    socket.on('new_match', handleNewMatch);
    socket.on('new_like', handleNewLike);
    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('new_match', handleNewMatch);
      socket.off('new_like', handleNewLike);
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, isConnected, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Simple beep using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors silently
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button - Modern Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-10 h-10 
          flex items-center justify-center 
          rounded-full 
          transition-all duration-300
          ${isOpen 
            ? 'bg-pink-100 text-pink-600' 
            : hasNewNotification
              ? 'bg-pink-50 text-pink-500 hover:bg-pink-100'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }
        `}
      >
        {/* Bell Icon */}
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'scale-110' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Badge - Animated */}
        {unreadCount > 0 && (
          <span 
            className="
              absolute -top-1 -right-1 
              min-w-[20px] h-5 px-1.5
              flex items-center justify-center
              bg-gradient-to-r from-pink-500 to-rose-500
              text-white text-[10px] font-bold rounded-full
              shadow-lg
              animate-bounce-subtle
            "
            style={{
              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.4)'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Pulse ring when has new notification */}
        {hasNewNotification && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-pink-500/30 animate-ping" />
        )}
      </button>

      {/* Notification Dropdown - Glassmorphism */}
      <NotificationDropdown
        notifications={notifications}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
      />

      {/* Additional Animations */}
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
