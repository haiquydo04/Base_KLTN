import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

// Custom Icons for Session Management
const Icons = {
    Search: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    ),
    Filter: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
    ),
    Logout: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    ),
    Laptop: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
    ),
    Smartphone: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
    ),
    Globe: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
    ),
    Warning: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
    ),
    Kill: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
    ),
    Shield: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    ),
    Speedometer: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20v-2"></path><path d="M12 4v-2"></path><path d="M20 12h-2"></path><path d="M4 12H2"></path><path d="M17.65 17.65l-1.41-1.41"></path><path d="M7.76 7.76l-1.41-1.41"></path><path d="M17.65 6.35l-1.41 1.41"></path><path d="M7.76 16.24l-1.41 1.41"></path><path d="m14 10-4 4"></path></svg>
    ),
    Database: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
    ),
    Lightning: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
    ),
    CheckCircle: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    ),
    X: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    ),
    ChevronLeft: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"></path></svg>
    ),
    ChevronRight: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"></path></svg>
    )
};

// Mock Data
const sessionData = [
    {
        id: 'user_8291',
        name: 'Hoàng Minh Anh',
        ip: '192.168.1.105',
        device: 'Chrome / macOS',
        deviceVer: 'Version 118.0.5993',
        deviceIcon: 'laptop',
        time: '14:20:15',
        date: 'Hôm nay, 12 Th04',
        status: 'TRỰC TUYẾN',
        avatar: 'https://i.pravatar.cc/150?img=11',
        selected: true
    },
    {
        id: 'user_4432',
        name: 'Trần Phương Thảo',
        ip: '113.161.45.22',
        device: 'Safari / iOS',
        deviceVer: 'iPhone 14 Pro Max',
        deviceIcon: 'smartphone',
        time: '12:05:44',
        date: 'Hôm nay, 12 Th04',
        status: 'TRỰC TUYẾN',
        avatar: 'https://i.pravatar.cc/150?img=5',
        selected: false
    },
    {
        id: 'user_9901',
        name: 'Cảnh báo rủi ro',
        ip: '103.21.144.18',
        device: 'Firefox / Linux',
        deviceVer: 'IP từ vùng hạn chế',
        deviceIcon: 'globe',
        time: '02:11:00',
        date: 'Hôm nay, 12 Th04',
        status: 'BỊ NGHI NGỜ',
        avatar: 'https://i.pravatar.cc/150?img=12',
        isRisk: true,
        selected: true
    }
];

