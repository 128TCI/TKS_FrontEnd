import { useState, useEffect, useRef } from 'react';
import { Mail, Check, Send, Edit } from 'lucide-react';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';

interface EmailConfiguration {
  id: number;
  username: string;
  emailSender: string;
  password: string;
  smtpServer: string;
  sendOption: string;
  port: string;
  targetName: string;
  encryptionConnection: string;
}

interface TestEmailResponse {
  success: boolean;
  message: string;
  errorDetails?: string;
  testedAt: string;
}

interface TestEmailRequest {
	  toEmail: string;
	  subject: string;
	  body: string;
	}

export function EmailConfigurationPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<TestEmailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const originalConfig = useRef<EmailConfiguration | null>(null);

  const [config, setConfig] = useState<EmailConfiguration>({
    id: 0,
    emailSender: '',
    password: '',
    smtpServer: '',
    targetName: '',
    sendOption: '',
    username: '',
    port: '587',
    encryptionConnection: 'None',
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchEmailConfig = async () => {
    const _response = await apiClient.get('/Security/EmailConfiguration/128TCI');
    console.log('API response:', _response.data);

    const isSuccess = ApiService.isApiSuccess(_response);
    if (!isSuccess) {
      showErrorModal('Failed to load email configuration. Please try again later.');
      return;
    }

    originalConfig.current = _response.data;
    setConfig(_response.data);
  };

  useEffect(() => {
    const loadConfig = async () => {
      await fetchEmailConfig();
      setLoading(false);
    };

    loadConfig();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        Id: config.id,
        Username: config.username,
        EmailSender: config.emailSender,
        Password: config.password,
        SmtpServer: config.smtpServer,
        SendOption: config.sendOption,
        Port: config.port,
        TargetName: config.targetName,
        EncryptionConnection: config.encryptionConnection,
      };

      const _response = await apiClient.put(`/Security/EmailConfiguration/Update/${config.username}`, payload);
      console.log('API response:', _response.data);

      const isSuccess = ApiService.isApiSuccess(_response);
      if (!isSuccess) {
        showErrorModal('Failed to save email configuration. Please try again later.');
        return;
      }

      originalConfig.current = config; // ✅ update snapshot
      setIsEditing(false);
      showSuccessModal('Email configuration saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      showErrorModal('Failed to save email configuration. Please try again later.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (originalConfig.current) {
      setConfig(originalConfig.current); // ✅ restore original values
    }
  };

  const handleTestEmail = () => {
    setIsTestModalOpen(true); // ✅ opens the modal
  };

  const handleTestModalClose = () => {
    setIsTestModalOpen(false);
    setTestResult(null);
  };

const handleSendTestEmail = async () => {
  setIsTesting(true);
  try {
    const payload = {
      toEmail: config.emailSender, 
      subject: 'Test Email Configuration',
      body: 'This is a test email to verify your email configuration is working correctly.',
    };

    const _response = await apiClient.post('/Security/EmailConfiguration/Test', payload);
    console.log('Test email API response:', _response.data);
    const isSuccess = ApiService.isApiSuccess(_response);
    if (isSuccess) {
      showSuccessModal(`Test email sent successfully to ${config.emailSender}!`);
    } else {
      showErrorModal(`Failed to send test email to ${config.emailSender}.`);
    }
  } catch (error) {
    showErrorModal(`Failed to send test email to ${config.emailSender}.`);
  } finally {
    setIsTesting(false);
  }
};

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <div className="p-6 text-gray-500">Loading email configuration...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
                onClick={handleSendTestEmail}
                className="px-6 py-2.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isTesting ? 'Sending...' : 'Test Email Configuration'}
              </button>
            </div>

            {/* Configuration Display/Edit Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-900 mb-2">EmailSender</label>
                  {isEditing ? (
                    <input type="email" value={config.emailSender} name="emailSender" onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  ) : (
                    <p className="text-gray-600">{config.emailSender}</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-900 mb-2">SmtpServer</label>
                  {isEditing ? (
                    <input type="text" value={config.smtpServer} name="smtpServer" onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  ) : (
                    <p className="text-gray-600">{config.smtpServer}</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-900 mb-2">SendOption</label>
                  {isEditing ? (
                    <select value={config.sendOption} name="sendOption" onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="Others">Others</option>
                      <option value="Gmail">Gmail</option>
                      <option value="Outlook">Outlook</option>
                      <option value="Yahoo">Yahoo</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{config.sendOption}</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-900 mb-2">Port</label>
                  {isEditing ? (
                    <input type="text" value={config.port} name="port" onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  ) : (
                    <p className="text-gray-600">{config.port}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-900 mb-2">TargetName</label>
                  {isEditing ? (
                    <input type="text" value={config.targetName} name="targetName" onChange={handleChange}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  ) : (
                    <p className="text-gray-600">{config.targetName || '(empty)'}</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <label className="block text-gray-900 mb-2">EncryptionConnection</label>
                  {isEditing ? (
                    <select value={config.encryptionConnection} name="encryptionConnection" onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="None">None</option>
                      <option value="SSL">SSL</option>
                      <option value="TLS">TLS</option>
                      <option value="STARTTLS">STARTTLS</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{config.encryptionConnection}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <label className="block text-gray-900 mb-2">Username</label>
                    <input type="text" value={config.username} name="username" onChange={handleChange}
                      placeholder="SMTP username"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                )}

                {isEditing && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <label className="block text-gray-900 mb-2">Password</label>
                    <input type="password" value={config.password} name="password" onChange={handleChange}
                      placeholder="SMTP password"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Save / Cancel Buttons */}
            {isEditing && (
              <div className="mt-6 flex items-center gap-3">
                <button onClick={handleSave}
                  className="px-6 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Save Configuration
                </button>
                <button onClick={handleCancel}
                  className="px-6 py-2.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
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
