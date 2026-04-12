import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { images } from '../assets/images';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [activeRuleTab, setActiveRuleTab] = useState('ho-so');
  const [imageError, setImageError] = useState(false);
  const [aiFeatureError, setAiFeatureError] = useState(false);
  const [premiumImageError, setPremiumImageError] = useState(false);

  const navItems = [
    { id: 'discover', label: 'Khám phá' },
    { id: 'about', label: 'Về chúng tôi' },
    { id: 'support', label: 'Hỗ trợ' },
    { id: 'community', label: 'Nguyên tắc cộng đồng' },
  ];

  const ruleMenu = [
    { id: 'ho-so', label: 'Nguyên tắc hồ sơ', icon: '👤' },
    { id: 'ung-xu', label: 'Nội dung & ứng xử', icon: '🛡️' },
    { id: 'bao-cao', label: 'Báo cáo an toàn', icon: '🚨' },
    { id: 'thuc-thi', label: 'Triết lý thực thi', icon: '⚖️' },
  ];

  const ruleDetails = {
    'ho-so': {
      title: 'Nguyên Tắc Hồ Sơ',
      intro: [
        'Bạn cần tuân thủ các nguyên tắc hồ sơ để đảm bảo môi trường minh bạch, an toàn và giảm rủi ro giả mạo trên nền tảng.',
      ],
      cards: [
        {
          title: 'Tuổi',
          content:
            'Bạn cần phải ít nhất 18 tuổi để tham gia LoveAI. Không được phép tạo hồ sơ cố tình xuyên tạc rằng bạn dưới 18 tuổi. Chúng tôi có thể yêu cầu xem giấy tờ tùy thân để xác minh tuổi và sẽ chặn tài khoản chưa đủ tuổi.',
        },
        {
          title: 'Ảnh hồ sơ',
          content:
            'Ít nhất một ảnh hồ sơ phải chỉ mô tả bạn và thể hiện rõ toàn bộ khuôn mặt. Không chấp nhận các loại ảnh sau:',
          bullets: [
            'Ảnh chỉnh sửa nặng hoặc hiệu ứng kỹ thuật số phóng đại.',
            'Biểu tượng, khung hoặc nhãn dán phủ lên ảnh.',
            'Meme hoặc ảnh chủ yếu chứa văn bản.',
            'Ảnh hồ sơ của trẻ em.',
          ],
        },
        {
          title: 'Tên người dùng',
          content:
            'Tên người dùng nên phản ánh đúng tên bạn thường dùng trong đời sống hằng ngày. Không cho phép:',
          bullets: [
            'Từ ngữ vi phạm Nguyên tắc Cộng đồng.',
            'Mạo danh người nổi tiếng.',
            'Lạm dụng ký hiệu, emoji.',
            'Chứa thông tin mạng xã hội khác.',
          ],
        },
      ],
    },
    'ung-xu': {
      title: 'Nội Dung Và Ứng Xử',
      intro: [
        'LoveAI nghiêm cấm mọi nội dung hoặc hành vi gây hại, bóc lột, lừa đảo hoặc đe dọa sự an toàn của cộng đồng.',
      ],
      cards: [
        {
          title: 'Ảnh khỏa thân và tình dục',
          content:
            'Không cho phép nội dung khỏa thân, khiêu dâm, hoặc hoạt động mua bán dịch vụ tình dục.',
        },
        {
          title: 'Bắt nạt và lạm dụng',
          content:
            'Không cho phép quấy rối, xúc phạm, đe dọa, hoặc tống tiền các thành viên khác.',
        },
        {
          title: 'Thông tin sai lệch',
          content:
            'Nghiêm cấm mạo danh, catfishing, hoặc xuyên tạc thông tin cá nhân gây hại.',
        },
      ],
    },
    'bao-cao': {
      title: 'Báo Cáo An Toàn',
      intro: [
        'An toàn là ưu tiên hàng đầu tại LoveAI. Chúng tôi kết hợp nhân sự kiểm duyệt và hệ thống tự động để đánh giá vi phạm.',
      ],
      cards: [
        {
          title: 'Khi nào cần báo cáo',
          content:
            'Nếu bạn cảm thấy không an toàn, hãy Hủy kết đôi, Khóa và báo cáo thành viên.',
        },
        {
          title: 'Xử lý sau báo cáo',
          content:
            'Tùy mức độ, chúng tôi có thể xóa nội dung, cảnh báo, khóa tính năng, hoặc cấm tài khoản.',
        },
      ],
    },
    'thuc-thi': {
      title: 'Triết Lý Thực Thi',
      intro: [
        'Mọi thành viên phải tuân thủ Điều khoản của LoveAI. Chúng tôi đánh giá hành vi theo mức độ rủi ro.',
      ],
      cards: [
        {
          title: 'Các hình thức xử lý',
          content:
            'Tùy vào mức độ vi phạm, LoveAI có thể xóa nội dung, đưa ra cảnh báo, hoặc cấm thành viên khỏi nền tảng.',
        },
        {
          title: 'Hành vi ngoài ứng dụng',
          content:
            'Hành vi gây hại diễn ra ngoài ứng dụng vẫn có thể dẫn đến xử lý tài khoản.',
        },
      ],
    },
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-rose-50 via-pink-50/40 to-sky-50/30">
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary-100/70 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-24 w-80 h-80 rounded-full bg-secondary-100/60 blur-3xl" />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm px-3 sm:px-6 lg:px-10 py-3 sm:py-4 w-full" data-aos="fade-down" data-aos-duration="800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link to="/" className="text-xl sm:text-2xl font-extrabold text-rose-500 tracking-tight flex-shrink-0">
            LoveAI
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center rounded-full border border-rose-100 bg-rose-50/80 px-2 py-1 shadow-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === item.id
                    ? 'bg-white text-rose-600 border border-rose-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/login" className="text-gray-700 text-[13px] sm:text-sm font-bold px-2 py-2 hover:text-gray-900 whitespace-nowrap">
              Đăng nhập
            </Link>
            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1.5 sm:px-5 sm:py-2.5 text-[12px] sm:text-sm rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Tham gia VIP
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-rose-100 md:hidden w-full overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="flex items-center gap-1.5 sm:gap-2 w-max mx-auto px-2">
            {navItems.map((item) => (
              <button
                key={`mobile-${item.id}`}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors border ${
                  activeTab === item.id
                    ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                    : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 px-4 sm:px-6 lg:px-10 pt-32 sm:pt-36 md:pt-28 pb-10 lg:pb-12 w-full max-w-[100vw]">
        {activeTab === 'discover' && (
          <>
            {/* HERO SECTION */}
            <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12 items-center pt-2 lg:pt-8">
              <div data-aos="fade-right" data-aos-duration="1000" className="w-full lg:w-1/2 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/90 text-primary-700 px-3 py-1.5 text-[10px] sm:text-xs font-semibold tracking-wide uppercase mb-3 sm:mb-6 mt-2 lg:mt-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary-500 text-white inline-flex items-center justify-center text-[9px]">*</span>
                  AI-Verified Connections
                </div>

                {/* Giảm kích thước Header Mobile */}
                <h1 className="text-[24px] sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900">
                  Tìm Thấy
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent italic pb-0.5 sm:pb-1">
                    Tình Yêu Đích Thực 
                  </span>
                  <span className="block">Nhờ Trí Tuệ.</span>
                </h1>

                <p className="mt-3 sm:mt-5 text-[13px] sm:text-base text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed px-1 lg:px-0">
                  Trải nghiệm không gian hẹn hò cao cấp, nơi AI giúp bạn sàng lọc những kết nối chân thành và an toàn tuyệt đối.
                </p>

                {/* Các nút bấm: Dùng flex w-full chia đều w-1/2 */}
                <div className="mt-5 sm:mt-8 flex flex-row justify-center lg:justify-start gap-2.5 sm:gap-4 w-full max-w-[340px] sm:max-w-none mx-auto lg:mx-0" data-aos="fade-up" data-aos-delay="300">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-1/2 sm:w-auto flex items-center justify-center py-3 sm:px-8 sm:py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[12.5px] sm:text-base font-bold shadow-md hover:-translate-y-0.5 transition-all whitespace-nowrap"
                  >
                    Bắt Đầu Ngay
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-1/2 sm:w-auto flex items-center justify-center py-3 sm:px-8 sm:py-3.5 rounded-full bg-rose-100 text-gray-700 text-[12.5px] sm:text-base font-bold hover:bg-rose-200 transition-colors whitespace-nowrap"
                  >
                    Khám phá AI
                  </button>
                </div>
              </div>

              {/* HERO IMAGE */}
              <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end z-10 mt-6 lg:mt-0" data-aos="fade-left">
                <div className="w-full max-w-[320px] sm:max-w-sm aspect-[4/5] rounded-[2rem] bg-primary-100/60 p-3 sm:p-5 shadow-[0_12px_50px_rgba(236,72,153,0.12)] mx-auto lg:mx-0">
                  <div className="relative w-full h-full rounded-[1.6rem] bg-gradient-to-b from-primary-200 to-primary-50 overflow-hidden shadow-2xl border border-white/50">
                    {!imageError ? (
                      <img
                        src={images.landingHero}
                        alt="LoveAI hero"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-primary-200 to-secondary-100 flex items-center justify-center">
                        <span className="text-3xl sm:text-6xl font-bold text-white/90">LoveAI</span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-white/95 rounded-xl px-2.5 py-1.5 shadow-md border border-gray-100">
                      <p className="text-[8px] sm:text-[10px] font-semibold text-gray-400 uppercase">Điểm tương hợp</p>
                      <p className="text-base sm:text-xl font-black text-gray-900">98%</p>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent text-white">
                      <p className="text-lg font-bold">Cha Eun Woo, 29</p>
                      <p className="text-[11px] text-white/90">Korea · Actor</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="max-w-7xl mx-auto pt-16 sm:pt-20 lg:pt-24 pb-4">
              <div className="text-center mb-8 lg:mb-10 px-4" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">Công Nghệ Dẫn Lối Cảm Xúc</h2>
                <div className="w-16 h-1 bg-primary-600 rounded-full mx-auto mt-3"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
                <article className="lg:col-span-2 rounded-[1.6rem] bg-primary-50 p-5 sm:p-7 border border-primary-100 shadow-sm hover:shadow-md transition-shadow duration-200" data-aos="fade-up" data-aos-delay="100" data-aos-duration="900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center h-full">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center mb-4 sm:mb-5 shadow-md">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                        </svg>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight mb-3">
                        Phát hiện Sự sống
                        <span className="block text-primary-600">(Liveness)</span>
                      </h3>

                      <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-5">
                        Công nghệ nhận diện thực thể sống đảm bảo 100% người dùng là thật. Không còn nỗi lo về tài khoản giả mạo hay hình ảnh ảo.
                      </p>

                      <ul className="space-y-2.5 text-sm sm:text-base text-gray-700 font-semibold">
                        <li className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center flex-shrink-0">✓</span>
                          Xác thực video thời gian thực
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center flex-shrink-0">✓</span>
                          Chống Deepfake tối ưu
                        </li>
                      </ul>
                    </div>

                    <div className="h-48 sm:h-64 md:h-full min-h-[200px] rounded-[1.4rem] bg-gradient-to-br from-gray-900 via-gray-700 to-gray-600 relative overflow-hidden shadow-inner">
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
                            <div className="w-32 h-20 sm:w-52 sm:h-32 rounded-full bg-gradient-to-r from-primary-200/20 to-white/20 blur-sm"></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </article>

                <article className="rounded-[1.6rem] bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6 sm:p-7 border border-primary-200 flex flex-col shadow-[0_14px_34px_rgba(236,72,153,0.16)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.22)] transition-all duration-300" data-aos="fade-up" data-aos-delay="300" data-aos-duration="900">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white flex items-center justify-center mb-4 sm:mb-5 border border-white shadow-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight mb-3">Ghép đôi Thông minh</h3>

                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6">
                    Thuật toán AI độc quyền phân tích giá trị sống và sở thích chiều sâu để kết nối những tâm hồn đồng điệu nhất.
                  </p>

                  <div className="mt-auto pt-6 sm:pt-8 border-t border-primary-200/70">
                    <div className="flex items-center mb-3">
                      <img src="/images/LandingPage/pp_1.png" alt="Profile 1" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white -mr-3 relative z-30" />
                      <img src="/images/LandingPage/pp_2.png" alt="Profile 2" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white -mr-3 relative z-20" />
                      <img src="/images/LandingPage/pp_3.png" alt="Profile 3" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white relative z-10" />
                      <span className="ml-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm">+5K</span>
                    </div>
                    <p className="text-[10px] sm:text-xs font-extrabold text-gray-500 uppercase tracking-wide">Đã ghép đôi thành công hôm nay</p>
                  </div>
                </article>
              </div>
            </section>

            {/* BANNER SECTION */}
            <section className="max-w-7xl mx-auto pt-8 sm:pt-10 pb-10">
              <article className="relative rounded-[2rem] overflow-hidden min-h-[280px] sm:min-h-[320px] shadow-xl border border-white/30 group" data-aos="zoom-in" data-aos-duration="900">
                {!premiumImageError ? (
                  <img
                    src={images.premiumExperience}
                    alt="Nâng tầm trải nghiệm hẹn hò"
                    onError={() => setPremiumImageError(true)}
                    className="absolute inset-0 w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-500"></div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-gray-800/40"></div>

                <div className="relative p-6 sm:p-10 lg:p-12 text-white max-w-2xl flex flex-col justify-center h-full min-h-[280px] sm:min-h-[320px]">
                  <h3 className="text-2xl sm:text-4xl font-black leading-tight">
                    Nâng Tầm Trải
                    <span className="block text-primary-300">Nghiệm Hẹn Hò.</span>
                  </h3>

                  <p className="mt-4 text-white/80 text-sm sm:text-base leading-relaxed max-w-lg">
                    Tại LoveAI, chúng tôi không chỉ tạo ra các cuộc gặp gỡ. Chúng tôi kiến tạo những khởi đầu đẹp đẽ trong một không gian riêng tư và sang trọng.
                  </p>

                  <div className="mt-6 sm:mt-8 flex flex-wrap gap-4 sm:gap-6 text-white/90 text-sm sm:text-base font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-600 text-white text-[11px] sm:text-xs flex items-center justify-center">✓</span>
                      100% Bảo mật
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-600 text-white text-[11px] sm:text-xs flex items-center justify-center">★</span>
                      Dịch vụ Premium
                    </div>
                  </div>
                </div>
              </article>
            </section>

            {/* CTA SECTION */}
            <section className="max-w-7xl mx-auto pt-6 pb-12 lg:pb-20 text-center px-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-duration="900">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                Bạn đã sẵn sàng để yêu?
              </h3>

              <button
                onClick={() => navigate('/register')}
                className="mt-8 w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-base sm:text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Tạo Tài Khoản Miễn Phí
              </button>

              <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                Bằng cách tham gia, bạn đồng ý với Điều khoản và Chính sách bảo mật của chúng tôi.
              </p>
            </section>
          </>
        )}

        {/* TABS CÒN LẠI */}
        {activeTab === 'about' && (
          <section className="max-w-7xl mx-auto py-10" data-aos="fade-up">
            <div className="rounded-3xl bg-white border border-primary-100 shadow-sm p-8 text-center">
              <h1 className="text-2xl font-black text-gray-900">Về Chúng Tôi</h1>
              <p className="mt-4 text-[13px] text-gray-600">Trang này đang được cập nhật nội dung.</p>
            </div>
          </section>
        )}

        {activeTab === 'support' && (
          <section className="max-w-7xl mx-auto py-10" data-aos="fade-up">
            <div className="rounded-3xl bg-white border border-primary-100 shadow-sm p-8 text-center">
              <h1 className="text-2xl font-black text-gray-900">Hỗ Trợ</h1>
              <p className="mt-4 text-[13px] text-gray-600">Trang này đang được cập nhật nội dung.</p>
            </div>
          </section>
        )}

        {/* TAB NGUYÊN TẮC CỘNG ĐỒNG */}
        {activeTab === 'community' && (
          <section className="max-w-7xl mx-auto py-4 sm:py-8 lg:py-10 w-full">
            {/* Banner */}
            <div className="rounded-2xl sm:rounded-[2rem] bg-gradient-to-r from-[#ff8fa3] via-[#ff9dcf] to-[#c8a6ff] p-5 sm:p-10 shadow-md text-white" data-aos="fade-down" data-aos-duration="800">
              <span className="inline-flex items-center rounded-full bg-white/25 px-3 py-1 sm:px-4 sm:py-1.5 text-[9px] sm:text-xs font-extrabold tracking-wide uppercase">
                Chính sách an toàn
              </span>
              <h2 className="mt-3 text-xl sm:text-3xl lg:text-4xl font-black leading-tight">Nguyên Tắc Cộng Đồng</h2>
              <p className="mt-2.5 sm:mt-4 text-[13px] sm:text-base text-white/95 max-w-4xl leading-relaxed">
                LoveAI là không gian để tạo ra những kết nối tử tế một cách an toàn, toàn diện và tôn trọng. Chúng tôi yêu cầu các thành viên chịu trách nhiệm về cách đối xử với nhau.
              </p>
            </div>

            <div className="mt-5 sm:mt-8 flex flex-col lg:grid lg:grid-cols-[280px_minmax(0,1fr)] gap-5 lg:gap-7">
              {/* Sidebar Menu */}
              <aside className="lg:bg-white lg:rounded-[1.5rem] lg:border border-gray-100 lg:shadow-sm lg:p-6 h-fit" data-aos="fade-right" data-aos-delay="100">
                <h3 className="hidden lg:block text-lg font-black text-gray-900 mb-4">Mục Chính</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-1 gap-2.5 sm:gap-3">
                  {ruleMenu.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveRuleTab(item.id)}
                      className={`w-full rounded-xl p-3 sm:px-4 sm:py-3 transition-all flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1.5 sm:gap-3 border ${
                        activeRuleTab === item.id
                          ? 'bg-white lg:bg-primary-50 text-primary-600 border-primary-200 shadow-sm lg:shadow-none'
                          : 'bg-white lg:bg-gray-50 text-gray-500 border-gray-100 lg:border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl sm:text-lg">{item.icon}</span>
                      <span className="text-[11px] sm:text-sm font-bold text-center lg:text-left leading-tight">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Nội dung chi tiết */}
              <article className="bg-white rounded-2xl lg:rounded-[1.5rem] border border-gray-100 shadow-sm p-5 sm:p-8 lg:p-10" data-aos="fade-left" data-aos-delay="200">
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-4">{ruleDetails[activeRuleTab].title}</h3>

                {ruleDetails[activeRuleTab].intro?.length > 0 && (
                  <div className="mb-5 sm:mb-8">
                    {ruleDetails[activeRuleTab].intro.map((paragraph) => (
                      <p key={paragraph} className="text-[13px] sm:text-base text-gray-600 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                <div className="space-y-3 sm:space-y-5">
                  {ruleDetails[activeRuleTab].cards.map((card) => (
                    <div key={card.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-6">
                      <h4 className="text-sm sm:text-lg font-extrabold text-gray-900 mb-1.5 sm:mb-3">{card.title}</h4>
                      <p className="text-[12px] sm:text-base text-gray-600 leading-relaxed">{card.content}</p>
                      {card.bullets?.length > 0 && (
                        <ul className="mt-2.5 sm:mt-4 space-y-1.5 list-disc pl-4 text-[12px] sm:text-base text-gray-600 leading-relaxed">
                          {card.bullets.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-primary-50/90 backdrop-blur border-t border-primary-100 px-4 sm:px-6 lg:px-10 py-8 lg:py-10" data-aos="fade-up" data-aos-duration="800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          <Link to="/" className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight">
            LoveAI
          </Link>

          <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-gray-600 font-semibold uppercase tracking-wide text-xs sm:text-sm">
            <button type="button" className="hover:text-rose-600 transition-colors">Về chúng tôi</button>
            <button type="button" className="hover:text-rose-600 transition-colors">An toàn</button>
            <button type="button" className="hover:text-rose-600 transition-colors">Hỗ trợ</button>
          </nav>

          <p className="text-gray-400 text-xs sm:text-sm text-center lg:text-right">
            © 2026 LoveAI Hẹn hò cao cấp. Được thiết kế để kết nối.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;