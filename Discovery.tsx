import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, MoreHorizontal, Brain, Sparkles, Lightbulb, MapPin, Shield, X, Heart, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export const Discovery = () => {
  const interests = ['Nghệ thuật', 'Rượu vang', 'Leo núi', 'Indie Music'];

  return (
    <div className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Gallery & Primary Actions */}
      <div className="lg:col-span-7 space-y-6">
        {/* Bento Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[500px] md:h-[650px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-3 row-span-2 relative group overflow-hidden rounded-xl"
          >
            <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://picsum.photos/seed/girl1/800/1000" 
              alt="Profile"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">Trực tuyến</span>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 row-span-1 overflow-hidden rounded-xl"
          >
            <img 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
              src="https://picsum.photos/seed/girl2/400/400" 
              alt="Gallery 1"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1 row-span-1 relative overflow-hidden rounded-xl group cursor-pointer"
          >
            <img 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/girl3/400/400" 
              alt="Gallery 2"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-bold">+5 ảnh</span>
            </div>
          </motion.div>
        </div>

        {/* Profile Overview */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface">Minh Thư, 24</h1>
            <div className="flex items-center gap-2 mt-2 text-on-surface-variant">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Hồ sơ đã được AI xác thực • Cách bạn 2km</span>
            </div>
          </div>
          <button className="p-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Detailed Bio */}
        <div className="bg-surface-container-low p-8 rounded-xl">
          <h3 className="font-headline font-bold text-lg mb-4 text-primary">Giới thiệu</h3>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Yêu thích nghệ thuật thị giác và những chuyến đi không lên kế hoạch trước. Hiện đang là một UI/UX Designer tự do, mình tìm kiếm một tâm hồn đồng điệu có thể cùng thảo luận về kiến trúc hoặc đơn giản là cùng ngồi im lặng ngắm hoàng hôn. 🌿✨
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {interests.map((interest) => (
              <span key={interest} className="px-4 py-2 bg-white rounded-full text-xs font-bold text-on-surface-variant border border-outline-variant/20">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: AI Analysis & Action Panel */}
      <div className="lg:col-span-5 space-y-6">
        {/* AI Compatibility Card */}
        <div className="bg-white border border-outline-variant/10 p-8 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="w-16 h-16 rounded-full border-4 border-surface-container-high relative flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  className="text-primary" 
                  cx="32" cy="32" fill="transparent" r="28" 
                  stroke="currentColor" strokeWidth="4"
                  strokeDasharray="176" strokeDashoffset="26"
                />
              </svg>
              <span className="font-headline font-extrabold text-primary text-xl">85%</span>
            </div>
          </div>
          <h2 className="font-headline font-extrabold text-2xl mb-6 flex items-center gap-2">
            <span className="text-primary">✨</span> Phân tích AI
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Tính cách tương đồng</h4>
                <p className="text-sm text-on-surface-variant mt-1">Cả hai bạn đều thuộc nhóm tính cách hướng nội và đề cao sự chân thành trong các mối quan hệ lâu dài.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Sở thích giao thoa</h4>
                <p className="text-sm text-on-surface-variant mt-1">Sự đam mê với du lịch khám phá và thiết kế sáng tạo sẽ là chủ đề mở đầu cuộc trò chuyện tuyệt vời.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Dự đoán kết nối</h4>
                <p className="text-sm text-on-surface-variant mt-1">Khả năng cao hai bạn sẽ có những buổi hẹn hò chất lượng tại các không gian nghệ thuật hoặc quán cà phê yên tĩnh.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-outline-variant/15">
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/50">Phân tích bởi LoveAI v2.0</p>
          </div>
        </div>

        {/* Map Preview */}
        <div className="bg-surface-container rounded-xl overflow-hidden h-48 relative group">
          <img 
            className="w-full h-full object-cover filter grayscale opacity-50 group-hover:grayscale-0 transition-all duration-500" 
            src="https://picsum.photos/seed/map/600/300" 
            alt="Map"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-4 py-2 bg-white/80 backdrop-blur shadow-lg rounded-full text-xs font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Cách bạn 2km (Quận 1)
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="bg-secondary p-4 rounded-xl text-white flex items-start gap-3">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">Luôn ưu tiên an toàn. Hãy trò chuyện qua ứng dụng trước khi quyết định gặp mặt trực tiếp. <a href="#" className="underline font-bold">Tìm hiểu thêm</a></p>
        </div>
      </div>

      {/* Fixed Action Bar (Floating) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-5 bg-white/80 backdrop-blur-xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant/10 z-50">
        <button className="w-16 h-16 rounded-full bg-surface-container-high text-secondary flex items-center justify-center hover:bg-surface-container-highest transition-all active:scale-90 group">
          <X className="w-8 h-8 transition-transform group-hover:rotate-12" />
        </button>
        <button className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-headline font-extrabold text-lg shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <Heart className="w-6 h-6 fill-current" />
          Thích
        </button>
        <button className="w-16 h-16 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-surface-container-highest transition-all active:scale-90 group">
          <Star className="w-8 h-8 fill-current transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
};
