import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Khám phá', path: '/' },
    { name: 'Tin nhắn', path: '/chat' },
    { name: 'Tương hợp', path: '/matches' },
    { name: 'Random Video', path: '/random-video' },
    { name: 'An toàn', path: '/safety' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-header h-20 flex justify-center">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent font-headline tracking-tight">
          LoveAI
        </Link>
        
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-semibold transition-colors duration-300",
                location.pathname === item.path 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-on-surface-variant hover:text-primary"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <Bell className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <Settings className="w-5 h-5 text-on-surface-variant" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
            <img 
              src="https://picsum.photos/seed/user/100/100" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
