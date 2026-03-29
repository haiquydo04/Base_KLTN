import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Modal from './Modal';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    age: '',
    gender: 'male',
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: '', password: '' });
      setRegisterData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        age: '',
        gender: 'male',
      });
      setValidationError('');
      clearError();
    }
  }, [isOpen, clearError]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(loginData);
      onClose();
      navigate('/discover');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (registerData.password !== registerData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (registerData.age && parseInt(registerData.age) < 18) {
      setValidationError('You must be at least 18 years old');
      return;
    }

    try {
      const { confirmPassword, ...data } = registerData;
      await register({ ...data, age: parseInt(registerData.age) || undefined });
      onClose();
      navigate('/discover');
    } catch (err) {
      // Error handled by store
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
    setValidationError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'login' ? 'Sign in to continue' : 'Join us to find your match'}
          </p>
        </div>

        {(error || validationError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error || validationError}</p>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="modal-email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="modal-password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label htmlFor="modal-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="modal-username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                className="input-field"
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>

            <div>
              <label htmlFor="modal-fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="modal-fullName"
                name="fullName"
                value={registerData.fullName}
                onChange={handleRegisterChange}
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="modal-email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="modal-age"
                  name="age"
                  value={registerData.age}
                  onChange={handleRegisterChange}
                  className="input-field"
                  placeholder="18+"
                  min={18}
                  max={100}
                />
              </div>

              <div>
                <label htmlFor="modal-gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="modal-gender"
                  name="gender"
                  value={registerData.gender}
                  onChange={handleRegisterChange}
                  className="input-field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="modal-password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className="input-field"
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="modal-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="modal-confirmPassword"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className="input-field"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-gray-600">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </Modal>
  );
};

export default AuthModal;
