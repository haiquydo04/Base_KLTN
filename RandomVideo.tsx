import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, RotateCcw, Sparkles, Shield, Flag, ChevronRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export const RandomVideo = () => {
  const [isSearching, setIsSearching] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);

  return (
    <main className="pt-20 h-screen flex flex-col bg-zinc-950 overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Main Video Area */}
      <section className="flex-1 relative z-10 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
          {isSearching ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-zinc-900/80 backdrop-blur-xl">
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-primary rounded-full"
                />
                <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-2xl shadow-primary/40">
                  <Sparkles className="w-12 h-12 text-white fill-current animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Đang tìm kiếm...</h2>
                <p className="text-zinc-400 font-medium">AI đang lọc những người có cùng sở thích leo núi với bạn</p>
              </div>
              <div className="flex gap-2">
                {['#LeoNui', '#DuLich', '#AmThuc'].map((tag) => (
                  <span key={tag} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-primary tracking-wider uppercase">{tag}</span>
                ))}
              </div>
            </div>
          ) : (
            <img 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/video/1280/720" 
              alt="Remote Video"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Self Preview Overlay */}
          <div className="absolute bottom-6 right-6 w-40 md:w-64 aspect-video bg-zinc-800 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl z-20">
            <img 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/self/400/225" 
              alt="Self Preview"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-widest">Bạn</div>
          </div>

          {/* Top Info Overlay */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Shield className="w-4 h-4 text-green-400 fill-current" />
              <span className="text-xs font-bold text-white tracking-wide">Kết nối an toàn bởi LoveAI</span>
            </div>
            <button className="flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/40 backdrop-blur-md px-4 py-2 rounded-full border border-rose-500/30 text-rose-400 transition-all group">
              <Flag className="w-4 h-4 group-hover:fill-current" />
              <span className="text-xs font-bold tracking-wide">Báo cáo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Control Bar */}
      <footer className="h-32 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-8 z-20">
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
              isMuted ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
              isVideoOff ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button className="w-16 h-16 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-600/40 transition-all active:scale-90">
            <PhoneOff className="w-8 h-8" />
          </button>

          <button className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
            <RotateCcw className="w-6 h-6" />
          </button>

          <div className="h-10 w-px bg-white/10 mx-2"></div>

          <button 
            onClick={() => setIsSearching(!isSearching)}
            className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group"
          >
            <Zap className="w-5 h-5 fill-current group-hover:animate-bounce" />
            <span>{isSearching ? "Dừng lại" : "Người tiếp theo"}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </main>
  );
};
