import Navbar from '../components/Navbar';

const Safety = () => {
  const BG = 'linear-gradient(180deg,#fff6f6 0%,#fff3f1 50%,#fff6f4 100%)';
  const CARD = {
    background: '#ffffff',
    borderRadius: 22,
    border: '1px solid #fde4e4',
    boxShadow: '0 12px 30px rgba(232, 91, 91, 0.12)'
  };
  const MUTED = '#8b6f6f';

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '28px 20px 60px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'left', marginBottom: 26 }}>
            <p style={{ fontSize: 10, letterSpacing: 2, color: '#d65b5b', fontWeight: 700, marginBottom: 6 }}>
              TRUNG TÂM BẢO MẬT
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2a1b1b', margin: 0 }}>
              An toàn của bạn là ưu tiên của chúng tôi.
            </h1>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 8, maxWidth: 520 }}>
              Quản lý các thiết lập riêng tư và công cụ bảo vệ để trải nghiệm hẹn hò của bạn luôn trọn vẹn và an tâm.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 26 }}>
            <div style={{ ...CARD, padding: 18 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: '#f2f6ff', color: '#6b7bbd', fontSize: 10, fontWeight: 700 }}>
                <span style={{ display: 'inline-flex', width: 8, height: 8, borderRadius: '50%', background: '#7aa6ff' }} />
                AI-VERIFIED
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#2b1b1b', marginTop: 12 }}>
                Danh tính đã xác thực
              </h3>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.6 }}>
                Hệ thống AI của chúng tôi đã xác nhận bạn là chính chủ.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 11, color: '#2fa76b', fontWeight: 700 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#2fa76b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9 }}>
                  ✓
                </span>
                Đang hoạt động
              </div>
            </div>

            <div style={{ ...CARD, padding: 18, background: '#51596a', border: '1px solid #525b6d' }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f0f3ff" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#f6f7fb', marginTop: 12 }}>
                Chế độ ẩn danh
              </h3>
              <p style={{ fontSize: 11, color: '#cbd2e1', marginTop: 6, lineHeight: 1.6 }}>
                Chỉ những người bạn chọn mới có thể nhìn thấy hồ sơ của bạn.
              </p>
              <button style={{ marginTop: 16, padding: '8px 16px', borderRadius: 999, border: 'none', background: '#6a7385', color: '#f7f8fb', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                Thay đổi cài đặt
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#2a1b1b', marginBottom: 10 }}>
              Hành động bảo vệ
            </h2>
            <div style={{ background: '#fdeff0', borderRadius: 16, padding: 12, border: '1px solid #fde4e4' }}>
              <button style={{ width: '100%', background: 'transparent', border: 'none', padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 999, background: '#fbd5d5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>⚠️</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#3a1d1d' }}>Báo cáo hành vi</div>
                    <div style={{ fontSize: 10, color: MUTED }}>Gửi phản hồi về các trường hợp nghi ngờ</div>
                  </div>
                </div>
                <span style={{ color: '#b37c7c', fontWeight: 700 }}>›</span>
              </button>
              <button style={{ width: '100%', background: 'transparent', border: 'none', padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 999, background: '#e8edf5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>🚫</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#3a1d1d' }}>Danh sách chặn</div>
                    <div style={{ fontSize: 10, color: MUTED }}>Quản lý 12 người dùng bị chặn</div>
                  </div>
                </div>
                <span style={{ color: '#b37c7c', fontWeight: 700 }}>›</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#2a1b1b', margin: 0 }}>
              Mẹo an toàn từ chuyên gia
            </h2>
            <button style={{ background: 'transparent', border: 'none', color: '#d65b5b', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              Xem tất cả
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={{ ...CARD, padding: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: '#fdeff0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <span>📍</span>
              </div>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#2b1b1b' }}>Giữ kín vị trí</h3>
              <p style={{ fontSize: 10, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                Đừng chia sẻ địa chỉ nhà hoặc nơi làm việc cụ thể sớm khi mới trò chuyện.
              </p>
            </div>

            <div style={{ ...CARD, padding: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: '#eef0f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <span>🏙️</span>
              </div>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#2b1b1b' }}>Gặp nơi công cộng</h3>
              <p style={{ fontSize: 10, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                Luôn chọn những quán cafe hoặc nơi đông người cho lần hẹn đầu.
              </p>
            </div>

            <div style={{ ...CARD, padding: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: '#f5eef5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <span>🛡️</span>
              </div>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#2b1b1b' }}>Bảo vệ thông tin</h3>
              <p style={{ fontSize: 10, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                Không chia sẻ thông tin tài chính hoặc mã xác minh của bạn.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Safety;