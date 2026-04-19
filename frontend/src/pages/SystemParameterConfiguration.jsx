import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

// SVGs and Icons
const Icons = {
  Brain: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-5.224 4.468C.655 12.814 2.219 16 5 16h.5c.866 0 1.578.47 2 1 1 1.25 1 2.5 1 2.5s.16 2.5 3.5 2.5 3.5-2.5 3.5-2.5 0-1.25 1-2.5c.422-.53 1.134-1 2-1h.5c2.781 0 4.345-3.186 4.223-6.407a4 4 0 0 0-5.224-4.468A3 3 0 1 0 12 5Z"/><path d="M9.5 9.5a1.5 1.5 0 0 1 3 0c0 .828-.672 1.5-1.5 1.5v1.5"/><circle cx="11" cy="15" r="1"/></svg>
  ),
  Code: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  ),
  MapPin: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  Swipe: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 14h2.5a3.5 3.5 0 0 0 0-7h-5A3.5 3.5 0 0 0 5 10.5V16M13.5 17.5 11 14l2.5-3.5"/><path d="M17.5 14 20 17.5 17.5 21"/></svg>
  ),
  Clock: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Info: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  ),
  CheckCircle: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  X: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  )
};

export default function SystemParameterConfiguration() {
  const [faceThreshold, setFaceThreshold] = useState(85);
  const [photoSensitivity, setPhotoSensitivity] = useState(92);
  const [nlpAccuracy, setNlpAccuracy] = useState(78);
  
  const [maxDistance, setMaxDistance] = useState(50);
  const [maxSwipes, setMaxSwipes] = useState(100);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  const [toastVisible, setToastVisible] = useState(false);

  const handleUpdate = () => {
    // Show toast
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  const titleNode = "Cấu hình tham số hệ thống";

  return (
    <AdminLayout title={titleNode} noPadding={true}>
      <div className="flex flex-col h-full bg-[#FAFAFA] relative">
        <div className="p-10 max-w-6xl mx-auto w-full">
          {/* Header Description */}
          <div className="mb-10 text-[15px] text-gray-500 font-medium leading-relaxed max-w-3xl">
            Điều chỉnh các tham số vận hành cốt lõi của hệ thống ghép đôi AI. Các thay đổi sẽ có hiệu lực ngay lập tức đối với tất cả các phiên người dùng mới.
          </div>

          {/* Cards Container */}
          <div className="flex flex-col lg:flex-row gap-8 items-stretch mb-10">
            {/* Card 1: Ngưỡng xử lý AI Engine */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] text-[#E53258] flex items-center justify-center">
                  <Icons.Brain />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ngưỡng xử lý AI Engine</h3>
                  <p className="text-sm text-gray-400 font-medium mt-1">Tinh chỉnh độ chính xác của các thuật toán nhận diện và lọc</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Item 1 */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[14px] font-bold text-gray-900">Ngưỡng xác thực khuôn mặt</label>
                    <span className="text-[#E53258] font-black text-[18px]">{faceThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={faceThreshold}
                    onChange={(e) => setFaceThreshold(e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none bg-rose-100 accent-[#B21C3A]"
                  />
                  <div className="relative w-full h-[6px] bg-rose-100 rounded-full mt-[-8px] pointer-events-none hidden">
                      <div className="h-full bg-[#B21C3A] rounded-full" style={{width: `${faceThreshold}%`}}></div>
                  </div>
                  <p className="text-[12px] text-gray-400 font-medium mt-3 italic">Độ chính xác tối thiểu để người dùng được cấp tích xanh xác thực.</p>
                </div>

                {/* Item 2 */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[14px] font-bold text-gray-900">Độ nhạy kiểm duyệt ảnh</label>
                    <span className="text-[#E53258] font-black text-[18px]">{photoSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={photoSensitivity}
                    onChange={(e) => setPhotoSensitivity(e.target.value)}
                    className="w-full h-2 bg-rose-100 rounded-full appearance-none cursor-pointer outline-none accent-[#B21C3A]"
                  />
                  <p className="text-[12px] text-gray-400 font-medium mt-3 italic">Càng cao, hệ thống càng khắt khe với các hình ảnh nhạy cảm hoặc không phù hợp.</p>
                </div>

                {/* Item 3 */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[14px] font-bold text-gray-900">Độ chính xác NLP</label>
                    <span className="text-[#E53258] font-black text-[18px]">{nlpAccuracy}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={nlpAccuracy}
                    onChange={(e) => setNlpAccuracy(e.target.value)}
                    className="w-full h-2 bg-rose-100 rounded-full appearance-none cursor-pointer outline-none accent-[#B21C3A]"
                  />
                  <p className="text-[12px] text-gray-400 font-medium mt-3 italic">Độ tin cậy của việc phân tích ý định trong tin nhắn và tiểu sử.</p>
                </div>
              </div>
            </div>

            {/* Card 2: Giới hạn vận hành */}
            <div className="bg-[#FCF7F8] rounded-[32px] p-8 flex-1 border border-rose-50/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#F0EBEF] text-gray-500 flex items-center justify-center">
                  <Icons.Code />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Giới hạn vận hành</h3>
                  <p className="text-sm text-gray-400 font-medium mt-1">Cài đặt quy tắc trải nghiệm người dùng</p>
                </div>
              </div>

              <div className="space-y-7">
                {/* Input 1 */}
                <div>
                  <label className="block text-[11px] font-black text-[#8E868A] uppercase tracking-wider mb-2">Giới hạn khoảng cách tìm kiếm tối đa (KM)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(e.target.value)}
                      className="w-full bg-white border border-[#F0EBEF] rounded-2xl px-6 py-4 font-black text-xl text-gray-900 outline-none focus:border-rose-200 transition-colors"
                    />
                    <Icons.MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Input 2 */}
                <div>
                  <label className="block text-[11px] font-black text-[#8E868A] uppercase tracking-wider mb-2">Số lượt quẹt tối đa/ngày</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxSwipes}
                      onChange={(e) => setMaxSwipes(e.target.value)}
                      className="w-full bg-white border border-[#F0EBEF] rounded-2xl px-6 py-4 font-black text-xl text-gray-900 outline-none focus:border-rose-200 transition-colors"
                    />
                    <Icons.Swipe className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Input 3 */}
                <div>
                  <label className="block text-[11px] font-black text-[#8E868A] uppercase tracking-wider mb-2">Thời gian hết hạn phiên (Phút)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full bg-white border border-[#F0EBEF] rounded-2xl px-6 py-4 font-black text-xl text-gray-900 outline-none focus:border-rose-200 transition-colors"
                    />
                    <Icons.Clock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
              <div className="w-5 h-5 rounded-full bg-[#B21C3A] text-white flex items-center justify-center">
                 <Icons.Info className="w-3 h-3" />
              </div>
              <span className="ml-1 text-[#8E868A]">Lần cập nhật cuối: 14:32, 24/10/2023 bởi <strong className="text-gray-700">Admin_01</strong></span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="px-8 py-3.5 bg-[#EFE9EB] hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-all"
                onClick={() => alert("Chức năng kiểm tra đang được phát triển")}
              >
                Kiểm tra
              </button>
              <button 
                className="px-8 py-3.5 bg-[#E53258] hover:bg-[#D42247] text-white rounded-full font-bold shadow-lg shadow-rose-200 transition-all active:scale-95"
                onClick={handleUpdate}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        <div className={`fixed bottom-8 right-8 bg-[#333333] text-white p-5 rounded-2xl shadow-2xl flex items-start gap-4 transition-all duration-300 transform ${toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          <div className="w-8 h-8 rounded-full bg-[#2EBA68] flex items-center justify-center shrink-0">
            <Icons.CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 pr-6">
            <h4 className="font-bold text-[15px] mb-0.5">Cập nhật tham số thành công</h4>
            <p className="text-[#999999] text-sm">Hệ thống đã đồng bộ hóa dữ liệu mới.</p>
          </div>
          <button onClick={() => setToastVisible(false)} className="text-gray-400 hover:text-white transition-colors mt-0.5">
            <Icons.X />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
