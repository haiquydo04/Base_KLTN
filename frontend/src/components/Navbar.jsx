import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/discover', label: 'Khám phá', icon: '🔍' },
    { to: '/messages', label: 'Tin nhắn', icon: '💬' },
    { to: '/video-chat', label: 'Video', icon: '📹' },
    { to: '/safety', label: 'An toàn', icon: '🛡️' }
  ];

  const isDiscover = location.pathname === '/discover';
  const isMessages = location.pathname === '/messages' || location.pathname.startsWith('/chat/');
  const isVideo = location.pathname === '/video-chat';
  const isSafety = location.pathname === '/safety';

  const checkIsActive = (label) => {
    if (label === 'Khám phá' && isDiscover) return true;
    if (label === 'Tin nhắn' && isMessages) return true;
    if (label === 'Video' && isVideo) return true;
    if (label === 'An toàn' && isSafety) return true;
    return false;
  };

  return (
    <>
      {/* ─── HEADER (TOP NAV) ─── */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
            
            {/* Logo */}
            <Link
              to="/discover"
              className="text-xl sm:text-2xl font-bold text-rose-500 flex-shrink-0"
              style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}
            >
              LoveAI
            </Link>

            {/* Desktop Center Nav Links (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const isHighlighted = checkIsActive(link.label);

                  return (
                    <Link
                      key={`${link.to}-${link.label}`}
                      to={link.to}
                      className={`px-4 lg:px-5 py-2 text-[13px] lg:text-sm font-semibold transition-all rounded-full ${
                        isHighlighted
                          ? 'text-gray-900 border-b-2 border-rose-500 bg-rose-50/50'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      style={isHighlighted ? { borderRadius: 0, borderBottom: '2px solid #f43f5e' } : {}}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Notification Bell */}
              <NotificationBell />

              {/* Settings (Desktop Only) */}
              <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-rose-300">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <svg className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 sm:w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 sm:py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Xem hồ sơ
                    </Link>
                    <Link
                      to="/profile/edit"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 sm:py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Chỉnh sửa hồ sơ
                    </Link>
                    
                    {/* Settings (Mobile Only) */}
                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex md:hidden items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Cài đặt
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 sm:py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── BOTTOM NAVIGATION (MOBILE ONLY) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navLinks.map((link) => {
            const isHighlighted = checkIsActive(link.label);
            
            return (
              <Link
                key={`bottom-${link.to}`}
                to={link.to}
                className="flex flex-col items-center justify-center w-full h-full gap-1"
              >
                <span className={`text-xl ${isHighlighted ? 'scale-110 transition-transform' : 'opacity-70 grayscale'}`}>
                  {link.icon}
                </span>
                <span className={`text-[10px] font-bold ${isHighlighted ? 'text-rose-500' : 'text-gray-500'}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;