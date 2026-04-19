import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAdminAuthStore } from './store/adminAuthStore';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MatchNotificationProvider } from './components/MatchNotification';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import RandomVideoChat from './pages/RandomVideoChat';
import Safety from './pages/Safety';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CategoryManagement from './pages/CategoryManagement';
import SessionManagement from './pages/SessionManagement';
import CensorshipAndViolationManagement from './pages/CensorshipAndViolationManagement';
import SystemParameterConfiguration from './pages/SystemParameterConfiguration';
import SystemTrace from './pages/SystemTrace';

const ProtectedRoute = ({ children }) => {
  const { token, isLoading, user } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!token) return <Navigate to="/login" replace />;

  if (user?.role === 'admin' || user?.role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { token, isLoading, user } = useAuthStore();
  const { adminToken } = useAdminAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (token) {
    if (user?.role === 'admin' || user?.role === 'Admin') {
      if (adminToken) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return children;
    }
    return <Navigate to="/discover" replace />;
  }
  
  return children;
};

// Admin Routes
const AdminProtectedRoute = ({ children }) => {
  const { adminToken, isLoading } = useAdminAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E53258]"></div>
      </div>
    );
  }
  
  return adminToken ? children : <Navigate to="/login" replace />;
};

function App() {
  const { adminToken, adminUser, fetchCurrentAdmin, logout } = useAdminAuthStore();

  useEffect(() => {
    if (adminToken && !adminUser) {
      fetchCurrentAdmin().catch(() => {
        logout(); // Automatically clears token and state
      });
    }
  }, [adminToken, adminUser, fetchCurrentAdmin, logout]);

  return (
    <AuthProvider>
      <SocketProvider>
        <MatchNotificationProvider>
          <Routes>
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminProtectedRoute>
                  <Dashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminProtectedRoute>
                  <UserManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <AdminProtectedRoute>
                  <CategoryManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/sessions" 
              element={
                <AdminProtectedRoute>
                  <SessionManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ai" 
              element={
                <AdminProtectedRoute>
                  <CensorshipAndViolationManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <AdminProtectedRoute>
                  <SystemParameterConfiguration />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/trace" 
              element={
                <AdminProtectedRoute>
                  <SystemTrace />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/login" 
              element={<Navigate to="/login" replace />} 
            />

            {/* Public/Auth Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discover" 
              element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/matches" 
              element={
                <ProtectedRoute>
                  <Matches />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:matchId" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:userId" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/edit" 
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/safety" 
              element={
                <ProtectedRoute>
                  <Safety />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/video-chat" 
              element={
                <ProtectedRoute>
                  <RandomVideoChat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/auth/callback" 
              element={<AuthCallback />} 
            />
            
            {/* Catch All */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </MatchNotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
