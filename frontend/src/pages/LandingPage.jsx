import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { images } from '../assets/images';

const LandingPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [imageError, setImageError] = useState(false);
  const [aiFeatureError, setAiFeatureError] = useState(false);
  const [premiumImageError, setPremiumImageError] = useState(false);

  // Chuyển hướng sang trang đăng ký
  const openRegisterPage = () => {
    window.location.href = '/register';
  };
  // Chuyển hướng sang trang đăng nhập
  const openLoginPage = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary-100/70 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-24 w-80 h-80 rounded-full bg-secondary-100/60 blur-3xl" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary-100 shadow-sm px-5 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold text-primary-600 tracking-tight">
            LoveAII
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-gray-700 text-sm font-semibold px-3 py-2 hover:text-gray-900"
            >
              Đăng nhập
            </Link>
            <button
              onClick={openRegisterPage}
              className="px-5 py-2.5 text-sm rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Tham gia VIP
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-5 lg:px-10 pt-24 lg:pt-28 pb-10 lg:pb-12">
        <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-100px)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/90 text-primary-700 px-3 py-1.5 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="w-3.5 h-3.5 rounded-full bg-primary-500 text-white inline-flex items-center justify-center text-[9px]">✦</span>
              AI-Verified Connections
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black leading-[0.95] text-gray-900">
              Tìm Thấy
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent italic">
                Tình Yêu Đích Thực
              </span>
              <span className="block">Nhờ Trí Tuệ Nhân Tạo.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-xl leading-relaxed">
              Trải nghiệm không gian hẹn hò cao cấp, nơi AI giúp bạn sàng lọc những kết nối chân thành và an toàn tuyệt đối.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={openLoginPage}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Bắt Đầu Ngay →
              </button>
              <button
                onClick={openRegisterPage}
                className="px-6 py-3 rounded-full bg-primary-100 text-gray-600 text-base font-semibold hover:bg-primary-200 transition-colors duration-200"
              >
                Khám phá AI
              </button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-sm aspect-[4/5] rounded-[2rem] bg-primary-100/60 p-5 shadow-[0_12px_50px_rgba(236,72,153,0.12)]">
              <div className="relative w-full h-full rounded-[1.8rem] bg-gradient-to-b from-primary-200 to-primary-50 overflow-hidden shadow-2xl border border-white/50">
                {!imageError ? (
                  <img
                    src={images.landingHero}
                    alt="LoveAI hero"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-primary-200 to-secondary-100 flex items-center justify-center">
                    <span className="text-6xl font-bold text-white/90">LoveAI</span>
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-white/95 rounded-xl px-3 py-2 shadow-md border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Điểm tương hợp</p>
                  <p className="text-2xl font-black text-gray-900">98%</p>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent text-white">
                  <p className="text-2xl font-bold">Cha Eun Woo, 29</p>
                  <p className="text-xs text-white/90">Korea · Actor</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto pt-6 lg:pt-12 pb-4">
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Công Nghệ Dẫn Lối Cảm Xúc</h2>
            <div className="w-16 h-1 bg-primary-600 rounded-full mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            <article className="lg:col-span-2 rounded-[1.6rem] bg-primary-50 p-6 sm:p-7 border border-primary-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center h-full">
                <div>
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center mb-5 shadow-md">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-3">
                    Phát hiện Sự sống
                    <span className="block">(Liveness)</span>
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    Công nghệ nhận diện thực thể sống đảm bảo 100% người dùng là thật. Không còn nỗi lo về tài khoản giả mạo hay hình ảnh ảo.
                  </p>

                  <ul className="space-y-2.5 text-sm text-gray-700 font-semibold">
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">✓</span>
                      Xác thực video thời gian thực
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">✓</span>
                      Chống Deepfake tối ưu
                    </li>
                  </ul>
                </div>

                <div className="h-52 sm:h-56 md:h-full min-h-[200px] rounded-[1.4rem] bg-gradient-to-br from-gray-900 via-gray-700 to-gray-600 relative overflow-hidden">
                  {!aiFeatureError ? (
                    <img
                      src={images.aiFeature}
                      alt="AI feature preview"
                      onError={() => setAiFeatureError(true)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute -left-10 top-10 w-44 h-44 rounded-full bg-primary-200/20 blur-2xl"></div>
                      <div className="absolute right-4 bottom-2 w-40 h-40 rounded-full bg-secondary-200/20 blur-2xl"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-24 sm:w-52 sm:h-32 rounded-full bg-gradient-to-r from-primary-200/20 to-white/20 blur-sm"></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </article>

            <article className="rounded-[1.6rem] bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6 sm:p-7 border border-primary-200 flex flex-col shadow-[0_14px_34px_rgba(236,72,153,0.16)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.22)] transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 flex items-center justify-center mb-5 border border-white shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 14h.01M16 10h.01M9 16h6M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-3">Ghép đôi Thông minh</h3>

              <p className="text-sm text-gray-500 leading-relaxed">
                Thuật toán AI đọc quyền phân tích giá trị sống và sở thích chiều sâu để kết nối những tâm hồn đồng điệu nhất.
              </p>

              <div className="mt-auto pt-8 border-t border-primary-200/70">
                <div className="flex items-center mb-3">
                  <img src="/images/LandingPage/pp_1.png" alt="Profile 1" className="w-8 h-8 rounded-full object-cover border border-white -mr-2" />
                  <img src="/images/LandingPage/pp_2.png" alt="Profile 2" className="w-8 h-8 rounded-full object-cover border border-white -mr-2" />
                  <img src="/images/LandingPage/pp_3.png" alt="Profile 3" className="w-8 h-8 rounded-full object-cover border border-white" />
                  <span className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold shadow-sm">+5K</span>
                </div>
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Đã ghép đôi thành công hôm nay</p>
              </div>
            </article>
          </div>
        </section>

        <section className="max-w-7xl mx-auto pt-6 lg:pt-10 pb-10">
          <article className="relative rounded-[2rem] overflow-hidden min-h-[230px] sm:min-h-[280px] shadow-xl border border-white/30">
            {!premiumImageError ? (
              <img
                src={images.premiumExperience}
                alt="Nâng tầm trải nghiệm hẹn hò"
                onError={() => setPremiumImageError(true)}
                className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-500"></div>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-800/55 to-gray-800/45"></div>

            <div className="relative p-6 sm:p-8 lg:p-10 text-white max-w-2xl">
              <h3 className="text-3xl sm:text-4xl font-black leading-tight">
                Nâng Tầm Trải
                <span className="block">Nghiệm Hẹn Hò.</span>
              </h3>

              <p className="mt-4 text-white/80 text-base leading-relaxed">
                Tại LoveAI, chúng tôi không chỉ tạo ra các cuộc gặp gỡ. Chúng tôi kiến tạo những khởi đầu đẹp đẽ trong một không gian riêng tư và sang trọng.
              </p>

              <div className="mt-6 flex flex-wrap gap-5 text-white/90 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[11px] flex items-center justify-center">✓</span>
                  100% Bảo mật
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[11px] flex items-center justify-center">★</span>
                  Dịch vụ Premium
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="max-w-7xl mx-auto pt-6 pb-12 lg:pb-16 text-center">
          <h3 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            Bạn đã sẵn sàng để yêu?
          </h3>

          <button
            onClick={openRegisterPage}
            className="mt-8 px-8 sm:px-12 py-3.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-lg sm:text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Tạo Tài Khoản Miễn Phí
          </button>

          <p className="mt-8 text-xs sm:text-sm text-gray-400">
            Bằng cách tham gia, bạn đồng ý với Điều khoản và Chính sách bảo mật của chúng tôi.
          </p>
        </section>
      </main>

      <footer className="bg-primary-50/90 backdrop-blur border-t border-primary-100 px-5 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          <Link to="/" className="text-3xl font-black text-primary-600 tracking-tight">
            LoveAI
          </Link>

          <nav className="flex items-center gap-6 sm:gap-8 text-gray-600 font-semibold uppercase tracking-wide text-sm sm:text-base">
            <button type="button" className="hover:text-gray-900 transition-colors">Về chúng tôi</button>
            <button type="button" className="hover:text-gray-900 transition-colors">An toàn</button>
            <button type="button" className="hover:text-gray-900 transition-colors">Hỗ trợ</button>
          </nav>

          <p className="text-gray-400 text-sm text-center lg:text-right">
            © 2026 LoveAI Hẹn hò cao cấp. Được thiết kế để kết nối.
          </p>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default LandingPage;
