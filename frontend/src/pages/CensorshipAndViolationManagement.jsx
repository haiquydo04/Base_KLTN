import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

const Icons = {
    CheckCircle: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    ),
    EyeOff: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
    ),
    Megaphone: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
    ),
    Ban: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" /></svg>
    ),
    Calendar: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    ShieldCheck: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
    ),
    AlertCircle: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    ),
    AlertTriangle: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
    ),
    Info: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
    ),
    Check: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
    )
};

export default function CensorshipAndViolationManagement() {
    const [showToast, setShowToast] = useState(true);

    return (
        <AdminLayout title="Kiểm duyệt AI" noPadding={true}>
            <div className="flex flex-col h-full bg-[#FAFAFA] relative min-h-screen font-sans">

                {/* Floating Success Toast (bottom center) */}
                {showToast && (
                    <div className="fixed bottom-10 left-1/2 w-max -translate-x-1/2 bg-[#10B981] text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-3 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
                        <Icons.CheckCircle className="w-6 h-6" />
                        <span className="font-bold text-[16px] pr-2">Xử lý vi phạm thành công</span>
                        <button onClick={() => setShowToast(false)} className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
                            <Icons.Check className="w-5 h-5 rotate-45 transform" />
                        </button>
                    </div>
                )}

                <div className="flex-1 px-8 lg:px-12 py-10 w-full max-w-[1600px] mx-auto overflow-y-auto">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                        </div>
                        <div className="flex gap-4">
                            <button className="bg-[#FFF0F3] text-[#E53258] px-8 py-3.5 rounded-full font-bold hover:bg-rose-100 transition-all shadow-sm text-[15px] hover:scale-105 active:scale-95">
                                Tải báo cáo
                            </button>
                            <button className="bg-[#59667C] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#4a5568] transition-all shadow-md text-[15px] hover:scale-105 active:scale-95">
                                Chế độ tập trung
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-8 items-stretch pt-2">

                        {/* LEFT COLUMN: Queue & System Status */}
                        <div className="w-full xl:w-[380px] flex flex-col gap-6 shrink-0">

                            {/* Queue Container */}
                            <div className="bg-[#FFF8F8] rounded-[40px] p-8 border border-rose-50 shadow-sm flex-1">
                                <div className="flex justify-between items-center mb-8 px-2">
                                    <h2 className="text-[20px] font-black text-gray-900 leading-tight">Hàng đợi kiểm<br />duyệt</h2>
                                    <div className="bg-[#FFE4E8] text-[#E53258] px-5 py-2.5 rounded-full text-[12px] font-black text-center leading-tight shadow-sm">
                                        24 mục<br />mới
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Queue Item 1 */}
                                    <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-rose-100 relative overflow-hidden group cursor-pointer ring-2 ring-[#E53258] hover:shadow-[0_8px_30px_rgba(229,50,88,0.15)] transition-all">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="bg-[#FFF0F3] text-[#E53258] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">HÌNH ẢNH (AI)</span>
                                            <span className="text-[12px] font-bold text-gray-400">2 phút trước</span>
                                        </div>
                                        <div className="font-bold text-gray-900 text-[18px] mb-1.5">@honganh_99</div>
                                        <div className="text-[15px] text-gray-500 font-medium italic">"Ảnh hồ sơ có dấu hiệu nhạy cảm..."</div>
                                        {/* Status Indicator Line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E53258]"></div>
                                    </div>

                                    {/* Queue Item 2 */}
                                    <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100/80 hover:border-orange-200 transition-all cursor-pointer hover:shadow-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="bg-[#FFF9E6] text-[#D9A000] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">NGÔN TỪ (NLP)</span>
                                            <span className="text-[12px] font-bold text-gray-400">15 phút trước</span>
                                        </div>
                                        <div className="font-bold text-gray-900 text-[18px] mb-1.5">@tuan_huy88</div>
                                        <div className="text-[15px] text-gray-500 font-medium italic">"Sử dụng từ ngữ thô tục trong tin n..."</div>
                                    </div>

                                    {/* Queue Item 3 */}
                                    <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100/80 hover:border-blue-200 transition-all cursor-pointer hover:shadow-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="bg-[#F0F4FA] text-[#475569] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">BÁO CÁO NGƯỜI DÙNG</span>
                                            <span className="text-[12px] font-bold text-gray-400">1 giờ trước</span>
                                        </div>
                                        <div className="font-bold text-gray-900 text-[18px] mb-1.5">@minh_thu_rose</div>
                                        <div className="text-[15px] text-gray-500 font-medium italic">"Bị báo cáo hành vi lừa đảo/spam..."</div>
                                    </div>
                                </div>
                            </div>

                            {/* System status */}
                            <div className="bg-[#59667C] rounded-[40px] p-8 relative overflow-hidden text-white shadow-xl shadow-[#59667C]/20 border border-slate-600/50">
                                <h3 className="text-[18px] font-bold mb-4 z-10 relative">Trạng thái hệ thống</h3>
                                <div className="flex items-center gap-3 mb-6 z-10 relative bg-[#1E293B]/30 w-max px-4 py-2 rounded-full border border-slate-700/50">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_12px_#10B981]"></div>
                                    <span className="text-[13px] font-bold text-white/90">AI đang hoạt động tối ưu</span>
                                </div>
                                <p className="text-[14px] text-white/70 leading-relaxed z-10 relative">
                                    Tỷ lệ phát hiện sai sót hiện tại: <span className="font-bold text-white">0.02%</span>. Hệ thống NLP vừa được cập nhật bộ từ điển mới.
                                </p>
                                {/* Watermark */}
                                <div className="absolute -right-10 -bottom-10 text-white/5 w-48 h-48 transform rotate-12">
                                    <Icons.CheckCircle className="w-full h-full" />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: DETAIL PANEL */}
                        <div className="flex-1 bg-white rounded-[48px] p-10 xl:p-12 shadow-[0_15px_50px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">

                            <div className="flex-1">
                                {/* User Header */}
                                <div className="flex justify-between items-center mb-10 pb-8 border-b border-gray-100">
                                    <div className="flex items-center gap-6 relative">
                                        <div className="relative">
                                            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="avatar" className="w-[88px] h-[88px] rounded-full object-cover shadow-md border-[3px] border-white" />
                                            <div className="absolute -bottom-1 -right-1 bg-[#E53258] text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                                <Icons.AlertTriangle className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-[30px] font-black text-gray-900 tracking-tight">Trần Hồng Anh</h2>
                                                <span className="text-[22px] font-medium text-slate-400">@honganh_99</span>
                                            </div>
                                            <div className="flex items-center gap-6 mt-3">
                                                <div className="flex items-center gap-2 text-slate-500 font-bold text-[14px]">
                                                    <Icons.Calendar className="w-4 h-4 text-slate-400" />
                                                    Tham gia 12/2023
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 font-bold text-[14px]">
                                                    <Icons.ShieldCheck className="w-4 h-4 text-slate-400" />
                                                    Xác minh AI: Có
                                                </div>
                                                <div className="flex items-center gap-2 text-[#E53258] font-bold text-[14px]">
                                                    <Icons.AlertCircle className="w-4 h-4" />
                                                    2 Cảnh báo trước đó
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Score Dial */}
                                    <div className="flex flex-col items-center justify-center bg-[#FFF8F8] p-4 rounded-3xl border border-rose-50">
                                        <div className="relative w-16 h-16 mb-2">
                                            {/* Outer track */}
                                            <svg viewBox="0 0 36 36" className="w-full h-full text-rose-100">
                                                <path className="text-rose-200" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="text-[#E53258]" strokeWidth="4" strokeDasharray="98, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-[16px] font-black text-[#E53258]">98%</span>
                                        </div>
                                        <div className="text-[10px] font-black text-[#E53258] uppercase tracking-widest text-center mt-1">KHẢ NĂNG<br />VI PHẠM</div>
                                    </div>
                                </div>

                                {/* TAGGED CONTENT SECTION */}
                                <div className="mb-10">
                                    <h3 className="text-[#8492A6] text-[15px] font-black tracking-[0.15em] mb-6 uppercase">NỘI DUNG BỊ GẮN THẺ</h3>

                                    <div className="flex flex-col xl:flex-row gap-6">
                                        {/* Blurred Image box */}
                                        <div className="w-full xl:w-[380px] h-auto min-h-[360px] bg-[#1E293B] rounded-[40px] flex flex-col items-center justify-center p-10 text-center shrink-0 shadow-xl relative overflow-hidden group">
                                            {/* Blurred background simulate image */}
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-800 to-slate-900 opacity-60 blur-xl"></div>

                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white mb-6 backdrop-blur-md shadow-lg border border-white/5">
                                                    <Icons.EyeOff className="w-7 h-7" />
                                                </div>
                                                <div className="text-white font-black text-[18px] mb-4 tracking-wider uppercase">NỘI DUNG NHẠY CẢM</div>
                                                <p className="text-slate-300 text-[14px] leading-relaxed mb-8 px-4 font-medium opacity-90">
                                                    AI phát hiện hở hang quá mức quy định (Loại: Nudity Probability High)
                                                </p>
                                                <button className="border border-white/30 text-white hover:bg-white/15 transition-all px-6 py-3 rounded-full text-[14px] font-bold backdrop-blur-md hover:scale-105 active:scale-95 shadow-lg">
                                                    Gỡ bỏ làm mờ (Tạm thời)
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stats boxes right side */}
                                        <div className="flex-1 flex flex-col gap-6">
                                            {/* Chi tiết phân tích AI */}
                                            <div className="border-[3px] border-[#FFE4E8] rounded-[40px] p-8 xl:p-10 bg-white shadow-sm relative overflow-hidden flex flex-col justify-center">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-7 h-7 rounded-full bg-[#E53258] text-white flex items-center justify-center shadow-md">
                                                        <span className="font-bold text-[14px] font-serif italic">i</span>
                                                    </div>
                                                    <h4 className="text-[15px] font-black tracking-widest uppercase text-gray-900">CHI TIẾT PHÂN TÍCH AI</h4>
                                                </div>
                                                <div className="space-y-5">
                                                    <div className="flex justify-between items-center bg-[#FAFAFA] p-3 px-5 rounded-2xl">
                                                        <span className="text-gray-600 font-bold text-[15px]">Hở vai/ngực:</span>
                                                        <span className="font-black text-[#E53258] text-[16px]">89%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-[#FAFAFA] p-3 px-5 rounded-2xl">
                                                        <span className="text-gray-600 font-bold text-[15px]">Trang phục lót:</span>
                                                        <span className="font-black text-[#E53258] text-[16px]">94%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-[#FAFAFA] p-3 px-5 rounded-2xl">
                                                        <span className="text-gray-600 font-bold text-[15px]">Bối cảnh:</span>
                                                        <span className="font-bold text-gray-900 text-[16px]">Phòng ngủ</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ghi chú hệ thống */}
                                            <div className="border-2 border-gray-100/80 rounded-[40px] p-8 xl:p-10 bg-[#FAFAFA]/50 shadow-sm flex-1 flex flex-col justify-center">
                                                <h4 className="text-[15px] font-black tracking-widest uppercase text-gray-900 mb-4">GHI CHÚ HỆ THỐNG</h4>
                                                <p className="text-slate-500 text-[16px] italic leading-relaxed font-medium">
                                                    "Người dùng này đã thay đổi ảnh hồ sơ 3 lần trong 24 giờ qua. Đây là lần thứ 2 AI tự động gắn thẻ."
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex flex-col sm:flex-row items-center gap-5 pt-8 mt-4 border-t border-gray-100">
                                <button className="w-full sm:flex-1 bg-[#F1F5F9] text-slate-700 py-4 px-6 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#E2E8F0] transition-all text-[16px] active:scale-95 group">
                                    <Icons.Check className="w-5 h-5 text-slate-500 group-hover:text-slate-700 transition-colors" />
                                    <span>Bỏ qua (Hợp lệ)</span>
                                </button>
                                <button className="w-full sm:flex-1 bg-[#59667C] text-white py-4 px-6 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#4a5568] shadow-xl shadow-[#59667C]/30 transition-all text-[16px] active:scale-95 hover:scale-[1.02]">
                                    <Icons.Megaphone className="w-5 h-5" />
                                    <span>Gửi Cảnh báo</span>
                                </button>
                                <button className="w-full sm:flex-1 bg-[#E53258] text-white py-4 px-6 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#D42247] shadow-xl shadow-rose-200/60 transition-all text-[16px] active:scale-95 hover:scale-[1.02]">
                                    <Icons.Ban className="w-5 h-5" />
                                    <span>Khóa tài khoản</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
