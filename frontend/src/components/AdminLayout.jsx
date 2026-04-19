import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminAuthService } from '../services/api';

const Icons = {
  Dashboard: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  Users: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Shield: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
  ),
  ShieldCheck: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  FileText: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
  ),
  Settings: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Search: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Bell: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
  ),
  Message: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Window: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 21V9"/></svg>
  ),
  Activity: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
  ),
  UserFace1: () => <img src="https://i.pravatar.cc/150?u=1" alt="avatar" className="w-10 h-10 rounded-full object-cover" />
};

export default function AdminLayout({ children, title = 'Bảng điều khiển', noPadding = false }) {
  const [admin, setAdmin] = useState({ name: 'Quản trị viên', avatar: null });
  const location = useLocation();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const adminInfo = await adminAuthService.getCurrentAdmin();
        if (adminInfo) setAdmin(adminInfo.data || adminInfo);
      } catch (e) {
        console.error('Failed to load admin profile', e);
      }
    };
    fetchAdminInfo();
  }, []);

  const getMenuClass = (path) => {
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return "flex items-center gap-3 px-6 py-3 bg-[#FFF0F3] border-l-4 border-[#E53258] text-[#E53258] font-medium transition-colors";
    }
    return "flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50 font-medium transition-colors border-l-4 border-transparent";
  };

  const getIconClass = (path) => {
    const isActive = location.pathname.startsWith(path);
    return `w-5 h-5 ${isActive ? '' : 'text-gray-400'}`;
  };

  return (
    <div className="flex h-screen bg-[#FDFBFB] font-sans text-[#334155]">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-[#F0EBEF] flex flex-col justify-between py-6 shrink-0 relative">
        <div>
          <div className="px-6 mb-10">
            <h1 className="text-[#E53258] font-bold text-2xl tracking-tight leading-none">LoveAI</h1>
            <p className="text-gray-500 text-xs mt-1">Bộ Quản lý</p>
          </div>

          <nav className="flex flex-col gap-2">
            <Link to="/admin/dashboard" className={getMenuClass('/admin/dashboard')}>
              <Icons.Dashboard className={getIconClass('/admin/dashboard')} />
              Bảng điều khiển
            </Link>
            <Link to="/admin/users" className={getMenuClass('/admin/users')}>
              <Icons.Users className={getIconClass('/admin/users')} />
              Quản lý người dùng
            </Link>
            <Link to="/admin/ai" className={getMenuClass('/admin/ai')}>
              <Icons.ShieldCheck className={getIconClass('/admin/ai')} />
              Kiểm duyệt AI
            </Link>
            <Link to="/admin/categories" className={getMenuClass('/admin/categories')}>
              <Icons.FileText className={getIconClass('/admin/categories')} />
              Quản lý danh mục
            </Link>
            <Link to="/admin/sessions" className={getMenuClass('/admin/sessions')}>
              <Icons.Window className={getIconClass('/admin/sessions')} />
              Phiên làm việc
            </Link>
            <Link to="/admin/trace" className={getMenuClass('/admin/trace')}>
              <Icons.Activity className={getIconClass('/admin/trace')} />
              Lưu vết hệ thống
            </Link>
            <Link to="/admin/settings" className={getMenuClass('/admin/settings')}>
              <Icons.Settings className={getIconClass('/admin/settings')} />
              Cài đặt hệ thống
            </Link>
          </nav>
        </div>

        <div className="px-6 mt-8">
          <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#475569] hover:bg-[#334155] text-white rounded-full font-medium transition-colors shadow-sm">
            <Icons.Shield className="w-4 h-4" />
            Chế độ An toàn
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[76px] px-8 flex items-center justify-between border-b border-[#F0EBEF] bg-white/70 backdrop-blur-md shrink-0">
          <h2 className="text-xl font-bold">{title}</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Icons.Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm hệ thống..." 
                className="w-64 pl-10 pr-4 py-2 bg-gray-100/80 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E53258]/20 transition-shadow"
              />
            </div>
            
            <div className="flex items-center gap-4 border-l border-gray-200 pl-6 cursor-pointer">
              <div className="relative text-gray-600 hover:text-gray-900 transition-colors">
                <Icons.Bell className="w-5 h-5" />
                <span className="absolute 1 top-0 right-0 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
              </div>
              <div className="text-gray-600 hover:text-gray-900 transition-colors">
                <Icons.Message className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                  {admin.avatar ? <img src={admin.avatar} alt="avatar" className="w-full h-full object-cover" /> : <Icons.UserFace1 />}
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-[#E53258] transition-colors uppercase tracking-widest bg-gray-50 hover:bg-rose-50 px-3 py-1.5 rounded-full"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-8 space-y-8'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
