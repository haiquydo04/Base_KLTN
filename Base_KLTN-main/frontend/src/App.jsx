import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Discover from './pages/Discover';
import RandomVideoChat from './pages/RandomVideoChat';
import AuthCallback from './pages/AuthCallback';

const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return token ? <Navigate to="/discover" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
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
            path="/profile/edit" 
            element={
              <ProtectedRoute>
                <EditProfile />
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
          <Route 
            path="*" 
            element={<Navigate to="/discover" replace />} 
          />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
