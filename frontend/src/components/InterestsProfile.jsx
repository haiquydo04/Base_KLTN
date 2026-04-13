import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Asterisk,
  Circle,
  Loader2,
  Plus,
  Sparkles,
  WandSparkles,
  X,
  Hash,
  RotateCcw,
  Check
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const MAX_TAGS = 15;

const formatDisplayTag = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const normalizeTags = (payload) => {
  if (!payload) return [];
  const raw = payload?.tags || payload?.interests || payload?.data?.tags || payload?.data?.interests || payload?.data || payload;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return item.name || item.tag || item.label || '';
      return '';
    })
    .map((v) => v.trim())
    .filter(Boolean);
};

const InterestsProfile = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [initialSelectedTags, setInitialSelectedTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isAtLimit = selectedTags.length >= MAX_TAGS;

  const filteredSuggestions = useMemo(() => {
    const selectedSet = new Set(selectedTags.map((t) => t.toLowerCase()));
    return suggestedTags.filter((tag) => !selectedSet.has(tag.toLowerCase()));
  }, [selectedTags, suggestedTags]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [resTags, resUser] = await Promise.all([
        axiosClient.get('/tags'),
        axiosClient.get('/users/interests')
      ]);
      const allTags = normalizeTags(resTags?.data);
      const userTags = normalizeTags(resUser?.data);
      setSuggestedTags(allTags);
      setSelectedTags(userTags);
      setInitialSelectedTags(userTags);
    } catch {
      setErrorMsg('Không thể tải sở thích lúc này.');
      setSuggestedTags(['Du lịch', 'Âm nhạc', 'Ẩm thực', 'Chụp ảnh', 'Thú cưng', 'Xem phim', 'Thể thao']);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const handleAddTag = () => {
    const value = inputValue.trim();
    if (isAtLimit || !value || value.length < 2 || value.length > 30) {
      if (value.length > 0) setErrorMsg('Độ dài từ 2 đến 30 ký tự');
      return;
    }
    if (selectedTags.some(t => t.toLowerCase() === value.toLowerCase())) {
      setErrorMsg('Sở thích này đã có trong danh sách!');
      return;
    }
    setSelectedTags(prev => [...prev, value]);
    setInputValue('');
    setErrorMsg('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosClient.post('/users/interests', { tags: selectedTags });
      setInitialSelectedTags(selectedTags);
      
      // Bật thông báo
      setSuccessMsg('Đã cập nhật sở thích thành công!');
      setTimeout(() => {
        setSuccessMsg(''); 
      }, 3000);

    } catch {
      setErrorMsg('Lỗi khi lưu thay đổi.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify([...initialSelectedTags].sort()) !== JSON.stringify([...selectedTags].sort());
  }, [initialSelectedTags, selectedTags]);

  return (
    <div className="w-full max-w-5xl relative">
      
      {/* 🟢 TOAST THÔNG BÁO XỊN XÒ - NẰM GÓC TRÊN BÊN PHẢI, MÀU ĐẬM */}
      <div 
        className={`fixed top-24 right-8 z-[9999] flex items-center gap-3 bg-emerald-600 px-6 py-3.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(5,150,105,0.5)] transition-all duration-500 ease-out ${
          successMsg ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white/20 text-white p-1.5 rounded-full">
          <Check className="h-4 w-4" strokeWidth={3} />
        </div>
        <span className="text-sm font-bold text-white tracking-wide">{successMsg}</span>
      </div>
      {/* ---------------------------------------------------- */}

      <div className="mb-5">
        <div className="flex items-center gap-1 text-rose-500 mb-1">
          <Asterisk className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Cá nhân hóa</span>
        </div>
        <h2 className="text-2xl font-black text-zinc-800 tracking-tight">Sở thích & Đam mê</h2>
      </div>

      {isLoading ? (
        <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-rose-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-5">
            <section className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  Đã chọn ({selectedTags.length}/{MAX_TAGS})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                    className="group flex items-center gap-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                  >
                    <Hash className="h-3 w-3 opacity-70" />
                    {formatDisplayTag(tag)}
                    <X className="h-3 w-3 ml-1 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
                {selectedTags.length === 0 && <span className="text-xs text-zinc-400 italic">Chưa có sở thích nào...</span>}
              </div>
            </section>

            <section className="rounded-2xl bg-rose-50/30 border border-rose-100 p-5">
              <h3 className="text-base font-bold text-zinc-800 mb-1">Gợi ý cho bạn</h3>
              <p className="text-[11px] text-zinc-500 mb-4 font-medium">Xu hướng phổ biến trong cộng đồng LoveAI</p>
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.slice(0, 12).map((tag) => (
                  <button
                    key={tag}
                    disabled={isAtLimit}
                    onClick={() => { setSelectedTags([...selectedTags, tag]); setErrorMsg(''); }}
                    className="flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 font-medium hover:border-rose-400 hover:text-rose-600 transition-all hover:shadow-sm disabled:opacity-40"
                  >
                    <Sparkles className="h-3 w-3 text-rose-300" />
                    {formatDisplayTag(tag)}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={loadInitialData}
                className="flex items-center gap-2 px-5 py-2 rounded-xl border border-zinc-200 text-zinc-500 text-xs font-bold hover:bg-zinc-50 transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Hủy thay đổi
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-100 hover:bg-rose-600 disabled:opacity-50 transition-all"
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Lưu thay đổi
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-800 mb-3">Thêm sở thích</h3>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  disabled={isAtLimit}
                  onChange={(e) => { setInputValue(e.target.value); setErrorMsg(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder={isAtLimit ? "Đã đạt giới hạn" : "Nhập sở thích..."}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-100 transition-all"
                />
                <button 
                  onClick={handleAddTag}
                  disabled={isAtLimit}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 bg-rose-500 text-white rounded-lg flex items-center justify-center hover:bg-rose-600 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {errorMsg && <p className="mt-2 text-[10px] text-rose-500 font-bold">{errorMsg}</p>}
              <p className="mt-2 text-[10px] text-zinc-400 italic">Nhấn Enter để thêm nhanh</p>
            </section>

            <section className="rounded-2xl bg-zinc-900 text-white p-5 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10"><WandSparkles className="h-12 w-12" /></div>
               <div className="relative z-10">
                  <span className="text-[9px] font-black tracking-widest text-rose-400 uppercase">LoveAI Intelligence</span>
                  <p className="mt-2 text-xs font-medium leading-relaxed opacity-90">
                    Hệ thống sẽ dựa trên các tag này để gợi ý những người có cùng tần số với bạn.
                  </p>
               </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestsProfile;