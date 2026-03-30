import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, MessageCircle, Heart, Video, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Khám phá', path: '/', icon: Compass },
    { name: 'Tin nhắn', path: '/chat', icon: MessageCircle },
    { name: 'Tương hợp', path: '/matches', icon: Heart },
    { name: 'Video', path: '/random-video', icon: Video },
    { name: 'An toàn', path: '/safety', icon: Shield },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-surface/80 backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-on-surface-variant"
            )}
          >
            <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-current")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
