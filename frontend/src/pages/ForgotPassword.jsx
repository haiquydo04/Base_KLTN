import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

const STEPS = [
  { id: 1, label: 'Nhập Email' },
  { id: 2, label: 'Nhập mã OTP' },
  { id: 3, label: 'Đặt lại mật khẩu' },
  { id: 4, label: 'Hoàn tất' },
];

function useTimer(total = 299, autoStart = false) {
  const [secs, setSecs] = useState(total);
  const ref = useRef(null);
  const start = () => {
    clearInterval(ref.current);
    setSecs(total);
    ref.current = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000);
  };
  useEffect(() => { if (autoStart) start(); return () => clearInterval(ref.current); }, [autoStart]);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return { display: `${mm}:${ss}`, expired: secs === 0, restart: start };
}

/* ── Icons ────────────────────────────────────── */
const ChevLeft = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const CheckIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
const EyeOpen = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOff = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>;
const MailIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LockIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const ClockIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

/* ── Buttons ──────────────────────────────────── */
function PrimaryBtn({ children, onClick, disabled, isLoading }) {
  return (
    <button onClick={onClick} disabled={disabled || isLoading}
      className="w-full h-11 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-2">
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full h-10 rounded-full border border-primary-200 bg-primary-50 text-xs text-primary-600 font-bold hover:bg-primary-100 transition-all duration-200 flex items-center justify-center gap-1.5">
      {children}
    </button>
  );
}

/* ── Password field (module-level — no remount bug) ── */
function PasswordField({ label, value, onChange, show, onToggle, error, hint }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none"><LockIcon /></span>
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••"
          className={`w-full h-11 rounded-full border pl-11 pr-11 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${error ? 'border-red-300 focus:ring-red-200' : 'border-primary-100 focus:ring-primary-200'
            }`}
        />
        <button type="button" onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary-500 transition-colors">
          {show ? <EyeOff /> : <EyeOpen />}
        </button>
      </div>
      {error && <p className="text-red-500 text-[11px] mt-1 pl-1">{error}</p>}
      {hint && !error && <p className="text-gray-400 text-[11px] mt-1 pl-1">{hint}</p>}
    </div>
  );
}

