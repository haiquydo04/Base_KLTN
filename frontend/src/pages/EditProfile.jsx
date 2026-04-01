import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/api';
import Navbar from '../components/Navbar';

/* ── Sidebar nav items ── */
const NAV_ITEMS = [
  { id: 'info', icon: '👤', label: 'Thông tin cá nhân' },
  { id: 'security', icon: '🔒', label: 'Bảo mật tài khoản' },
  { id: 'pref', icon: '⚙️', label: 'Tùy chọn' },
  { id: 'plan', icon: '💎', label: 'Gói thành viên' },
  { id: 'privacy', icon: '🛡️', label: 'Quyền riêng tư' },
];

/* ── Range slider util ── */
const RangeSlider = ({ min, max, value, onChange, unit = '', label }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#f43f5e' }}>{value} {unit}</span>
    </div>
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: '#f43f5e', cursor: 'pointer', height: 4 }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
      <span style={{ fontSize: 10, color: '#d1d5db' }}>{min} {unit}</span>
      <span style={{ fontSize: 10, color: '#d1d5db' }}>{max} {unit}</span>
    </div>
  </div>
);

/* ════════════════════════════
    EditProfile Page
════════════════════════════ */
const EditProfile = () => {
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuthStore();
  const [activeNav, setActiveNav] = useState('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');
  const [viewAvatar, setViewAvatar] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: currentUser?.fullName || '',
    gender: currentUser?.gender || 'female',
    dateOfBirth: currentUser?.dateOfBirth || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    interests: currentUser?.interests?.join(', ') || '',
    avatar: null,
    preferences: {
      maxDistance: currentUser?.preferences?.maxDistance || 25,
      minAge: currentUser?.preferences?.minAge || 18,
      maxAge: currentUser?.preferences?.maxAge || 35,
      gender: currentUser?.preferences?.gender || 'both',
    },
  });

  /* ── handlers ── */
  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setError(''); setSuccess('');
  };
  const setPref = (key, val) => {
    setForm(f => ({ ...f, preferences: { ...f.preferences, [key]: val } }));
    setError(''); setSuccess('');
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set('avatar', file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const interestsArray = form.interests.split(',').map(s => s.trim()).filter(Boolean);
      const data = await userService.updateProfile({
        fullName: form.fullName,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        bio: form.bio,
        location: form.location,
        interests: interestsArray,
        avatar: form.avatar,
        preferences: form.preferences,
      });
      setUser(data.user);
      setSuccess('Lưu thành công!');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  /* ── tokens ── */
  const BG = 'linear-gradient(160deg,#fff8fa 0%,#fdf4ff 55%,#f5f3ff 100%)';
  const CARD = { background: '#fff', borderRadius: 16, border: '1px solid #fce7f3', boxShadow: '0 2px 12px rgba(244,63,94,0.06)' };
  const INPUT = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: '1.5px solid #fce7f3', fontSize: 13, color: '#374151',
    background: '#fff9fb', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .2s',
  };
  const LABEL = { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, display: 'block' };

  const initial = ((currentUser?.fullName || currentUser?.username) ?? '?').charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 20px 60px', gap: 32, boxSizing: 'border-box' }}>

        {/* ══ LEFT SIDEBAR ══ */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ ...CARD, padding: '20px 12px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#f43f5e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, padding: '0 8px' }}>
              Cài đặt
            </p>
            <p style={{ fontSize: 10, color: '#c4b5fd', marginBottom: 16, padding: '0 8px' }}>
              Quản lý trải nghiệm của bạn
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => setActiveNav(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                    borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 12, fontWeight: activeNav === item.id ? 700 : 500,
                    background: activeNav === item.id ? 'linear-gradient(135deg,#fce7f3,#fdf4ff)' : 'transparent',
                    color: activeNav === item.id ? '#f43f5e' : '#9ca3af',
                    transition: 'all .2s',
                  }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ══ CENTER — Main form ══ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Header */}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
              Quản lý hồ sơ cá nhân
            </h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              Hoàn thiện vẻ đẹp tâm hồn để kết nối cùng người thương 💕
            </p>
          </div>

          {/* Avatar */}
          <div style={{ ...CARD, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#fce7f3,#ede9fe)', boxShadow: '0 0 0 3px #fce7f3' }}>
                {avatarPreview
                  ? <img
                    src={avatarPreview}
                    alt="avatar"
                    onClick={() => setViewAvatar(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#f9a8d4' }}>{initial}</div>
                }
              </div>
              <button onClick={() => fileRef.current?.click()}
                style={{ position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', background: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(244,63,94,0.4)' }}>
                <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Ảnh đại diện</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5, maxWidth: 300 }}>
                Tải lên một bức ảnh rõ nét để AI phân tích. Bấm vào ảnh để xem chi tiết.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => fileRef.current?.click()}
                  style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #f43f5e', background: '#fff0f6', color: '#f43f5e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Tải lên ảnh mới
                </button>
                {avatarPreview && (
                  <button onClick={() => { setAvatarPreview(''); set('avatar', null); }}
                    style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Gỡ bỏ
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div style={{ ...CARD, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>❤️</span>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>Thông tin cá nhân</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={LABEL}>Họ tên</label>
                <input style={INPUT} value={form.fullName} placeholder="Nguyễn Thuý An"
                  onChange={e => set('fullName', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#f43f5e'}
                  onBlur={e => e.target.style.borderColor = '#fce7f3'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LABEL}>Giới tính</label>
                  <select style={{ ...INPUT, appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239ca3af' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'calc(100% - 12px) center', paddingRight: 32, cursor: 'pointer' }}
                    value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Ngày sinh</label>
                  <input type="date" style={{ ...INPUT, cursor: 'pointer' }}
                    value={form.dateOfBirth}
                    onChange={e => set('dateOfBirth', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f43f5e'}
                    onBlur={e => e.target.style.borderColor = '#fce7f3'} />
                </div>
              </div>

              <div>
                <label style={LABEL}>Tiểu sử</label>
                <textarea style={{ ...INPUT, minHeight: 88, resize: 'vertical', lineHeight: 1.6 }}
                  value={form.bio} placeholder="Yêu âm nhạc cổ điển, thích đọc sách bên tách trà nóng..."
                  maxLength={500}
                  onChange={e => set('bio', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#f43f5e'}
                  onBlur={e => e.target.style.borderColor = '#fce7f3'} />
                <p style={{ fontSize: 10, color: '#d1d5db', marginTop: 3, textAlign: 'right' }}>{form.bio.length}/500</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LABEL}>Vị trí</label>
                  <input style={INPUT} value={form.location} placeholder="TP. Hồ Chí Minh"
                    onChange={e => set('location', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f43f5e'}
                    onBlur={e => e.target.style.borderColor = '#fce7f3'} />
                </div>
                <div>
                  <label style={LABEL}>Sở thích (cách nhau bởi dấu phẩy)</label>
                  <input style={INPUT} value={form.interests} placeholder="Du lịch, Âm nhạc, Đọc sách"
                    onChange={e => set('interests', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f43f5e'}
                    onBlur={e => e.target.style.borderColor = '#fce7f3'} />
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #fce7f3', margin: '4px 0' }} />

            {error && (
              <div style={{ padding: '10px 14px', background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 12, fontSize: 12, color: '#ef4444' }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, fontSize: 12, color: '#16a34a' }}>
                ✅ {success}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Link to="/profile"
                style={{
                  padding: '12px 28px', borderRadius: 28, border: '1.5px solid #fca5a5',
                  background: '#fff', color: '#f43f5e', fontSize: 13, fontWeight: 700,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer', transition: 'all .2s',
                }}>
                Hủy &nbsp;✕
              </Link>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '12px 36px', borderRadius: 28, border: 'none',
                  background: loading ? '#fca5a5' : 'linear-gradient(135deg,#fb7185,#f43f5e)',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(244,63,94,0.35)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {loading ? '⏳ Đang lưu...' : '✅ Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...CARD, padding: '16px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 14 }}>🌸</span>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Tiêu chí tìm kiếm</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <RangeSlider
                label="Khoảng cách tối đa"
                min={1} max={100}
                value={form.preferences.maxDistance}
                onChange={v => setPref('maxDistance', v)}
                unit="km"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <RangeSlider
                  label="Độ tuổi tối thiểu"
                  min={18} max={60}
                  value={form.preferences.minAge}
                  onChange={v => { if (v <= form.preferences.maxAge) setPref('minAge', v); }}
                  unit="tuổi"
                />
                <RangeSlider
                  label="Độ tuổi tối đa"
                  min={18} max={60}
                  value={form.preferences.maxAge}
                  onChange={v => { if (v >= form.preferences.minAge) setPref('maxAge', v); }}
                  unit="tuổi"
                />
              </div>
              <div>
                <label style={{ ...LABEL, marginBottom: 8 }}>Giới tính mục tiêu</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
                  {[{ v: 'male', l: 'Nam' }, { v: 'female', l: 'Nữ' }, { v: 'both', l: 'Cả hai' }].map(({ v, l }) => (
                    <button key={v} onClick={() => setPref('gender', v)}
                      style={{
                        padding: '7px 4px', borderRadius: 10, border: '1.5px solid',
                        borderColor: form.preferences.gender === v ? '#f43f5e' : '#fce7f3',
                        background: form.preferences.gender === v ? 'linear-gradient(135deg,#fce7f3,#fdf4ff)' : '#fff',
                        color: form.preferences.gender === v ? '#f43f5e' : '#9ca3af',
                        fontSize: 11, fontWeight: form.preferences.gender === v ? 700 : 500,
                        cursor: 'pointer', transition: 'all .2s',
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 14, padding: '14px', background: 'linear-gradient(135deg,#fff0f6,#fdf4ff)', border: '1.5px solid #fce7f3', boxShadow: '0 2px 10px rgba(244,63,94,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#fb7185,#f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 13 }}>✦</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#f43f5e', margin: '0 0 4px' }}>Phân tích LoveAI</p>
                <p style={{ fontSize: 10, color: '#9d4c6e', lineHeight: 1.55, margin: 0 }}>
                  Hồ sơ của bạn đã hoàn thiện 85%. Thêm sở thích âm nhạc để AI tìm kiếm nhiều tâm hồn đồng điệu hơn.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 12, height: 5, borderRadius: 5, background: '#fce7f3' }}>
              <div style={{ width: '85%', height: '100%', borderRadius: 5, background: 'linear-gradient(90deg,#fb7185,#f43f5e)', transition: 'width .8s ease' }} />
            </div>
            <p style={{ fontSize: 9, color: '#f9a8d4', textAlign: 'right', margin: '3px 0 0', fontWeight: 600 }}>85% hoàn thiện</p>
          </div>
        </div>
      </div>

      {/* ══ MODAL XEM ẢNH ĐẠI DIỆN PHÓNG TO ══ */}
      {viewAvatar && avatarPreview && (
        <div
          onClick={() => setViewAvatar(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', padding: 20
          }}
        >
          <button
            onClick={() => setViewAvatar(false)}
            style={{
              position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)',
              border: 'none', color: '#fff', fontSize: 24, width: 40, height: 40,
              borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>

          <img
            src={avatarPreview}
            alt="Phóng to"
            onClick={(e) => e.stopPropagation()}
            style={{
              height: '85vh',
              minHeight: '400px',
              width: 'auto',
              maxWidth: '95vw',
              borderRadius: 16,
              objectFit: 'contain',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              cursor: 'default',
              backgroundColor: '#fff'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EditProfile;