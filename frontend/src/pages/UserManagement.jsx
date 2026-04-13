import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminUserService } from '../services/api';
import AdminLayout from '../components/AdminLayout';

// Custom Icons closely matched to the design
const Icons = {
    Heart: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#E53258" stroke="#E53258" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
    ),
    Dashboard: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    ),
    Users: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    ShieldCheck: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
    ),
    FileText: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
    ),
    Shield: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
    ),
    Settings: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    Headset: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm15 0h3a2 2 0 0 0-2-2v-5a2 2 0 0 0-2-2H16a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z" /><path d="M21 16v2a4 4 0 0 1-4 4h-5" /></svg>
    ),
    History: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
    ),
    Bell: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    ),
    Search: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    ChevronDown: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6" /></svg>
    ),
    Calendar: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    ArrowLeftRight: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="M16 21l4-4-4-4" /><path d="M20 17H4" /></svg>
    ),
    Lock: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    ),
    Activity: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
    ),
    UserImage1: () => <img src="https://i.pravatar.cc/150?u=tranminhanh" alt="avatar" className="w-full h-full object-cover" />,
    UserImage2: () => <img src="https://i.pravatar.cc/150?u=phamhai" alt="avatar" className="w-full h-full object-cover" />,
    AdminAvatar: () => <img src="https://i.pravatar.cc/150?u=admin" alt="Admin Rose" className="w-10 h-10 rounded-full object-cover" />
};

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [role, setRole] = useState('all');
    const [status, setStatus] = useState('all');
    const [gender, setGender] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = { page, limit };
            if (search) params.search = search;
            if (role !== 'all') params.role = role;
            if (status !== 'all') params.status = status;
            if (gender !== 'all') params.gender = gender;
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;

            const res = await adminUserService.getUsers(params);
            if (res.success) {
                setUsers(res.data || []);
                setTotal(res.pagination?.total || 0);
                setTotalPages(res.pagination?.pages || 1);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search, role, status, gender, dateRange]);

    const handleSearchClick = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await adminUserService.toggleStatus(id);
            if (res.success) {
                setUsers(prev => prev.map(u => u._id === id ? { ...u, isLocked: res.data.isLocked, status: res.data.status } : u));
                alert('Đã cập nhật trạng thái người dùng thành công');
            } else {
                alert(res.message || 'Lỗi khi cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    const handleUpdateRole = async (id, currentRole) => {
        const cycle = { 'user': 'premium', 'premium': 'admin', 'admin': 'user' };
        const nextRole = cycle[currentRole?.toLowerCase()] || 'user';
        try {
            const res = await adminUserService.updateRole(id, nextRole);
            if (res.success) {
                setUsers(prev => prev.map(u => u._id === id ? { ...u, role: res.data.role } : u));
                alert(`Đã cấp quyền ${res.data.role.toUpperCase()} cho người dùng`);
            } else {
                alert(res.message || 'Lỗi khi cập nhật quyền');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    const getAvatarText = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (idx) => {
        const colors = ['bg-rose-100 text-[#E53258]', 'bg-[#F1EEF0] text-gray-500', 'bg-[#E3E8FF] text-[#4F46E5]', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-600'];
        return colors[idx % colors.length];
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'PREMIUM':
                return <span className="px-3 py-1 bg-[#E8EFFF] text-[#5A7EE2] rounded-full text-[10px] font-extrabold tracking-wider">PREMIUM</span>;
            case 'ADMIN':
                return <span className="px-3 py-1 bg-[#FFF0F3] text-[#E53258] rounded-full text-[10px] font-extrabold tracking-wider">ADMIN</span>;
            case 'USER':
            default:
                return <span className="px-3 py-1 bg-[#F4EFEF] text-[#918188] rounded-full text-[10px] font-extrabold tracking-wider">USER</span>;
        }
    };

    return (
        <AdminLayout title="Quản lý người dùng" noPadding={true}>
            <div className="flex-1 overflow-y-auto p-12 pr-16 space-y-10">


                    {/* Search Bar & Role Dropdown */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1 max-w-[600px] flex items-center bg-white rounded-full shadow-sm p-1.5 pl-6">
                            <Icons.Search className="text-gray-400 w-5 h-5 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm theo Email, Username, Họ tên..." 
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-4 text-[15px] text-gray-700 placeholder-gray-400"
                            />
                            <button onClick={handleSearchClick} className="bg-[#E53258] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-rose-600 transition-colors shrink-0 shadow-md shadow-rose-200">
                                Tìm kiếm
                            </button>
                        </div>

                        <div className="relative flex items-center bg-white rounded-full shadow-sm px-6 py-[18px] cursor-pointer gap-16 border border-transparent hover:border-gray-100 transition-colors">
                            <select 
                                value={role} 
                                onChange={(e) => { setRole(e.target.value); setPage(1); }}
                                className="appearance-none bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] text-gray-800 font-medium z-10 w-full"
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="user">User</option>
                                <option value="premium">Premium</option>
                                <option value="admin">Admin</option>
                            </select>
                            <Icons.ChevronDown className="w-4 h-4 text-gray-400 absolute right-6 pointer-events-none" />
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex gap-6 items-center flex-wrap">
                        {/* Status */}
                        <div className="bg-[#FFF0F3] rounded-3xl p-1.5 px-2 pb-2 relative pt-6">
                            <div className="absolute top-2 left-6 text-[9px] font-black text-[#D3A9B2] uppercase tracking-[0.1em]">Trạng thái</div>
                            <div className="flex gap-1 items-center">
                                <button onClick={() => { setStatus('all'); setPage(1); }} className={`px-6 py-2 rounded-2xl text-[13px] font-bold transition-colors ${status === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-[#988C91] hover:text-gray-900'}`}>Tất cả</button>
                                <button onClick={() => { setStatus('active'); setPage(1); }} className={`px-5 py-2 rounded-2xl text-[13px] font-bold transition-colors ${status === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-[#988C91] hover:text-gray-900'}`}>Hoạt động</button>
                                <button onClick={() => { setStatus('banned'); setPage(1); }} className={`px-5 py-2 rounded-2xl text-[13px] font-bold transition-colors ${status === 'banned' ? 'bg-white text-gray-900 shadow-sm' : 'text-[#988C91] hover:text-gray-900'}`}>Bị khóa</button>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="bg-[#FFF0F3] rounded-3xl p-1.5 px-2 pb-2 relative pt-6">
                            <div className="absolute top-2 left-6 text-[9px] font-black text-[#D3A9B2] uppercase tracking-[0.1em]">Giới tính</div>
                            <div className="flex gap-1 items-center">
                                <button onClick={() => { setGender('all'); setPage(1); }} className={`px-5 py-2 rounded-2xl text-[13px] font-bold transition-colors ${gender === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-[#988C91] hover:text-gray-900'}`}>Tất cả</button>
                                <button onClick={() => { setGender('male'); setPage(1); }} className={`px-5 py-2 rounded-2xl text-[13px] font-bold transition-colors ${gender === 'male' ? 'bg-white text-gray-900 shadow-sm' : 'text-[#988C91] hover:text-gray-900'}`}>Nam</button>
                                <button onClick={() => { setGender('female'); setPage(1); }} className={`px-5 py-2 rounded-2xl text-[13px] font-bold transition-colors ${gender === 'female' ? 'bg-white text-gray-900 shadow-sm' : 'text-[#988C91] hover:text-gray-900'}`}>Nữ</button>
                            </div>
                        </div>

                        {/* Join Date */}
                        <div className="bg-[#FFF0F3] rounded-3xl p-1.5 px-2 pb-2 relative pt-6 flex-1 max-w-[420px]">
                            <div className="absolute top-2 left-6 text-[9px] font-black text-[#D3A9B2] uppercase tracking-[0.1em]">Khoảng thời gian tham gia</div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center bg-white rounded-2xl px-3 py-2 gap-2 justify-between">
                                    <input type="date" className="w-full text-gray-600 text-[13px] font-medium outline-none border-none bg-transparent" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                                </div>
                                <span className="text-[#988C91] text-[13px] font-bold">đến</span>
                                <div className="flex-1 flex items-center bg-white rounded-2xl px-3 py-2 gap-2 justify-between">
                                    <input type="date" className="w-full text-gray-600 text-[13px] font-medium outline-none border-none bg-transparent" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-t-[32px] rounded-b-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex-1 flex flex-col pt-8 pb-4 relative z-10 border border-gray-50/50">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr>
                                    <th className="pb-6 text-[11px] font-black tracking-widest text-[#A19D9F] uppercase w-[25%] pl-8">Tên người dùng</th>
                                    <th className="pb-6 text-[11px] font-black tracking-widest text-[#A19D9F] uppercase w-[22%]">Liên hệ</th>
                                    <th className="pb-6 text-[11px] font-black tracking-widest text-[#A19D9F] uppercase w-[13%]">Vai trò</th>
                                    <th className="pb-6 text-[11px] font-black tracking-widest text-[#A19D9F] uppercase w-[15%]">Ngày tham gia</th>
                                    <th className="pb-6 text-[11px] font-black tracking-widest text-[#A19D9F] uppercase w-[10%] text-center">Trạng thái</th>
                                    <th className="pb-6 text-[11px] font-black tracking-widest text-[#A19D9F] uppercase w-[15%] text-right pr-12">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/80">
                                {loading ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                                ) : (!users || users.length === 0) ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-gray-500">Không tìm thấy người dùng nào.</td></tr>
                                ) : users.map((user, idx) => {
                                    const isBanned = user.isLocked || user.status === 'banned';
                                    return (
                                    <tr key={user._id} className={`hover:bg-[#FCFAFA] transition-colors group ${isBanned ? 'opacity-60 bg-gray-50/50' : ''}`}>
                                        <td className="py-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 flex-shrink-0">
                                                    {user.avatar ? (
                                                        <div className="w-full h-full rounded-full overflow-hidden border border-gray-100">
                                                            <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                                                        </div>
                                                    ) : (
                                                        <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(idx)}`}>
                                                            {getAvatarText(user.fullName || user.username)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="truncate">
                                                    <div className="font-bold text-gray-900 text-[15px]">{user.fullName || user.username}</div>
                                                    <div className="text-[13px] text-gray-400 mt-0.5">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 text-gray-700 text-[14px] font-medium whitespace-nowrap overflow-hidden text-ellipsis pr-4">
                                            {user.email}
                                        </td>
                                        <td className="py-5">
                                            {getRoleBadge(user.role ? user.role.toUpperCase() : 'USER')}
                                        </td>
                                        <td className="py-5 text-gray-500 text-[14px] font-medium">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="py-5 text-center">
                                            {isBanned ? (
                                                <span className="px-3 py-1 bg-[#FFF0F3] text-[#E53258] border border-[#FFE1E8] rounded-full text-[10px] font-extrabold tracking-wider whitespace-nowrap">BỊ KHÓA</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-[#E8FFF0] text-[#10B981] border border-[#A7F3D0] rounded-full text-[10px] font-extrabold tracking-wider whitespace-nowrap">HOẠT ĐỘNG</span>
                                            )}
                                        </td>
                                        <td className="py-5 text-right pr-12">
                                            <div className="flex items-center justify-end gap-5">
                                                <button onClick={() => handleUpdateRole(user._id, user.role)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Thay đổi quyền">
                                                    <Icons.ArrowLeftRight className="w-[18px] h-[18px]"/>
                                                </button>
                                                {user.isLocked || user.status === 'banned' ? (
                                                    <button onClick={() => handleToggleStatus(user._id)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFF0F3] text-[#E53258] hover:bg-rose-100 transition-colors" title="Mở khóa">
                                                        <Icons.Lock className="w-[18px] h-[18px] text-[#E53258]"/>
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleToggleStatus(user._id)} className="text-gray-500 hover:text-gray-800 transition-colors" title="Khóa">
                                                        <Icons.Lock className="w-[18px] h-[18px]"/>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>

                        {/* Table Footer / Pagination */}
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50 px-8">
                            <span className="text-[13px] text-gray-400 font-medium tracking-wide">
                                Hiển thị <span className="font-extrabold text-gray-800">{(users && users.length > 0) ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, total)}</span> trong tổng số <span className="font-extrabold text-[#E53258]">{total}</span> người dùng
                            </span>
                            
                            <div className="flex items-center gap-8">
                                <span className="text-[13px] text-gray-500 font-medium">Trang {page} của {totalPages}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-[34px] h-[34px] rounded-full bg-gray-100/80 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50">
                                        <Icons.ChevronDown className="w-4 h-4 rotate-90" />
                                    </button>
                                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                        let p = page;
                                        if (page === 1) p = i + 1;
                                        else if (page === totalPages && totalPages > 2) p = totalPages - 2 + i;
                                        else p = page - 1 + i;
                                        if (p > totalPages) return null;
                                        
                                        return (
                                            <button 
                                                key={p} 
                                                onClick={() => setPage(p)}
                                                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold transition-colors ${page === p ? 'bg-[#B21C3A] text-white shadow-md shadow-rose-200/50 outline outline-[3px] outline-[#FFF0F3]' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    })}
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-[34px] h-[34px] rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-50">
                                        <Icons.ChevronDown className="w-4 h-4 -rotate-90" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Floating AI Insights Card */}
                        <div className="absolute right-[-24px] bottom-16 w-[340px] bg-[#1E1C22] text-white rounded-[24px] p-6 shadow-2xl z-20">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="w-11 h-11 bg-[#E53258] rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(229,50,88,0.4)]">
                                    <Icons.Activity className="w-[22px] h-[22px] text-white" />
                                </div>
                                <div className="pt-0.5">
                                    <div className="font-extrabold text-[15px] mb-0.5">AI Insights</div>
                                    <div className="text-[11px] text-gray-400 font-medium tracking-wide">Phân tích hành vi 24h qua</div>
                                </div>
                            </div>
                            <p className="text-[13px] text-gray-300 leading-relaxed mb-6 font-medium px-1">
                                Phát hiện <span className="text-[#E53258] font-bold">12 tài khoản</span> có dấu hiệu spam tin nhắn tự động. Hệ thống đề xuất xem xét khóa tạm thời.
                            </p>
                            <button className="w-full py-3 bg-[#2D2A32] hover:bg-[#38353E] border border-gray-700/60 rounded-[14px] text-[13px] text-gray-200 font-bold transition-colors shadow-sm">
                                Xem danh sách đề xuất
                            </button>
                        </div>
                    </div>
                </div>
        </AdminLayout>
    );
}