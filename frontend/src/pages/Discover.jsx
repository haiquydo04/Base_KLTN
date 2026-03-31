import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService, matchService } from '../services/api';
import Navbar from '../components/Navbar';

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
  const { user } = useAuthStore();

  const [profiles, setProfiles]           = useState([]);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]                 = useState('');
  const [matchNotification, setMatchNotification] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [likeFlash, setLikeFlash]         = useState(false);
  const [passFlash, setPassFlash]         = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getRecommendedUsers();
      setProfiles(res.users || []);
      setCurrentIndex(0);
      setError('');
    } catch {
      setError('Không thể tải hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);
  useEffect(() => { setSelectedPhoto(0); }, [currentIndex]);

  const cp = profiles[currentIndex]; // current profile

  const handleLike = async () => {
    if (actionLoading || !cp) return;
    setLikeFlash(true); setTimeout(() => setLikeFlash(false), 420);
    setActionLoading(true);
    try {
      const res = await matchService.likeUser(cp._id);
      if (res.isMatch || res.matched) setMatchNotification({ matchedUser: cp });
      setCurrentIndex(i => i + 1);
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const handlePass = async () => {
    if (actionLoading || !cp) return;
    setPassFlash(true); setTimeout(() => setPassFlash(false), 420);
    setActionLoading(true);
    try {
      await matchService.passUser(cp._id);
      setCurrentIndex(i => i + 1);
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const getPhotos = (p) => {
    if (!p) return [];
    const arr = p.avatar ? [p.avatar] : [];
    if (p.photos) arr.push(...p.photos.filter(x => x !== p.avatar));
    return arr.slice(0, 4);
  };

  /* ── Shared tokens ── */
  const BG_PAGE   = 'linear-gradient(160deg, #fff8fa 0%, #fdf4ff 55%, #f5f3ff 100%)';
  const CARD_STYLE = { background: '#ffffff', borderRadius: 16, border: '1px solid #fce7f3' };
  const SHADOW_SM  = '0 2px 12px rgba(244,63,94,0.06)';

  /* ── STATES ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col" style={{ background: BG_PAGE }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-rose-400 animate-spin mx-auto" />
          <p style={{ fontSize: 13, color: '#f9a8d4', fontWeight: 500 }}>Đang tìm người phù hợp…</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col" style={{ background: BG_PAGE }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div style={{ ...CARD_STYLE, padding: 32, textAlign: 'center', maxWidth: 320, boxShadow: SHADOW_SM }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>😢</div>
          <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16 }}>{error}</p>
          <button onClick={fetchProfiles}
            style={{ background: 'linear-gradient(135deg,#fb7185,#f43f5e)', color: '#fff', borderRadius: 24, padding: '8px 24px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );

  if (!cp) return (
    <div className="min-h-screen flex flex-col" style={{ background: BG_PAGE }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div style={{ ...CARD_STYLE, padding: 40, textAlign: 'center', maxWidth: 320, boxShadow: SHADOW_SM }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💝</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Hết hồ sơ rồi!</h3>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 24 }}>Hãy quay lại sau để khám phá thêm 💕</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={fetchProfiles}
              style={{ background: 'linear-gradient(135deg,#fb7185,#f43f5e)', color: '#fff', borderRadius: 24, padding: '8px 20px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(244,63,94,0.3)' }}>
              Tải lại
            </button>
            <Link to="/matches"
              style={{ background: '#fff0f6', color: '#f43f5e', borderRadius: 24, padding: '8px 20px', fontSize: 12, fontWeight: 600, border: '1px solid #fce7f3', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Xem kết nối
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const photos  = getPhotos(cp);
  const mainSrc = photos[selectedPhoto] || null;
  const side    = photos.filter((_, i) => i !== selectedPhoto).slice(0, 2);
  const initial = ((cp.fullName || cp.username) ?? '?').charAt(0).toUpperCase();

  const aiItems = [
    { icon: '🎯', bg: '#fce7f3', title: 'Tính cách tương đồng', desc: 'Cả hai đều hướng nội, đề cao sự chân thành trong quan hệ lâu dài.' },
    { icon: '🎁', bg: '#fef3c7', title: 'Sở thích giao thoa',   desc: 'Đam mê du lịch & thiết kế sáng tạo — chủ đề mở đầu tuyệt vời.' },
    { icon: '📈', bg: '#ede9fe', title: 'Dự đoán kết nối',      desc: 'Khả năng cao có buổi hẹn hò chất lượng tại quán cà phê yên tĩnh.' },
  ];

  /* ════ MAIN RENDER ════ */
  return (
    <div style={{ minHeight: '100vh', background: BG_PAGE, display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Scrollable content area with room at bottom ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ════ 3-COLUMN GRID ════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '5fr 3.5fr 5.5fr', gap: 16, alignItems: 'start' }}>

            {/* ╔══════════════════════════╗
                ║  LEFT — Photo + Info     ║
                ╚══════════════════════════╝ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Main photo */}
              <div style={{ borderRadius: 18, overflow: 'hidden', height: 290, position: 'relative', boxShadow: '0 4px 20px rgba(244,63,94,0.10)', flexShrink: 0 }}>
                {mainSrc
                  ? <img src={mainSrc} alt={cp.fullName || cp.username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                  : <PhotoPlaceholder initial={initial} />
                }

                {/* Photo dots */}
                {photos.length > 1 && (
                  <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                    {photos.map((_, i) => (
                      <button key={i} onClick={() => setSelectedPhoto(i)}
                        style={{ height: 4, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
                          width: i === selectedPhoto ? 20 : 10,
                          background: i === selectedPhoto ? '#fff' : 'rgba(255,255,255,0.5)',
                          transition: 'all .25s' }} />
                    ))}
                  </div>
                )}

                {/* Online badge */}
                {cp.isOnline && (
                  <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: '4px 10px', fontSize: 10, fontWeight: 600, color: '#6b7280' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'block' }} />
                      TRỰC TUYẾN
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Info card */}
              <div style={{ ...CARD_STYLE, padding: '14px 16px', boxShadow: SHADOW_SM }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1.2, margin: 0 }}>
                      {cp.fullName || cp.username}
                      {cp.age && <span style={{ fontWeight: 400, color: '#9ca3af' }}>, {cp.age}</span>}
                    </h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {cp.isVerifiedProfile && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#f43f5e' }}>
                          <svg width="13" height="13" fill="#f43f5e" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          AI xác thực
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af' }}>
                        <svg width="11" height="11" fill="#fb7185" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {cp.location ? `Cách bạn 2km` : 'Cách bạn 2km'}
                      </span>
                    </div>
                  </div>
                  <button style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#fdf2f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <svg width="14" height="14" fill="#f9a8d4" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>

                {/* Bio */}
                {cp.bio && (
                  <div style={{ borderTop: '1px solid #fef2f8', paddingTop: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#f43f5e', marginBottom: 4 }}>Giới thiệu</p>
                    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cp.bio}</p>
                  </div>
                )}

                {/* Interests */}
                {cp.interests?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {cp.interests.slice(0, 5).map((t, i) => (
                      <span key={i} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#fdf2f8', color: '#e879a0', border: '1px solid #fce7f3' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ╔════════════════════════════╗
                ║  MIDDLE — Thumbnails + CTA ║
                ╚════════════════════════════╝ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Thumb 1 */}
              <div
                onClick={() => side[0] && setSelectedPhoto(photos.indexOf(side[0]))}
                style={{ borderRadius: 16, overflow: 'hidden', height: 138, cursor: side[0] ? 'pointer' : 'default',
                  background: 'linear-gradient(135deg,#fce7f3,#fdf4ff)', boxShadow: SHADOW_SM, flexShrink: 0 }}
              >
                {side[0]
                  ? <img src={side[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'transform .3s', display: 'block' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  : <div className="w-full h-full flex items-center justify-center">
                      <svg width="28" height="28" fill="none" stroke="#f9a8d4" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                }
              </div>

              {/* Thumb 2 */}
              <div
                onClick={() => side[1] && setSelectedPhoto(photos.indexOf(side[1]))}
                style={{ borderRadius: 16, overflow: 'hidden', height: 138, cursor: side[1] ? 'pointer' : 'default',
                  background: 'linear-gradient(135deg,#ede9fe,#fdf4ff)', boxShadow: SHADOW_SM, flexShrink: 0 }}
              >
                {side[1]
                  ? <img src={side[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'transform .3s', display: 'block' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  : <div className="w-full h-full flex items-center justify-center">
                      <svg width="28" height="28" fill="none" stroke="#c4b5fd" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                }
              </div>

              {/* ★ ACTION CARD ★ */}
              <div style={{
                borderRadius: 20, padding: '16px 12px', flexShrink: 0,
                background: 'linear-gradient(145deg,#fff0f6 0%,#fdf4ff 55%,#f5f3ff 100%)',
                border: '2px solid #fb7185',
                boxShadow: '0 6px 28px rgba(244,63,94,0.18), 0 0 0 4px rgba(251,113,133,0.10)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
              }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#e11d48', textTransform: 'uppercase', margin: 0 }}>
                  💕 Bạn có thích không?
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, width: '100%' }}>

                  {/* PASS */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <button onClick={handlePass} disabled={actionLoading}
                      style={{
                        width: 46, height: 46, borderRadius: '50%', border: '2px solid',
                        borderColor: passFlash ? '#ef4444' : '#fca5a5',
                        background: passFlash ? 'linear-gradient(135deg,#fca5a5,#ef4444)' : '#fff',
                        boxShadow: passFlash ? '0 6px 18px rgba(239,68,68,0.35)' : '0 3px 12px rgba(252,165,165,0.25)',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: passFlash ? 'scale(0.9)' : 'scale(1)',
                        transition: 'all .2s', opacity: actionLoading ? 0.4 : 1
                      }}
                      onMouseEnter={e => { if (!passFlash) { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(252,165,165,0.45)'; }}}
                      onMouseLeave={e => { if (!passFlash) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(252,165,165,0.25)'; }}}
                    >
                      <svg width="18" height="18" fill="none" stroke={passFlash ? '#fff' : '#f87171'} strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#f87171' }}>Bỏ qua</span>
                  </div>

                  {/* LIKE */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <button onClick={handleLike} disabled={actionLoading}
                      style={{
                        width: 62, height: 62, borderRadius: '50%', border: 'none',
                        background: 'linear-gradient(135deg,#fb7185,#f43f5e)',
                        boxShadow: likeFlash
                          ? '0 8px 28px rgba(244,63,94,0.55), 0 0 0 10px rgba(244,63,94,0.12)'
                          : '0 6px 22px rgba(244,63,94,0.38), 0 0 0 5px rgba(244,63,94,0.08)',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: likeFlash ? 'scale(1.16)' : 'scale(1)',
                        transition: 'all .2s', opacity: actionLoading ? 0.4 : 1, position: 'relative', overflow: 'visible'
                      }}
                      onMouseEnter={e => { if (!likeFlash) { e.currentTarget.style.transform = 'scale(1.10)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(244,63,94,0.50), 0 0 0 10px rgba(244,63,94,0.12)'; }}}
                      onMouseLeave={e => { if (!likeFlash) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(244,63,94,0.38), 0 0 0 5px rgba(244,63,94,0.08)'; }}}
                    >
                      <svg width="28" height="28" fill="#fff" viewBox="0 0 24 24">
                        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
                      </svg>
                    </button>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#f43f5e' }}>Thích ❤️</span>
                  </div>

                  {/* SUPER LIKE */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <button disabled={actionLoading}
                      style={{
                        width: 46, height: 46, borderRadius: '50%', border: '2px solid #fcd34d',
                        background: '#fff',
                        boxShadow: '0 3px 12px rgba(251,191,36,0.22)',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .2s', opacity: actionLoading ? 0.4 : 1
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.background = 'linear-gradient(135deg,#fef9c3,#fde68a)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(251,191,36,0.45)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(251,191,36,0.22)'; }}
                    >
                      <svg width="18" height="18" fill="#fbbf24" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#f59e0b' }}>Super ⭐</span>
                  </div>

                </div>
              </div>
            </div>

            {/* ╔══════════════════════════╗
                ║  RIGHT — AI + Info cards ║
                ╚══════════════════════════╝ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* AI Analysis */}
              <div style={{ ...CARD_STYLE, padding: '16px 18px', boxShadow: SHADOW_SM }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#f43f5e', fontSize: 15, lineHeight: 1 }}>✦</span>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Phân tích AI</h2>
                  </div>
                  <AIScoreRing score={85} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {aiItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', margin: '0 0 3px' }}>{item.title}</p>
                        <p style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: 9, color: '#d1d5db', marginTop: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Phân tích bởi LoveAI v2.0
                </p>
              </div>

              {/* Nearby card */}
              <div style={{ ...CARD_STYLE, overflow: 'hidden', boxShadow: SHADOW_SM }}>
                <div style={{ position: 'relative', height: 80 }}>
                  {cp.avatar
                    ? <img src={cp.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', opacity: 0.45, display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#fce7f3,#ede9fe)' }} />
                  }
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(244,63,94,0.08),rgba(167,139,250,0.08))' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: '4px 10px', fontSize: 10, fontWeight: 600, color: '#6b7280' }}>
                      <svg width="10" height="10" fill="#f43f5e" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {cp.location ? `Cách bạn 2km (${cp.location})` : 'Cách bạn 2km (Quận 1)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety tip */}
              <div style={{ borderRadius: 16, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', background: 'linear-gradient(135deg,#fff0f6,#fdf2ff)', border: '1.5px solid #fce7f3', boxShadow: '0 2px 10px rgba(244,63,94,0.07)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#fce7f3,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" fill="none" stroke="#f43f5e" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', margin: '0 0 3px' }}>🛡️ An toàn khi hẹn hò</p>
                  <p style={{ fontSize: 10, color: '#9d4c6e', lineHeight: 1.6, margin: 0 }}>
                    Luôn trò chuyện qua ứng dụng trước khi quyết định gặp mặt trực tiếp.{' '}
                    <button style={{ color: '#f43f5e', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: 10, fontWeight: 600 }}>
                      Tìm hiểu thêm
                    </button>
                  </p>
                </div>
              </div>

              {/* Lifestyle chips */}
              {(cp.occupation || cp.education || cp.height) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cp.occupation && (
                    <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#fff0f6', color: '#e879a0', border: '1px solid #fce7f3' }}>💼 {cp.occupation}</span>
                  )}
                  {cp.education && (
                    <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#eff6ff', color: '#60a5fa', border: '1px solid #dbeafe' }}>🎓 {cp.education}</span>
                  )}
                  {cp.height && (
                    <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#f0fdf4', color: '#4ade80', border: '1px solid #bbf7d0' }}>📏 {cp.height}cm</span>
                  )}
                </div>
              )}

            </div>{/* end right col */}
          </div>{/* end 3-col grid */}
        </div>{/* end max-w container */}
      </div>{/* end scroll area */}

      {/* ══ MATCH MODAL ══ */}
      {matchNotification && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{
            background: '#fff', borderRadius: 28, padding: '32px 28px', maxWidth: 320, width: '100%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(244,63,94,0.2)', position: 'relative', overflow: 'hidden',
            animation: 'popIn .38s cubic-bezier(.34,1.56,.64,1) both'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(251,113,133,0.06),rgba(216,180,254,0.08))', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>💕</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Kết đôi!</h2>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
                Bạn và <strong style={{ color: '#374151' }}>{matchNotification.matchedUser?.fullName || matchNotification.matchedUser?.username}</strong> đã thích nhau!
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                {[user, matchNotification.matchedUser].map((u, i) => (
                  <div key={i} style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 0 3px ${i === 0 ? '#fb7185' : '#c4b5fd'}, 0 0 0 5px #fff` }}>
                    {u?.avatar
                      ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20, background: i === 0 ? 'linear-gradient(135deg,#fb7185,#f43f5e)' : 'linear-gradient(135deg,#c4b5fd,#8b5cf6)' }}>
                          {(u?.fullName || u?.username)?.charAt(0).toUpperCase()}
                        </div>
                    }
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => { setMatchNotification(null); navigate('/matches'); }}
                  style={{ width: '100%', padding: '12px 0', background: 'linear-gradient(135deg,#fb7185,#f43f5e)', color: '#fff', borderRadius: 28, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px rgba(244,63,94,0.35)' }}>
                  ❤️ Nhắn tin ngay
                </button>
                <button
                  onClick={() => setMatchNotification(null)}
                  style={{ background: 'none', border: 'none', color: '#d1d5db', fontSize: 12, cursor: 'pointer', padding: '6px 0' }}>
                  Tiếp tục khám phá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:scale(0.72); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Discover;
