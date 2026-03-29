import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/api';
import { ChevronLeft, Camera, Sparkles, MapPin, Briefcase, Heart } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Bước 0 là màn hình chào mừng như trong ảnh bạn gửi
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '', age: '', gender: '', bio: '',
    location: '', interests: [], occupation: '',
    lookingFor: '', avatar: null,
  });
  const [newInterest, setNewInterest] = useState('');

  const interestsList = [
    'Travel', 'Music', 'Movies', 'Reading', 'Cooking', 'Sports',
    'Gaming', 'Fitness', 'Art', 'Photography', 'Dancing', 'Yoga'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, avatar: e.target.files[0] });
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (skip = false) => {
    setIsLoading(true);
    setError('');

    if (!skip && currentStep !== 0) {
      if (!formData.fullName?.trim()) { setError('Vui lòng nhập họ tên'); setIsLoading(false); return; }
      if (!formData.age || parseInt(formData.age) < 18) { setError('Bạn phải trên 18 tuổi'); setIsLoading(false); return; }
    }

    try {
      const updateData = { ...formData, age: formData.age ? parseInt(formData.age) : undefined };
      if (!updateData.avatar) delete updateData.avatar;

      const result = await userService.updateProfile(updateData);
      if (result.success) {
        if (result.user) setUser(result.user);
        navigate('/discover');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ');
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // MÀN HÌNH CHÀO MỪNG (Giống ảnh image_2bdc66.png)
        return (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-rose-200 blur-3xl rounded-full opacity-30 animate-pulse"></div>
              <Heart className="w-24 h-24 text-rose-600 fill-rose-600 relative z-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              Chào mừng bạn<br />đến với <span className="text-rose-600">LoveAI</span>
            </h1>
            <p className="text-gray-500 max-w-xs mx-auto mb-10 leading-relaxed">
              Nơi AI thấu hiểu trái tim bạn. Hãy bắt đầu hành trình tìm kiếm một nửa hoàn hảo của mình.
            </p>
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all transform active:scale-95"
            >
              Bắt đầu ngay
            </button>
            <button className="mt-6 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-rose-600 transition-colors">
              Tìm hiểu thêm
            </button>
          </div>
        );

      case 1: // THÔNG TIN CƠ BẢN
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h3>
              <p className="text-gray-400 text-sm mt-1">Hãy để mọi người biết bạn là ai</p>
            </div>
            <div className="space-y-4">
              <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none" placeholder="Họ và tên của bạn *" />
              <div className="grid grid-cols-2 gap-4">
                <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none" placeholder="Tuổi *" />
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none text-gray-500">
                  <option value="">Giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2: // HÌNH ẢNH & BIO
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Hình ảnh đại diện</h3>
              <p className="text-gray-400 text-sm mt-1">Một bức ảnh đẹp sẽ thu hút hơn</p>
            </div>
            <div className="flex justify-center">
              <label className="relative w-40 h-40 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-rose-50 hover:border-rose-200 transition-all overflow-hidden">
                {formData.avatar ? (
                  <img src={URL.createObjectURL(formData.avatar)} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Tải ảnh lên</span>
                  </>
                )}
                <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
              </label>
            </div>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-rose-500/20 outline-none min-h-[120px]" placeholder="Viết vài dòng giới thiệu về bản thân..." maxLength={500} />
          </div>
        );

      case 3: // SỞ THÍCH
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Sở thích</h3>
              <p className="text-gray-400 text-sm mt-1">Tìm kiếm sự đồng điệu</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {interestsList.map(interest => (
                <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.interests.includes(interest) ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {interest}
                </button>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl">
                <MapPin className="w-5 h-5 text-gray-300" />
                <input name="location" value={formData.location} onChange={handleChange} className="bg-transparent border-none outline-none w-full" placeholder="Bạn sống ở đâu?" />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl">
                <Briefcase className="w-5 h-5 text-gray-300" />
                <input name="occupation" value={formData.occupation} onChange={handleChange} className="bg-transparent border-none outline-none w-full" placeholder="Nghề nghiệp của bạn?" />
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F9] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-rose-100/50 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl shadow-rose-100/30 border border-white">

          {/* Header LoveAI (Chỉ hiện khi không ở bước 0) */}
          {currentStep !== 0 && (
            <div className="flex justify-between items-center mb-10">
              <span className="text-xl font-black text-rose-600">LoveAI</span>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Bước {currentStep} / 3</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {renderStep()}

          {/* Navigation */}
          {currentStep > 0 && (
            <div className="flex gap-3 mt-10">
              <button onClick={() => setCurrentStep(prev => prev - 1)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>

              {currentStep < 3 ? (
                <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all">
                  Tiếp theo
                </button>
              ) : (
                <button onClick={() => handleSubmit(false)} disabled={isLoading} className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50">
                  {isLoading ? 'Đang lưu...' : 'Hoàn tất'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Photos (Giống trong ảnh bạn gửi) */}
        <div className="mt-12 flex justify-center -space-x-3 opacity-60">
          <img src="https://i.pravatar.cc/150?u=1" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="user" />
          <img src="https://i.pravatar.cc/150?u=2" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="user" />
          <img src="https://i.pravatar.cc/150?u=3" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="user" />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;