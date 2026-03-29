import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Heart, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setValidationError('Tất cả các trường là bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Mật khẩu không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Mật khẩu phải từ 6 ký tự');
      return;
    }

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/onboarding');
      }
    } catch (err) {
      console.log('Register error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F9] font-sans">
      {/* Header / Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-rose-600 tracking-tight">LoveAI</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">Bạn đã có tài khoản?</span>
          <Link to="/login" className="font-bold text-rose-600 hover:underline">Đăng nhập</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16 items-center">

        {/* Phần bên trái: Nội dung giới thiệu */}
        <div className="space-y-10">
          <div className="inline-block px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider">
            Tìm thấy định mệnh
          </div>

          <h1 className="text-6xl font-extrabold text-gray-900 leading-[1.1]">
            Khởi đầu <span className="italic text-rose-600">hành trình</span> tình yêu cùng AI
          </h1>

          <p className="text-gray-500 text-lg max-w-md leading-relaxed">
            Trải nghiệm không gian kết đôi sang trọng, nơi công nghệ AI thấu hiểu trái tim bạn để tìm thấy những tâm hồn đồng điệu nhất.
          </p>

          <div className="flex gap-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <CheckCircle2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Xác thực AI</div>
                <div className="text-sm text-gray-400">Đảm bảo hồ sơ thật 100%</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">98% Hài lòng</div>
                <div className="text-sm text-gray-400">Tỷ lệ kết đôi thành công cao</div>
              </div>
            </div>
          </div>

          {/* Testimonial Box */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-rose-100/50 border border-rose-50 relative overflow-hidden">
            <div className="relative z-10 italic text-gray-700 text-lg leading-relaxed">
              "LoveAI đã thay đổi hoàn toàn cách tôi nhìn nhận về hẹn hò trực tuyến. Thật tinh tế và hiệu quả."
            </div>
            <div className="mt-4 font-bold text-rose-600">— Minh Anh, 28 tuổi</div>
            {/* Decor blur */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-100 blur-3xl rounded-full"></div>
          </div>
        </div>

        {/* Phần bên phải: Form đăng ký */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-rose-100/50 border border-white">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
            <p className="text-gray-400 text-sm mb-10">Bắt đầu câu chuyện tình yêu của bạn ngay hôm nay</p>

            {(error || validationError) && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center">
                {error || validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tên người dùng</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 transition-all outline-none text-gray-800 placeholder:text-gray-300"
                    placeholder="Nhập tên người dùng"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 transition-all outline-none text-gray-800 placeholder:text-gray-300"
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-14 pr-14 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 transition-all outline-none text-gray-800"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Hidden in image but required by your logic) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Xác nhận mật khẩu</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 transition-all outline-none text-gray-800"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded-md border-gray-200 text-rose-600 focus:ring-rose-500" required id="terms" />
                <label htmlFor="terms" className="text-[11px] text-gray-500 leading-tight">
                  Tôi đồng ý với <span className="text-rose-600 font-bold">Điều khoản dịch vụ</span> và <span className="text-rose-600 font-bold">Chính sách bảo mật</span>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-rose-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all transform active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Đăng Ký Ngay"}
              </button>
            </form>

            <div className="relative my-10 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <span className="relative px-4 bg-white text-gray-400 text-xs font-medium">Hoặc đăng ký bằng</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex justify-center py-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
              </button>
              <button className="flex justify-center py-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-6 h-6" alt="Facebook" />
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-gray-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Dữ liệu bảo mật tuyệt đối</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;