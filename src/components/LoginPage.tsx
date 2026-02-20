import { useState } from 'react';
import { Building2, User, Lock } from 'lucide-react';
import apiClient from '../services/apiClient';
import auditTrail from '../services/auditTrail'
import lifeBankHeader from '../assets/Lifebank.png';
import techLogo from '../assets/128Tech_Logo.jpg';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';

interface LoginPageProps {
  onLogin: () => void;
  onForgotPassword: () => void;
}

export function LoginPage({ onLogin, onForgotPassword }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('DEMO COMPANY INC');
  const [windowsAuth, setWindowsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('UserLogin/login', {
        username,
        password,
        company,
        windowsAuth,
      });

      if (response.status === 200) {
        const userData = response.data.user || {};
        const userId = userData.userID || userData.userId || userData.id || 0;

        // Store tokens & payload
        if (response.data.token) localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('loginTimestamp', new Date().getTime().toString());
        localStorage.setItem('loginPayload', JSON.stringify(response.data));
        if (userData) localStorage.setItem('userData', JSON.stringify(userData));

        // ── AUDIT TRAIL LOG ──
        try {
          await auditTrail.log({
            trans: `Employee ${userData.username || username} logged in.`,
            messages: `Employee ${userData.username || username} logged in.`,
            formName: 'LogIn',
            accessType: 'LogIn',
          });
        } catch (err) {
          console.error('Audit trail login failed:', err);
        }

        await Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'Welcome back!',
          timer: 2000,
          showConfirmButton: false,
        });

        onLogin();
      }
    } catch (err: any) {
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = async (err: any) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Login failed. Please try again.';
    
    setError(message);

    if (status === 401) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Credentials',
        text: 'Invalid username or password.',
        confirmButtonColor: '#dc2626',
      });
    } else if (status === 403) {
      await Swal.fire({
        icon: 'warning',
        title: 'Account Suspended',
        text: message,
        confirmButtonColor: '#dc2626',
      });
    } else if (status === 400) {
      await Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: message,
        confirmButtonColor: '#dc2626',
      });
    } else if (status >= 500) {
      await Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Server error. Please try again later.',
        confirmButtonColor: '#dc2626',
      });
    } else if (err.message === 'Network Error' || !err.response) {
      await Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to connect to the server.',
        confirmButtonColor: '#dc2626',
      });
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: message,
        confirmButtonColor: '#dc2626',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header with LifeBank Logo */}
      <div className="bg-white border-b border-gray-200 relative z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <img 
            src={lifeBankHeader} 
            alt="LifeBank Microfinance Foundation" 
            className="h-14 object-contain"
          />
        </div>
      </div>

      {/* Dark Slate Bar with Company Name */}
          <div className="w-full bg-green-600 text-white py-3">
        <div className="max-w-7xl mx-auto">
          <p className="text-white tracking-wide">LIFEBANK MICROFINANCE FOUNDATION, INC.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        {/* Login Form Card */}
        <div className="w-full max-w-md relative">
          {/* Logo Circle - Positioned Above Card */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20">
            <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-green-600">
              <img 
                src={techLogo} 
                alt="128 Tech Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 pt-16">
            {/* Title */}
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-gray-900 text-center">Login</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              {/* Username Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  placeholder="Username"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  placeholder="Password"
                />
              </div>

              {/* Company Name Field */}
              <div>
                <label className="block text-gray-600 mb-2" style={{ fontSize: '0.875rem' }}>
                  Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer text-gray-700"
                  >
                    <option value="DEMO COMPANY INC">DEMO COMPANY INC</option>
                    <option value="LIFEBANK MICROFINANCE FOUNDATION INC">LIFEBANK MICROFINANCE FOUNDATION INC</option>
                    <option value="ACME Corporation">ACME Corporation</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Windows Authentication Checkbox */}
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="windowsAuth"
                  checked={windowsAuth}
                  onChange={(e) => setWindowsAuth(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="windowsAuth" className="ml-3 text-gray-700 cursor-pointer select-none">
                  Windows Authentication
                </label>
              </div>

              {/* Submit Button and Forgot Password */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-500 disabled:hover:to-red-600 disabled:hover:shadow-lg disabled:transform-none"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>

          {/* Footer Version Info */}
          <div className="text-center mt-6">
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>v7.3 • Secure Login</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-green-700 text-white px-6 py-4 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white" style={{ fontSize: '0.875rem' }}>
            © 128 Tech Consulting Inc. 2025. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}