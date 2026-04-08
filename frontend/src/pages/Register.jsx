import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const EyeOpen = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOff = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>;

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', agree: false });
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getApiUrl = () => {
    if (import.meta.env.PROD) {
      return import.meta.env.VITE_API_URL || '';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setValidationError('');
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword)
      return setValidationError('Vui lòng điền đầy đủ thông tin.');
    if (formData.password !== formData.confirmPassword) return setValidationError('Mật khẩu không khớp.');
    if (formData.password.length < 6) return setValidationError('Mật khẩu tối thiểu 6 ký tự.');
    if (!formData.agree) return setValidationError('Bạn cần đồng ý với Điều khoản dịch vụ.');
    try { const r = await register(formData); if (r) navigate('/onboarding'); } catch (_) { }
  };

  /* ── Shared field styles ── */
  const inputCls = 'w-full h-10 rounded-full border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-[13px] text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white focus:border-transparent transition-all';
  const labelCls = 'block text-[12px] font-bold text-gray-700 mb-1.5 ml-1';
  const iconWrap = 'absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-colors';

  const UserIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const MailIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
  const LockIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
  const ShieldIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  return (
    <div className="min-h-screen w-full bg-white bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative">
      {/* Blobs */}
      <div className="pointer-events-none fixed -top-24 -left-24 w-72 h-72 rounded-full bg-primary-100/70 blur-3xl z-0" />
      <div className="pointer-events-none fixed top-24 -right-24 w-80 h-80 rounded-full bg-secondary-100/60 blur-3xl z-0" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-50 px-5 lg:px-10 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-primary-600 tracking-tight">LoveAI</Link>
          <p className="text-sm font-semibold text-gray-600 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-white/50">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">Đăng nhập</Link>
          </p>
        </div>
      </header>

      {/* ── Main — Unified Card Frame ── */}
      <main className="relative z-10 min-h-screen flex flex-col px-4 lg:px-8 pt-28 pb-12 lg:py-20">
        <div className="w-full max-w-[960px] m-auto bg-white rounded-[2rem] shadow-2xl border border-gray-200 overflow-hidden flex flex-col lg:flex-row items-stretch">

          {/* ═══ LEFT ═══ */}
          <div className="lg:w-[45%] p-6 lg:p-8 bg-gradient-to-b from-primary-50/50 to-white flex flex-col relative z-10 border-b lg:border-b-0 lg:border-r border-gray-100">
            {/* Back */}
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-primary-700 font-bold border border-primary-200 bg-white rounded-full px-3.5 py-1.5 w-fit mb-6 hover:bg-primary-50 transition-all shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              Trang chủ
            </Link>

            {/* Headline */}
            <h1 className="text-3xl lg:text-3xl font-black leading-tight text-gray-900 mb-2">
              Khởi đầu
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent italic">
                Hành Trình Tình Yêu
              </span>
              <span className="block">Cùng AI.</span>
            </h1>
            <p className="text-gray-500 font-medium text-xs leading-relaxed mb-6 max-w-sm">
              Trải nghiệm kết đôi sang trọng — nơi AI thấu hiểu trái tim để tìm những tâm hồn đồng điệu.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
              {[
                {
                  bg: 'bg-white', border: 'border-primary-100', iconBg: 'bg-primary-100 text-primary-600',
                  icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
                  title: 'Xác thực AI', desc: 'Hồ sơ thật 100%'
                },
                {
                  bg: 'bg-white', border: 'border-secondary-100', iconBg: 'bg-secondary-100 text-secondary-600',
                  icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
                  title: '98% Hài lòng', desc: 'Kết đôi thành công'
                },
              ].map((f, i) => (
                <div key={i} className={`${f.bg} border ${f.border} rounded-2xl p-3 shadow-sm`}>
                  <div className={`w-7 h-7 rounded-full ${f.iconBg} flex items-center justify-center mb-2`}>{f.icon}</div>
                  <p className="font-bold text-gray-800 text-xs">{f.title}</p>
                  <p className="text-gray-500 font-medium text-[11px] mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Photo — Automatically takes remaining space so left and right form match in height */}
            <div className="flex-1 rounded-2xl overflow-hidden shadow-inner ring-1 ring-black/5 min-h-[160px] relative mt-auto">
              <img src="/images/LandingPage/Couple.png" alt="Couple" className="absolute inset-0 w-full h-full object-cover object-top" />
            </div>
          </div>

          {/* ═══ RIGHT — Form ═══ */}
          <div className="lg:w-[55%] flex flex-col bg-white">
            <div className="px-6 lg:px-10 py-8 lg:py-10 flex-1 flex flex-col">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-black text-pink-600">Tạo tài khoản mới</h2>
                <p className="text-black-100 font-medium text-xs mt-1 italic">Bắt đầu câu chuyện tình yêu ngay hôm nay 💕</p>
              </div>

              {/* Error */}
              {(error || validationError) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                  </svg>
                  <p className="text-red-700 font-medium text-[12px]">{error || validationError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-3.5">
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className={labelCls}>Tên người dùng</label>
                    <div className="relative">
                      <span className={iconWrap}><UserIcon /></span>
                      <input id="username" name="username" type="text" value={formData.username} onChange={handleChange}
                        placeholder="name123" className={inputCls} required minLength={3} maxLength={30} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={labelCls}>Email</label>
                    <div className="relative">
                      <span className={iconWrap}><MailIcon /></span>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                        placeholder="user_name@gmail.com" className={inputCls} required />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className={labelCls}>Mật khẩu</label>
                    <div className="relative">
                      <span className={iconWrap}><LockIcon /></span>
                      <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                        value={formData.password} onChange={handleChange} placeholder="••••••••"
                        className={`${inputCls} pr-10`} required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors">
                        {showPassword ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm */}
                  <div>
                    <label htmlFor="confirmPassword" className={labelCls}>Xác nhận</label>
                    <div className="relative">
                      <span className={iconWrap}><ShieldIcon /></span>
                      <input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                        value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                        className={`${inputCls} pr-10`} required minLength={6} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors">
                        {showConfirm ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Agree */}
                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" id="agree" name="agree" checked={formData.agree} onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-primary-600 cursor-pointer flex-shrink-0" required />
                  <label htmlFor="agree" className="text-[12px] text-gray-600 font-medium select-none leading-relaxed">
                    Tôi đồng ý với{' '}
                    <Link to="#" className="text-primary-600 font-bold hover:underline">Điều khoản</Link>{' '}và{' '}
                    <Link to="#" className="text-primary-600 font-bold hover:underline">Chính sách bảo mật</Link>.
                  </label>
                </div>

                <div className="mt-auto pt-4 space-y-3">
                  {/* Submit */}
                  <button type="submit" disabled={isLoading}
                    className="w-full h-11 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200">
                    {isLoading
                      ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Đang xử lý...</span>
                      : 'Đăng ký ngay'}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <p className="text-[11px] font-bold text-gray-500 tracking-widest whitespace-nowrap">Hoặc đăng ký bằng</p>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  {/* Social */}
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => window.location.href = `${getApiUrl()}/api/auth/google`}
                      className="h-10 rounded-full border border-gray-200 bg-white text-[13px] text-gray-800 font-bold hover:bg-gray-50 hover:border-gray-300 inline-flex items-center justify-center gap-2 transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.5 22.56 15.6 22.56 12.25z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </button>
                    <button type="button" onClick={() => window.location.href = `${getApiUrl()}/api/auth/facebook`}
                      className="h-10 rounded-full border border-gray-200 bg-white text-[13px] text-gray-800 font-bold hover:bg-gray-50 hover:border-gray-300 inline-flex items-center justify-center gap-2 transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M22.675 0h-21.35C.592 0 0 .592 0 1.326v21.348C0 23.408.592 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.408 24 22.674V1.326C24 .592 23.408 0 22.675 0" /></svg>
                      Facebook
                    </button>
                  </div>

                  {/* Security */}
                  <p className="text-center text-[11px] text-gray-500 font-semibold flex items-center justify-center gap-1.5 mt-2">
                    <LockIcon />
                    Dữ liệu được bảo mật tuyệt đối
                  </p>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Register;
