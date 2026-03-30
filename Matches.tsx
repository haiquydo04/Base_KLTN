import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Search, Sliders, Heart, CheckCircle, PlusCircle, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export const Matches = () => {
  const matches = [
    { id: 1, name: 'Minh Anh', age: 24, time: '2 giờ trước', score: '98% TƯƠNG THÍCH', verified: true, liked: true },
    { id: 2, name: 'Đức Duy', age: 27, time: '5 giờ trước', aiSuggest: true },
    { id: 3, name: 'Phương Linh', age: 22, time: 'Hôm qua', near: true, verified: true },
    { id: 4, name: 'Hoàng Nam', age: 29, time: '2 ngày trước', commonInterest: true },
    { id: 5, name: 'Thu Trang', age: 26, time: '3 ngày trước', connected: true },
    { id: 6, name: 'Lan Hương', age: 25, time: 'Tuần trước', score: '92% Match' },
  ];

  return (
    <main className="pt-32 pb-20 px-8 max-w-screen-xl mx-auto">
      {/* New Match Celebration Section */}
      <section className="mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-xl p-10 bg-gradient-to-br from-primary-container to-primary text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-primary/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 fill-current" />
              <span className="text-xs font-bold tracking-widest uppercase">Phép màu từ AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight">Tương hợp mới!</h1>
            <p className="text-lg text-rose-50/90 max-w-md">Thuật toán Atelier vừa tìm thấy 3 tâm hồn đồng điệu dành riêng cho bạn tối nay.</p>
          </div>

          <div className="relative z-10 flex -space-x-6 mt-8 md:mt-0 items-center">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className={cn(
                  "rounded-full border-4 border-white overflow-hidden shadow-xl",
                  i === 2 ? "h-32 w-32 z-20" : "h-24 w-24"
                )}
              >
                <img 
                  className="h-full w-full object-cover" 
                  src={`https://picsum.photos/seed/match${i}/200/200`} 
                  alt="Match"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Search and Filter Bar */}
      <section className="mb-12 flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0">
        <div className="relative group w-full md:w-96">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" />
          <input 
            className="w-full bg-surface-container border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all outline-none text-on-surface" 
            placeholder="Tìm kiếm tên bạn tâm giao..." 
            type="text"
          />
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button className="px-6 py-2.5 bg-primary text-white rounded-full font-semibold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">Tất cả</button>
          <button className="px-6 py-2.5 bg-surface-container-low text-zinc-600 rounded-full font-medium text-sm hover:bg-surface-container-high transition-all">Gần đây</button>
          <button className="px-6 py-2.5 bg-surface-container-low text-zinc-600 rounded-full font-medium text-sm hover:bg-surface-container-high transition-all">Yêu thích</button>
          <button className="p-2.5 bg-surface-container-low text-zinc-600 rounded-full hover:bg-surface-container-high transition-all">
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Match Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {matches.map((match) => (
          <motion.div 
            key={match.id}
            whileHover={{ y: -4 }}
            className="group relative bg-white rounded-xl p-6 shadow-sm border border-transparent hover:border-rose-100 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className={cn(
                  "h-40 w-40 rounded-full overflow-hidden border-4 border-surface-container p-1",
                  (match.score || match.verified) && "ring-2 ring-primary-container ring-offset-4 ring-offset-white"
                )}>
                  <img 
                    className="h-full w-full object-cover rounded-full" 
                    src={`https://picsum.photos/seed/person${match.id}/200/200`} 
                    alt={match.name}
                    referrerPolicy="no-referrer"
                  />
                </div>
                {match.liked && (
                  <div className="absolute bottom-2 right-2 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                )}
                {match.verified && !match.liked && (
                  <div className="absolute bottom-2 right-2 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
                    <CheckCircle className="w-4 h-4 fill-current" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-headline font-bold text-on-surface">{match.name}, {match.age}</h3>
                <p className="text-sm text-zinc-500 font-medium">Tương hợp {match.time}</p>
              </div>
              <div className={cn(
                "flex items-center space-x-2 px-4 py-1.5 rounded-full",
                match.score ? "bg-rose-50" : "bg-surface-container"
              )}>
                {match.score && <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>}
                <span className={cn(
                  "text-xs font-bold tracking-wide uppercase",
                  match.score ? "text-primary" : "text-zinc-500"
                )}>
                  {match.score || (match.aiSuggest ? "Gợi ý từ AI" : match.near ? "Gần nơi bạn" : match.commonInterest ? "Cùng sở thích" : "Đã kết nối")}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty/Add State */}
        <div className="group relative bg-surface-container border-2 border-dashed border-outline-variant/30 rounded-xl p-6 hover:bg-surface-container-high transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
            <PlusCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-headline font-bold text-on-surface-variant">Tìm thêm?</h3>
          <p className="text-xs text-zinc-400 mt-1">Khám phá thêm các tâm hồn khác</p>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300 group">
          <Zap className="w-8 h-8 fill-current" />
          <div className="absolute right-20 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Tăng tốc tìm kiếm!</div>
        </button>
      </div>
    </main>
  );
};
