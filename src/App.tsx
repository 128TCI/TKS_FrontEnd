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
    const rawPayload = localStorage.getItem('loginPayload');

    if (token) {
      setIsLoggedIn(true);
    }

    if (rawPayload) {
      try {
        const parsedPayload = JSON.parse(rawPayload);

        const deepDecrypt = (obj: any): any => {
          if (typeof obj === 'string') {
            try { return decryptData(obj); } catch { return obj; }
          }
          if (Array.isArray(obj)) return obj.map(deepDecrypt);
          if (typeof obj === 'object' && obj !== null) {
            return Object.keys(obj).reduce((acc: any, key) => {
              acc[key] = deepDecrypt(obj[key]);
              return acc;
            }, {});
          }
          return obj;
        };

        console.log('Fully Decrypted loginPayload:', deepDecrypt(parsedPayload));
      } catch (err) {
        console.error('Failed to parse/decrypt loginPayload:', err);
      }
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