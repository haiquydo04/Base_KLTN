import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  
  const token = searchParams.get('token');
  const provider = searchParams.get('provider');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AuthCallback] Starting...');
      
      // 1. Check OAuth error từ Google
      if (error) {
        console.error('[AuthCallback] OAuth Error:', error);
        setStatus('error');
        setTimeout(() => navigate('/login?error=' + encodeURIComponent(error)), 1500);
        return;
      }

      // 2. Check có token không
      if (!token) {
        console.error('[AuthCallback] No token in URL');
        setStatus('error');
        setTimeout(() => navigate('/login?error=no_token'), 1500);
        return;
      }

      try {
        console.log('[AuthCallback] Token found, saving...');
        
        // Lưu token vào localStorage trực tiếp
        localStorage.setItem('token', token);
        
        // Gọi API để lấy user info
        console.log('[AuthCallback] Fetching user info...');
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('[AuthCallback] User fetched:', response.data);
        
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        console.log('[AuthCallback] Success! Redirecting to /discover');
        setStatus('success');
        setTimeout(() => navigate('/discover', { replace: true }), 500);
        
      } catch (err) {
        console.error('[AuthCallback] Error:', err?.message || err);
        
        // Nếu /auth/me lỗi nhưng có token, vẫn cho đăng nhập
        if (token) {
          console.log('[AuthCallback] Token valid but user fetch failed, continuing...');
          setStatus('success');
          setTimeout(() => navigate('/discover', { replace: true }), 500);
        } else {
          setStatus('error');
          setTimeout(() => navigate('/login?error=auth_failed'), 1500);
        }
      }
    };

    handleCallback();
  }, []); // Empty deps - chỉ chạy 1 lần

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Đang đăng nhập Google...</p>
            <p className="text-gray-400 text-sm mt-2">
              Token: {token ? '✓ Có' : '✗ Không'}
            </p>
            <p className="text-gray-400 text-sm">
              Provider: {provider || 'Không rõ'}
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <p className="text-green-600 font-medium">Đăng nhập thành công!</p>
            <p className="text-gray-500 text-sm">Đang chuyển hướng...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-600 font-medium">Đăng nhập thất bại</p>
            <p className="text-gray-500 text-sm">Đang quay lại đăng nhập...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
