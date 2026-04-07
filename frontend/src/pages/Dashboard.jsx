import React, { useState, useEffect } from 'react';
import { adminDashboardService, adminAuthService } from '../services/api';
import { LineChart, Line, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

// Custom Icons to match the design precisely
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
  Wifi: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
  ),
  Heart: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#E53258" stroke="#E53258" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  ),
  AlertTriangle: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  ),
  ChevronDown: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
  ),
  Sparkles: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/></svg>
  ),
  MoreVertical: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
  ),
  CheckCircle2: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  MinusCircle: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
  ),
  Bot: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>
  ),
  UserFace1: () => <img src="https://i.pravatar.cc/150?u=1" alt="avatar" className="w-10 h-10 rounded-full object-cover" />,
  UserFace2: () => <img src="https://i.pravatar.cc/150?u=2" alt="avatar" className="w-10 h-10 rounded-full object-cover" />,
  UserFace3: () => <img src="https://i.pravatar.cc/150?u=5" alt="avatar" className="w-10 h-10 rounded-full object-cover" />
};

export default function Dashboard() {
  const [admin, setAdmin] = useState({ name: 'Quản trị viên', avatar: null });
  const [stats, setStats] = useState({ totalUsers: 0, usersOnline: 0, totalMatches: 0 });
  const [growthData, setGrowthData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysRange, setDaysRange] = useState(7);
  const [isDaysDropdownOpen, setIsDaysDropdownOpen] = useState(false);
  const [userLimit, setUserLimit] = useState(5);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        try {
          const adminInfo = await adminAuthService.getCurrentAdmin();
          if (adminInfo) setAdmin(adminInfo.data || adminInfo);
        } catch (e) {
          console.error('Failed to load admin profile', e);
        }

        try {
          const [statsData, growthRes, genderRes, recentUsersRes] = await Promise.all([
            adminDashboardService.getStats(),
            adminDashboardService.getGrowth(daysRange),
            adminDashboardService.getGender(),
            adminDashboardService.getRecentUsers(userLimit)
          ]);
          
          if (statsData) setStats(statsData.data || statsData);
          
          if (growthRes) {
            const rawGrowth = growthRes.data || growthRes;
            const growthArr = Array.isArray(rawGrowth) ? rawGrowth : (Array.isArray(rawGrowth.data) ? rawGrowth.data : []);
            
            const lastDays = Array.from({length: daysRange}, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - ((daysRange - 1) - i));
              return d.toISOString().split('T')[0];
            });

            const fullGrowthData = lastDays.map(date => {
              const found = growthArr.find(item => item._id === date || item.date === date);
              return {
                date: date.substring(5), // Just MM-DD to look clean on x-axis
                users: found ? (found.count || found.users || 0) : 0
              };
            });
            
            setGrowthData(fullGrowthData);
          }

          if (genderRes) {
            const rawGender = genderRes.data || genderRes;
            if (Array.isArray(rawGender)) {
              setGenderData(rawGender);
            } else if (rawGender && typeof rawGender === 'object') {
              const mappedArr = [];
              for (const [key, value] of Object.entries(rawGender)) {
                if (key !== 'success' && typeof value === 'number') {
                  let label = key;
                  if (key.toLowerCase() === 'male') label = 'Nam';
                  if (key.toLowerCase() === 'female') label = 'Nữ';
                  if (key.toLowerCase() === 'other') label = 'Khác';
                  if (key.toLowerCase() === 'unknown') continue; // Don't show unknown if not needed or group them
                  mappedArr.push({ gender: label, count: value });
                }
              }
              setGenderData(mappedArr);
            } else {
              setGenderData([]);
            }
          }

          if (recentUsersRes) {
            const rawUsers = recentUsersRes.data || recentUsersRes;
            setRecentUsers(Array.isArray(rawUsers) ? rawUsers : (Array.isArray(rawUsers?.data) ? rawUsers.data : []));
          }
        } catch (e) {
          console.error('Failed to load dashboard data', e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Thiết lập Polling (Gửi yêu cầu liên tục) mỗi 5 giây để lấy dữ liệu stats mới nhất (giúp số liệu Trực Tuyến nhảy real-time mà k cần reload)
    const statsInterval = setInterval(async () => {
      try {
        const statsData = await adminDashboardService.getStats();
        if (statsData) {
          setStats(prevStats => ({
            ...prevStats,
            ...(statsData.data || statsData)
          }));
        }
      } catch (e) {}
    }, 5000);

    return () => clearInterval(statsInterval);
  }, [daysRange, userLimit]);

  const COLORS = ['#E53258', '#475569', '#F1F5F9'];

  return (
    <AdminLayout title="Bảng điều khiển">
      {/* Welcome Text */}
          <div>
            <h2 className="text-[28px] font-bold text-gray-900">Chào mừng trở lại, {admin.name || 'Quản trị viên'}</h2>
            <p className="text-gray-500 italic mt-1">"Kết nối trái tim bằng trí tuệ nhân tạo"</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col border border-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-rose-50 text-[#E53258] rounded-xl flex items-center justify-center">
                  <Icons.Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Tổng người dùng</p>
              <h3 className="text-[32px] font-bold mt-1 text-gray-800">{loading ? '...' : (stats.totalUsers?.toLocaleString() || '0')}</h3>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col border border-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center border border-gray-100">
                  <Icons.Wifi className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-green-500 text-[10px] font-bold rounded-full tracking-wider border border-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  TRỰC TIẾP
                </div>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Đang trực tuyến</p>
              <h3 className="text-[32px] font-bold mt-1 text-gray-800">{loading ? '...' : (stats.onlineUsers?.toLocaleString() || '0')}</h3>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col border border-gray-50">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                  <Icons.Heart className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Tỷ lệ tương hợp AI / Tổng</p>
              <h3 className="text-[32px] font-bold mt-1 text-gray-800">{loading ? '...' : (stats.totalMatches?.toLocaleString() || '88%')}</h3>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col border border-gray-50">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 text-[#E53258] bg-rose-50 rounded-xl flex items-center justify-center">
                  <Icons.AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Cảnh báo gian lận</p>
              <h3 className="text-[32px] font-bold mt-1 text-gray-800">12</h3>
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-[24px] p-8 shadow-sm border border-gray-50">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-bold">Tăng trưởng người dùng</h3>
                <div className="relative">
                  <button 
                    onClick={() => setIsDaysDropdownOpen(!isDaysDropdownOpen)} 
                    className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors px-4 py-2 rounded-full font-medium"
                  >
                    {daysRange} ngày qua
                    <Icons.ChevronDown />
                  </button>
                  {isDaysDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
                      {[7, 14, 30, 90].map(d => (
                        <button 
                          key={d} 
                          onClick={() => { setDaysRange(d); setIsDaysDropdownOpen(false); }} 
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${daysRange === d ? 'bg-rose-50 text-[#E53258] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {d} ngày qua
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="h-64 mt-4 w-full">
                {growthData && growthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="users" stroke="#E53258" strokeWidth={3} dot={{ r: 4, fill: '#E53258', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <p className="text-gray-400 text-sm">Chưa có đủ dữ liệu tăng trưởng.</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Status */}
            <div className="bg-[#475569] text-white rounded-[24px] p-8 shadow-sm flex flex-col relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <Icons.Sparkles className="w-6 h-6 text-white" />
                <h3 className="text-lg font-bold">Trạng thái Công cụ AI</h3>
              </div>

              <div className="space-y-6 flex-1">
                {[
                  { title: 'XỬ LÝ NGÔN NGỮ TỰ NHIÊN', status: 'Đang hoạt động tốt', badge: 'ONLINE' },
                  { title: 'PHÁT HIỆN THỰC THỂ SỐNG', status: 'Tải trung bình', badge: 'ONLINE' },
                  { title: 'KIỂM DUYỆT HÌNH ẢNH', status: 'Đang quét 1.2k ảnh/phút', badge: 'ONLINE' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div>
                      <h4 className="text-xs font-bold tracking-widest text-[#94A3B8] mb-1">{item.title}</h4>
                      <p className="text-sm font-medium text-white group-hover:text-gray-200 transition-colors">{item.status}</p>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded border border-green-400/30 text-green-400 bg-green-400/10">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-600/50">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold tracking-widest text-[#94A3B8]">ĐỘ TIN CẬY TỔNG THỂ</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-[#E53258] rounded-full" style={{ width: '98.2%' }}></div>
                </div>
                <div className="text-right text-xs font-bold text-white">98.2%</div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
            {/* New Users */}
            <div className="lg:col-span-2 bg-white rounded-[24px] p-8 shadow-sm border border-gray-50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Người dùng mới</h3>
                <button 
                  onClick={() => setUserLimit(userLimit === 5 ? 50 : 5)}
                  className="flex items-center gap-1 text-[#E53258] hover:text-[#C12543] font-bold text-sm transition-colors"
                >
                  {userLimit === 5 ? 'Xem tất cả' : 'Thu gọn'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-xs font-bold tracking-widest text-gray-400 w-1/3">NGƯỜI DÙNG</th>
                      <th className="pb-4 text-xs font-bold tracking-widest text-gray-400">TRẠNG THÁI</th>
                      <th className="pb-4 text-xs font-bold tracking-widest text-gray-400">NGÀY THAM GIA</th>
                      <th className="pb-4 text-xs font-bold tracking-widest text-gray-400 text-right">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentUsers && recentUsers.length > 0 ? recentUsers.map((user, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-4">
                            {user.avatar ? <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="avatar" /> : <Icons.UserFace1 />}
                            <div>
                              <div className="font-bold text-gray-800">{user.name}</div>
                              <div className="text-xs text-gray-400 font-medium">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          {user.status === 'active' || user.status === 'Verified' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[11px] font-bold uppercase tracking-wider">
                              <Icons.ShieldCheck className="w-3.5 h-3.5" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-[#E53258] text-[11px] font-bold uppercase tracking-wider">
                              <Icons.MinusCircle className="w-3.5 h-3.5" />
                              {user.status || 'Chờ duyệt'}
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="text-gray-600 font-medium whitespace-nowrap">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100 inline-flex items-center justify-center">
                            <Icons.MoreVertical />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-400 text-sm">Chưa có người dùng mới</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-50 flex flex-col relative">
              <h3 className="text-lg font-bold mb-8">Phân bổ giới tính</h3>
              
              <div className="absolute top-6 right-6 w-10 h-10 bg-[#E53258] rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
                <Icons.Bot className="text-white w-5 h-5" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 mb-8 flex-shrink-0">
                  {genderData && genderData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="count"
                          stroke="none"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-full border-8 border-gray-100 flex items-center justify-center">
                    </div>
                  )}
                  {/* Inner white circle for donut hole label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center shadow-inner pointer-events-none rounded-full">
                    <span className="text-2xl font-bold text-gray-800">
                      {stats.totalUsers ? (stats.totalUsers > 1000 ? (stats.totalUsers/1000).toFixed(1)+'K' : stats.totalUsers) : '0'}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-1">Tổng số</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                  {genderData && genderData.map((g, i) => (
                    <div key={i} className={`${i === 0 ? 'bg-[#FFF0F3]' : 'bg-[#F8FAFC]'} ${i > 1 ? 'col-span-2' : ''} rounded-[16px] p-4 flex flex-col items-center justify-center text-center`}>
                      <span className={`text-[11px] font-bold tracking-widest ${i === 0 ? 'text-[#E53258]' : 'text-gray-500'} uppercase mb-1`}>{g.gender || g.name}</span>
                      <span className="text-xl font-bold text-gray-800">
                        {stats.totalUsers ? Math.round((g.count / stats.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                  {(!genderData || genderData.length === 0) && (
                    <>
                      <div className="bg-[#FFF0F3] rounded-[16px] p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] font-bold tracking-widest text-[#E53258] uppercase mb-1">Nữ</span>
                        <span className="text-xl font-bold text-gray-800">0%</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-[16px] p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-1">Nam</span>
                        <span className="text-xl font-bold text-gray-800">0%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            </div>
    </AdminLayout>
  );
}