/* ── Sidebar ──────────────────────────────────── */
function Sidebar({ currentStep }) {
  return (
    <div className="w-52 flex-shrink-0 flex flex-col overflow-hidden">
      {/* Header — same gradient style as LandingPage hero button area */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-400 px-5 pt-6 pb-5">
        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 mb-3">
          <span className="w-3 h-3 rounded-full bg-white/80 flex items-center justify-center">
            <svg className="w-1.5 h-1.5 text-primary-600" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
          </span>
          <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest">Quên mật khẩu</span>
        </div>
        <h2 className="text-base font-black text-white leading-snug">Khôi phục<br />quyền truy cập</h2>
        <p className="text-[11px] text-primary-100 mt-1.5 leading-relaxed">Làm theo các bước để lấy lại tài khoản.</p>
      </div>

      {/* Steps */}
      <div className="flex-1 bg-primary-50 px-4 py-4 flex flex-col gap-1">
        {STEPS.map((s, idx) => {
          const done = s.id < currentStep;
          const active = s.id === currentStep;
          const last = idx === STEPS.length - 1;
          return (
            <div key={s.id} className="relative">
              {!last && (
                <div className={`absolute left-[15px] top-9 w-0.5 h-4 rounded-full ${done ? 'bg-primary-400' : 'bg-primary-100'}`} />
              )}
              <div className={`relative z-10 flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${active ? 'bg-white border border-primary-100 shadow-sm' : done ? 'bg-primary-50' : ''
                }`}>
                <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${done ? 'bg-primary-500 text-white'
                  : active ? 'bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-sm'
                    : 'bg-primary-100 text-primary-300'
                  }`}>
                  {done ? <CheckIcon /> : s.id}
                </span>
                <span className={`text-xs font-bold ${done ? 'text-primary-600' : active ? 'text-primary-700' : 'text-primary-300'
                  }`}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div className="bg-primary-50 border-t border-primary-100 px-4 py-3">
        <div className="bg-primary-100/60 rounded-xl p-2.5 flex items-start gap-2">
          <svg className="w-3.5 h-3.5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[10px] text-primary-700 leading-relaxed">
            Mã OTP có hiệu lực <strong>5 phút</strong>. Sau khi đổi thành công, đăng nhập lại để tiếp tục.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Step 1 ───────────────────────────────────── */
function Step1({ email, setEmail, onSendOTP, error, isLoading }) {
  return (
    <div>
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-3 py-1 mb-3">
          <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] flex items-center justify-center font-bold">1</span>
          <span className="text-[11px] font-bold text-primary-600">Bước 1 / 3</span>
        </div>
        <h3 className="text-xl font-black text-gray-800 mb-1">Nhập địa chỉ Email</h3>
        <p className="text-xs text-gray-400 leading-relaxed">Chúng tôi sẽ gửi mã OTP 6 số đến email đã đăng ký.</p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-xs text-center">{error}</p>
        </div>
      )}
      <label className="block text-xs font-bold text-gray-500 mb-1.5">Địa chỉ Email</label>
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none"><MailIcon /></span>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vidu@email.com"
          className="w-full h-11 rounded-full border border-primary-100 bg-white pl-11 pr-4 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent transition-all" />
      </div>
      <div className="space-y-2">
        <PrimaryBtn onClick={onSendOTP} disabled={!email.trim()} isLoading={isLoading}>
          {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực →'}
        </PrimaryBtn>
        <Link to="/login" className="w-full h-10 rounded-full border border-primary-200 bg-primary-50 text-xs text-primary-600 font-bold hover:bg-primary-100 transition-all flex items-center justify-center gap-1.5">
          <ChevLeft /> Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}

/* ── Step 2 ───────────────────────────────────── */
function Step2({ otp, setOtp, onVerifyOTP, onPrev, onResend, error, isLoading }) {
  const refs = useRef([]);
  const { display, expired, restart } = useTimer(299, true);
  const handleInput = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus(); };
  const handleResend = () => { setOtp(Array(6).fill('')); restart(); onResend(); };
  const filled = otp.every(d => d !== '');

  return (
    <div>
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-3 py-1 mb-3">
          <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] flex items-center justify-center font-bold">2</span>
          <span className="text-[11px] font-bold text-primary-600">Bước 2 / 3</span>
        </div>
        <h3 className="text-xl font-black text-gray-800 mb-1">Nhập mã OTP</h3>
        <p className="text-xs text-gray-400 leading-relaxed">Mã 6 số đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.</p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-xs text-center">{error}</p>
        </div>
      )}
      <label className="block text-xs font-bold text-gray-500 mb-2">Mã xác thực</label>
      <div className="grid grid-cols-6 gap-2 mb-3">
        {otp.map((d, i) => (
          <input key={i} ref={el => refs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleInput(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            className={`h-12 text-center text-lg font-bold rounded-xl border-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all ${d ? 'border-primary-400 text-primary-600' : 'border-primary-100 text-gray-700'
              }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-medium flex items-center gap-1.5 ${expired ? 'text-primary-500' : 'text-gray-400'}`}>
          <ClockIcon />{expired ? 'Mã đã hết hạn' : `Hiệu lực: ${display}`}
        </span>
        <button onClick={handleResend} disabled={isLoading} className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors disabled:opacity-50">Gửi lại mã</button>
      </div>
      <div className="space-y-2">
        <PrimaryBtn onClick={onVerifyOTP} disabled={!filled} isLoading={isLoading}>
          {isLoading ? 'Đang xác thực...' : 'Xác nhận OTP →'}
        </PrimaryBtn>
        <GhostBtn onClick={onPrev}><ChevLeft /> Quay lại bước trước</GhostBtn>
      </div>
    </div>
  );
}

/* ── Step 3 ───────────────────────────────────── */
function Step3({ newPass, setNewPass, confirmPass, setConfirmPass, onResetPassword, onPrev, error, isLoading }) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const mismatch = confirmPass.length > 0 && newPass !== confirmPass;
  const tooShort = newPass.length > 0 && newPass.length < 6;
  const valid = newPass.length > 0 && newPass === confirmPass && !mismatch;

  return (
    <div>
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-3 py-1 mb-3">
          <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] flex items-center justify-center font-bold">3</span>
          <span className="text-[11px] font-bold text-primary-600">Bước 3 / 3</span>
        </div>
        <h3 className="text-xl font-black text-gray-800 mb-1">Đặt mật khẩu mới</h3>
        <p className="text-xs text-gray-400 leading-relaxed">Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-xs text-center">{error}</p>
        </div>
      )}
      <div className="space-y-3 mb-4">
        <PasswordField label="Mật khẩu mới" value={newPass} onChange={e => setNewPass(e.target.value)}
          show={showNew} onToggle={() => setShowNew(v => !v)}
          hint={tooShort ? 'Nên dùng ít nhất 6 ký tự để bảo mật hơn.' : null} />
        <PasswordField label="Xác nhận mật khẩu" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
          show={showConfirm} onToggle={() => setShowConfirm(v => !v)}
          error={mismatch ? 'Mật khẩu không khớp.' : null} />
      </div>
      <div className="space-y-2">
        <PrimaryBtn onClick={onResetPassword} disabled={!valid} isLoading={isLoading}>
          {isLoading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
        </PrimaryBtn>
        <GhostBtn onClick={onPrev}><ChevLeft /> Quay lại bước trước</GhostBtn>
      </div>
    </div>
  );
}

/* ── Step 4 ───────────────────────────────────── */
function Step4() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full py-6">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="absolute -inset-3 rounded-full bg-primary-50 -z-10" />
      </div>
      <h3 className="text-2xl font-black text-gray-800 mb-2">Thành công!</h3>
      <p className="text-sm text-gray-400 mb-1">Mật khẩu của bạn đã được cập nhật.</p>
      <p className="text-xs text-gray-400 mb-7">Vui lòng đăng nhập lại để tiếp tục khám phá LoveAI.</p>
      <Link to="/login" className="px-8 h-11 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
        Đăng nhập ngay →
      </Link>
    </div>
  );
}

/* ── Main ─────────────────────────────────────── */
export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const goNext = () => setStep(s => s + 1);
  const goPrev = () => setStep(s => Math.max(s - 1, 1));

  // Step 1: Gửi yêu cầu reset password
  const handleSendOTP = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: email.trim() });
      setOtpSent(true);
      goNext();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Không thể gửi mã OTP. Vui lòng thử lại.';
      // Nếu là tài khoản Google/Facebook, hiển thị thông báo
      if (msg.includes('Google') || msg.includes('facebook')) {
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Xác thực OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, { email: email.trim(), otp: otpCode });
      goNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (newPass !== confirmPass || newPass.length < 6) return;
    setIsLoading(true);
    setError('');
    try {
      const otpCode = otp.join('');
      await axios.post(`${API_URL}/auth/reset-password`, {
        email: email.trim(),
        otp: otpCode,
        newPassword: newPass
      });
      goNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: email.trim() });
      setOtp(Array(6).fill(''));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
      {/* Blobs — same as LandingPage */}
      <div className="pointer-events-none fixed -top-24 -left-24 w-72 h-72 rounded-full bg-primary-100/70 blur-3xl" />
      <div className="pointer-events-none fixed top-24 -right-24 w-80 h-80 rounded-full bg-secondary-100/60 blur-3xl" />

      {/* Header — exact LandingPage header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary-100 shadow-sm px-5 lg:px-10 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold text-primary-600 tracking-tight">LoveAI</Link>
          <Link to="/login" className="inline-flex items-center gap-1.5 px-4 h-8 rounded-full border border-primary-200 bg-primary-50 text-primary-600 text-xs font-bold hover:bg-primary-100 transition-colors">
            <ChevLeft /> Quay lại đăng nhập
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white/95 backdrop-blur border border-primary-100 rounded-[1.6rem] shadow-xl overflow-hidden flex" style={{ minHeight: 440 }}>
            <Sidebar currentStep={step} />
            <div className="flex-1 p-7 min-w-0">
              {step === 1 && <Step1 email={email} setEmail={setEmail} onSendOTP={handleSendOTP} error={error} isLoading={isLoading} />}
              {step === 2 && <Step2 otp={otp} setOtp={setOtp} onVerifyOTP={handleVerifyOTP} onPrev={goPrev} onResend={handleResendOTP} error={error} isLoading={isLoading} />}
              {step === 3 && <Step3 newPass={newPass} setNewPass={setNewPass} confirmPass={confirmPass} setConfirmPass={setConfirmPass} onResetPassword={handleResetPassword} onPrev={goPrev} error={error} isLoading={isLoading} />}
              {step === 4 && <Step4 />}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? 'w-6 h-2 bg-primary-500'
                : i < step ? 'w-2 h-2 bg-primary-400'
                  : 'w-2 h-2 bg-primary-100'
                }`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
