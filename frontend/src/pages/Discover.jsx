import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService, matchService } from '../services/api';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';

/* ─── Icons ─── */
const Icons = {
  Target: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Gift: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  Activity: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Compass: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  User: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Message: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  ChevronLeft: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>,
  Menu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
};

const BG_PAGE = 'linear-gradient(160deg, #fff8fa 0%, #fdf4ff 55%, #f5f3ff 100%)';

/* ─── AI Score Ring ─── */
const AIScoreRing = ({ score = 85 }) => {
  const r = 20, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: 48, height: 48 }}>
      <svg className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }} width="48" height="48" viewBox="0 0 48 48">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r={r} fill="none" stroke="#fce7f3" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke="url(#ring-grad)" strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: 10, fontWeight: 700, color: '#f43f5e' }}>{score}%</span>
      </div>
    </div>
  );
};

/* ─── Photo placeholder ─── */
const PhotoPlaceholder = ({ initial = '?', gradient = 'linear-gradient(135deg,#fce7f3,#fdf4ff,#ede9fe)' }) => (
  <div className="w-full h-full flex items-center justify-center" style={{ background: gradient }}>
    <span style={{ fontSize: 52, fontWeight: 700, color: '#f9a8d4', opacity: 0.8 }}>{initial}</span>
  </div>
);

