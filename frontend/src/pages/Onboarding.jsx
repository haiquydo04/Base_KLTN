import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/api';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    dob: '', // Added for date of birth
    gender: '',
    bio: '',
    location: '',
    interests: [],
    occupation: '',
    lookingFor: '',
    avatar: null,
  });
  const [newInterest, setNewInterest] = useState('');
  
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);

  const LocationPickerMarker = () => {
    useMapEvents({
      click(e) {
        setMapPosition(e.latlng);
      },
    });
    return mapPosition ? <Marker position={mapPosition} /> : null;
  };

  const interestsList = [
    'Du lịch', 'Âm nhạc', 'Phim ảnh', 'Đọc sách', 'Nấu ăn', 'Thể thao',
    'Chơi game', 'Gym', 'Nghệ thuật', 'Nhiếp ảnh', 'Khiêu vũ', 'Yoga'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleAvatarChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAddCustomInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleOpenMap = () => {
    setShowMapModal(true);
    if (!mapPosition && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          setMapPosition({ lat: 10.762622, lng: 106.660172 });
        }
      );
    } else if (!mapPosition) {
       setMapPosition({ lat: 10.762622, lng: 106.660172 });
    }
  };

  const handleConfirmMapSelection = async () => {
    if (!mapPosition) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition.lat}&lon=${mapPosition.lng}&zoom=10&addressdetails=1`);
      const data = await response.json();
      
      let city = data.address.city || data.address.town || data.address.province || data.address.state;
      if (city) {
        setFormData(prev => ({ ...prev, location: city }));
        setError('');
        setShowMapModal(false);
      } else {
        setError('Không thể lấy tên thành phố từ vị trí vừa chọn.');
      }
    } catch (err) {
      setError('Lỗi khi lấy dữ liệu vị trí.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (skip = false) => {
    if (skip) {
      navigate('/discover');
      return;
    }

    setIsLoading(true);
    setError('');

    let calculatedAge = null;
    if (formData.dob) {
      calculatedAge = Math.floor((new Date() - new Date(formData.dob)) / 365.25 / 24 / 60 / 60 / 1000);
    } else if (formData.age) {
      calculatedAge = parseInt(formData.age);
    }

    if (!formData.fullName?.trim()) {
      setError('Vui lòng nhập họ và tên.');
      setIsLoading(false);
      return;
    }
      if (!calculatedAge || calculatedAge < 18) {
        setError('Bạn phải ít nhất 18 tuổi.');
        setIsLoading(false);
        return;
      }
      if (!formData.gender) {
        setError('Vui lòng chọn giới tính.');
        setIsLoading(false);
        return;
      }

    try {
      const updateData = {
        ...formData,
        age: calculatedAge,
      };

      if (!updateData.avatar) {
        delete updateData.avatar;
      }

      const result = await userService.updateProfile(updateData);

      if (result.success) {
        if (result.user) {
          setUser(result.user);
        }
        navigate('/discover');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật hồ sơ thất bại');
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h1 className="text-[1.75rem] leading-tight font-black text-gray-900 mb-6 tracking-tight">
              Hãy cho chúng tôi biết <span className="text-primary-600">về bạn.</span>
            </h1>

            <div className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1.5 ml-1">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white text-gray-800 text-sm rounded-full border border-primary-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all placeholder:text-gray-400 font-semibold shadow-sm"
                  placeholder="Nhập tên của bạn..."
                />
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1.5 ml-1">Ngày sinh</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-white text-gray-800 text-sm rounded-full border border-primary-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all font-semibold shadow-sm"
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-2 ml-1">Giới tính</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'gender', value: 'male' }})}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl border-2 transition-all ${
                      formData.gender === 'male' ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm shadow-primary-100' : 'border-transparent bg-white shadow-sm text-gray-500 hover:bg-primary-50'
                    }`}
                  >
                    <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5" /><line x1="21" y1="3" x2="13.5" y2="10.5" /><polyline points="16 3 21 3 21 8" /></svg>
                    <span className="text-[10px] font-bold mt-1">Nam</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'gender', value: 'female' }})}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl border-2 transition-all ${
                      formData.gender === 'female' ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm shadow-primary-100' : 'border-transparent bg-white shadow-sm text-gray-500 hover:bg-primary-50'
                    }`}
                  >
                    <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="5" /><line x1="12" y1="15" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></svg>
                    <span className="text-[10px] font-bold mt-1">Nữ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'gender', value: 'other' }})}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl border-2 transition-all ${
                      formData.gender === 'other' ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm shadow-primary-100' : 'border-transparent bg-white shadow-sm text-gray-500 hover:bg-primary-50'
                    }`}
                  >
                    <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><line x1="21" y1="3" x2="14.8" y2="9.2" /><polyline points="16 3 21 3 21 8" /><line x1="3" y1="3" x2="9.2" y2="9.2" /><polyline points="3 8 3 3 8 3" /><line x1="4.5" y1="7.5" x2="7.5" y2="4.5" /><line x1="12" y1="16" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></svg>
                    <span className="text-[10px] font-bold mt-1">Khác</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in">
            <h1 className="text-[1.75rem] leading-tight font-black text-gray-900 mb-6 tracking-tight">
              Thêm vài dòng <span className="text-primary-600">về bản thân.</span>
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1.5 ml-1">Ảnh đại diện</label>
                <div className="border-2 border-dashed border-primary-200 bg-white/60 rounded-3xl py-2 px-4 text-center hover:border-primary-400 transition-colors shadow-sm">
                  <input type="file" name="avatar" onChange={handleAvatarChange} accept="image/*" className="hidden" id="avatar-upload" />
                  <label htmlFor="avatar-upload" className="cursor-pointer block">
                    {formData.avatar ? (
                      <div className="flex flex-col items-center">
                        <img src={URL.createObjectURL(formData.avatar)} alt="Preview" className="w-16 h-16 rounded-full object-cover mb-1 shadow-md border-2 border-white" />
                        <span className="text-[10px] font-bold text-primary-600">Thay đổi ảnh</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="text-sm font-bold text-gray-600">Nhấn để tải ảnh lên</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">JPG, PNG hoặc GIF</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1.5 ml-1">Tiểu sử (Bio)</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full bg-white text-gray-800 text-sm rounded-3xl border border-primary-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all font-semibold min-h-[70px] resize-none shadow-sm"
                  placeholder="Giới thiệu đôi nét về tính cách..."
                  maxLength={500}
                />
                <p className="text-[10px] text-gray-400 mt-1 text-right font-medium">{formData.bio.length}/500 ký tự</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in">
            <h1 className="text-[1.75rem] leading-tight font-black text-gray-900 mb-6 tracking-tight">
              Sở thích & <span className="text-primary-600">Tìm kiếm.</span>
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1.5 ml-1">Sở thích</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {interestsList.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm ${
                        formData.interests.includes(interest)
                          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-primary-50'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomInterest())}
                    className="flex-1 bg-white text-gray-800 text-sm rounded-full border border-primary-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all font-semibold shadow-sm"
                    placeholder="Nhập sở thích khác..."
                  />
                  <button type="button" onClick={handleAddCustomInterest} className="px-4 py-2 bg-white text-gray-700 text-xs font-bold rounded-full hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors">
                    Thêm
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1.5 ml-1">Nơi ở (Thành phố)</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-white text-gray-800 text-sm rounded-full border border-primary-100 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all font-semibold shadow-sm"
                    placeholder="VD: TP. Hồ Chí Minh"
                  />
                  <button
                    type="button"
                    onClick={handleOpenMap}
                    title="Mở bản đồ chọn vị trí"
                    className="absolute right-2 p-2 text-primary-500 hover:text-white hover:bg-primary-500 rounded-full transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1.5 ml-1">Mục tiêu tìm kiếm</label>
                <select
                  name="lookingFor"
                  value={formData.lookingFor}
                  onChange={handleChange}
                  className="w-full bg-white text-gray-800 text-sm rounded-full border border-primary-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all font-semibold appearance-none shadow-sm"
                >
                  <option value="">Chọn mục tiêu...</option>
                  <option value="relationship">Mối quan hệ nghiêm túc</option>
                  <option value="friendship">Kết bạn</option>
                  <option value="casual">Hẹn hò vui vẻ</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-primary-50 via-gray-50 to-primary-100/50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="pointer-events-none fixed -top-24 -left-24 w-72 h-72 rounded-full bg-primary-200/40 blur-3xl z-0" />
      <div className="pointer-events-none fixed top-40 -right-24 w-80 h-80 rounded-full bg-secondary-200/30 blur-3xl z-0" />

      <div className="w-full max-w-md bg-[#fdf8fa] rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] border border-primary-100/60 flex flex-col relative z-10 overflow-hidden max-h-[95vh]">
        {/* Header inside the card */}
        <header className="px-6 py-4 flex items-center justify-between shrink-0 bg-[#fdf8fa]">
          <div className="text-xl font-black text-primary-600 tracking-tighter cursor-pointer" onClick={() => navigate('/')}>LoveAI</div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-white px-2.5 py-1 rounded-full shadow-sm border border-gray-100">
            Bước {currentStep}/3
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col pt-1 scrollbar-hide">
          {/* Progress Bar */}
          <div className="w-full mb-5 flex gap-1.5">
            {[1, 2, 3].map(step => (
              <div key={step} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step <= currentStep ? 'bg-primary-500' : 'bg-primary-100'}`} />
            ))}
          </div>

          <main className="flex-1 flex flex-col">
            {error && (
              <div className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex items-start gap-2 shadow-sm">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                <p className="text-red-700 text-xs font-bold">{error}</p>
              </div>
            )}

            {renderStep()}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full flex gap-3 h-11">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 rounded-full bg-white text-gray-700 text-[15px] font-bold border-2 border-primary-100 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Trở lại
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-[15px] font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    Tiếp theo <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-[15px] font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isLoading ? 'Đang lưu...' : 'Hoàn tất'} <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="text-gray-400 font-bold text-[11px] hover:text-gray-600 transition-colors py-1 flex items-center gap-1"
              >
                Bỏ qua phần này <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-sm">Chọn vị trí trên bản đồ</h3>
              <button type="button" onClick={() => setShowMapModal(false)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="h-[350px] w-full relative z-0 relative z-0">
              {mapPosition && (
                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <LocationPickerMarker />
                </MapContainer>
              )}
            </div>

            <div className="p-4 bg-gray-50/50 flex justify-between items-center border-t border-gray-100">
              <div className="text-xs text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-3 flex-1">
                {mapPosition ? `Chạm để đổi vị trí` : 'Đang tải bản đồ...'}
              </div>
              <button 
                type="button"
                disabled={!mapPosition || isLoading}
                onClick={handleConfirmMapSelection}
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold rounded-full disabled:opacity-50 hover:shadow-md transition-all"
              >
                {isLoading ? 'Đang xác định...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
