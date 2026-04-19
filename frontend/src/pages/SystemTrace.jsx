import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

const Icons = {
    ChevronDown: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6" /></svg>
    ),
    Download: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
    ),
    CheckCircle: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
    AlertCircle: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    ),
    ChevronLeft: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg>
    ),
    ChevronRight: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6" /></svg>
    ),
};

const mockLogs = [
    { id: 1, time: "20/10/2023", timeDetails: "14:30:22", actorType: "admin", actorPrefix: "A1", actorName: "Admin_01", action: "Cập nhật cấu hình AI", status: "success" },
    { id: 2, time: "20/10/2023", timeDetails: "14:28:10", actorType: "system", actorPrefix: "S", actorName: "Hệ thống", action: "Đăng nhập hệ thống", status: "success" },
    { id: 3, time: "20/10/2023", timeDetails: "14:15:45", actorType: "user", actorPrefix: "U8", actorName: "user_8291", action: "Khóa tài khoản", status: "failed" },
    { id: 4, time: "20/10/2023", timeDetails: "13:55:01", actorType: "admin", actorPrefix: "A1", actorName: "Admin_01", action: "Sao lưu dữ liệu nhật ký", status: "success" },
    { id: 5, time: "20/10/2023", timeDetails: "13:42:12", actorType: "user", actorPrefix: "U2", actorName: "user_4412", action: "Truy vấn AI LoveMatch", status: "success" }
];

const getActorAvatarStyle = (type) => {
    switch (type) {
        case 'admin': return 'bg-[#E2E8F0] text-[#334155]'; // Light blue-gray bg, dark slate text
        case 'system': return 'bg-[#E53258] text-white'; // Red bg, white text
        case 'user': return 'bg-[#FFE4E6] text-[#E53258]'; // Pink bg, red text
        default: return 'bg-gray-200 text-gray-600';
    }
};

export default function SystemTrace() {
    const [logs] = useState(mockLogs);

    return (
        <AdminLayout title="Lưu vết hệ thống" noPadding={true}>
            <div className="flex flex-col h-full bg-[#FAFAFA] relative">
                <div className="p-10 max-w-6xl mx-auto w-full">

                    {/* Header */}
                    <div className="mb-10">

                        <p className="text-[15px] text-gray-500 font-medium">Giám sát và truy xuất nhật ký hoạt động của hệ thống LoveAI</p>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-[#FCF5F6] rounded-[32px] p-6 mb-8 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6 flex-1">
                            {/* Filter 1 */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Loại nhật ký</label>
                                <div className="relative">
                                    <select className="appearance-none bg-white border-0 rounded-2xl px-5 py-3.5 pr-12 font-bold text-gray-700 w-56 focus:outline-none focus:ring-2 focus:ring-rose-100 shadow-sm text-sm">
                                        <option>Tất cả nhật ký</option>
                                        <option>Nhật ký hệ thống</option>
                                        <option>Nhật ký người dùng</option>
                                    </select>
                                    <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Filter 2 */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Thời gian</label>
                                <div className="relative">
                                    <select className="appearance-none bg-white border-0 rounded-2xl px-5 py-3.5 pr-12 font-bold text-gray-700 w-56 focus:outline-none focus:ring-2 focus:ring-rose-100 shadow-sm text-sm">
                                        <option>Tuần trước</option>
                                        <option>Hôm nay</option>
                                        <option>Tháng này</option>
                                    </select>
                                    <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end gap-4 mt-6 sm:mt-0">
                            <button className="bg-[#E53258] hover:bg-[#D42247] text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-rose-200 transition-all text-sm">
                                Truy xuất
                            </button>
                            <button className="bg-white border-2 border-rose-100 hover:border-[#E53258] text-[#E53258] flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all text-sm">
                                <Icons.Download />
                                <span>Xuất báo cáo</span>
                            </button>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] pt-6 pb-2 mb-8">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr>
                                    <th className="pb-6 pt-2 text-[12px] font-black tracking-widest text-[#A19D9F] uppercase w-[20%] pl-10 border-b border-gray-50">Khởi tạo</th>
                                    <th className="pb-6 pt-2 text-[12px] font-black tracking-widest text-[#A19D9F] uppercase w-[25%] border-b border-gray-50">Tác nhân</th>
                                    <th className="pb-6 pt-2 text-[12px] font-black tracking-widest text-[#A19D9F] uppercase w-[35%] border-b border-gray-50">Hành động</th>
                                    <th className="pb-6 pt-2 text-[12px] font-black tracking-widest text-[#A19D9F] uppercase w-[20%] pr-10 border-b border-gray-50">Ngày kết quả</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Time */}
                                        <td className="py-6 pl-10">
                                            <div className="font-bold text-[15px] text-gray-900 leading-tight">{log.time}</div>
                                            <div className="text-[13px] text-gray-400 font-medium mt-1">{log.timeDetails}</div>
                                        </td>

                                        {/* Actor */}
                                        <td className="py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] ${getActorAvatarStyle(log.actorType)}`}>
                                                    {log.actorPrefix}
                                                </div>
                                                <span className="font-bold text-gray-700 text-[15px]">{log.actorName}</span>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="py-6">
                                            <span className="inline-block bg-[#F8EEEE] text-gray-600 px-4 py-2 rounded-full text-[14px] font-semibold">
                                                {log.action}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-6 pr-10">
                                            <div className={`flex items-center gap-2 font-bold text-[15px] ${log.status === 'success' ? 'text-[#2EBA68]' : 'text-[#E53258]'}`}>
                                                {log.status === 'success' ? <Icons.CheckCircle className="w-5 h-5" /> : <Icons.AlertCircle className="w-5 h-5" />}
                                                <span>{log.status === 'success' ? 'Thành công' : 'Thất bại'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center px-4">
                        <span className="text-[14px] text-gray-500 font-medium">
                            Hiển thị 1 - 5 trên 1,248 nhật ký
                        </span>
                        <div className="flex items-center gap-2">
                            <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                <Icons.ChevronLeft />
                            </button>

                            <button className="w-9 h-9 rounded-full flex items-center justify-center font-bold bg-[#E53258] text-white shadow-md">1</button>
                            <button className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 transition-colors">2</button>
                            <button className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 transition-colors">3</button>
                            <span className="w-9 h-9 flex items-center justify-center font-bold text-gray-400">...</span>
                            <button className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 transition-colors">25</button>

                            <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                <Icons.ChevronRight />
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}
