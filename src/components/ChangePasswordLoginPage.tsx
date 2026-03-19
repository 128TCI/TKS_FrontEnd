import { useState } from 'react';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import { securityService } from '../services/securityService';
import { showSuccessModal, showErrorModal } from '../services/apiService';
import auditTrail from '../services/auditTrail';
import { Footer } from './Footer/Footer';
import apiClient from '../services/apiClient';

interface ChangePasswordLoginPageProps {
  onBackToLogin: () => void;
}

export function ChangePasswordLoginPage({ onBackToLogin }: ChangePasswordLoginPageProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating,      setIsUpdating]      = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Get plain username stored directly from login input ───────────────────
  const username = localStorage.getItem('pendingUsername') ?? '';

  // ── Submit ────────────────────────────────────────────────────────────────
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // ── Client-side validation ─────────────────────────────────────────────
  if (!currentPassword)
    { await showErrorModal('Please enter your old password.');                      return; }
  if (!newPassword)
    { await showErrorModal('Please enter a new password.');                         return; }
  if (newPassword !== confirmPassword)
    { await showErrorModal('New passwords do not match.');                          return; }
  if (newPassword === currentPassword)
    { await showErrorModal('New password must be different from the current one.'); return; }

  setIsUpdating(true);

  // ── Temporarily promote pending token so API calls authenticate ────────
  const pendingToken = localStorage.getItem('pendingToken') ?? '';
  localStorage.setItem('authToken', pendingToken);

  try {
    // ── Step 1: Change password ───────────────────────────────────────────
    const res = await securityService.changePassword(username, {
      oldPassword: currentPassword,
      newPassword: newPassword,
    });

    if (res.success) {

  // ── Step 2: Reset EditedDate so CheckPasswordAge returns false ────────
  // Without this the loop continues — EditedDate stays old on next login
  try {
    await apiClient.post('UserLogin/update-password-changed-date', {
      UserName: username,
    });
  } catch (dateErr) {
    console.error('Failed to update password changed date:', dateErr);
  }

  // ── Step 3: Audit trail ───────────────────────────────────────────────
  try {
    await auditTrail.log({
      accessType: 'Edit',
      trans:      `Changed Password for account '${username}'`,
      messages:   `Security Manager - Users update record: ${username}`,
      formName:   'Security Manager - Users',
    });
  } catch (auditErr) {
    console.error('Audit trail failed:', auditErr);
  }

  await showSuccessModal(res.message || 'Password changed successfully.');

  // ── Step 4: Clear ALL pending and auth keys ───────────────────────────
  localStorage.removeItem('pendingPasswordChange');
  localStorage.removeItem('pendingToken');
  localStorage.removeItem('pendingPayload');
  localStorage.removeItem('pendingUserData');
  localStorage.removeItem('pendingUsername');
  localStorage.removeItem('authToken');
  localStorage.removeItem('loginTimestamp');
  localStorage.removeItem('loginPayload');
  localStorage.removeItem('userData');

  // ── Step 5: Redirect to login ─────────────────────────────────────────
  const currentPath = window.location.pathname;
  const changeIdx   = currentPath.indexOf('/change-password-login');
  const base        = changeIdx !== -1 ? currentPath.substring(0, changeIdx) : '';

  window.location.href = `${base}/login`;
} else {
      // ── Remove promoted token on failure ──────────────────────────────
      localStorage.removeItem('authToken');
      await showErrorModal(res.message || 'Failed to change password.');
    }

  } catch {
    // ── Remove promoted token on error ────────────────────────────────
    localStorage.removeItem('authToken');
    await showErrorModal('Failed to change password. Please try again.');
  } finally {
    setIsUpdating(false);
  }
};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
      </div>

      {/* Green top bar */}
      <div className="w-full bg-green-600 text-white py-3 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-white tracking-wide">Password Change Required</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">

            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Lock className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-gray-900 text-center text-xl font-semibold">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 text-center mt-1">
                Your password must be changed before you can continue.
              </p>
            </div>

            {/* Info banner */}
            <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                For security reasons, please update your password to proceed.
                Your new password must be different from your current one.
                You will be returned to the login page after changing your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <PasswordField
                label="Current Password"
                placeholder="Current Password"
                value={currentPassword}
                show={showCurrent}
                onChange={setCurrentPassword}
                onToggle={() => setShowCurrent(p => !p)}
              />
              <PasswordField
                label="New Password"
                placeholder="New Password"
                value={newPassword}
                show={showNew}
                onChange={setNewPassword}
                onToggle={() => setShowNew(p => !p)}
              />
              <PasswordField
                label="Confirm Password"
                placeholder="Confirm Password"
                value={confirmPassword}
                show={showConfirm}
                onChange={setConfirmPassword}
                onToggle={() => setShowConfirm(p => !p)}
                onEnter={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              />

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-500 disabled:hover:to-red-600 disabled:transform-none"
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? 'Updating…' : 'Update Password'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

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
      `}</style>
    </div>
  );
}

// ── Reusable password field ───────────────────────────────────────────────────
interface PasswordFieldProps {
  label:       string;
  placeholder: string;
  value:       string;
  show:        boolean;
  onChange:    (v: string) => void;
  onToggle:    () => void;
  onEnter?:    () => void;
}

function PasswordField({
  label, placeholder, value, show, onChange, onToggle, onEnter
}: PasswordFieldProps) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label} *</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-600 placeholder-gray-400 transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={e => e.preventDefault()}
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}