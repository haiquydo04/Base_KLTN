import { useState } from 'react';
import { Link } from 'react-router-dom';
import { images } from '../assets/images';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [activeRuleTab, setActiveRuleTab] = useState('ho-so');
  const [imageError, setImageError] = useState(false);
  const [aiFeatureError, setAiFeatureError] = useState(false);
  const [premiumImageError, setPremiumImageError] = useState(false);

  const navItems = [
    { id: 'discover', label: 'Khám phá' },
    { id: 'about', label: 'Về chúng tôi' },
    { id: 'support', label: 'Hỗ trợ' },
    { id: 'community', label: 'Nguyên tắcc cộng đồng' },
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
            'Ảnh chỉnh sửa nặng hoặc hiệu ứng kỹ thuật số phóng đại đến mức không thể xác định bạn là người trong ảnh.',
            'Biểu tượng, khung hoặc nhãn dán không phải của LoveAI phủ lên ảnh hồ sơ.',
            'Meme hoặc ảnh chủ yếu chứa văn bản, ký tự chữ.',
            'Ảnh hồ sơ của trẻ em hoặc ảnh trẻ em không mặc quần áo.',
          ],
        },
        {
          title: 'Tên người dùng',
          content:
            'Tên người dùng nên phản ánh đúng tên bạn thường dùng trong đời sống hằng ngày. Không cho phép:',
          bullets: [
            'Từ ngữ hoặc cụm từ vi phạm Nguyên tắc Cộng đồng.',
            'Mạo danh người nổi tiếng hoặc nhân vật hư cấu.',
            'Lạm dụng ký hiệu, emoji, số hoặc dấu câu để thay cho tên hợp lệ.',
            'Thông tin nền tảng mạng xã hội hoặc ứng dụng nhắn tin trong tên người dùng.',
          ],
        },
      ],
    },
    'ung-xu': {
      title: 'Nội Dung Và Ứng Xử',
      intro: [
        'LoveAI nghiêm cấm mọi nội dung hoặc hành vi gây hại, bóc lột, lừa đảo hoặc đe dọa sự an toàn của cộng đồng, cả trên và ngoài nền tảng.',
      ],
      cards: [
        {
          title: 'Ảnh khỏa thân và hoạt động tình dục người lớn',
          content:
            'Không cho phép nội dung hồ sơ khỏa thân, khiêu dâm, thô tục tình dục hoặc hoạt động mua bán, quảng cáo nội dung hoặc dịch vụ tình dục.',
        },
        {
          title: 'Bắt nạt và lạm dụng',
          content:
            'Không cho phép quấy rối, xúc phạm, đe dọa, tống tiền, liên lạc không mong muốn lặp đi lặp lại hoặc ca ngợi hành vi bạo lực.',
        },
        {
          title: 'Bóc lột và lạm dụng tình dục trẻ em',
          content:
            'Áp dụng chính sách không khoan nhượng cho mọi hình thức bóc lột trẻ em, kể cả nội dung thật hoặc hư cấu. Nghiêm cấm tải lên, lưu trữ, sản xuất, chia sẻ hoặc lôi kéo chia sẻ tài liệu lạm dụng trẻ em.',
        },
        {
          title: 'Hoạt động thương mại và quảng cáo',
          content:
            'Không sử dụng nền tảng cho mục đích quảng cáo hoặc thương mại không được yêu cầu.',
        },
        {
          title: 'Hàng hóa và chất bị cấm',
          content:
            'Nghiêm cấm mua bán, cung cấp hoặc tạo điều kiện phân phối ma túy, chất cấm, dụng cụ sử dụng ma túy và lạm dụng các chất hợp pháp.',
        },
        {
          title: 'Khủng bố, cực đoan bạo lực và hận thù danh tính',
          content:
            'Không cho phép nội dung cổ xúy khủng bố, cực đoan bạo lực hoặc thù ghét dựa trên đặc điểm được bảo vệ như chủng tộc, giới tính, xu hướng tính dục, tôn giáo, khuyết tật, quốc tịch.',
        },
        {
          title: 'Hồ sơ không trung thực và thông tin sai lệch',
          content:
            'Nghiêm cấm mạo danh, catfishing, xuyên tạc thông tin cá nhân hoặc lan truyền thông tin sai lệch có thể gây hại nghiêm trọng cho cá nhân hoặc cộng đồng.',
        },
        {
          title: 'Bạo hành, lừa đảo, quấy rối tình dục, spam',
          content:
            'Không chấp nhận bạo hành thể chất hoặc tình dục, lừa đảo tài chính, cyberflashing, đe dọa phát tán ảnh nhạy cảm, gửi nội dung rác hoặc tạo nhiều tài khoản gây rối.',
        },
        {
          title: 'Nội dung tự hại, bạo lực, phản cảm và thao túng nền tảng',
          content:
            'Không cho phép nội dung cổ xúy tự tử, tự hại, rối loạn ăn uống, nội dung đẫm máu hoặc phản cảm, hoặc hành vi tự động trái phép như thu thập dữ liệu, chạy script, né tránh lệnh cấm bằng tài khoản mới hoặc VPN.',
        },
      ],
    },
    'bao-cao': {
      title: 'Báo Cáo An Toàn',
      intro: [
        'An toàn là ưu tiên hàng đầu tại LoveAI. Chúng tôi kết hợp nhân sự kiểm duyệt và hệ thống tự động để đánh giá tài khoản, nội dung và hành vi có thể vi phạm.',
      ],
      cards: [
        {
          title: 'Khi nào cần báo cáo',
          content:
            'Nếu bạn cảm thấy không thoải mái hoặc không an toàn, hãy Hủy kết đôi, Khóa và báo cáo thành viên. Báo cáo của bạn là nguồn tín hiệu quan trọng để bảo vệ cộng đồng.',
        },
        {
          title: 'Nguyên tắc báo cáo công bằng',
          content:
            'Không đồng ý quan điểm hoặc không thích ai đó không mặc định là lý do báo cáo. Hệ thống có thể xử lý ngược lại nếu phát hiện báo cáo sai lệch, ác ý hoặc nhắm vào đặc điểm được bảo vệ.',
        },
        {
          title: 'Xử lý sau báo cáo',
          content:
            'Tùy mức độ, chúng tôi có thể xác minh thêm, xóa nội dung, cảnh báo, khóa tính năng, cấm tài khoản hoặc phối hợp cơ quan chức năng trong các trường hợp nghiêm trọng.',
        },
      ],
    },
    'thuc-thi': {
      title: 'Triết Lý Thực Thi',
      intro: [
        'Mọi thành viên phải tuân thủ Nguyên tắc Cộng đồng, Điều khoản và các giá trị an toàn của LoveAI. Chúng tôi đánh giá hành vi theo mức độ rủi ro và tác động thực tế.',
      ],
      cards: [
        {
          title: 'Các hình thức xử lý',
          content:
            'Tùy vào mức độ vi phạm, LoveAI có thể xóa nội dung, đưa ra cảnh báo, hoặc cấm thành viên khỏi một số hoặc toàn bộ ứng dụng của Bumble Inc.',
          bullets: [
            'Xóa nội dung vi phạm.',
            'Đưa ra cảnh báo hoặc hạn chế tính năng.',
            'Cấm tạm thời hoặc vĩnh viễn khỏi nền tảng.',
          ],
        },
        {
          title: 'Hành vi ngoài ứng dụng',
          content:
            'Hành vi gây hại diễn ra ngoài ứng dụng (hẹn gặp trực tiếp, tin nhắn ngoài nền tảng) vẫn có thể dẫn đến xử lý tài khoản nếu chúng tôi xác định có rủi ro cho cộng đồng.',
        },
        {
          title: 'Khiếu nại quyết định',
          content:
            'Nếu bạn cho rằng tài khoản hoặc nội dung bị xử lý nhầm, bạn có thể liên hệ bộ phận hỗ trợ để được xem xét lại.',
        },
      ],
    },
  };

  const openRegisterPage = () => {
    window.location.href = '/register';
  };

  const openLoginPage = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50/40 to-sky-50/30">
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary-100/70 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-24 w-80 h-80 rounded-full bg-secondary-100/60 blur-3xl" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm px-5 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="text-xl sm:text-2xl font-extrabold text-rose-500 tracking-tight">
            LoveAI
          </Link>

          <nav className="hidden md:flex items-center rounded-full border border-rose-100 bg-rose-50/80 px-2 py-1 shadow-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === item.id
                    ? 'bg-white text-rose-600 border border-rose-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-700 text-xs sm:text-sm font-semibold px-3 py-2 hover:text-gray-900">
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-xs sm:text-sm rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Tham gia VIP
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-3 md:hidden overflow-x-auto scrollbar-hide">
          <nav className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50/80 px-2 py-1 shadow-sm min-w-max">
            {navItems.map((item) => (
              <button
                key={`mobile-${item.id}`}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === item.id
                    ? 'bg-white text-rose-600 border border-rose-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 px-5 lg:px-10 pt-36 md:pt-24 lg:pt-28 pb-10 lg:pb-12">
        {activeTab === 'discover' && (
          <>
            <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-100px)]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/90 text-primary-700 px-3 py-1.5 text-xs font-semibold tracking-wide uppercase mb-6">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary-500 text-white inline-flex items-center justify-center text-[9px]">*</span>
                  AI-Verified Connections
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-gray-900">
                  Tìm Thấy
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent italic">
                    Tình Yêu Đích Thực hong phải đít giả
                  </span>
                  <span className="block">Nhờ Trí Tuệ Nhân Tạo.</span>
                </h1>

                <p className="mt-5 text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed">
                  Trải nghiệm không gian hẹn hò cao cấp, nơi AI giúp bạn sàng lọc những kết nối chân thành và an toàn tuyệt đối.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={openLoginPage}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Bắt Đầu Ngay
                  </button>
                  <button
                    onClick={openRegisterPage}
                    className="px-6 py-3 rounded-full bg-rose-100 text-gray-700 text-sm sm:text-base font-semibold hover:bg-rose-200 transition-colors duration-200"
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
                      <p className="text-xl font-black text-gray-900">98%</p>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent text-white">
                      <p className="text-xl font-bold">Cha Eun Woo, 29</p>
                      <p className="text-xs text-white/90">Korea · Actor</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto pt-6 lg:pt-12 pb-4">
              <div className="text-center mb-8 lg:mb-10">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Công Nghệ Dẫn Lối Cảm Xúc</h2>
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

                      <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-3">
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

                  <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-3">Ghép đôi Thông minh</h3>

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
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight">
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
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                Bạn đã sẵn sàng để yêu?
              </h3>

              <button
                onClick={openRegisterPage}
                className="mt-8 px-8 sm:px-12 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-base sm:text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Tạo Tài Khoản Miễn Phí
              </button>

              <p className="mt-8 text-xs sm:text-sm text-gray-400">
                Bằng cách tham gia, bạn đồng ý với Điều khoản và Chính sách bảo mật của chúng tôi.
              </p>
            </section>
          </>
        )}

        {activeTab === 'about' && (
          <section className="max-w-7xl mx-auto py-10 lg:py-14">
            <div className="rounded-3xl bg-white border border-primary-100 shadow-sm p-8 sm:p-10 text-center">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Về Chúng Tôi</h1>
              <p className="mt-4 text-base text-gray-600">Trang này đang được cập nhật nội dung.</p>
            </div>
          </section>
        )}

        {activeTab === 'support' && (
          <section className="max-w-7xl mx-auto py-10 lg:py-14">
            <div className="rounded-3xl bg-white border border-primary-100 shadow-sm p-8 sm:p-10 text-center">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Hỗ Trợ</h1>
              <p className="mt-4 text-base text-gray-600">Trang này đang được cập nhật nội dung.</p>
            </div>
          </section>
        )}

        {activeTab === 'community' && (
          <section className="max-w-7xl mx-auto py-8 lg:py-10">
            <div className="rounded-[2rem] bg-gradient-to-r from-[#ff8fa3] via-[#ff9dcf] to-[#c8a6ff] p-7 sm:p-10 shadow-[0_14px_30px_rgba(221,123,185,0.2)] text-white">
              <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-xs font-extrabold tracking-wide uppercase">
                Chính sách an toàn cộng đồng
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-black leading-tight">Nguyên Tắc Cộng Đồng</h2>
              <p className="mt-4 text-sm sm:text-base text-white/95 max-w-5xl leading-relaxed">
                LoveAI là không gian để tạo ra những kết nối tử tế một cách an toàn, toàn diện và tôn trọng. Để thúc đẩy các mối quan hệ lành mạnh và công bằng, chúng tôi yêu cầu các thành viên phải chịu trách nhiệm về cách họ đối xử với nhau.
              </p>
              <p className="mt-3 text-sm sm:text-base text-white/90 max-w-5xl leading-relaxed">
                Nguyên Tắc Cộng Đồng nêu rõ những nội dung và hành vi không được chấp nhận, cả trên và ngoài nền tảng, nhằm đảm bảo an toàn cho tất cả thành viên.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 lg:gap-7">
              <aside className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 h-fit">
                <h3 className="text-lg font-black text-gray-900 mb-4">Mục Chính</h3>
                <div className="space-y-2">
                  {ruleMenu.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveRuleTab(item.id)}
                      className={`w-full text-left rounded-xl px-4 py-3 font-semibold transition-colors ${
                        activeRuleTab === item.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </aside>

              <article className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-7 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">{ruleDetails[activeRuleTab].title}</h3>

                {ruleDetails[activeRuleTab].intro?.length > 0 && (
                  <div className="mb-5 space-y-3">
                    {ruleDetails[activeRuleTab].intro.map((paragraph) => (
                      <p key={paragraph} className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  {ruleDetails[activeRuleTab].cards.map((card) => (
                    <div key={card.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:p-6">
                      <h4 className="text-lg font-extrabold text-gray-900 mb-2">{card.title}</h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{card.content}</p>
                      {card.bullets?.length > 0 && (
                        <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-gray-600 leading-relaxed">
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

      <footer className="bg-primary-50/90 backdrop-blur border-t border-primary-100 px-5 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          <Link to="/" className="text-2xl font-black text-rose-500 tracking-tight">
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
    </div>
  );
};

export default LandingPage;
