import { useState, useEffect } from 'react';
import { Building2, User, Lock } from 'lucide-react';
import apiClient from '../services/apiClient';
import auditTrail from '../services/auditTrail'
import lifeBankHeader from '../assets/Lifebank.png';
import techLogo from '../assets/128Tech_Logo.jpg';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';

// ─── Encryption Helpers ────────────────────────────────────────────────────────

const SECRET_KEY = "128bl3$$1ng$";
const SALT       = "bl3$$1ng$128";

let cached: { key: CryptoJS.lib.WordArray; iv: CryptoJS.lib.WordArray } | null = null;

function getKeyAndIV() {
  if (cached) return cached;

  const saltBytes = CryptoJS.enc.Utf16LE.parse(SALT);

  const derived = CryptoJS.PBKDF2(SECRET_KEY, saltBytes, {
    keySize:    12,
    iterations: 1000,
    hasher:     CryptoJS.algo.SHA1,
  });

  cached = {
    iv:  CryptoJS.lib.WordArray.create(derived.words.slice(0, 4)),
    key: CryptoJS.lib.WordArray.create(derived.words.slice(4, 12)),
  };

  return cached;
}

function encryptData(plainText: string): string {
  if (!plainText) return "";

  try {
    const { key, iv } = getKeyAndIV();
    const wordArray = CryptoJS.enc.Utf16LE.parse(plainText);

    const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
      iv,
      mode:    CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  } catch (error) {
    console.error("Encryption Error:", error);
    return "";
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface LoginPageProps {
  onLogin: () => void;
  onForgotPassword: () => void;
}

export function LoginPage({ onLogin, onForgotPassword }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [company,  setCompany]  = useState('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [windowsAuth, setWindowsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ─── Fetch companies from API on mount ──────────────────────────────────────
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiClient.get('Security/DatabaseConfiguration/databases');
        const servers: string[] = response.data?.servers ?? [];
        setCompanies(servers);
        if (servers.length > 0) {
          setCompany(servers[0]); // default to first company
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
        // Fallback list in case the API is unreachable
        const fallback = ['DEMO COMPANY INC'];
        setCompanies(fallback);
        setCompany(fallback[0]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const encryptedUsername = encryptData(username);
      const encryptedPassword = encryptData(password);
      const encryptedCompany  = encryptData(company);

      const response = await apiClient.post('UserLogin/login', {
        username:    encryptedUsername,
        password:    encryptedPassword,
        company:     encryptedCompany,
        windowsAuth,
      });

      if (response.status === 200) {
        if (response.data.token) {
          localStorage.setItem('authToken',      response.data.token);
          localStorage.setItem('loginTimestamp', new Date().getTime().toString());
        }

        if (response.data) {
          localStorage.setItem('loginPayload', JSON.stringify(response.data));
        }

        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }

        await Swal.fire({
          icon:              'success',
          title:             'Login Successful',
          text:              'Welcome back!',
          timer:             2000,
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
    const status  = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Login failed. Please try again.';

    setError(message);

    if (status === 401) {
      await Swal.fire({ icon: 'error',   title: 'Invalid Credentials', text: 'Invalid username or password.', confirmButtonColor: '#dc2626' });
    } else if (status === 403) {
      await Swal.fire({ icon: 'warning', title: 'Account Suspended',   text: message,                        confirmButtonColor: '#dc2626' });
    } else if (status === 400) {
      await Swal.fire({ icon: 'warning', title: 'Invalid Input',        text: message,                        confirmButtonColor: '#dc2626' });
    } else if (status >= 500) {
      await Swal.fire({ icon: 'error',   title: 'Server Error',         text: 'Server error. Please try again later.', confirmButtonColor: '#dc2626' });
    } else if (err.message === 'Network Error' || !err.response) {
      await Swal.fire({ icon: 'error',   title: 'Connection Error',     text: 'Unable to connect to the server.',      confirmButtonColor: '#dc2626' });
    } else {
      await Swal.fire({ icon: 'error',   title: 'Login Failed',         text: message,                        confirmButtonColor: '#dc2626' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      {/* Dark Slate Bar with Company Name */}
      <div className="w-full bg-green-600 text-white py-3">
        <div className="max-w-7xl mx-auto">
          <p className="text-white tracking-wide">DEMO ACCOUNT</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md relative">

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 pt-16">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-gray-900 text-center">Login</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Username */}
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

              {/* Password */}
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

              {/* Company Name — dynamically populated */}
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
                    disabled={loadingCompanies}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingCompanies ? (
                      <option value="">Loading companies…</option>
                    ) : (
                      companies.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {loadingCompanies ? (
                      // Spinner icon while fetching
                      <svg className="h-5 w-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Windows Authentication */}
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

              {/* Submit & Forgot Password */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="submit"
                  disabled={loading || loadingCompanies}
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
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(30px, -50px) scale(1.1); }
          66%  { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}