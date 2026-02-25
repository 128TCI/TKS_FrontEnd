import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has a valid token on app load
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    setIsLoggedIn(true);  // Token exists → show HomePage
  }
  // If no token, isLoggedIn stays false → show LoginPage
  setIsLoading(false);
}, []);

  // Show loading state while checking token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lime-200 via-green-400 to-lime-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showForgotPassword) {
      return <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />;
    }
    return (
      <LoginPage 
        onLogin={() => setIsLoggedIn(true)} 
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  return <HomePage onLogout={() => setIsLoggedIn(false)} />;
}