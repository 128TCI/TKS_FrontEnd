import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import logoImage from 'figma:asset/61938a0d79b7addf7705f197066d189cda2ff9a9.png';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate password reset request
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <img 
            src={logoImage} 
            alt="LifeBank Foundation" 
            className="h-12 object-contain"
          />
        </div>
      </div>

      {/* Blue Bar */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/95">LIFEBANK MICROFINANCE FOUNDATION, INC.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {/* Forgot Password Card */}
        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            {!isSubmitted ? (
              <>
                <div className="mb-8">
                  <h1 className="text-gray-900 mb-2">Forgot Password?</h1>
                  <p className="text-gray-600">Enter your email address or username and we'll send you instructions to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email/Username Field */}
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      Email or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email or username"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                  >
                    Send Reset Instructions
                  </button>

                  {/* Back to Login */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={onBack}
                      className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Login</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-gray-900 mb-2">Check Your Email</h1>
                  <p className="text-gray-600">
                    If an account exists with the provided email or username, you will receive password reset instructions shortly.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-800" style={{ fontSize: '0.875rem' }}>
                      <strong>Note:</strong> The email may take a few minutes to arrive. Please check your spam folder if you don't see it in your inbox.
                    </p>
                  </div>

                  {/* Back to Login Button */}
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    Back to Login
                  </button>

                  {/* Resend Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Didn't receive the email? Try again
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Version Info */}
          <div className="text-center mt-6">
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>v7.3 • Secure Login</p>
          </div>
        </div>
      </div>

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
