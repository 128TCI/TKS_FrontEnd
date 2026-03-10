import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { decryptData } from './services/encryptionService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }

    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/home', { replace: true });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login', { replace: true });
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lime-200 via-green-400 to-lime-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppRoutes
      onLogin={handleLogin}
      onLogout={handleLogout}
      onForgotPassword={handleForgotPassword}
      onBackToLogin={handleBackToLogin}
    />
  );
}