/* ════════════════════════════════════════
   Discover Page
════════════════════════════════════════ */
const Discover = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [likeFlash, setLikeFlash] = useState(false);
  const [passFlash, setPassFlash] = useState(false);
  const [superFlash, setSuperFlash] = useState(false);
  const [superAnimation, setSuperAnimation] = useState(false);

  const fetchProfiles = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setProfiles([]);
      setCurrentIndex(0);

      const res = await userService.getRecommendedUsers(forceRefresh);

      const newProfiles = res?.users || res?.data?.users || res?.data || [];

      if (!Array.isArray(newProfiles)) {
        setProfiles([]);
      } else {
        setProfiles(newProfiles);
      }

      setError('');
    } catch (err) {
      setError('Không thể tải hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [location.pathname, fetchProfiles]);

  useEffect(() => { setSelectedPhoto(0); }, [currentIndex]);

  const cp = profiles[currentIndex]; // current profile

  const handleLike = async () => {
    if (actionLoading || !cp) return;
    setLikeFlash(true); setTimeout(() => setLikeFlash(false), 420);
    setActionLoading(true);
    try {
      const res = await matchService.likeUser(cp._id);
      
      const isMatch = res?.matched || res?.isMatch;
      const conversationId = res?.conversationId || res?.matchId;
      
      if (isMatch && conversationId) {
        navigate(`/chat/${conversationId}`);
        return;
      }
      
      setCurrentIndex(i => i + 1);
    } catch (err) {
      setCurrentIndex(i => i + 1);
    }
    finally { setActionLoading(false); }
  };

  const handlePass = async () => {
    if (actionLoading || !cp) return;
    setPassFlash(true); setTimeout(() => setPassFlash(false), 420);
    setActionLoading(true);
    try {
      await matchService.passUser(cp._id);
      setCurrentIndex(i => i + 1);
    } catch (err) {
      setCurrentIndex(i => i + 1);
    }
    finally { setActionLoading(false); }
  };

  const handleSuperLike = async () => {
    if (actionLoading || !cp) return;
    setSuperFlash(true);
    setSuperAnimation(true);
    setActionLoading(true);
    
    try {
      const res = await matchService.superLikeUser(cp._id);
      
      setTimeout(() => setSuperAnimation(false), 2000);
      
      if (res?.matched || res?.isSuperMatch) {
        const conversationId = res?.match?._id || res?.matchId;
        setTimeout(() => {
          if (conversationId) {
            navigate(`/chat/${conversationId}`);
          }
        }, 1500);
        return;
      }
      
      setTimeout(() => {
        setCurrentIndex(i => i + 1);
      }, 1500);
    } catch (err) {
      setTimeout(() => setSuperAnimation(false), 2000);
      setTimeout(() => setCurrentIndex(i => i + 1), 1500);
    }
    finally {
      setActionLoading(false);
      setTimeout(() => setSuperFlash(false), 420);
    }
  };

  const getPhotos = (p) => {
    if (!p) return [];
    const arr = p.avatar ? [p.avatar] : [];
    if (p.photos) arr.push(...p.photos.filter(x => x !== p.avatar));
    return arr.slice(0, 4);
  };

  /* ── Shared tokens ── */
  const CARD_STYLE = { background: '#ffffff', borderRadius: 16, border: '1px solid #fce7f3' };
  const SHADOW_SM = '0 2px 12px rgba(244,63,94,0.06)';

  /* ── STATES ── */
  if (loading) return (
    <div className="min-h-screen bg-[#FCF9F9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-rose-400 animate-spin mx-auto" />
          <p className="text-sm font-medium text-pink-400">Đang tìm người phù hợp…</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#FCF9F9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[1rem] p-8 text-center max-w-sm shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">😢</div>
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button onClick={() => fetchProfiles()} className="bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-full px-6 py-2 text-sm font-bold shadow-md hover:from-rose-500 hover:to-rose-600">
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );

  if (!cp) return (
    <div className="min-h-screen bg-[#FCF9F9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[1.5rem] p-10 text-center max-w-sm shadow-[0_2px_12px_rgba(244,63,94,0.06)] border border-rose-50">
          <div className="text-5xl mb-3">💝</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1.5">Hết hồ sơ rồi!</h3>
          <p className="text-xs text-gray-400 mb-6">Hãy quay lại sau để khám phá thêm 💕</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => fetchProfiles(true)} className="bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-full px-5 py-2 text-xs font-bold shadow-[0_4px_14px_rgba(244,63,94,0.3)]">
              Tải lại
            </button>
            <Link to="/messages" className="bg-rose-50 text-rose-500 border border-rose-100 rounded-full px-5 py-2 text-xs font-bold shadow-sm inline-flex items-center">
              Tin nhắn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const photos = getPhotos(cp);
  const mainSrc = photos[selectedPhoto] || null;
  const side = photos.filter((_, i) => i !== selectedPhoto).slice(0, 2);
  const initial = ((cp.fullName || cp.username) ?? '?').charAt(0).toUpperCase();

  const aiItems = [
    { icon: <Icons.Target color="#f43f5e" size={16} />, bg: '#fce7f3', title: 'Tính cách tương đồng', desc: 'Cả hai đều hướng nội, đề cao sự chân thành trong quan hệ lâu dài.' },
    { icon: <Icons.Gift color="#d97706" size={16} />, bg: '#fef3c7', title: 'Sở thích giao thoa', desc: 'Đam mê du lịch & thiết kế sáng tạo — chủ đề mở đầu tuyệt vời.' },
    { icon: <Icons.Activity color="#7c3aed" size={16} />, bg: '#ede9fe', title: 'Dự đoán kết nối', desc: 'Khả năng cao có buổi hẹn hò chất lượng tại quán cà phê yên tĩnh.' },
  ];

  /* ════ OVERALL LAYOUT WRAPPER ════ */
  return (
    <div className="h-[100vh] w-screen overflow-hidden flex flex-col bg-[#FCF9F9]">
      <Navbar />
      
      {/* ── HORIZONTAL WRAPPER ── */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative w-full">

        <SidebarMenu />

      {/* ── MAIN DISCOVER CONTENT ── */}
      <main className="flex-1 overflow-hidden flex flex-col relative w-full min-w-0">
        
        {/* We use flex layout to strictly fit into the screen without scroll */}
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-6 py-4 flex flex-col overflow-hidden min-w-0">
          
          <div key={cp._id} className="w-full flex-1 flex flex-col lg:flex-row gap-5 lg:gap-6 profile-card-anim min-h-0 relative">
            
            {/* ╔══════════════════════════╗
                ║  LEFT COLUMN — 60%       ║
                ╚══════════════════════════╝ */}
            <div className="w-full lg:w-[60%] flex flex-col relative min-h-0 min-w-0 z-0">
              
              {/* 1) PHOTO GRID - Flexes to take available space height */}
              <div className="flex-1 grid grid-cols-[2fr_1fr] gap-3 md:gap-4 mb-3 min-h-0 relative">
                {/* Main Photo (Left) */}
                <div 
                  className="rounded-[2rem] overflow-hidden relative shadow-[0_4px_20px_rgba(244,63,94,0.1)] cursor-pointer bg-gray-100 h-full min-h-[250px]"
                  onClick={() => setSelectedPhoto(0)}
                >
                  {photos[0] ? (
                    <img src={photos[0]} alt="Main" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  ) : (
                    <PhotoPlaceholder initial={initial} />
                  )}
                  {cp.isOnline && (
                    <div className="absolute bottom-3 left-3 bg-black/45 backdrop-blur font-bold text-white text-[10px] md:text-xs px-3 py-1.5 rounded-full tracking-wider border border-white/10 uppercase z-10">
                      TRỰC TUYẾN
                    </div>
                  )}
                  {selectedPhoto === 0 && <div className="absolute inset-0 ring-4 ring-inset ring-rose-400 rounded-[2.5rem] z-20 pointer-events-none" />}
                </div>

                {/* Stacked Photos (Right) */}
                <div className="flex flex-col gap-3 md:gap-4 h-full min-h-0">
                  <div 
                    className="rounded-[1.5rem] overflow-hidden flex-1 relative shadow-sm cursor-pointer bg-gray-100 min-h-0"
                    onClick={() => photos[1] && setSelectedPhoto(1)}
                  >
                    {photos[1] ? (
                      <img src={photos[1]} alt="Thumbnail 1" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-50 flex items-center justify-center">
                        <Icons.User size={24} color="#f9a8d4" />
                      </div>
                    )}
                    {selectedPhoto === 1 && <div className="absolute inset-0 ring-4 ring-inset ring-rose-400 rounded-[1.5rem] z-20 pointer-events-none" />}
                  </div>

                  <div 
                    className="rounded-[1.5rem] overflow-hidden flex-1 relative shadow-sm cursor-pointer bg-gray-100 min-h-0"
                    onClick={() => photos[2] && setSelectedPhoto(2)}
                  >
                    {photos[2] ? (
                      <img src={photos[2]} alt="Thumbnail 2" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center">
                        <Icons.User size={24} color="#c4b5fd" />
                      </div>
                    )}
                    {selectedPhoto === 2 && <div className="absolute inset-0 ring-4 ring-inset ring-rose-400 rounded-[1.5rem] z-20 pointer-events-none" />}
                  </div>
                </div>
              </div>

              {/* 2) PROFILE HEADER & BIO - Bottom fixed constrained bounds */}
              <div className="flex-shrink-0 flex flex-col h-[180px] lg:h-[220px]">
                
                {/* Header Name & Badges */}
                <div className="flex items-start justify-between mb-2 lg:mb-3 px-1 flex-shrink-0">
                  <div className="min-w-0 pr-2">
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight truncate">
                      {cp.fullName || cp.username}{cp.age && <span>, {cp.age}</span>}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] text-gray-600 font-medium">
                      {cp.isVerifiedProfile && (
                         <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                           <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                           </svg>
                           Đã xác thực
                         </span>
                      )}
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[11px]">Cách bạn 2km</span>
                    </div>
                  </div>
                </div>

                {/* Bio Block with absolute Action Bar to avoid height jumps */}
                <div className="bg-[#FFF5F8]/80 rounded-[1.5rem] p-4 relative shadow-[0_2px_10px_rgba(244,63,94,0.03)] border border-rose-50/50 flex-1 flex flex-col justify-between w-full h-[120px] lg:mb-6">
                  
                  <div className="overflow-hidden mb-2 relative z-10 w-full pr-4">
                     <p className="text-gray-700 text-[13px] leading-relaxed line-clamp-2 pr-6">
                       <span className="font-bold text-rose-700 mr-2 uppercase tracking-wide text-[11px]">Giới thiệu:</span>
                       {cp.bio || "Chưa có lời giới thiệu."}
                     </p>
                  </div>

                  {cp.interests?.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-hidden flex-nowrap w-[calc(100%-80px)] pb-1 shrink-0 z-10">
                      {cp.interests.slice(0, 3).map((t, i) => {
                        const iconP = ['🎨', '🍷', '⛰️', '🎧', '📸'][i % 5];
                        return (
                          <span key={i} className="flex-shrink-0 bg-white/90 border border-rose-50 text-gray-600 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)] backdrop-blur-sm whitespace-nowrap">
                            {iconP} {t}
                          </span>
                        );
                      })}
                      {cp.interests.length > 3 && (
                         <span className="flex-shrink-0 text-rose-400 text-[10px] font-bold">+ {cp.interests.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* 4) FLOATING ACTION BAR - Right Overlay aligned bottom */}
                  <div className="absolute -bottom-2 right-4 lg:right-6 flex items-center gap-2 lg:gap-3 bg-white/90 backdrop-blur-xl px-2 lg:px-3 py-1.5 lg:py-2 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-rose-50 z-30">
                     
                     <button 
                       onClick={handlePass} disabled={actionLoading}
                       className={`w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-all ${passFlash ? 'scale-90 opacity-50 bg-red-100' : 'hover:scale-105'}`}
                     >
                       <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>

                     <button 
                       onClick={handleLike} disabled={actionLoading}
                       className={`px-4 lg:px-6 h-10 lg:h-12 rounded-[1.5rem] bg-[#E11D48] text-white font-bold flex items-center gap-1.5 transition-all shadow-[0_4px_10px_rgba(225,29,72,0.3)]
                                   ${likeFlash ? 'scale-110 shadow-[0_4px_20px_rgba(225,29,72,0.5)]' : 'hover:bg-rose-700 hover:scale-105'}`}
                     >
                       <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                       <span className="text-[13px] lg:text-[14px]">Thích</span>
                     </button>

                     <button 
                       onClick={handleSuperLike} disabled={actionLoading}
                       className={`w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-[#FFF0F4] border border-rose-50 flex items-center justify-center hover:bg-rose-100 transition-all ${superFlash ? 'scale-110 bg-yellow-100' : 'hover:scale-105'}`}
                     >
                       <svg className="w-4 h-4 lg:w-5 lg:h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                     </button>

                  </div>
                </div>

              </div>
            </div>

            {/* ╔══════════════════════════╗
                ║  RIGHT COLUMN — 40%      ║
                ╚══════════════════════════╝ */}
            <div className="w-full lg:w-[40%] flex flex-col gap-4 lg:gap-5 relative z-0 h-full min-h-0 flex-shrink-0">
               
               {/* AI Analysis Box - Takes fixed proportion */}
               <div className="bg-white rounded-[1.5rem] p-4 lg:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden flex flex-col flex-shrink-0">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-3 lg:mb-4 relative z-10 shrink-0">
                     <h2 className="text-[15px] lg:text-[16px] font-bold text-gray-900 flex items-center gap-1.5">
                       <span className="text-rose-500 text-lg leading-[0]">✦</span>
                       Phân tích AI
                     </h2>
                     <div className="transform scale-[0.8] origin-right"><AIScoreRing score={85} /></div>
                  </div>

                  <div className="flex flex-col gap-3 lg:gap-4 relative z-10 flex-shrink-0 overflow-y-auto pr-1 flex-1 min-h-0">
                     {/* Point 1 */}
                     <div className="flex gap-3 items-start shrink-0">
                       <div className="w-7 h-7 rounded-full bg-[#FFF0F4] flex items-center justify-center text-rose-500 shrink-0 mt-0.5 shadow-sm">
                         <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="white"/></svg>
                       </div>
                       <div>
                         <p className="text-[12px] lg:text-[13px] font-bold text-gray-900 mb-0.5">Tính cách tương đồng</p>
                         <p className="text-[11px] lg:text-[12px] text-gray-500 leading-snug line-clamp-2">Hai bạn đều thuộc nhóm tính cách hướng nội và chân thành.</p>
                       </div>
                     </div>

                     {/* Point 2 */}
                     <div className="flex gap-3 items-start shrink-0">
                       <div className="w-7 h-7 rounded-full bg-[#FFF5F1] flex items-center justify-center text-orange-500 shrink-0 mt-0.5 shadow-sm">
                         <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                       </div>
                       <div>
                         <p className="text-[12px] lg:text-[13px] font-bold text-gray-900 mb-0.5">Sở thích giao thoa</p>
                         <p className="text-[11px] lg:text-[12px] text-gray-500 leading-snug line-clamp-2">Đam mê du lịch và thiết kế sáng tạo sẽ là chủ đề tuyệt vời.</p>
                       </div>
                     </div>

                     {/* Point 3 */}
                     <div className="flex gap-3 items-start shrink-0">
                       <div className="w-7 h-7 rounded-full bg-[#F5F3FF] flex items-center justify-center text-indigo-500 shrink-0 mt-0.5 shadow-sm">
                         <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                       </div>
                       <div>
                         <p className="text-[12px] lg:text-[13px] font-bold text-gray-900 mb-0.5">Dự đoán kết nối</p>
                         <p className="text-[11px] lg:text-[12px] text-gray-500 leading-snug line-clamp-2">Khả năng cao cùng yêu thích các buổi hẹn hò ở quán cà phê yên tĩnh.</p>
                       </div>
                     </div>
                  </div>

                  <div className="text-center mt-3 pt-2 relative z-10 shrink-0">
                     <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Phân tích bởi LoveAI v2.0</span>
                  </div>
               </div>

               {/* Background Map image - Adjusts to remaining space */}
               <div className="flex-1 min-h-[90px] lg:min-h-[140px] rounded-[1.5rem] bg-gray-200 relative overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  {mainSrc ? (
                    <img src={mainSrc} className="w-full h-full object-cover blur-[8px] grayscale opacity-50 scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  )}
                  <div className="absolute inset-0 bg-white/10"></div>
                  
                  {/* Pill */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/95 backdrop-blur-md px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[11px] font-bold text-gray-800 shadow-md flex items-center gap-1.5 border border-white">
                      <svg className="w-3.5 h-3.5 text-rose-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                      Cách bạn 2km (Quận 1)
                    </span>
                  </div>
               </div>

               {/* Security Box */}
               <div className="bg-[#4C556A] text-white rounded-[1.2rem] p-4 flex items-center gap-3 shadow-md border border-[#5d6880] shrink-0 h-[80px]">
                  <div className="mt-0 shrink-0">
                    <svg className="w-[20px] h-[20px] text-white/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] lg:text-[12px] leading-tight text-gray-200 line-clamp-2">
                      Luôn ưu tiên an toàn. Hãy trò chuyện qua ứng dụng trước.
                      <button className="underline text-white font-semibold ml-1 hover:text-white/80 transition-colors">Tìm hiểu thêm</button>
                    </p>
                  </div>
               </div>

            </div>{/* end right column */}

          </div>
        </div>
      </main>

      {/* Super Like Animation Overlay */}
      {superAnimation && (
        <div 
          style={{
            position: 'fixed', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div 
            style={{
              textAlign: 'center',
              animation: 'superLikePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div style={{ fontSize: 80, marginBottom: 16 }}>
              ⭐
            </div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              color: '#fff',
              textShadow: '0 0 30px rgba(251,191,36,0.8)',
              marginBottom: 8
            }}>
              SUPER LIKE!
            </h2>
            <p style={{ 
              fontSize: 14, 
              color: '#fbbf24',
              fontWeight: 500
            }}>
              Bạn đã gửi Super Like cho {cp?.fullName || cp?.username}
            </p>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes superLikePop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes starBurst {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.5) rotate(180deg); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .profile-card-anim {
          animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes floatEffect {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        .float-anim {
          animation: floatEffect 4s ease-in-out infinite;
        }
        .float-anim-delayed {
          animation: floatEffect 4s ease-in-out 2s infinite;
        }
        .main-photo-anim {
          transition: transform 0.4s ease;
        }
        .main-photo-anim:hover {
          transform: scale(1.02);
        }
      `}</style>
      
      </div>
    </div>
  );
};

export default Discover;