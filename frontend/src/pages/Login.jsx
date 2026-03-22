import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/discover');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-primary-50">
      <div className="hidden lg:block absolute top-0 right-0 w-1/2 h-full bg-primary-100/60" />

      <div className="relative min-h-screen px-5 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
          <header className="flex items-start justify-between">
            <div>
              <Link to="/" className="text-3xl font-black text-primary-600 tracking-tight">
                LoveAI
              </Link>
              <p className="text-xs text-gray-400 mt-1">The Digital Matchmaker&apos;s Atelier</p>
            </div>
          </header>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center py-4 lg:py-2 -mt-6 lg:-mt-16">
            <section>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[0.98] max-w-lg">
                Chào mừng bạn
                <span className="block">quay lại với </span>
                <span className="text-primary-600">LoveAI</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-lg leading-relaxed">
                Nơi tình yêu được kết nối bởi sự thấu hiểu của trí tuệ nhân tạo và sự tinh tế của cảm xúc.
              </p>

              <div className="mt-7 flex items-center gap-3">
                <div className="flex -space-x-3">
                  <img
                    src="/images/Login/login_1.jpg"
                    alt="Login avatar 1"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="/images/Login/login_2.jpg"
                    alt="Login avatar 2"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="/images/Login/login_3.jpg"
                    alt="Login avatar 3"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <p className="text-gray-500 text-sm">Hơn 500k+ cặp đôi đã tìm thấy nhau</p>
              </div>
            </section>

            <section className="w-full max-w-[32rem] mx-auto lg:mx-0 lg:ml-auto lg:mr-8 px-3 sm:px-4">
              <div className="bg-white rounded-[2rem] shadow-xl border border-primary-100 p-6 sm:p-6">
                <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-600 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21s-7-4.35-9.2-8.1C1.3 10.2 2.3 6.8 5.6 5.6c2.1-.8 4.2.1 5.4 1.8 1.2-1.7 3.3-2.6 5.4-1.8 3.3 1.2 4.3 4.6 2.8 7.3C19 16.65 12 21 12 21z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900 text-center mb-5">Đăng nhập</h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="email" className="block text-[11px] tracking-wide font-bold text-gray-500 uppercase mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-11 rounded-full bg-primary-50 border border-primary-100 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        placeholder="email@vi-du.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-[11px] tracking-wide font-bold text-gray-500 uppercase mb-1.5">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-1.657 0-3 1.343-3 3 0 1.04.53 1.956 1.333 2.494L10 19h4l-.333-2.506A2.995 2.995 0 0015 14c0-1.657-1.343-3-3-3zm6 8H6a1 1 0 01-1-1v-7a1 1 0 011-1h1V8a5 5 0 1110 0v2h1a1 1 0 011 1v7a1 1 0 01-1 1zm-3-9V8a3 3 0 10-6 0v2h6z" />
                        </svg>
                      </span>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full h-11 rounded-full bg-primary-50 border border-primary-100 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-base font-bold shadow-md hover:shadow-lg disabled:opacity-60"
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>

                  <div className="flex justify-end">
                    <button type="button" className="text-[11px] font-semibold text-primary-600 hover:text-primary-700">
                      Quên mật khẩu?
                    </button>
                  </div>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Hoặc tiếp tục với</p>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="h-10 rounded-full border border-gray-200 text-sm text-gray-700 font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faGoogle} className="text-base text-[#DB4437]" />
                    <span>Google</span>
                  </button>
                  <button type="button" className="h-10 rounded-full border border-gray-200 text-sm text-gray-700 font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faFacebookF} className="text-base text-[#1877F2]" />
                    <span>Facebook</span>
                  </button>
                </div>

                <p className="mt-5 text-center text-xs text-gray-500">
                  Bạn chưa có tài khoản?{' '}
                  <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700">
                    Đăng ký miễn phí
                  </Link>
                </p>
              </div>
            </section>
          </div>

          <footer className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-6 uppercase tracking-wide font-semibold">
              <button type="button" className="hover:text-gray-600">Điều khoản</button>
              <button type="button" className="hover:text-gray-600">Bảo mật</button>
              <button type="button" className="hover:text-gray-600">Trợ giúp</button>
            </div>
            <p>© 2024 LoveAI Studio. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