export default function SessionManagement() {
    const [showToast, setShowToast] = useState(true);

    return (
        <AdminLayout title="Quản trị Phiên làm việc" noPadding={true}>
            <div className="flex flex-col h-full bg-[#FAFAFA] relative min-h-screen">

                {/* Floating Toast Notification */}
                {showToast && (
                    <div className="absolute top-8 right-8 bg-white rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] p-4 flex items-center gap-4 w-[320px] z-50 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="w-10 h-10 bg-[#ECFDF5] rounded-full flex items-center justify-center text-[#10B981] shrink-0">
                            <Icons.CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[14px] font-bold text-gray-900">Thao tác thành công</h4>
                            <p className="text-[13px] text-gray-500 mt-0.5">Đã ngắt kết nối phiên làm việc</p>
                        </div>
                        <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Icons.X />
                        </button>
                    </div>
                )}

                {/* Floating Action Button */}
                <button className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-[#E53258] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(229,50,88,0.4)] hover:scale-105 hover:bg-[#D42247] transition-all z-40 group">
                    <Icons.Lightning className="group-hover:animate-pulse" />
                </button>

                <div className="flex-1 px-10 py-10">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <p className="text-gray-500 text-[16px] font-medium max-w-xl leading-relaxed">
                                Giám sát và quản lý các kết nối thời gian thực để đảm bảo an toàn tuyệt đối cho hệ thống LoveAI.
                            </p>
                        </div>

                        {/* Stats boxes on the right */}
                        <div className="flex gap-5">
                            <div className="bg-[#FFF0F3] rounded-[24px] p-5 px-8 text-center min-w-[150px] flex flex-col justify-center">
                                <div className="text-[32px] font-black text-[#E53258] leading-none mb-1.5">1,284</div>
                                <div className="text-[10px] font-black text-[#E53258] uppercase tracking-widest text-opacity-80">ĐANG TRỰC TUYẾN</div>
                            </div>
                            <div className="bg-[#FFF8F8] rounded-[24px] p-5 px-8 text-center min-w-[140px] flex flex-col justify-center border border-gray-100/50">
                                <div className="text-[32px] font-black text-gray-900 leading-none mb-1.5">42</div>
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">RỦI RO CAO</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-5 mb-8">
                        <div className="flex-1 bg-white rounded-full p-2 flex items-center shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-gray-100/50">
                            <div className="pl-5 text-gray-400">
                                <Icons.Search />
                            </div>
                            <input type="text" placeholder="Tìm kiếm theo ID người dùng hoặc dải IP..." className="flex-1 px-4 py-2.5 bg-transparent text-[15px] outline-none font-medium text-gray-700 placeholder-gray-400" />
                            <button className="bg-[#B21C3A] text-white px-8 py-3.5 rounded-full text-[14px] font-bold hover:bg-[#90162f] shadow-lg shadow-rose-200/50 transition-colors">
                                Tìm kiếm
                            </button>
                        </div>

                        <div className="bg-white rounded-full p-2 px-8 flex items-center shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-gray-100/50 gap-4 h-[64px]">
                            <div className="text-[#E53258] flex items-center justify-center">
                                <Icons.Filter className="w-5 h-5" />
                            </div>
                            <span className="text-[15px] font-bold text-gray-900 whitespace-nowrap">Lọc nâng cao</span>
                            <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                            <div className="bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-full text-[13px] font-bold text-gray-600">Chrome</div>
                            <div className="bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-full text-[13px] font-bold text-gray-600">Hà Nội</div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-[32px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 mb-10 overflow-hidden relative">

                        {/* Table Toolbar */}
                        <div className="flex justify-between items-center bg-[#FCFAFA] rounded-[24px] p-3 pl-6 m-2 mb-2">
                            <div className="flex items-center gap-4">
                                <input type="checkbox" className="w-5 h-5 rounded-[6px] border-gray-300 text-[#E53258] focus:ring-[#E53258] accent-[#E53258]" checked readOnly />
                                <span className="text-[15px] font-bold text-gray-900">Chọn tất cả</span>
                                <span className="text-[13px] font-medium text-gray-500">Đã chọn 3 phiên</span>
                            </div>
                            <button className="bg-[#E53258] hover:bg-[#D42247] text-white px-6 py-3 rounded-full text-[14px] font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-200/60 active:scale-95">
                                <Icons.Kill className="w-4 h-4" />
                                <span>Ngắt kết nối (Kill Session)</span>
                            </button>
                        </div>

                        <table className="w-full text-left border-collapse table-fixed mt-2">
                            <thead>
                                <tr>
                                    <th className="pb-6 pt-4 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[25%] pl-8">ID NGƯỜI DÙNG</th>
                                    <th className="pb-6 pt-4 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[15%]">ĐỊA CHỈ IP</th>
                                    <th className="pb-6 pt-4 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[20%]">THIẾT BỊ / OS</th>
                                    <th className="pb-6 pt-4 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[15%]">THỜI GIAN ĐĂNG NHẬP</th>
                                    <th className="pb-6 pt-4 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[15%] text-center">TRẠNG THÁI</th>
                                    <th className="pb-6 pt-4 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[10%] text-right pr-8">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/80">
                                {sessionData.map((s, i) => (
                                    <tr key={i} className={`transition-colors group ${s.isRisk ? 'bg-[#FFF0F3]/30' : 'hover:bg-[#FCFAFA]'}`}>
                                        <td className="py-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <input type="checkbox" className="w-5 h-5 rounded-[6px] border-gray-300 text-[#E53258] focus:ring-[#E53258] accent-[#E53258]" checked={s.selected} readOnly />
                                                <img src={s.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                                <div>
                                                    <div className="font-bold text-gray-900 text-[15px] leading-tight">{s.id}</div>
                                                    <div className={`text-[13px] font-medium mt-0.5 ${s.isRisk ? 'text-[#E53258]' : 'text-gray-500'}`}>{s.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <span className={`font-bold text-[14px] font-mono tracking-wider ${s.isRisk ? 'text-[#E53258]' : 'text-gray-600'}`}>{s.ip}</span>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex items-start gap-4">
                                                <div className="text-gray-400 mt-1">
                                                    {s.deviceIcon === 'laptop' && <Icons.Laptop />}
                                                    {s.deviceIcon === 'smartphone' && <Icons.Smartphone />}
                                                    {s.deviceIcon === 'globe' && <Icons.Globe className={s.isRisk ? 'text-[#E53258]' : ''} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-[14px] leading-tight">{s.device}</div>
                                                    <div className={`text-[12px] font-medium mt-0.5 ${s.isRisk ? 'text-[#E53258]' : 'text-gray-400'}`}>{s.deviceVer}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <div className="font-bold text-gray-900 text-[14px] leading-tight">{s.time}</div>
                                            <div className="text-[12px] font-medium text-gray-500 mt-0.5">{s.date}</div>
                                        </td>
                                        <td className="py-5 text-center">
                                            {s.status === 'TRỰC TUYẾN' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8FFF0] text-[#10B981] rounded-full text-[10px] font-black tracking-widest">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                                                    TRỰC TUYẾN
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0F3] text-[#E53258] rounded-full text-[10px] font-black tracking-widest">
                                                    BỊ NGHI NGỜ
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-5 text-right pr-8">
                                            {s.isRisk ? (
                                                <button className="w-10 h-10 rounded-full bg-[#E53258] text-white flex items-center justify-center shadow-lg shadow-rose-200/50 ml-auto hover:bg-[#D42247] transition-all hover:scale-105 active:scale-95">
                                                    <Icons.Warning className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button className="text-[#E53258] hover:text-[#D42247] ml-auto flex items-center justify-center p-2 transition-colors hover:scale-110">
                                                    <Icons.Logout />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-2 px-8 pb-4 pt-4 border-t border-gray-50">
                            <span className="text-[13px] text-gray-500 font-bold tracking-wide">
                                Hiển thị 1 - 25 trong số 1,284 phiên
                            </span>
                            <div className="flex items-center gap-1">
                                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                                    <Icons.ChevronLeft />
                                </button>
                                <button className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-[#B21C3A] text-white shadow-md">1</button>
                                <button className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 transition-colors">2</button>
                                <button className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 transition-colors">3</button>
                                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                                    <Icons.ChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Card 1 */}
                        <div className="bg-[#FFF0F3] rounded-[32px] p-8 relative overflow-hidden group">
                            <div className="flex gap-4 items-center mb-6">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E53258] shadow-sm">
                                    <Icons.Shield />
                                </div>
                                <div className="font-bold text-gray-900 text-[16px]">Bảo mật hệ thống</div>
                            </div>

                            <div className="w-full bg-white rounded-full h-3 mb-3 overflow-hidden shadow-inner">
                                <div className="bg-[#10B981] h-3 rounded-full" style={{ width: '94.2%' }}></div>
                            </div>
                            <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest">TỈ LỆ AN TOÀN: 94.2%</div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#FFF8F8] rounded-[32px] p-8 relative overflow-hidden border border-gray-100/50">
                            <div className="flex gap-4 items-center mb-5">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E53258] shadow-sm">
                                    <Icons.Speedometer />
                                </div>
                                <div className="font-bold text-gray-900 text-[16px]">Thời gian phản hồi</div>
                            </div>
                            <div className="flex items-baseline gap-2 mb-1.5">
                                <span className="text-[40px] font-black text-gray-900 leading-none">124</span>
                                <span className="text-[15px] font-bold text-gray-500">ms</span>
                            </div>
                            <div className="text-[11px] font-black text-[#10B981] uppercase tracking-widest">TRẠNG THÁI: TỐT</div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#59667C] rounded-[32px] p-8 relative overflow-hidden text-white shadow-xl shadow-[#59667C]/20">
                            <div className="text-[14px] font-bold text-white/80 mb-2">Backup mới nhất</div>
                            <div className="text-[32px] font-black mb-6 tracking-tight">2 giờ trước</div>
                            <a href="#" className="text-[13px] font-bold text-white/90 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all inline-block">Xem log hệ thống</a>

                            <div className="absolute -right-4 -bottom-4 text-white/10 w-40 h-40 transform rotate-12">
                                <Icons.Database className="w-full h-full" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
