import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Heart, MessageSquare, Bell, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const location = useLocation();

  const items = [
    { icon: User, path: '/profile', label: 'Hồ sơ' },
    { icon: Heart, path: '/matches', label: 'Tương hợp' },
    { icon: MessageSquare, path: '/chat', label: 'Tin nhắn' },
    { icon: Bell, path: '/notifications', label: 'Thông báo' },
    { icon: Sliders, path: '/settings', label: 'Cài đặt' },
  ];

  return (
    <aside className="hidden xl:flex fixed left-0 top-1/2 -translate-y-1/2 flex-col p-6 space-y-4 h-auto w-20 bg-surface-container-low rounded-r-3xl shadow-2xl shadow-primary/5 z-30">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "p-3 rounded-2xl transition-all flex items-center justify-center",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-on-surface-variant hover:bg-surface-container-high"
            )}
            title={item.label}
          >
            <Icon className="w-6 h-6" />
          </Link>
        );
      })}
    </aside>
  );
};
