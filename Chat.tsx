import React from 'react';
import { motion } from 'motion/react';
import { Edit3, Search, Phone, Video, Info, PlusCircle, Image, Smile, Send, Bolt } from 'lucide-react';
import { cn } from '../lib/utils';

export const Chat = () => {
  const chatList = [
    { id: 1, name: 'Lan Hương', lastMsg: 'Lan Hương: Chào anh! ✨', time: 'Vừa xong', active: true, online: true },
    { id: 2, name: 'Minh Anh', lastMsg: 'Minh Anh: Rất vui được gặp bạn', time: '12:45', online: false },
    { id: 3, name: 'Thu Phương', lastMsg: 'Hẹn gặp bạn vào cuối tuần nhé!', time: 'Hôm qua', online: false },
  ];

  return (
    <div className="pt-20 h-screen flex overflow-hidden">
      {/* Left Column: Chat List */}
      <aside className="w-full md:w-96 flex-shrink-0 flex flex-col bg-white border-r border-outline-variant/15">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-headline text-on-surface">Tin nhắn</h1>
            <button className="p-2 bg-surface-container-high rounded-full text-primary hover:bg-primary-container hover:text-white transition-all">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
          {/* Search */}
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-surface-container rounded-xl border-none focus:ring-0 focus:bg-surface-container-high transition-all text-sm font-medium" 
              placeholder="Tìm kiếm hội thoại..." 
              type="text"
            />
          </div>
        </div>

        {/* Active Chats Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
          {chatList.map((chat) => (
            <div 
              key={chat.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all",
                chat.active ? "bg-rose-50/80 border-l-4 border-primary" : "hover:bg-surface-container-low"
              )}
            >
              <div className="relative">
                <img 
                  className="w-14 h-14 rounded-full object-cover" 
                  src={`https://picsum.photos/seed/${chat.id}/100/100`} 
                  alt={chat.name}
                  referrerPolicy="no-referrer"
                />
                {chat.online && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-on-surface truncate font-headline">{chat.name}</span>
                  <span className={cn("text-[10px]", chat.active ? "text-primary font-bold" : "text-on-surface-variant/60")}>{chat.time}</span>
                </div>
                <p className={cn("text-sm truncate", chat.active ? "text-on-surface-variant font-semibold italic" : "text-on-surface-variant")}>
                  {chat.lastMsg}
                </p>
              </div>
            </div>
          ))}

          {/* AI Recommendation Group */}
          <div className="mt-8 mb-4 px-2">
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest px-2">Gợi ý từ LoveAI</span>
            <div className="mt-3 bg-surface-container-low rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20">
                  <img src="https://picsum.photos/seed/ai/100/100" alt="AI Suggestion" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-xs font-bold font-headline">Khánh Vy</p>
                  <p className="text-[10px] text-primary">Tương hợp 98%</p>
                </div>
                <button className="ml-auto text-primary p-1">
                  <Bolt className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Chat Interface */}
      <section className="hidden md:flex flex-1 flex-col bg-white relative">
        {/* Chat Header */}
        <header className="p-4 px-8 glass-header flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                className="w-12 h-12 rounded-full object-cover border-2 border-rose-100" 
                src="https://picsum.photos/seed/1/100/100" 
                alt="Active Contact"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-lg font-headline">Lan Hương</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-on-surface-variant font-medium">Đang hoạt động</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors text-zinc-600">
              <Phone className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors text-zinc-600">
              <Video className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors text-primary">
              <Info className="w-5 h-5 fill-current" />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest bg-surface-container-high px-3 py-1 rounded-full">Hôm nay, 14:30</span>
          </div>

          {/* Incoming Message */}
          <div className="flex items-end gap-3 max-w-[80%]">
            <img className="w-8 h-8 rounded-full object-cover" src="https://picsum.photos/seed/1/50/50" alt="Avatar" referrerPolicy="no-referrer" />
            <div className="space-y-1">
              <div className="bg-surface-container-high text-on-surface p-4 rounded-xl rounded-bl-none text-sm font-medium">
                Chào anh! Em thấy chúng ta có cùng sở thích leo núi á 🏔️
              </div>
              <span className="text-[10px] text-on-surface-variant ml-1">14:32</span>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex flex-col items-end gap-1 ml-auto max-w-[80%]">
            <div className="bg-gradient-to-r from-primary to-primary-container text-white p-4 rounded-xl rounded-br-none text-sm font-medium shadow-md shadow-rose-200">
              Chào Lan Hương! Đúng rồi, anh vừa đi Fansipan tháng trước. Em thường leo ở đâu?
            </div>
            <div className="flex items-center gap-1 mr-1">
              <span className="text-[10px] text-on-surface-variant">14:35</span>
              <span className="text-[10px] text-primary font-bold">Đã xem</span>
            </div>
          </div>

          {/* Incoming Message with Image */}
          <div className="flex items-end gap-3 max-w-[80%]">
            <img className="w-8 h-8 rounded-full object-cover" src="https://picsum.photos/seed/1/50/50" alt="Avatar" referrerPolicy="no-referrer" />
            <div className="space-y-1">
              <div className="bg-surface-container-high text-on-surface p-1 rounded-xl rounded-bl-none overflow-hidden">
                <img className="rounded-lg w-full max-h-60 object-cover mb-1" src="https://picsum.photos/seed/mountain/600/400" alt="Mountain" referrerPolicy="no-referrer" />
                <div className="p-3 pt-1 text-sm font-medium">
                  Wow, Fansipan đẹp quá! Em mới chỉ leo núi Bà Đen thôi, đây là ảnh em chụp nè.
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant ml-1">14:38</span>
            </div>
          </div>

          {/* Typing Indicator */}
          <div className="flex items-center gap-3">
            <img className="w-8 h-8 rounded-full object-cover" src="https://picsum.photos/seed/1/50/50" alt="Avatar" referrerPolicy="no-referrer" />
            <div className="bg-surface-container p-3 rounded-full flex gap-1">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
            </div>
            <span className="text-[10px] font-bold text-primary italic">Lan Hương đang soạn...</span>
          </div>
        </div>

        {/* Input Bar */}
        <footer className="p-6 bg-white border-t border-outline-variant/10">
          <div className="flex items-end gap-4 max-w-5xl mx-auto">
            <div className="flex gap-1 mb-1">
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-500 transition-colors">
                <PlusCircle className="w-6 h-6" />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-500 transition-colors">
                <Image className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea 
                className="w-full bg-surface-container-low border-none rounded-2xl py-3 pl-5 pr-12 focus:ring-2 focus:ring-rose-100 transition-all text-sm resize-none overflow-hidden" 
                placeholder="Nhập tin nhắn..." 
                rows={1}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button className="w-12 h-12 bg-gradient-to-r from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200 active:scale-90 transition-transform">
              <Send className="w-5 h-5 fill-current" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};
