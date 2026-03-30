import React from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldCheck, ShieldAlert, Lock, Eye, UserCheck, MessageSquareWarning, AlertTriangle, ChevronRight, BookOpen, HeartHandshake, PhoneCall } from 'lucide-react';
import { cn } from '../lib/utils';

export const Safety = () => {
  const safetyTips = [
    { id: 1, title: 'Xác thực AI', desc: 'Sử dụng tính năng xác thực khuôn mặt để tăng độ tin cậy cho hồ sơ của bạn.', icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, title: 'Bảo mật thông tin', desc: 'Không bao giờ chia sẻ mật khẩu hoặc thông tin tài chính với bất kỳ ai.', icon: Lock, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 3, title: 'Báo cáo vi phạm', desc: 'Hãy báo cáo ngay nếu bạn gặp phải hành vi quấy rối hoặc lừa đảo.', icon: MessageSquareWarning, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 4, title: 'Gặp gỡ an toàn', desc: 'Luôn chọn địa điểm công cộng và thông báo cho bạn bè khi đi hẹn hò lần đầu.', icon: Eye, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <main className="pt-32 pb-20 px-8 max-w-screen-xl mx-auto">
      {/* Hero Header */}
      <section className="mb-16 text-center space-y-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-6 py-2 rounded-full border border-green-100 shadow-sm"
        >
          <ShieldCheck className="w-5 h-5 fill-current" />
          <span className="text-sm font-bold tracking-widest uppercase">Hệ thống an toàn LoveAI</span>
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface">An tâm kết nối, trọn vẹn yêu thương.</h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto font-medium">Sự an toàn của bạn là ưu tiên hàng đầu của chúng tôi. LoveAI sử dụng công nghệ AI tiên tiến để bảo vệ cộng đồng.</p>
      </section>

      {/* Safety Status Card */}
      <section className="mb-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-zinc-100 border border-zinc-100 flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
            <div className="w-48 h-48 rounded-full border-[12px] border-green-50 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-green-500 flex flex-col items-center justify-center text-white shadow-xl shadow-green-200">
                <span className="text-4xl font-bold font-headline">100</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Điểm an toàn</span>
              </div>
            </div>
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-2 -right-2 bg-white p-3 rounded-full shadow-lg border border-green-100 text-green-500"
            >
              <ShieldCheck className="w-8 h-8 fill-current" />
            </motion.div>
          </div>
          
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <h2 className="text-3xl font-headline font-bold text-on-surface">Tài khoản của bạn đang rất an toàn!</h2>
              <p className="text-on-surface-variant font-medium">Bạn đã hoàn thành tất cả các bước xác thực cần thiết. Hãy tiếp tục duy trì các thói quen an toàn khi tương tác.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                <Shield className="w-4 h-4 text-green-500 fill-current" />
                <span className="text-xs font-bold text-zinc-600">Xác thực khuôn mặt: OK</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                <Shield className="w-4 h-4 text-green-500 fill-current" />
                <span className="text-xs font-bold text-zinc-600">Số điện thoại: OK</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                <Shield className="w-4 h-4 text-green-500 fill-current" />
                <span className="text-xs font-bold text-zinc-600">Email: OK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <button className="group p-8 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-100 transition-all text-left space-y-4">
          <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-headline font-bold text-rose-700">Báo cáo khẩn cấp</h3>
            <p className="text-sm text-rose-600/80 font-medium">Gửi yêu cầu hỗ trợ ngay lập tức nếu bạn cảm thấy không an toàn.</p>
          </div>
          <div className="flex items-center text-rose-700 font-bold text-sm gap-1">
            <span>Thực hiện ngay</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        <button className="group p-8 bg-zinc-900 hover:bg-black rounded-2xl border border-zinc-800 transition-all text-left space-y-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-zinc-900 shadow-lg group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-headline font-bold text-white">Chặn người dùng</h3>
            <p className="text-sm text-zinc-400 font-medium">Ngừng mọi liên lạc với những người khiến bạn cảm thấy phiền toái.</p>
          </div>
          <div className="flex items-center text-white font-bold text-sm gap-1">
            <span>Danh sách chặn</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        <button className="group p-8 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-all text-left space-y-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-headline font-bold text-blue-700">Đường dây nóng</h3>
            <p className="text-sm text-blue-600/80 font-medium">Liên hệ với các tổ chức hỗ trợ tâm lý và an toàn 24/7.</p>
          </div>
          <div className="flex items-center text-blue-700 font-bold text-sm gap-1">
            <span>Gọi ngay</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </section>

      {/* Safety Tips Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-headline font-bold text-on-surface">Cẩm nang an toàn</h2>
          <button className="text-primary font-bold flex items-center gap-1 hover:underline">
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyTips.map((tip) => (
            <div key={tip.id} className="bg-white p-6 rounded-2xl border border-zinc-100 hover:shadow-lg transition-shadow space-y-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", tip.bg, tip.color)}>
                <tip.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-headline font-bold text-on-surface">{tip.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="bg-surface-container rounded-3xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm">
            <HeartHandshake className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-headline font-bold text-on-surface">Tiêu chuẩn cộng đồng LoveAI</h2>
            <p className="text-on-surface-variant font-medium">Chúng tôi xây dựng một môi trường tôn trọng, chân thành và văn minh. Mọi hành vi vi phạm tiêu chuẩn cộng đồng sẽ bị xử lý nghiêm khắc.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
              <BookOpen className="w-5 h-5" />
              <span>Đọc quy tắc cộng đồng</span>
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-full font-bold hover:bg-zinc-50 transition-colors">
              Tìm hiểu về quyền riêng tư
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
