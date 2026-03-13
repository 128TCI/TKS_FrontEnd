import { useState } from 'react';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import apiClient, { getLoggedInUsername } from '../../services/apiClient';
import { showSuccessModal, showErrorModal } from '../../services/apiService';
import auditTrail from '../../services/auditTrail';
import { securityService } from '../../services/securityService';
import { decryptData } from '../../services/encryptionService';
import { Footer } from '../Footer/Footer';

interface ChangePasswordPageProps {
  onBack: () => void;
}

export function ChangePasswordPage({ onBack }: ChangePasswordPageProps) {
  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [isUpdating,       setIsUpdating]       = useState(false);

  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const username = getLoggedInUsername();

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword)                { await showErrorModal('Please enter your old password.');                      return; }
    if (!newPassword)                    { await showErrorModal('Please enter a new password.');                         return; }
    if (newPassword !== confirmPassword) { await showErrorModal('New passwords do not match.');                          return; }
    if (newPassword === currentPassword) { await showErrorModal('New password must be different from the current one.'); return; }

    setIsUpdating(true);
    try {
      const res = await securityService.changePassword(username, {
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
      if (res.success) {
        await auditTrail.log({
          accessType: 'Edit',
          trans:      `Changed Password for account '${username}'`,
          messages:   `Security Manager - Users update record: ${username}`,
          formName:   'Security Manager - Users',
        });
        await showSuccessModal(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        //onBack();
      } else {
        await showErrorModal(res.message);
      }
    } catch {
      await showErrorModal('Failed to change password.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Change Password</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6">

            {/* ── Info banner — same style as UpdateDaytypeRawdataPage ── */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Update your account password. Choose a strong password that you haven't used before.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      'Enter your current password to verify identity',
                      'New password must differ from the current one',
                    ].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit}>

              {/* Fields container — max-w-3xl, same style as SecurityManagerPage modal sections */}
              <div className="max-w-3xl mx-auto bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-4 mb-8">
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
              </div>

              {/* Buttons */}

              <div className="flex items-center justify-center gap-3 pt-6 mt-8">
                <br></br>
                    <button type="submit"
                      disabled={isUpdating} 
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Save className="w-4 h-4"/>{isUpdating?'Updating…':'Update'}
                    </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable password field ─────────────────────────────────────────────────
interface PasswordFieldProps {
  label:       string;
  placeholder: string;
  value:       string;
  show:        boolean;
  onChange:    (v: string) => void;
  onToggle:    () => void;
  onEnter?:    () => void;
}

function PasswordField({ label, placeholder, value, show, onChange, onToggle, onEnter }: PasswordFieldProps) {
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
          className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600 placeholder-gray-400 transition-all"
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
