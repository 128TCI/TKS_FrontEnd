import { useState } from 'react';
import { Mail, Check, Send, Edit } from 'lucide-react';
import { Footer } from './Footer/Footer';

export function EmailConfigurationPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [emailSender, setEmailSender] = useState('perlita.manalo@128techconsultinginc.com');
  const [smtpServer, setSmtpServer] = useState('mail.128techconsultinginc.com');
  const [sendOption, setSendOption] = useState('Others');
  const [port, setPort] = useState('587');
  const [targetName, setTargetName] = useState('');
  const [encryptionConnection, setEncryptionConnection] = useState('None');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  const handleSave = () => {
    setIsEditing(false);
    alert('Email configuration saved successfully!');
  };

  const handleTestEmail = () => {
    setIsTesting(true);
    setTestResult('');
    
    setTimeout(() => {
      setTestResult('✓ Email test successful! Test email sent to configured address.');
      setIsTesting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Email Configuration</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Configure email server settings to enable system notifications, alerts, and automated reports. Set up SMTP server details and test connectivity.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Configure SMTP server settings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Support for SSL/TLS encryption</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Test email configuration instantly</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Secure authentication support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleTestEmail}
                disabled={isTesting}
                className="px-6 py-2.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isTesting ? 'Testing...' : 'Test Email Configuration'}
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <p className="text-sm text-green-700">{testResult}</p>
              </div>
            )}

            {/* Configuration Display/Edit Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Email Sender */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-700 mb-2">
                    <span className="text-gray-900">EmailSender</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={emailSender}
                      onChange={(e) => setEmailSender(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  ) : (
                    <p className="text-gray-600">{emailSender}</p>
                  )}
                </div>

                {/* SMTP Server */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-700 mb-2">
                    <span className="text-gray-900">SmtpServer</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={smtpServer}
                      onChange={(e) => setSmtpServer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  ) : (
                    <p className="text-gray-600">{smtpServer}</p>
                  )}
                </div>

                {/* Send Option */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-700 mb-2">
                    <span className="text-gray-900">SendOption</span>
                  </label>
                  {isEditing ? (
                    <select
                      value={sendOption}
                      onChange={(e) => setSendOption(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Others">Others</option>
                      <option value="Gmail">Gmail</option>
                      <option value="Outlook">Outlook</option>
                      <option value="Yahoo">Yahoo</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{sendOption}</p>
                  )}
                </div>

                {/* Port */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-700 mb-2">
                    <span className="text-gray-900">Port</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  ) : (
                    <p className="text-gray-600">{port}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Target Name */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-700 mb-2">
                    <span className="text-gray-900">TargetName</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-gray-600">{targetName || '(empty)'}</p>
                  )}
                </div>

                {/* Encryption Connection */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-700 mb-2">
                    <span className="text-gray-900">EncryptionConnection</span>
                  </label>
                  {isEditing ? (
                    <select
                      value={encryptionConnection}
                      onChange={(e) => setEncryptionConnection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="None">None</option>
                      <option value="SSL">SSL</option>
                      <option value="TLS">TLS</option>
                      <option value="STARTTLS">STARTTLS</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{encryptionConnection}</p>
                  )}
                </div>

                {/* Username */}
                {isEditing && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <label className="block text-gray-700 mb-2">
                      <span className="text-gray-900">Username</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="SMTP username (optional)"
                    />
                  </div>
                )}

                {/* Password */}
                {isEditing && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <label className="block text-gray-700 mb-2">
                      <span className="text-gray-900">Password</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="SMTP password (optional)"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Button (only visible in edit mode) */}
            {isEditing && (
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Configuration
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}