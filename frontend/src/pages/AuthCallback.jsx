import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken, fetchCurrentUser } = useAuthStore();

  const handleCallback = useCallback(async () => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (!token) {
      console.error('No token received');
      navigate('/login?error=no_token');
      return;
    }

    try {
      // Set token in store and localStorage
      setToken(token);

      // Fetch user data with the new token
      const data = await fetchCurrentUser();
      
      if (data?.user) {
        setUser(data.user);
        
        // Auto-detect admin
        if (data.user.role === 'admin' || data.user.role === 'Admin') {
           navigate('/admin/dashboard');
           return;
        }
      }

      // Redirect normal users to discover page
      navigate('/discover');
    } catch (error) {
      console.error('Auth callback error:', error);
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, navigate, setUser, setToken, fetchCurrentUser]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
