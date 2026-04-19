import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Icons = {
  Compass: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  User: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Message: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  ChevronLeft: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"></polyline></svg>,
  Menu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Video: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
  Shield: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2s8 3.5 8 10c0 5-4.5 9-8 10-3.5-1-8-5-8-10 0-6.5 8-10 8-10z"></path></svg>
};

const SidebarMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/discover', label: 'Khám phá', icon: Icons.Compass },
    { path: '/messages', label: 'Tin nhắn', icon: Icons.Message },
    { path: '/video-chat', label: 'Video ngẫu nhiên', icon: Icons.Video },
    { path: '/safety', label: 'An toàn', icon: Icons.Shield },
    { path: '/profile', label: 'Hồ sơ', icon: Icons.User },
    { path: '/settings', label: 'Cài đặt', icon: Icons.Settings },
  ];

  return (
    <div className={`hidden md:flex flex-col border-r border-rose-100 bg-white/60 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative z-40 ${isSidebarOpen ? 'w-64' : 'w-16'} shadow-[2px_0_15px_rgba(244,63,94,0.03)] h-full shrink-0`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        className="absolute -right-[14px] top-6 w-7 h-7 bg-white border border-rose-200 text-rose-500 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:bg-rose-50 transition-all z-50 focus:outline-none"
      >
        {isSidebarOpen ? <Icons.ChevronLeft size={16} /> : <Icons.Menu size={14} className="text-rose-500" />}
      </button>

      <div className="flex-1 overflow-hidden flex flex-col py-6 px-3">
        <nav className="flex flex-col gap-2 relative">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-4 px-3 py-3 rounded-[1rem] transition-all overflow-hidden whitespace-nowrap ${
                  isActive 
                    ? 'bg-rose-50/50 text-rose-600 font-bold hover:bg-rose-50' 
                    : 'text-gray-500 hover:text-gray-900 font-medium hover:bg-gray-50'
                }`} 
                title={item.label}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SidebarMenu;
